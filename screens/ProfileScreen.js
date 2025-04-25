import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
// ProfileScreen.js
globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useGlobalContext } from "~/components/timer/context";
import CustomButton from "../components/CustomButton";
import StyledText from "../components/texts/StyledText";
import SettingsItem from "../components/settings/SettingsItem";
import { SafeAreaView } from "react-native-safe-area-context";
import { getItem, setItem, clear } from "../components/utils/AsyncStorage";
import { supabase } from "../components/utils/supabase";
import { getChallengeStats } from "../components/utils/API";
// import { LoginManager } from "react-native-fbsdk-next";
import { LinkFacebook } from "../components/utils/SocialAuth";
// import {getMessaging} from '@react-native-firebase/messaging'
import Loader from "@/components/utils/ActivityLoader";

const ProfileScreen = ({ navigation }) => {
  const {
    user,
    setUser,
    theme,
    isLoggedIn,
    setIsLoggedIn,
    setSelectedSource,
    setSelectedOrg,
    isEmailSignIn,
    setIsEmailSignIn,
    setIsLoading,
  } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];

  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({});
  const [loginState, setLoginState] = useState();

  useEffect(() => {
    if (isLoggedIn && !isEmailSignIn) {
      setLoginState("logout");
    } else if (isLoggedIn && isEmailSignIn) {
      setLoginState("linkAccounts");
    } else setLoginState("login");
  }, [isLoggedIn, isEmailSignIn]);

  // ────────────────────────────────────────────────────────────────
  // Fetch challenge statistics for the current user
  // ────────────────────────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      if (isLoggedIn && !isEmailSignIn) {
        if (!user || !user?.id) {
          throw new Error("No user available for fetching stats");
        }
        const statsData = await getChallengeStats(user?.id);
        if (!statsData) {
          throw new Error("No stats returned from API");
        }
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  // ────────────────────────────────────────────────────────────────
  // Pull-to-refresh: re-fetch stats
  // ────────────────────────────────────────────────────────────────
  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchStats();
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // ────────────────────────────────────────────────────────────────
  // Logout: clear Supabase session, update global context, and reset navigation
  // ────────────────────────────────────────────────────────────────
  const logoutUser = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      return;
    }
  };

  const getUserInitials = () => {
    if (!user || !user.name) return "";
    const nameParts = user.name.trim().split(" ");
    const firstInitial = nameParts[0] ? nameParts[0].charAt(0) : "";
    const lastInitial =
      nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0) : "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  // ────────────────────────────────────────────────────────────────
  // Calculate statistics values for display
  // ────────────────────────────────────────────────────────────────
  const totalMatches = (stats?.wins ?? 0) + (stats?.losses ?? 0);
  const winPercentage =
    totalMatches > 0 ? ((stats?.wins ?? 0) / totalMatches) * 100 : 0;

  // ────────────────────────────────────────────────────────────────
  // Render the Profile screen UI
  // ────────────────────────────────────────────────────────────────
  return (
    // <Loader isLoading={isLoading}>
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
      style={[{ backgroundColor: activeColors.primary }, styles.container]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={true}
      keyboardShouldPersistTaps="handled"
    >
      <Avatar
        style={[styles.image, { width: 90, height: 90 }]}
        alt={getUserInitials()}
      >
        <AvatarImage
          source={
            user?.avatar
              ? { uri: user?.avatar }
              : require("~/assets/placeholder.png")
          }
        />
        <AvatarFallback>
          <StyledText>{getUserInitials()}</StyledText>
        </AvatarFallback>
      </Avatar>

      <>
        <View style={styles.section}>
          <SettingsItem label="Name" spaceBetween>
            <StyledText>{user?.name}</StyledText>
          </SettingsItem>
        </View>
        <View style={styles.section}>
          <SettingsItem label="Matches Played" spaceBetween>
            <StyledText style={{ paddingHorizontal: 15 }}>
              {stats?.total ?? 0}
            </StyledText>
          </SettingsItem>
          <SettingsItem label="Matches Won" spaceBetween>
            <StyledText style={{ paddingHorizontal: 15 }}>
              {stats?.wins ?? 0}
            </StyledText>
          </SettingsItem>
          <SettingsItem label="Matches Lost" spaceBetween>
            <StyledText style={{ paddingHorizontal: 15 }}>
              {stats?.losses ?? 0}
            </StyledText>
          </SettingsItem>
          <SettingsItem label="Win Percentage" spaceBetween>
            <StyledText style={{ paddingHorizontal: 15 }}>
              {isNaN(winPercentage) ? 0 : winPercentage.toFixed(2)}%
            </StyledText>
          </SettingsItem>
        </View>
      </>
      <View style={styles.buttonRow}>
        <CustomButton
          color="white"
          textStyle={{ fontSize: 14 }}
          buttonColor={activeColors.chatpurple}
          label="Pending Matches"
          onPress={() => navigation.navigate("PendingMatches")}
          style={{
            height: 45,
            paddingHorizontal: 10,
            paddingVertical: 10,
            borderRadius: 4,
          }}
        />
        <CustomButton
          color="white"
          textStyle={{ fontSize: 14 }}
          buttonColor={activeColors.accent}
          label="Match History"
          onPress={() => navigation.navigate("MatchHistory")}
          style={{
            height: 45,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 4,
          }}
        />
      </View>
      <View style={styles.logout}>
        <CustomButton
          color="white"
          label={
            loginState === "logout"
              ? "Logout"
              : loginState === "login"
              ? "Sign in with Facebook"
              : "Sign in with Facebook"
          }
          onPress={() => {
            if (loginState === "linkAccounts") {
              logoutUser();
            } else if (loginState === "logout") {
              logoutUser();
            } else {
              // navigation.navigate('Login')
              logoutUser();
            }
          }}
          width={250}
          style={{
            height: 45,
            paddingHorizontal: 50,
            paddingVertical: 10,
            borderRadius: 4,
          }}
          cancel={isLoggedIn} // Show 'cancel' style if logged in
          submit={!isLoggedIn} // Show 'submit' style if not logged in
        />
      </View>
    </ScrollView>
    // </Loader>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    paddingVertical: 10,
  },
  section: {
    borderRadius: 30,
    overflow: "hidden",
    marginTop: 20,
    // marginBottom: 15,
  },
  logout: {
    overflow: "hidden",
    marginTop: -10,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 25,
    marginTop: 25,
  },
  image: {
    alignSelf: "center",
    marginBottom: -10,
  },
});
