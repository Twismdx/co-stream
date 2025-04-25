import { Buffer } from "buffer";
global.Buffer = global.Buffer || Buffer;
import process from "process";
global.process = process;
globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
if (typeof global.atob === "undefined") {
  global.atob = (input) => Buffer.from(input, "base64").toString("binary");
}
import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { AppProvider } from "~/components/timer/context";
import { ToastProvider } from "~/components/ui/toast";
import { LogBox, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";
// import {OpenSans_600SemiBold} from '@expo-google-fonts/open-sans'
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
import {
  useFonts,
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from "@expo-google-fonts/inter";
import { getCurrentUser, supabase } from "./components/utils/supabase";
import ActivityLoader from "./components/utils/ActivityLoader";
import AppContent from "./AppContent";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://0b65b2de868bbb143f80448f0fc59014@o4509216306757632.ingest.us.sentry.io/4509216307806208',

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

SplashScreen.preventAutoHideAsync();

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [fontsLoaded] = useFonts({
    // OpenSans_600SemiBold: OpenSans_600SemiBold,
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

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
        if (fontsLoaded) {
          await SplashScreen.hideAsync();

          bootstrap()
            .then(() => setIsReady(true))
            .catch(console.error);

          messaging().onMessage(onDisplayNotification);
        }
      } catch (error) {
        console.error("Error initializing app:", error);
      }
    };
    initializeApp();
  }, [fontsLoaded]);

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
  }, [fontsLoaded]);

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
                <AppContent />
                <ToastProvider />
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