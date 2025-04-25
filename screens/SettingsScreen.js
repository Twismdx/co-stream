import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
// Updated to use our custom switch implementation
import { Switch } from "../components/ui/switch";

import StyledText from "../components/texts/StyledText";
import SettingsItem from "../components/settings/SettingsItem";
import { useGlobalContext } from "../components/timer/context";
import CustomButton from "../components/CustomButton";
import DynamicSelect from "../components/texts/DynamicSelect";

// Import Supabase and OAuth helper functions
import { supabase } from "../components/utils/supabase";
import {
  LoginWithFacebook,
  LinkFacebook,
  isFacebookTokenValid,
} from "../components/utils/SocialAuth";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";

const SettingsScreen = ({ navigation }) => {
  const { theme, toggleTheme, setSelectedOrg, setSelectedSource, setUser } =
    useGlobalContext();

  const activeColors = theme.colors[theme.mode];
  const [isDarkTheme, setIsDarkTheme] = useState(theme.mode === "dark");
  // Track which providers the user is connected to
  const [linkedAccounts, setLinkedAccounts] = useState({
    facebook: false,
    google: false,
    discord: false,
    kick: false,
    twitch: false,
  });

  useEffect(() => {
    setIsDarkTheme(theme.mode === "dark");
  }, [theme.mode]);

  // On mount, check if any providers are already linked in the user's session.
  useEffect(() => {
    const checkLinkedAccounts = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error getting user:", error);
        return;
      }
      if (data?.user?.identities) {
        const identities = data.user.identities;
        const updatedLinkedAccounts = { ...linkedAccounts };
        Object.keys(updatedLinkedAccounts).forEach((provider) => {
          // Check if the user's identities array has any matching provider.
          updatedLinkedAccounts[provider] = identities.some(
            (identity) => identity.provider === provider
          );
        });
        setLinkedAccounts(updatedLinkedAccounts);
      }
    };
    checkLinkedAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const linkAccount = useCallback(
    async (provider) => {
      try {
        let result;
        const redirectTo = makeRedirectUri();
        if (provider === "facebook") {
          // Link using our custom Facebook function
          result = await LinkFacebook();
        } else {
          // For other providers, use Supabase's linkIdentity
          const { data, error } = await supabase.auth.linkIdentity({
            provider,
            options: {
              redirectTo,
              skipBrowserRedirect: true,
            },
          });
          if (error) {
            console.error(`Error linking ${provider}:`, error);
            Alert.alert("Error", `Failed to link ${provider} account.`);
            return;
          }
          const res = await WebBrowser.openAuthSessionAsync(
            data?.url ?? "",
            redirectTo
          );
          if (res.type !== "success") {
            console.warn(
              `${provider} linking did not complete successfully: ${res.type}`
            );
            Alert.alert("Info", `${provider} linking cancelled or failed.`);
            return;
          }
          // For simplicity, assume success if browser session completes
          result = { success: true };
        }
        if (result) {
          Alert.alert("Success", `${provider} account linked!`);
          setLinkedAccounts((prev) => ({ ...prev, [provider]: true }));
          // Optionally update the user object if returned from the provider linking flow
          // e.g., setUser(result);
        }
      } catch (error) {
        console.error(`Error linking ${provider} account:`, error);
        Alert.alert("Error", `Failed to link ${provider} account.`);
      }
    },
    [setLinkedAccounts]
  );

  const unlinkAccount = useCallback((provider) => {
    // Unlinking logic: call your custom removal methods and update state accordingly.
    // For example, remove tokens from your DB, then update local linkedAccounts flag:
    // await removeProviderToken(userId, provider);
    setLinkedAccounts((prev) => ({ ...prev, [provider]: false }));
    Alert.alert("Info", `${provider} account unlinked!`);
  }, []);

  const resetSelectedOrg = useCallback(async () => {
    try {
      await AsyncStorage.removeItem("@selectedOrg");
      setSelectedOrg(null);
      navigation.navigate("Home");
    } catch (error) {
      console.error("Error resetting selected organization:", error);
    }
  }, [setSelectedOrg, navigation]);

  const resetSelectedSource = useCallback(async () => {
    try {
      await AsyncStorage.removeItem("@selectedSource");
      setSelectedSource(null);
      await resetSelectedOrg();
    } catch (error) {
      console.error("Error resetting selected source:", error);
    }
  }, [setSelectedSource, resetSelectedOrg]);

  const renderLinkButton = useCallback(
    (provider, label) => {
      const isLinked = linkedAccounts[provider];
      return (
        <SettingsItem label={label} spaceBetween>
          <View style={[styles.customButton, { alignItems: "flex-end" }]}>
            <CustomButton
              style={{
                paddingHorizontal: 20,
                borderRadius: 10,
                opacity: isLinked ? 0.5 : 1,
              }}
              color="white"
              submit={isLinked}
              label={isLinked ? "Linked" : "Link"}
              onPress={() => {
                // If already linked, do nothing.
                if (isLinked) return;
                linkAccount(provider);
              }}
              width={80}
            />
          </View>
        </SettingsItem>
      );
    },
    [linkedAccounts, activeColors, linkAccount]
  );

  return (
    <View style={{ flex: 1, zIndex: 999 }}>
      <StatusBar style="auto" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={[{ backgroundColor: activeColors.primary }, styles.container]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        <StyledText style={{ color: activeColors.accent }} bold>
          Theme Switch
        </StyledText>
        <View style={styles.section}>
          <SettingsItem label="Dark Mode">
            <Switch
              value={isDarkTheme}
              onValueChange={toggleTheme}
              thumbColor={theme.mode === "dark" ? "#fff" : "#121212"}
              trackColor={{
                false: activeColors.primary,
                true: activeColors.accent,
              }}
            />
          </SettingsItem>
        </View>

        <StyledText style={{ color: activeColors.accent }} bold>
          Reset Selected Organisation
        </StyledText>
        <View style={styles.section}>
          <SettingsItem>
            <View style={styles.customButton}>
              <CustomButton
                style={{
                  minWidth: "100%",
                  paddingHorizontal: 20,
                  borderRadius: 20,
                }}
                color="black"
                gradientColors={[
                  activeColors.accentVariant,
                  activeColors.accent,
                ]}
                buttonColor={activeColors.accent}
                label="Reset"
                onPress={resetSelectedOrg}
                width="70%"
              />
            </View>
          </SettingsItem>
        </View>

        <StyledText style={{ color: activeColors.accent }} bold>
          Reset Data Source
        </StyledText>
        <View style={styles.section}>
          <SettingsItem>
            <View style={styles.customButton}>
              <CustomButton
                style={{
                  minWidth: "100%",
                  paddingHorizontal: 20,
                  borderRadius: 20,
                }}
                color="black"
                buttonColor={activeColors.accent}
                label="Reset"
                width="70%"
                onPress={resetSelectedSource}
              />
            </View>
          </SettingsItem>
        </View>

        <StyledText style={{ color: activeColors.accent }} bold>
          Link streaming services
        </StyledText>
        <View style={styles.section}>
          {renderLinkButton("facebook", "Facebook")}
          {renderLinkButton("google", "Google")}
          {renderLinkButton("discord", "Discord")}
          {renderLinkButton("kick", "Kick")}
          {renderLinkButton("twitch", "Twitch")}
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    overflow: "hidden",
    marginTop: 10,
    borderRadius: 30,
    marginBottom: 10,
  },
  customButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: 200,
  },
});
