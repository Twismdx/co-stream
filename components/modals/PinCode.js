import React, { useRef, useEffect, useState, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { PinScreen } from "react-native-awesome-pin";
import { useGlobalContext } from "~/components/timer/context";
import { supabase } from "~/components/utils/supabase";
import ActivityLoader from "@/components/utils/ActivityLoader";
import Toast from "~/components/ui/toast";
import * as Clipboard from "expo-clipboard";
import Dialog from "./AlertDialog";

const PinCode = ({ route }) => {
  const pinScreenRef = useRef(null);
  const routePin = route?.params?.pin; // Your expected PIN
  const challengeId = route?.params?.challengeId;
  const { theme, copy, setCopy, isLoading, setIsLoading } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];
  const [stats, setStats] = useState({});
  const [sendPin, setSendPin] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [expectedPin, setExpectedPin] = useState(null);
  const navigation = useNavigation();
  const [message, setMessage] = useState("");

  async function searchPoolstatPins(pin) {
    const { data, error } = await supabase
      .from("poolstat_match_pins")
      .select("*")
      .eq("pin", pin)
      .single();

    if (error) {
      console.log("Not in poolstat_match_pins, trying challenges…", error);
      return error;
    }

    return data;
  }

  async function searchChallengePins(pin) {
    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .eq("pin", pin)
      .single();

    if (error) {
      console.log("Not in challenges either...", error);
      return error;
    }

    return data;
  }

  async function getPoolstatNames(pin) {
    let result;
    const poolstatRes = await searchPoolstatPins(pin);
    const challengeRes = await searchChallengePins(pin);
    if (poolstatRes?.pin === pin) {
      result = poolstatRes;
    } else if (challengeRes?.pin === pin) {
      result = challengeRes;
    } else {
      console.log("Pin not found in either table");
      return;
    }

    const compid = result?.compid ?? null;
    const matchid = result?.matchid ?? null;
    const challengeid = result?.challengeid ?? null;

    if (matchid !== null) {
      const response = await fetch(
        `https://scrbd.co-stream.live/api/livescores?compId=${encodeURIComponent(
          compid
        )}&matchId=${encodeURIComponent(matchid)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        console.log("Livescores API error:", response.status);
        return null;
      }

      const json = await response.json();
      const entries = Object.values(json);

      if (!entries.length) {
        console.log("Livescores API returned no entries");
        return null;
      }

      return `${entries[0].hometeamlabel} vs ${entries[0].awayteamlabel}`;
    } else if (challengeid !== null) {
      const { data, error } = await supabase
        .from("challenges")
        .select("homeTeam,awayTeam")
        .eq("challengeid", challengeid)
        .single();

      if (error) {
        console.log("Error retrieving data: ", error);
        return;
      }

      return `${data.homeTeam} vs ${data.awayTeam}`;
    } else return null;
  }

  const fetchCopiedText = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setCopy(text);
    }
  };

  useEffect(() => {
    fetchCopiedText();
  }, []);

  useEffect(() => {
    if (routePin) {
      setExpectedPin(routePin);
    }
  }, [routePin]);

  const errorToast = useCallback((error1, error2, style1, style2, type) => {
    Toast.show({
      text1Style: style1 ? style1 : null,
      text2Style: style2 ? style2 : null,
      type: type ? type : "error",
      text1: error1 ? error1 : "Oops, Something has gone wrong.",
      text2: error2
        ? error2
        : `We can't seem to work out what's wrong, Please close and restart the app.`,
      visibilityTime: 3000,
    });
  }, []);

  const getData = async () => {
    if (challengeId) {
      const { data: matchData, error: matchError } = await supabase
        .from("challenges")
        .select("homeTeam,awayTeam")
        .eq("challengeid", challengeId)
        .single();

      if (matchError) {
        console.error("Error retrieving data: ", matchError);
      }

      setStats(matchData);
      setStats((prev) => ({
        ...prev,
        challengeid: challengeId,
      }));
    }
  };

  useEffect(() => {
    getData();
  }, [challengeId]);

  const receivePin = (pin) => {
    pinScreenRef.current?.clearError();

    if (expectedPin) {
      if (pin.length < expectedPin.length) return;

      if (pin === expectedPin) {
        setCopy(null);
        setIsLoading(true);
        navigation.navigate("MainTabs", {
          screen: "Timer",
          params: { stats: stats, pin: stats.pin, syncTimer: true },
        });
      } else {
        pinScreenRef.current?.throwError("Incorrect Match Pin");
      }

      return;
    }

    if (pin.length !== 6) {
      return;
    }

    (async () => {
      const matchDesc = await getPoolstatNames(pin);

      if (matchDesc === null) {
        return errorToast(
          "Pin not found!",
          "Please check the pin and try again.",
          { fontSize: 14, color: activeColors.error },
          { textAlign: "center" },
          "info"
        );
      } else {
        setSendPin(pin);
        setMessage(matchDesc);
        setShowDialog(true);
      }
    })();
  };

  return (
    <>
      {showDialog && (
        <Dialog
          title={"Confirmation"}
          desc={`Is this the match you are trying to connect to?`}
          desc2={message}
          desc3={`If this is not what you expected, Please check the pin and try again.`}
          cancel={"Try Again"}
          action={"Connect"}
          open={showDialog}
          actionPress={() => {
            setShowDialog(false);
            navigation.navigate("MainTabs", {
              screen: "Timer",
              params: { pin: sendPin, syncTimer: false },
            });
            setMessage(null);
            setCopy(null);
            setIsLoading(true);
            setExpectedPin(null);
          }}
          cancelPress={() => {
            setShowDialog(false);
            setMessage(null);
            setExpectedPin(null);
          }}
        />
      )}
      <PinScreen
        copy={copy ? copy : null}
        onRef={(ref) => (pinScreenRef.current = ref)}
        tagline="Enter Match Pin"
        logo={require("~/assets/splashscreen_image_foreground.png")}
        containerStyle={{ backgroundColor: activeColors.accentVariant }}
        keyDown={receivePin}
        numberOfPins={6}
        headerBackgroundColor={activeColors.accentVariant}
        footerBackgroundColor={activeColors.foreground} // changes the SafeAreaView wrapping the keyboard
        keyboardStyle={{ backgroundColor: activeColors.foreground }} // applies to the PinKeyboard container (if supported)
        keyStyle={{
          backgroundColor: activeColors.border,
          color: activeColors.foreground,
        }} // individual key background
        keyTextStyle={{ color: activeColors.foreground }} // individual key text color
        keyImageStyle={{ tintColor: activeColors.foreground }}
      />
    </>
  );
};

export default PinCode;
