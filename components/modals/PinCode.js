// PinCode.js

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { PinScreen } from "react-native-awesome-pin";
import { useGlobalContext } from "~/components/timer/context";
import { supabase } from "~/components/utils/supabase";
import ActivityLoader from "@/components/utils/ActivityLoader";
import Toast from "~/components/ui/toast";
import * as Clipboard from "expo-clipboard";
import Dialog from "./AlertDialog";
import { Ionicons } from "@expo/vector-icons";

const PinCode = ({ route }) => {
  const pinScreenRef = useRef(null);
  const routePin = route?.params?.pin;
  const challengeId = route?.params?.challengeId;
  const { theme, copy, setCopy, isLoading, setIsLoading } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];

  const [stats, setStats] = useState({});
  const [sendPin, setSendPin] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [expectedPin, setExpectedPin] = useState(null);
  const [message, setMessage] = useState("");
  const navigation = useNavigation();

  // load clipboard text
  const fetchCopiedText = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) setCopy(text);
  };
  useEffect(() => {
    fetchCopiedText();
  }, []);

  // store expected PIN if provided
  useEffect(() => {
    if (routePin) setExpectedPin(routePin.toString());
  }, [routePin]);

  const errorToast = useCallback((t1, t2, s1, s2, type) => {
    Toast.show({
      text1Style: s1 || null,
      text2Style: s2 || null,
      type: type || "error",
      text1: t1 || "Oops, Something went wrong.",
      text2: t2 || "Please restart the app and try again.",
      visibilityTime: 3000,
    });
  }, []);

  // fetch challenge teams
  const getData = async () => {
    if (!challengeId) return;
    const { data, error } = await supabase
      .from("challenges")
      .select("homeTeam,awayTeam")
      .eq("challengeid", challengeId)
      .single();
    if (error) {
      console.error("Error retrieving data:", error);
      return;
    }
    setStats({ ...data, challengeid: challengeId });
  };
  useEffect(() => {
    getData();
  }, [challengeId]);

  const receivePin = (pin) => {
    pinScreenRef.current?.clearError();

    // validating flow
    if (expectedPin) {
      if (pin.length < expectedPin.length) return;
      if (pin === expectedPin) {
        setCopy(null);
        setIsLoading(false);
        navigation.navigate("MainTabs", {
          screen: "Timer",
          params: { stats, pin: stats.pin, syncTimer: true },
        });
      } else {
        pinScreenRef.current?.throwError("Incorrect Match Pin");
      }
      return;
    }

    // lookup flow
    if (pin.length !== 6) return;
    (async () => {
      const matchDesc = await getPoolstatNames(pin);
      if (!matchDesc) {
        errorToast(
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

  // helpers for lookup...
  async function searchPoolstatPins(pin) {
    const { data, error } = await supabase
      .from("poolstat_match_pins")
      .select("*")
      .eq("pin", pin)
      .single();
    if (error) return null;
    return data;
  }
  async function searchChallengePins(pin) {
    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .eq("pin", pin)
      .single();
    if (error) return null;
    return data;
  }
  async function getPoolstatNames(pin) {
    const pool = await searchPoolstatPins(pin);
    const chall = await searchChallengePins(pin);
    const result = pool?.pin === pin ? pool : chall?.pin === pin ? chall : null;
    if (!result) return null;

    if (result.matchid != null) {
      const resp = await fetch(
        `https://scrbd.co-stream.live/api/livescores?compId=${encodeURIComponent(
          result.compid
        )}&matchId=${encodeURIComponent(result.matchid)}`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );
      if (!resp.ok) return null;
      const json = await resp.json();
      const entries = Object.values(json);
      if (!entries.length) return null;
      return `${entries[0].hometeamlabel} vs ${entries[0].awayteamlabel}`;
    } else {
      const { data, error } = await supabase
        .from("challenges")
        .select("homeTeam,awayTeam")
        .eq("challengeid", result.challengeid)
        .single();
      if (error) return null;
      return `${data.homeTeam} vs ${data.awayTeam}`;
    }
  }

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (!text) return;

    // grab up to 6 digits
    const digits = text.replace(/\D/g, "").slice(0, 6).split("");

    // dispatch each keystroke with a small delay
    digits.forEach((d, i) => {
      setTimeout(() => {
        pinScreenRef.current?.keyDown(d);
      }, i * 50); // 50ms between each key press
    });
  };

  // back handler
  const handleBack = () => pinScreenRef.current?.keyDown("back");

  const keyboard = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    ["paste", 0, "back"],
  ];
  const keyboardFunc = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
    [null, null, handleBack],
  ];

  // *** wrap numbers in <Text> so you never return a raw primitive
  const renderKey = (key) => {
    if (key === "back") {
      return (
        <Ionicons
          name="backspace-outline"
          size={28}
          color={activeColors.accent}
        />
      );
    }
    if (key === "paste") {
      return (
        <Ionicons
          name="clipboard-outline"
          size={28}
          color={activeColors.accent}
        />
      );
    }
    return (
      <Text style={{ fontSize: 25, color: activeColors.foreground }}>
        {key}
      </Text>
    );
  };

  return (
    <>
      {showDialog && (
        <Dialog
          title="Confirmation"
          desc="Is this the match you are trying to connect to?"
          desc2={message}
          desc3="If this is not what you expected, please check the pin and try again."
          cancel="Try Again"
          action="Connect"
          open={showDialog}
          actionPress={() => {
            setShowDialog(false);
            navigation.navigate("MainTabs", {
              screen: "Timer",
              params: { pin: sendPin, syncTimer: false },
            });
            setMessage("");
            setCopy(null);
            setIsLoading(true);
            setExpectedPin(null);
          }}
          cancelPress={() => {
            setShowDialog(false);
            setMessage("");
            setExpectedPin(null);
          }}
        />
      )}

      <PinScreen
        onRef={(ref) => (pinScreenRef.current = ref)}
        keyDown={receivePin}
        numberOfPins={6}
        copy={copy}
        tagline="Enter Match Pin"
        logo={require("~/assets/splashscreen_image_foreground.png")}
        containerStyle={{ backgroundColor: activeColors.accentVariant }}
        headerBackgroundColor={activeColors.accentVariant}
        footerBackgroundColor={activeColors.foreground}
        keyboardStyle={{ backgroundColor: activeColors.foreground }}
        keyStyle={{
          backgroundColor: activeColors.border,
          color: activeColors.foreground,
        }}
        keyTextStyle={{ color: activeColors.foreground }}
        keyImageStyle={{ tintColor: activeColors.foreground }}
        keyboard={keyboard}
        keyboardFunc={keyboardFunc}
        renderKey={renderKey}
      />
    </>
  );
};

export default PinCode;
