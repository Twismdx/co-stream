import { registerRootComponent } from "expo";
import App from "./App";
import notifee, { AndroidImportance, EventType } from "@notifee/react-native";
import * as Linking from "expo-linking";
import messaging from "@react-native-firebase/messaging";

const deepLinkMap = {
  // Auth & Onboarding Screens
  Login: "com.costream://Login",
  Register: "com.costream://Register",

  // Main Navigator
  MainTabs: "com.costream://MainTabs",
  Home: "com.costream://Home",
  Timer: "com.costream://Timer",
  Settings: "com.costream://Settings",

  // Additional Stack Screens
  GoLive: "com.costream://GoLive",
  PinCode: "com.costream://PinCode",
  SearchModal: "com.costream://SearchModal",
  Profile: "com.costream://Profile",
  MatchHistory: "com.costream://MatchHistory",
  ChallengeMatch: "com.costream://ChallengeMatch",
  PendingMatches: "com.costream://PendingMatches",
};

function buildDeepLinkFromNotificationData(data) {
  console.log("buildDeepLinkFromNotificationData received:", data);
  const navigationId = data?.navigationId;
  if (!navigationId || !deepLinkMap[navigationId]) {
    return null;
  }
  return deepLinkMap[navigationId];
}

const handleBackgroundMessage = async (remoteMessage) => {
  const channelId = await notifee.createChannel({
    id: "default",
    name: "Default Channel",
    vibration: true,
    sound: "cueball",
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
      importance: AndroidImportance.HIGH,
      lights: ["#4a3e6b", 300, 600],
      smallIcon: "ic_costream",
      color: "#4a3e6b",
    },
  });
};

messaging().setBackgroundMessageHandler(handleBackgroundMessage);

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    const { notification } = detail;
    const url = buildDeepLinkFromNotificationData(notification?.data);
    if (url) {
      Linking.openURL(url);
    }
    await notifee.cancelNotification(notification.id);
  }
});

if (typeof FinalizationRegistry === "undefined") {
  global.FinalizationRegistry = class {
    constructor(callback) {
      // Optionally log a warning that this is a polyfill.
    }
    register() {}
    unregister() {}
  };
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately

registerRootComponent(App);
