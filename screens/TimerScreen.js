import React from "react";
import { WebView } from "react-native-webview";
import Constants from "expo-constants";
import { StyleSheet, View, Text, Platform, BackHandler } from "react-native";
import { getItem, setItem } from "~/components/utils/AsyncStorage";
import { useGlobalContext } from "@/components/timer/context";
import ActivityLoader from "@/components/utils/ActivityLoader";
import {
  useIsFocused,
  useNavigation,
  usePreventRemove,
} from "@react-navigation/native";
import CheckboxWithLabel from "~/components/CheckBox";
import Dialog2 from "~/components/modals/AlertDialog2";
import Dialog from "~/components/modals/AlertDialog";

export default function TimerScreen({ route }) {
  const { actionSheet, theme, isLoading, setIsLoading } = useGlobalContext();
  const webviewRef = React.useRef(null);
  const isFocused = useIsFocused();
  const stats = route?.params?.stats;
  const syncTimer = route?.params?.syncTimer;
  const pin = route?.params?.pin;
  const [checked, setChecked] = React.useState(false);
  const activeColors = theme.colors[theme.mode];
  const navigation = useNavigation();
  // States for the exit confirmation and "do not remind me again" flag.
  const [exitPopupVisible, setExitPopupVisible] = React.useState(false);
  const [doNotRemind, setDoNotRemind] = React.useState(false);
  // State for the initial live match prompt.
  const [initialPromptVisible, setInitialPromptVisible] = React.useState(false);
  // Hold the navigation event so we can proceed later if needed.
  const [pendingNavigationEvent, setPendingNavigationEvent] =
    React.useState(null);

  // Generate a key for the WebView.
  const webViewKey = React.useMemo(
    () =>
      syncTimer ? `webview-${stats.challengeid}` : `webview-${Date.now()}`,
    [isFocused]
  );

  React.useEffect(() => {
    // If syncTimer is true and team data is available, we're ready.
    if (stats?.homeTeam && syncTimer) {
      setIsLoading(false);
    }
  }, [stats, syncTimer]);

  // Show the initial prompt if syncTimer is false or undefined.
  React.useEffect(() => {
    if (!syncTimer && !pin) {
      setIsLoading(false);
      setInitialPromptVisible(true);
    } else if (pin) {
      setIsLoading(false);
    }
  }, [syncTimer]);

  // Load the "do not remind" flag from AsyncStorage on mount.
  React.useEffect(() => {
    getItem("doNotRemindTimerPopup").then((value) => {
      if (value === "true") {
        setDoNotRemind(true);
        setExitPopupVisible(false);
      }
    });
  }, []);

  const handleContinue = () => {
    setExitPopupVisible(false);
    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs" }],
    });
  };

  React.useEffect(() => {
    const onHardwareBackPress = () => {
      // only show the popup if “doNotRemind” is false
      if (!doNotRemind) {
        setExitPopupVisible(true);
        return true; // prevent default (the app closing)
      }
      return false; // allow default exit if user opted out
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onHardwareBackPress
    );
    return () => subscription.remove();
  }, [doNotRemind]);

  // usePreventRemove(!doNotRemind, ({ data: { action } }) => {
  //   console.log("🔥 beforeRemove fired!", action);
  //   setPendingNavigationEvent(action);
  //   setExitPopupVisible(true);
  // });

  const buildMessageJavaScript = (action, payload) => {
    const message = JSON.stringify({ action, payload });
    const safeString = JSON.stringify(message);
    return `window.onMessageFromRN(${safeString});`;
  };

  const postMessageToWebApp = (webviewRef, action, payload) => {
    webviewRef.current.injectJavaScript(
      buildMessageJavaScript(action, payload)
    );
  };

  const sendAvatarData = () => {
    if (stats?.challengeid && syncTimer) {
      const payload = {
        p1Avatar: true,
        p2Avatar: true,
        p1AvatarUrl: stats?.homeTeam?.avatar,
        p2AvatarUrl: stats?.awayTeam?.avatar,
        homeTeam: {
          id: stats?.homeTeam?.id,
          name: stats?.homeTeam?.name,
        },
        awayTeam: {
          id: stats?.awayTeam?.id,
          name: stats?.awayTeam?.name,
        },
        challengeid: stats?.challengeid,
        pin: stats?.pin,
      };
      const payload2 = { pin: pin };
      if (syncTimer === true) {
        postMessageToWebApp(webviewRef, "updateAvatars", payload);
      } else if (syncTimer === false) {
        postMessageToWebApp(webviewRef, "updateAvatars", payload2);
      }
    }
  };

  const handleCancel = React.useCallback(() => {
    setExitPopupVisible(false);
    setPendingNavigationEvent(null);
  }, []);

  // Handler for toggling the "Do not remind me again" checkbox.
  const handleDoNotRemindChange = async (newValue) => {
    setDoNotRemind(newValue);
    await setItem("doNotRemindTimerPopup", newValue ? "true" : "false");
  };

  // Handlers for the initial prompt.
  const handleInitialNo = () => {
    setInitialPromptVisible(false);
    setIsLoading(false);
  };
  const handleInitialYes = () => {
    setInitialPromptVisible(false);
    navigation.navigate("PinCode");
  };

  React.useEffect(() => {
    if (isFocused && webviewRef.current) {
      webviewRef.current.reload();
    }
  }, [isFocused]);

  return (
    <View style={styles.container}>
      {!initialPromptVisible && !isLoading && (
        <WebView
          key={webViewKey}
          ref={webviewRef}
          style={styles.webview}
          source={{ uri: "http://timer.co-stream.live/" }}
          mediaPlaybackRequiresUserAction={false}
          thirdPartyCookiesEnabled
          startInLoadingState
          domStorageEnabled
          javaScriptEnabled
          allowsInlineMediaPlayback
          scalesPageToFit={true}
          onLoadEnd={() => {
            if (!isLoading && stats?.challengeid) {
              sendAvatarData();
            }
          }}
          onMessage={(event) => {
            console.log(event.nativeEvent.data);
          }}
        />
      )}
      {exitPopupVisible && !doNotRemind && (
        <Dialog2
          title={"Warning"}
          desc={
            "If you exit this screen, you will have to re-enter your match PIN to reconnect."
          }
          cancel={"Cancel"}
          action={"Continue"}
          open={exitPopupVisible}
          actionPress={() => {
            handleContinue();
          }}
          cancelPress={() => {
            handleCancel();
          }}
        >
          <CheckboxWithLabel
            label="Do not remind me again"
            checked={doNotRemind}
            onCheckedChange={handleDoNotRemindChange}
          />
        </Dialog2>
      )}
      {initialPromptVisible && (
        <Dialog
          title={"Timer"}
          desc={"Are you connecting to a live streaming match?"}
          cancel={"No"}
          action={"Yes"}
          open={initialPromptVisible}
          actionPress={handleInitialYes}
          cancelPress={handleInitialNo}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
  webview: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
  },
});
