import { Buffer } from "buffer";
global.Buffer = global.Buffer || Buffer;
import process from "process";
global.process = process;
globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
if (typeof global.atob === "undefined") {
  global.atob = (input) => Buffer.from(input, "base64").toString("binary");
}
import React, { useEffect, useState, useCallback, useRef } from "react";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { AppProvider } from "~/components/timer/context";
import { ToastProvider } from "~/components/ui/toast";
import { LogBox, Platform, Animated, View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import "expo-dev-client";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppState } from "react-native";
import messaging from "@react-native-firebase/messaging";
import { PortalProvider, PortalHost } from "@gorhom/portal";
import { PortalHost as PHost } from "@rn-primitives/portal";
import notifee, {
  EventType,
  AndroidImportance,
  AuthorizationStatus,
} from "@notifee/react-native";
import { getCurrentUser, supabase } from "./components/utils/supabase";
import ActivityLoader from "./components/utils/ActivityLoader";
import AppContent from "./AppContent";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import * as Sentry from "@sentry/react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import {
  getItem,
  setItem,
  clear,
  setObject,
  getObject,
  removeItem,
  removeObject,
} from "~/components/utils/AsyncStorage";
import { TourGuideProvider } from "rn-tourguide";

Sentry.init({
  dsn: "https://0b65b2de868bbb143f80448f0fc59014@o4509216306757632.ingest.us.sentry.io/4509216307806208",

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  async function bootstrap() {
    const initialNotification = await notifee.getInitialNotification();

    if (initialNotification) {
      console.log(
        "Notification caused application to open",
        initialNotification.notification
      );
      console.log(
        "Press action used to open the app",
        initialNotification.pressAction
      );
    }
  }

  async function onDisplayNotification(remoteMessage) {
    await notifee.requestPermission();

    const channelId = await notifee.createChannel({
      id: "default",
      name: "Default Channel",
      sound: "cueball",
      vibration: true,
      vibrationPattern: [200, 500, 200, 500],
      lights: true,
      lightColor: "#4a3e6b",
    });

    await notifee.displayNotification({
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      data: remoteMessage.data,
      android: {
        channelId,
        sound: "cueball",
        lights: ["#4a3e6b", 300, 600],
        importance: AndroidImportance.HIGH,
        smallIcon: "ic_costream",
        color: "#4a3e6b",
        pressAction: {
          id: "default",
        },
      },
    });
  }

  async function checkNotificationPermission() {
    const settings = await notifee.getNotificationSettings();

    if (settings.authorizationStatus == AuthorizationStatus.AUTHORIZED) {
      console.log("Notification permissions has been authorized");
    } else if (settings.authorizationStatus == AuthorizationStatus.DENIED) {
      console.log("Notification permissions has been denied");
    }
  }

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await Font.loadAsync(Ionicons.font);
        await Font.loadAsync(MaterialCommunityIcons.font);
        await Font.loadAsync(Feather.font);

        bootstrap();
        messaging().onMessage(onDisplayNotification);
      } catch (error) {
        console.log("Error loading fonts:", error);
      } finally {
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    (async () => {
      // reveal your JS app *underneath*
      await SplashScreen.hideAsync();

      // fade out the overlay
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800, // <– how long your fade should be
        useNativeDriver: true,
      }).start();
    })();
  }, [isReady]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    checkNotificationPermission();
  }, [isReady]);

  // useEffect(() => {
  //   GoogleSignin.configure({
  //     scopes: [
  //       "https://www.googleapis.com/auth/youtube",
  //       "https://www.googleapis.com/auth/youtube.force-ssl",
  //       "https://www.googleapis.com/auth/firebase.messaging",
  //       "https://www.googleapis.com/auth/cloud-platform",
  //     ],
  //     webClientId:
  //       "616611117861-07fpmevfhj81d6jmgos5f5rtnj0js4tm.apps.googleusercontent.com",
  //   });
  // }, []);

  // if (!fontsLoaded || !isReady) {
  //   return null;
  // }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PortalProvider>
          <AppProvider>
            <BottomSheetModalProvider>
              <AutocompleteDropdownContextProvider>
                <TourGuideProvider androidStatusBarVisible={true}>
                  <AppContent />
                  <ToastProvider />
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      StyleSheet.absoluteFillObject,
                      { backgroundColor: "#322257", opacity: fadeAnim },
                    ]}
                  />
                </TourGuideProvider>
              </AutocompleteDropdownContextProvider>
            </BottomSheetModalProvider>
            <PortalHost />
            <PHost />
          </AppProvider>
        </PortalProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default Sentry.wrap(App);
