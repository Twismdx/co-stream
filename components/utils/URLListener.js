import React, { useEffect, useState } from "react";
import * as Linking from "expo-linking";
import { useNavigation } from "@react-navigation/native";
import { useGlobalContext } from "../timer/context";
import { supabase } from "../utils/supabase";

const URLListener = () => {
  const { setIsLoading, isLoading, user } = useGlobalContext();
  const [stats, setStats] = useState({});
  const navigation = useNavigation();

  // Our deep link handler
  const handleDeepLink = async (event) => {
    const replacedURL = event.url.replace("#", "?");
    console.log("Received URL:", replacedURL);
    const dataEvent = Linking.parse(replacedURL);
    const path = dataEvent?.path;
    const queryParams = dataEvent?.queryParams || {};
    // Look for the Timer deep link. For example:
    // "com.costream://MainTabs/Home?pin=true&challengeId=1"
    console.log("path", path);
    if (
      path === "Home" &&
      queryParams.pin === "true" &&
      queryParams.challengeId
    ) {
      const challengeId = queryParams.challengeId;
      console.log("Deep link for Timer detected. ChallengeId:", challengeId);

      try {
        const { data: matchData, error: matchError } = await supabase
          .from("challenges")
          .select("*")
          .eq("challengeid", challengeId)
          .single();

        if (matchError) {
          console.error("Error retrieving challenge data:", matchError.message);
          return;
        }
        console.log(matchData);

        navigation.navigate("MainTabs", {
          screen: "Timer",
          params: { stats: matchData, pin: matchData.pin },
        });
      } catch (err) {
        console.error("Error in deep link handler:", err);
      }
    } else if (
      path === "Home" &&
      queryParams.pin === "true" &&
      queryParams.matchId
    ) {
      const matchId = queryParams.matchId;
      console.log("Deep link for Timer detected. MatchId:", matchId);

      try {
        navigation.navigate("MainTabs", {
          screen: "Timer",
          params: { matchId: matchId, syncTimer: true },
        });
      } catch (err) {
        console.error("Error in deep link handler:", err);
      }
    }

    // Handle other deep link paths if needed
    if (path === "AccountVerified") {
      navigation.navigate("AccountVerified");
    }
    if (path === "SetNewPassword") {
      const accessToken = queryParams.access_token;
      const refreshToken = queryParams.refresh_token;
      navigation.navigate("SetNewPassword", { accessToken, refreshToken });
    }
  };

  useEffect(() => {
    console.log("Setting up URL Listener");
    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => {
      console.log("Cleaning up URL Listener");
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const checkInitialURL = async () => {
      const initialURL = await Linking.getInitialURL();
      if (initialURL) {
        console.log("Initial URL:", initialURL);
        await handleDeepLink({ url: initialURL });
      }
    };
    checkInitialURL();
  }, []);

  return null;
};

export default URLListener;
