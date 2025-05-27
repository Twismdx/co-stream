import Onboarding from "react-native-onboarding-swiper";
import { Image } from "react-native";
import React from "react";
import { useGlobalContext } from "~/components/timer/context";
import { setItem } from "~/components/utils/AsyncStorage";
import { Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const onboardingImageStyle = {
  width: width * 1.05, // 90% of screen width
  height: height * 0.6, // 50% of screen height
  resizeMode: "contain",
  alignSelf: "center", // center the image horizontally
};

const OnboardingScreen = () => {
  const { theme } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];
  const navigation = useNavigation();

  const setIsOnboarded = async () => {
    await setItem("isOnboarded", "true");
    navigation.navigate("MainTabs");
  };

  return (
    <Onboarding
      onDone={() => {
        console.log("done");
        setIsOnboarded();
      }}
      pages={[
        {
          backgroundColor: activeColors.accentVariant,
          image: (
            <Image
              style={onboardingImageStyle}
              source={require("../images/onboarding/1.png")}
            />
          ),
          title: "Welcome to Co-Stream",
          titleStyles: { marginTop: -45 },
          subTitleStyles: { marginBottom: 20, paddingBottom: 20 },
          subtitle: "This is the home screen of the app",
        },
        {
          backgroundColor: activeColors.accentVariant,
          image: (
            <Image
              style={onboardingImageStyle}
              source={require("../images/onboarding/25.png")}
            />
          ),
          title: "Setting your organization",
          titleStyles: { marginTop: -45 },
          subTitleStyles: { marginBottom: 20, paddingBottom: 20 },
          subtitle:
            "Select your organization from the search field. For example, if you play in Super League, search for 'Eight Ball Association of SA Incorporated'. The auto-complete feature will help you find and select the correct organization.",
        },
        {
          backgroundColor: activeColors.accentVariant,
          image: (
            <Image
              style={onboardingImageStyle}
              source={require("../images/onboarding/2.png")}
            />
          ),
          title: "Challenge matches",
          titleStyles: { marginTop: -45 },
          subTitleStyles: { marginBottom: 20, paddingBottom: 20 },
          subtitle:
            "Discover and connect with other players. View their stats and challenge them to exciting matches!",
        },
        {
          backgroundColor: activeColors.accentVariant,
          image: (
            <Image
              style={onboardingImageStyle}
              source={require("../images/onboarding/3.png")}
            />
          ),
          title: "User Profile",
          titleStyles: { marginTop: -45 },
          subTitleStyles: { marginBottom: 20, paddingBottom: 20 },
          subtitle:
            "Get detailed insights into a player's performance, match history, and achievements.",
        },
        {
          backgroundColor: activeColors.accentVariant,
          image: (
            <Image
              style={onboardingImageStyle}
              source={require("../images/onboarding/4.png")}
            />
          ),
          title: "Menu",
          titleStyles: { marginTop: -45 },
          subTitleStyles: { marginBottom: 20, paddingBottom: 20 },
          subtitle:
            "Tap on your avatar to access your profile, match history, pending challenges, and more through the quick-access menu.",
        },
        {
          backgroundColor: activeColors.accentVariant,
          image: (
            <Image
              style={onboardingImageStyle}
              source={require("../images/onboarding/6.png")}
            />
          ),
          title: "Settings",
          titleStyles: { marginTop: -45 },
          subTitleStyles: { marginBottom: 20, paddingBottom: 20 },
          subtitle:
            "Customize your experience with theme options, organization settings, and social account connections, And to view this tutorial again.",
        },
        {
          backgroundColor: activeColors.accentVariant,
          image: (
            <Image
              style={onboardingImageStyle}
              source={require("../images/onboarding/1.png")}
            />
          ),
          title: "Matches",
          titleStyles: { marginTop: -45 },
          subTitleStyles: { marginBottom: 20, paddingBottom: 20 },
          subtitle:
            "View your upcoming matches scheduled for today on the home screen",
        },
        {
          backgroundColor: activeColors.accentVariant,
          image: (
            <Image
              style={onboardingImageStyle}
              source={require("../images/onboarding/7.png")}
            />
          ),
          title: "Streaming a Match",
          titleStyles: { marginTop: -45 },
          subTitleStyles: { marginBottom: 20, paddingBottom: 20 },
          subtitle:
            "Select your match and tap 'Stream this match' to begin the streaming setup process",
        },
        {
          backgroundColor: activeColors.accentVariant,
          image: (
            <Image
              style={onboardingImageStyle}
              source={require("../images/onboarding/8.png")}
            />
          ),
          title: "Stream setup",
          titleStyles: { marginTop: -45 },
          subTitleStyles: { marginBottom: 20, paddingBottom: 20 },
          subtitle:
            "Select your Facebook streaming destination - your profile, a page you manage, or a group you're part of. During this testing phase, profile streaming is the only available option.",
        },
        {
          backgroundColor: activeColors.accentVariant,
          image: (
            <Image
              style={onboardingImageStyle}
              source={require("../images/onboarding/9.png")}
            />
          ),
          title: "Stream title",
          titleStyles: { marginTop: -45 },
          subTitleStyles: { marginBottom: 20, paddingBottom: 20 },
          subtitle:
            "Customize your stream title and description, or use the default format: '[Home Team] vs [Away Team]'",
        },
        {
          backgroundColor: activeColors.accentVariant,
          image: (
            <Image
              style={onboardingImageStyle}
              source={require("../images/onboarding/10.png")}
            />
          ),
          title: "Match Pin",
          titleStyles: { marginTop: -45 },
          subTitleStyles: { marginBottom: 20, paddingBottom: 20 },
          subtitle:
            "Each match generates a unique pin. Share this pin with umpires/referees to allow them to control the timer. For challenge matches, your opponent can use this pin to connect to the timer and scoring system.",
        },
        {
          backgroundColor: activeColors.accentVariant,
          image: (
            <Image
              style={onboardingImageStyle}
              source={require("../images/onboarding/11.png")}
            />
          ),
          title: "Match QR code",
          titleStyles: { marginTop: -45 },
          subTitleStyles: { marginBottom: 20, paddingBottom: 20 },
          subtitle:
            "Or if you prefer you can share this QR code with umpires/referees/opponent to allow them to control the timer. For challenge matches, your opponent can scan the QR code with their camera to connect to the timer and scoring system.",
        },
        {
          backgroundColor: activeColors.accentVariant,
          image: (
            <Image
              style={onboardingImageStyle}
              source={require("../images/onboarding/12.png")}
            />
          ),
          title: "Timer Screen",
          titleStyles: { marginTop: -45 },
          subTitleStyles: { marginBottom: 20, paddingBottom: 20 },
          subtitle:
            "Control match timing, scoring, and game settings from this central hub. The timer screen gives you complete control over your match.",
        },
        {
          backgroundColor: activeColors.accentVariant,
          image: (
            <Image
              style={onboardingImageStyle}
              source={require("../images/onboarding/15.png")}
            />
          ),
          title: "Live Streaming Controls",
          titleStyles: { marginTop: -45 },
          subTitleStyles: { marginBottom: 20, paddingBottom: 20 },
          subtitle:
            "Manage your live stream with intuitive controls. Start broadcasting with the center button, and toggle audio with the mute button on the right.",
        },
        {
          backgroundColor: activeColors.accentVariant,
          image: (
            <Image
              style={onboardingImageStyle}
              source={require("../images/onboarding/16.png")}
            />
          ),
          title: "Scoreboard Overlay",
          titleStyles: { marginTop: -45 },
          subTitleStyles: { marginBottom: 20, paddingBottom: 20 },
          subtitle:
            "Access the scoreboard menu from the top-right icon. Enable the overlay to display live scores to your viewers during the stream.",
        },
        {
          backgroundColor: activeColors.accentVariant,
          image: (
            <Image
              style={onboardingImageStyle}
              source={require("../images/onboarding/17.png")}
            />
          ),
          title: "Customize Scoreboard",
          titleStyles: { marginTop: -45 },
          subTitleStyles: { marginBottom: 20, paddingBottom: 20 },
          subtitle:
            "After enabling the scoreboard, you can freely position it anywhere on screen. Use pinch gestures to adjust its size to your preference.",
        },
      ]}
    />
  );
};

export default OnboardingScreen;
