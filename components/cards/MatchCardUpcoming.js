import React, {
  useContext,
  useState,
  useEffect,
  startTransition,
  useMemo,
  useRef,
} from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Text,
  Linking,
} from "react-native";
import { useGlobalContext } from "../timer/context";
import { useNavigation } from "@react-navigation/native";
import CountdownTimer from "../timer/CountdownTimer";
import axios from "axios";

// --- Day.js imports ---
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Extend Day.js
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

import { getTimeZone } from "react-native-localize";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

export const upcomingWindowWidth = Dimensions.get("window").width;
export const upcomingCardWidth = upcomingWindowWidth * 0.8;
export const upcomingCardHeight = (upcomingCardWidth / 3) * 2;

const MatchCardUpcoming = ({
  imageSource,
  title,
  home,
  away,
  matchId,
  homeScore,
  awayScore,
  matchTime, // e.g. "10:00:00"
  homePoints,
  awayPoints,
  timer,
  compId,
  orgCode,
  hasMatchPoints,
  matchTimezone,
  index,
  upcomingScrollOffset,
  openPoolstatA,
}) => {
  const {
    liveStats,
    selectedMatch,
    setSelectedMatch,
    theme,
    showModal,
    setShowModal,
    streamTitle,
    setShowModal1,
    setStreamTitle,
    desc,
    setDesc,
    actionSheet,
    setActionSheet,
  } = useGlobalContext();
  const navigation = useNavigation();
  const activeColors = theme.colors[theme.mode];
  const [timeRemaining, setTimeRemaining] = useState();
  const sheetRef = useRef(null);

  const handleClose = () =>
    setActionSheet((prevState) => ({
      ...prevState,
      show: false,
    }));

  const handleData = async () => {
    await setActionSheet({
      show: true,
      matchTime: matchTime,
      matchId: matchId,
      compId: compId,
      orgCode: orgCode,
    });
    await setStreamTitle(`${home} Vs ${away}`);
    await setDesc(`${home} Vs ${away}`);
    await openPoolstatA();
  };

  useEffect(() => {
    // Debug log
    if (!home || !away) {
      console.log("Missing required props:", { home, away, matchTime });
      return;
    } else if (!matchTime) {
      return;
    }

    try {
      // Parse 12-hour time format
      const timeRegex = /(\d+):(\d+)\s?(AM|PM)/i;
      const matches = matchTime.match(timeRegex);

      if (!matches) {
        console.error("Invalid time format:", matchTime);
        return;
      }

      let [_, hours, minutes, period] = matches;
      hours = parseInt(hours);
      minutes = parseInt(minutes);

      // Convert to 24-hour format if PM
      if (period.toUpperCase() === "PM" && hours < 12) {
        hours += 12;
      }
      // Handle 12 AM edge case
      if (period.toUpperCase() === "AM" && hours === 12) {
        hours = 0;
      }

      // Create match date
      const matchDate = new Date();
      matchDate.setHours(hours);
      matchDate.setMinutes(minutes);
      matchDate.setSeconds(0);

      // Get current time and calculate difference
      const now = new Date();
      const secondsUntil = Math.floor((matchDate - now) / 1000);

      // Set countdown timer
      setTimeRemaining(Math.max(0, secondsUntil));
    } catch (err) {
      console.error("Error parsing match time:", matchTime, err);
      setTimeRemaining(0);
    }
  }, [matchTime, home, away]);

  const rContainerStyle = useAnimatedStyle(() => {
    const activeIndex = upcomingScrollOffset.value / upcomingCardWidth;
    const paddingLeft = (upcomingWindowWidth - upcomingCardWidth) / 4;
    const translateX = interpolate(
      activeIndex,
      [index - 2, index - 1, index, index + 1],
      [120, 60, 0, -upcomingCardWidth - paddingLeft * 2],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      activeIndex,
      [index - 2, index - 1, index, index + 1],
      [0.8, 0.9, 1, 1],
      Extrapolation.CLAMP
    );

    return {
      left: paddingLeft,
      transform: [
        {
          translateX: upcomingScrollOffset.value + translateX,
        },
        { scale },
      ],
    };
  }, []);

  return (
    <Animated.View
      style={[
        {
          zIndex: -index,
        },
        rContainerStyle,
      ]}
    >
      <TouchableOpacity
        style={[styles.container, { backgroundColor: activeColors.secondary }]}
        onPress={handleData}
      >
        <View style={styles.contentContainer}>
          <View style={styles.teamRow}>
            <View style={[styles.sideTeam, { alignItems: "flex-end" }]}>
              <Text
                style={[styles.teamName, { color: activeColors.accent }]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {home}
              </Text>
            </View>

            <View style={styles.centerMarker}>
              <Text style={[styles.vsText, { color: activeColors.accent2 }]}>
                Vs
              </Text>
            </View>

            <View style={[styles.sideTeam, { alignItems: "flex-start" }]}>
              <Text
                style={[styles.teamName, { color: activeColors.accent }]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {away}
              </Text>
            </View>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.divider} />
            <View style={styles.matchStatusRow}>
              <View style={[styles.sideTeam, { alignItems: "flex-end" }]}>
                <Text
                  style={[styles.matchStatus, { color: activeColors.accent2 }]}
                >
                  Starting Soon
                </Text>
              </View>

              <View style={styles.centerMarker}>
                <Text style={[styles.bullet, { color: activeColors.accent }]}>
                  •
                </Text>
              </View>

              <View style={[styles.sideTeam, { alignItems: "flex-start" }]}>
                <Text
                  style={[styles.frameText, { color: activeColors.accent2 }]}
                >
                  {matchTime ? (
                    <CountdownTimer
                      customColor={activeColors.onPrimary}
                      timer={timeRemaining}
                    />
                  ) : (
                    <Text style={{ color: activeColors.error }}>
                      No Start Time
                    </Text>
                  )}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: upcomingCardWidth,
    height: (upcomingCardWidth / 5) * 2,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    position: "absolute",
  },
  contentContainer: {
    // flex: 1,
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    height: "100%",
    justifyContent: "space-between",
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    gap: 15,
  },

  matchStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // paddingHorizontal: 10,
    marginTop: 5,
    gap: 5,
  },

  sideTeam: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 10,
  },

  centerMarker: {
    width: 40, // enough for 'Vs' or bullet to sit dead center
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  teamName: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    width: "100%",
  },

  vsText: {
    fontSize: 18,
    fontWeight: "700",
  },

  matchStatus: {
    fontSize: 14,
    textAlign: "center",
  },

  bullet: {
    fontSize: 20,
    textAlign: "center",
  },

  frameText: {
    fontSize: 14,
    textAlign: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    textAlignVertical: "center",
    flexWrap: "wrap",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(128, 128, 128, 0.2)",
    marginVertical: 10,
  },
});

export default MatchCardUpcoming;
