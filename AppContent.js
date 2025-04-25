import React, { useEffect, useState, useCallback } from "react";
import { Text } from "react-native";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { useGlobalContext } from "~/components/timer/context";
import StackNavigator from "~/components/navigators/StackNavigator";
import URLListener from "~/components/utils/URLListener";
import notifee, { EventType } from "@notifee/react-native";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { getItem, setItem, clear } from "~/components/utils/AsyncStorage";
import * as Linking from "expo-linking";
import { StatusBar } from "expo-status-bar";
import useUserPresence from "~/components/utils/useUserPresence";
import { supabase, getCurrentUser } from "~/components/utils/supabase";
import ActivityLoader from "./components/utils/ActivityLoader";
import Toast from "~/components/ui/toast";
import { getMessaging } from "@react-native-firebase/messaging";
import { upsertFcmToken } from "~/components/utils/API";

// deep-link map
export const deepLinkMap = {
  Login: "com.costream://Login",
  Register: "com.costream://Register",
  MainTabs: "com.costream://MainTabs",
  Home: "com.costream://Home",
  Timer: "com.costream://Timer",
  Settings: "com.costream://Settings",
  GoLive: "com.costream://GoLive",
  PinCode: "com.costream://PinCode",
  SearchModal: "com.costream://SearchModal",
  Profile: "com.costream://Profile",
  MatchHistory: "com.costream://MatchHistory",
  ChallengeMatch: "com.costream://ChallengeMatch",
  PendingMatches: "com.costream://PendingMatches",
};

function buildDeepLinkFromNotificationData(data) {
  const navigationId = data?.navigationId;
  if (!navigationId || !deepLinkMap[navigationId]) return null;
  return deepLinkMap[navigationId];
}

const linking = {
  prefixes: ["com.costream://", "https://supabase.brellahost.com.au"],
  config: {
    initialRouteName: "Login",
    screens: {
      Login: "Login",
      Register: "Register",
      MainTabs: {
        screens: {
          Home: "Home",
          Timer: "Timer",
          Settings: "Settings",
        },
      },
      GoLive: "GoLive",
      PinCode: "PinCode",
      SearchModal: "SearchModal",
      Profile: "Profile",
      MatchHistory: "MatchHistory",
      ChallengeMatch: "ChallengeMatch",
      PendingMatches: "PendingMatches",
    },
  },
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    return url ?? null;
  },
  subscribe(listener) {
    const onReceiveURL = ({ url }) => listener(url);
    const sub = Linking.addEventListener("url", onReceiveURL);
    return () => sub.remove();
  },
};

const navigation = createNavigationContainerRef();

export default function AppContent() {
  const {
    theme,
    user,
    setUser,
    isLoading,
    setIsLoading,
    isLoggedIn,
    setIsLoggedIn,
    freshSignIn,
    session,
    setSession,
    setSelectedSource,
    setSelectedOrg,
    setIsEmailSignIn,
  } = useGlobalContext();

  const [notifeeDialog, setNotifeeDialog] = useState(false);

  // Supabase auth listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        await clear();
        setSession(null);
        setIsLoggedIn(false);
        setSelectedOrg(null);
        setIsEmailSignIn(false);
        setSelectedSource(null);
        setUser(null);
        if (navigation.isReady()) {
          navigation.navigate("Login");
        }
      } else if (session) {
        setSession(session);
      }
    });
    return () => subscription.unsubscribe();
  }, [
    setSession,
    setIsLoggedIn,
    setSelectedOrg,
    setIsEmailSignIn,
    setSelectedSource,
    setUser,
  ]);

  // Welcome toast helper
  const showToast = useCallback((userName) => {
    Toast.show({
      type: "success",
      text1: "Welcome back!",
      text2: `Glad to see you, ${userName}`,
      visibilityTime: 3000,
    });
  }, []);

  // External-token check & routing on fresh sign-in
  useEffect(() => {
    async function bootstrap() {
      if (!session) return;
      try {
        const fbToken = await getMessaging().getToken();
        await upsertFcmToken(session.user.id, fbToken);
      } catch {}
      const currentUser = await getCurrentUser(session.user.id);
      if (currentUser) setUser(currentUser);

      if (!freshSignIn) {
        setIsLoggedIn(true);
        if (navigation.isReady()) {
          navigation.navigate("MainTabs");
          setTimeout(() => {
            const name = session.user.user_metadata?.name;
            showToast(name);
          }, 1000);
        }
      }
    }
    bootstrap();
  }, [session, freshSignIn, setUser, setIsLoggedIn, showToast]);

  // Presence
  useUserPresence(user?.id);

  // Handle in-app notifications
  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.ACTION_PRESS || type === EventType.PRESS) {
        const url = buildDeepLinkFromNotificationData(
          detail.notification?.data
        );
        if (url) Linking.openURL(url);
      }
    });
    return unsubscribe;
  }, []);

  // Prompt to enable notifications
  const handleNotifications = async () => {
    setNotifeeDialog(true);
  };

  return (
    <ActivityLoader>
      <StatusBar style="auto" />
      <NavigationContainer
        linking={linking}
        fallback={<Text>Loading…</Text>}
        ref={navigation}
      >
        <AlertDialog
          open={notifeeDialog}
          onOpenChange={(open) => {
            if (!open) setNotifeeDialog(false);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Allow Notifications</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              To get the best experience, please turn on notifications.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogAction onPress={handleNotifications}>
                Allow
              </AlertDialogAction>
              <AlertDialogCancel onPress={() => setNotifeeDialog(false)}>
                Don't allow
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <URLListener />
        <StackNavigator />
      </NavigationContainer>
    </ActivityLoader>
  );
}
