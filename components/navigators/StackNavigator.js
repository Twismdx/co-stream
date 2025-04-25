import { createStackNavigator } from "@react-navigation/stack";
import StreamScreen from "../../screens/StreamScreen";
import HomeScreen from "../../screens/HomeScreen";
import TimerScreen from "../../screens/TimerScreen";
import React, { useState, useEffect } from "react";
import SettingsScreen from "../../screens/SettingsScreen";
import LoginScreen from "../../screens/LoginScreen";
import { View, Dimensions } from "react-native";
import CreateChallengeScreen from "@/screens/CreateChallengeScreen";
import SelectedUserProfileScreen from "@/screens/SelectedUserProfileScreen";
import ProfileScreen from "../../screens/ProfileScreen";
import MainTabNavigator from "../navigators/MainTabNavigator";
import { useGlobalContext } from "../timer/context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MatchHistory from "../MatchHistory";
import PendingMatches from "../profile/PendingMatches";
import RegisterScreen from "../../screens/RegisterScreen";
import PinCode from "../modals/PinCode";
import { navigation } from "@/AppContent";

const Stack = createStackNavigator();

const StackNavigator = () => {
  const { theme } = useGlobalContext();
  const screenWidth = Dimensions.get("window").width;
  const insets = useSafeAreaInsets();
  const activeColors = theme.colors[theme.mode];

  return (
    <View
      style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: activeColors.secondary,
            height: 75,
          },
          headerBackTitleStyle: {
            color: activeColors.accent,
          },
          headerTintColor: activeColors.accent,
          headerTitleContainerStyle: {
            alignItems: "center",
            justifyContent: "center",
            bottom: 11.5,
          },
          headerLeftContainerStyle: {
            flex: 1,
            bottom: 10,
          },
          headerTitleAlign: "center",
        }}
      >
        <Stack.Group>
          <Stack.Screen
            name="Login"
            // component={LoginScreen}
            options={{ headerShown: false }}
            children={(props) => <LoginScreen />}
          />
          <Stack.Screen
            name="Register"
            options={{ headerShown: false }}
            component={RegisterScreen}
          />
          <Stack.Screen
            name="MainTabs"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="GoLive"
            component={StreamScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PinCode"
            component={PinCode}
            options={{ headerShown: false }}
          />
        </Stack.Group>
        <Stack.Group>
          {/* <Stack.Screen
            name="SearchModal"
            component={SearchModal}
            options={{ headerShown: true }}
          /> */}
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerShown: true, headerTitleAlign: "center" }}
          />
          <Stack.Screen
            name="MatchHistory"
            component={MatchHistory}
            options={{ headerShown: true, headerTitle: "Match History" }}
          />
          <Stack.Screen
            name="SelectedUserProfile"
            component={SelectedUserProfileScreen}
            options={{ headerShown: true, headerTitle: "User Profile" }}
          />
          <Stack.Screen
            name="PendingMatches"
            component={PendingMatches}
            options={{ headerShown: true, headerTitle: "Challenges" }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </View>
  );
};

export default StackNavigator;
