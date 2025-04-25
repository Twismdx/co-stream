import React, { useContext, useState, useEffect, startTransition } from "react";
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
import { useGlobalContext } from "../../timer/context";
import { useNavigation } from "@react-navigation/native";
import CountdownTimer from "../../timer/CountdownTimer";
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

const CardComponent = ({
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
  scrollOffset,
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

  const handleClose = () =>
    setActionSheet((prevState) => ({
      ...prevState,
      show: false,
    }));

  const handleData = () => {
    setActionSheet((prevState) => ({
      ...prevState,
      show: true,
      matchTime: matchTime,
      matchId: matchId,
      compId: compId,
      orgCode: orgCode,
    }));
    setStreamTitle(`${home} Vs ${away}`);
    setDesc(`${home} Vs ${away}`);
    setShowModal1(true);
  };

  useEffect(() => {
    // Debug log
    if (!home || !away || !matchTime) {
      console.log("Missing required props:", { home, away, matchTime });
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

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: activeColors.secondary }]}
      onPress={handleData}
    >
      <View style={styles.contentContainer}>
        <View style={styles.teamContainer}>
          <View style={styles.teamSection}>
            <Text
              style={[styles.title, { color: activeColors.accent }]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {home}
            </Text>
          </View>

          <View style={styles.centerSection}>
            <Text style={[styles.vsText, { color: activeColors.accent2 }]}>
              Vs
            </Text>
          </View>

          <View style={styles.teamSection}>
            <Text
              style={[styles.title, { color: activeColors.accent }]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {away}
            </Text>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.divider} />
          <View style={styles.matchStatusContainer}>
            <Text
              style={[styles.matchStatus, { color: activeColors.accent2 }]}
              numberOfLines={1}
            >
              Starting Soon
            </Text>
            <Text style={[styles.bullet, { color: activeColors.accent }]}>
              •
            </Text>
            <View style={styles.frameText}>
              <CountdownTimer
                customColor={activeColors.onPrimary}
                timer={timeRemaining}
              />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CardComponent;

const styles = StyleSheet.create({
  container: {
    width: 325,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderRadius: 20,
    margin: 10,
    height: 100, // Fixed height for consistency
  },
  contentContainer: {
    paddingVertical: 15, // Ensures even vertical padding
    paddingHorizontal: 10,
    height: "100%",
    justifyContent: "space-between",
  },
  teamContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  teamSection: {
    flex: 0.45,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 22,
  },
  centerSection: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -12 }],
    zIndex: 1,
  },
  title: {
    // fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: "100%",
  },
  bottomSection: {
    flex: 1,
    justifyContent: "flex-end",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(128, 128, 128, 0.2)",
    marginVertical: 10,
  },
  vsText: {
    fontSize: 16,
    fontWeight: "600",
  },
  matchStatusContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    width: "100%",
    marginVertical: 3,
  },
  matchStatus: {
    position: "absolute",
    left: "12%",
    fontSize: 14,
  },
  bullet: {
    position: "absolute",
    fontSize: 24,
    left: "50%",
    transform: [{ translateX: -6.5 }],
    textAlignVertical: "center",
  },
  frameText: {
    position: "absolute",
    left: "57%",
    fontSize: 14,
  },
});
