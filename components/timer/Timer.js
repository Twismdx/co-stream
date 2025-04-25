import React, { useState, useContext, useEffect } from "react";
import { useGlobalContext } from "./context";
import LinearGradient from "expo-linear-gradient";
import Controllers from "./Controllers";
import { Audio } from "expo-av";
import Config from "./Config";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Vibration,
  Dimensions,
} from "react-native";
import Clock from "./Clock";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../utils/supabase";
const { width, height } = Dimensions.get("window"); // Get screen dimensions

const Timer = ({ matchId }) => {
  const { theme } = useGlobalContext();
  let activeColors = theme.colors[theme.mode];
  const {
    progressBarPercentage,
    isPlaying,
    setIsPlaying,
    selectedFont,
    minuteTimer,
    setTime,
    actionText,
    selectedController,
    shortTimer,
    colorChoosed,
    setClockStatus,
    setActionText,
    key,
    setKey,
  } = useGlobalContext();
  const [isPortrait, setIsPortrait] = useState(true);

  const checkOrientation = () => {
    const { width, height } = Dimensions.get("window");
    setIsPortrait(height > width);
  };

  // Listen to orientation changes
  useEffect(() => {
    checkOrientation(); // Set the initial orientation
    const subscription = Dimensions.addEventListener(
      "change",
      checkOrientation
    ); // Add listener

    return () => {
      subscription?.remove(); // Clean up the listener
    };
  }, []);

  const styles = {
    mainContainer: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 50,
    },
    mainDivTimer: {
      // flex: 1,
      justifyContent: "center",
      alignItems: "center",
      // marginTop: 40,
      textAlign: "center",
      // width: 656,
      // height: 656,
      position: "relative",
      // borderRadius: 100,
      mixBlendMode: "normal",
      boxShadow: "-50px -50px 100px #272c5a, 50px 50px 100px #121530",
      zIndex: -1,
    },
    secondCircle: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      mixBlendMode: "normal",
      width: 55.6,
      height: 55.6,
      borderRadius: 50,
      backgroundColor: "#161932",

      // zIndex: ,
    },
    actionTextDiv: {
      flex: 1,
      backgroundColor: "transparent",
      position: "absolute",
      fontSize: 8.8,
      lineHeight: 8.8,
      letterSpacing: 12,
      color: "#d7e0ff",
      marginTop: 51.2,
      marginLeft: 840,
    },
    container: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "center",
      transform: [{ scale: 0.85 }],
    },
    landscapeContainer: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "center",
      transform: [{ scale: 0.95 }],
      marginTop: -50,
    },
    gradient: {
      width: 400, // Approx 41rem, adjust based on your screen size
      height: 400, // Approx 41rem
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 200, // Half of width/height to make it a circle
      // height: height - 75,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 1,
      shadowRadius: 3.84,
      elevation: 15,
    },
    content: {
      flex: 1,
      width: "100%",
      // height: '100%',
      justifyContent: "center",
      alignItems: "center",
    },
    // start: {
    // 	left: 0,
    // 	transform: [{ translateX: 0 }, { translateY: -0 }],
    // },
    // pause: {
    // 	left: 0,
    // 	transform: [{ translateX: 0 }, { translateY: -0 }],
    // },
    // restart: {
    // 	left: 0,
    // 	transform: [{ translateX: 0 }, { translateY: -0 }],
    // },
  };

  let marginValue = 0;
  let letterSpace = 0;
  let fontSizeForFont = 0;

  if (selectedFont === "semiBold") {
    marginValue = 15;
    letterSpace = -5;
    fontSizeForFont = 120;
  } else if (selectedFont === "extraBold") {
    marginValue = -20;
    letterSpace = 0;
    fontSizeForFont = 120;
  } else if (selectedFont === "Technology") {
    marginValue = -15;
    letterSpace = -5;
    fontSizeForFont = 120;
  }

  // async function Beep() {
  // 	const { sound } = await Audio.Sound.createAsync(beepSfx)
  // 	sound.playAsync()
  // }

  useEffect(() => {
    const halfTime = progressBarPercentage / 2;
    if (isPlaying === true) {
      if (progressBarPercentage === halfTime) {
        Vibration.vibrate(500);
      } else if (progressBarPercentage === 0) {
        Vibration.vibrate(2);
      }
    }
  }, [progressBarPercentage, isPlaying]);

  const determineTotalTime = () => {
    switch (selectedController) {
      case "shortTimer":
        return shortTimer;
      case "minuteTimer":
        return minuteTimer;
      default:
        return progressBarPercentage;
    }
  };

  // const handleUpdateDB = async (remainingTime) => {
  //   if (!matchId) return;

  //   const totalTime = determineTotalTime();

  //   const { error } = await supabase
  //     .from('challenges')
  //     .update({
  //       timer: remainingTime,
  //       total_time: totalTime, // Note: Using the column name from your table definition
  //     })
  //     .eq('challengeId', matchId);

  //   if (error) {
  //     console.error('Supabase update error:', error);
  //   }
  // };

  const handleComplete = () => {
    setKey((prevKey) => prevKey + 1);
    setIsPlaying(false);
  };

  const handleReset = () => {
    const totalTime = determineTotalTime();
    setKey((prevKey) => prevKey + 1);
    setTime(totalTime);
    // handleUpdateDB(totalTime); // Reset timer in Firebase
  };

  const handleAction = () => {
    const totalTime = determineTotalTime();

    if (actionText === "START") {
      setClockStatus("Started");
      setActionText("PAUSE");
      setIsPlaying(true);
      // handleUpdateDB(totalTime); // Initialize totalTime in Firebase
    } else if (actionText === "PAUSE") {
      setClockStatus("Stopped");
      setActionText("START");
      setIsPlaying(false);
    } else if (actionText === "RESTART") {
      setClockStatus("Stopped");
      setIsPlaying(false);
      handleReset();
      setActionText("START");
    }
  };

  const children = () => {
    return <Clock />;
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View style={styles.mainContainer}>
        <Controllers />
        <View style={isPortrait ? styles.container : styles.landscapeContainer}>
          <LinearGradient
            colors={["#242848", "#0b0d21"]}
            style={styles.gradient}
            start={{ x: 0.7, y: 1 }}
            angle={115}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.content}>
              <TouchableOpacity
                // style={[
                // 	styles.mainDivTimer,
                // 	{
                // 		backgroundColor: 'transparent'
                // 	},
                // ]}
                onPress={handleAction}
              >
                <CountdownCircleTimer
                  size={360}
                  strokeWidth={20}
                  duration={progressBarPercentage}
                  role="figure"
                  isPlaying={isPlaying}
                  colors={["#70f87b", "#F87070", "#f84747"]}
                  colorsTime={[progressBarPercentage, 15, 0]}
                  isSmoothColorTransition={true}
                  rotation={"counterclockwise"}
                  trailColor="#2e325a"
                  trailStrokeWidth={20}
                  strokeLinecap={"round"}
                  updateInterval={0}
                  children={children}
                  key={key}
                  // onUpdate={(remainingTime) => handleUpdateDB(remainingTime)}
                  onComplete={handleComplete}
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
      <Config />
    </View>
  );
};

export default Timer;
