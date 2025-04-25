import React, { useState, useEffect, startTransition } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
import { useGlobalContext } from "../timer/context";
import CountdownTimer from "../timer/CountdownTimer";
import moment from "moment-timezone";
import { getTimeZone } from "react-native-localize";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

export const challengeWindowWidth = Dimensions.get("window").width;
export const challengeCardWidth = challengeWindowWidth * 0.8;
export const challengeCardHeight = (challengeCardWidth / 3) * 2;

const CardComponent = ({
  title,
  owner,
  opponent,
  matchId,
  homeScore,
  awayScore,
  matchTime, // Could be just "01:42 PM" OR "6/1/2025, 01:42 PM"
  homePoints,
  awayPoints,
  stats,
  orgCode,
  compId,
  hasMatchPoints,
  route,
  compTitle,
  playerName,
  raceTo,
  matchPin,
  challengeid,
  index,
  challengeScrollOffset,
  openChallengeA,
}) => {
  const {
    theme,
    showModal,
    setShowModal,
    showModal1,
    setShowModal1,
    setActionSheet,
    setStreamTitle,
    setDesc,
    actionSheet,
  } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];
  const [time, setTime] = useState(null);
  const [isMatchStarted, setIsMatchStarted] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  // Handle pressing the card
  const handleData = async () => {
    await setActionSheet({
      show: true,
      challengeId: challengeid,
      matchPin: matchPin,
      owner: owner,
      opponent: opponent,
    });
    await setStreamTitle(`${owner} Vs ${opponent}`);
    await setDesc(`${owner} Vs ${opponent}`);
    openChallengeA();
  };

  useEffect(() => console.log(challengeid, matchPin), [challengeid, matchPin]);

  useEffect(() => {
    if (!matchTime) return; // No match time => exit

    // Detect the user's current timezone
    const timezone = getTimeZone();
    const currentTime = moment().tz(timezone); // Current time in that timezone

    // 1. Check if matchTime contains a date component (e.g. "6/1/2025")
    //    This is a naive check; adapt to your format if needed.
    const hasDateInfo = matchTime.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/);

    let matchDateTime;
    if (hasDateInfo) {
      // matchTime is something like "6/1/2025, 01:42 PM"
      // Adjust format if you have seconds => "D/M/YYYY, h:mm:ss a"
      // or if you only have h:mm => "D/M/YYYY, h:mm a"
      matchDateTime = moment(matchTime, "D/M/YYYY, h:mm A").tz(timezone);
    } else {
      // matchTime is only "01:42 PM" => combine with *today's date*
      const todayString = currentTime.format("D/M/YYYY"); // e.g. "6/1/2025"
      const combinedString = `${todayString}, ${matchTime}`; // "6/1/2025, 01:42 PM"
      matchDateTime = moment(combinedString, "D/M/YYYY, h:mm A").tz(timezone);
    }

    // If invalid, skip further logic
    if (!matchDateTime.isValid()) {
      console.error("Invalid matchDateTime:", matchTime);
      return;
    }

    // 2. Calculate time difference in hours
    const hoursDifference = matchDateTime.diff(currentTime, "hours", true);

    // Only show a countdown if the match is within the next 16 hours
    if (hoursDifference <= 16 && hoursDifference >= 0) {
      const diffInSeconds = matchDateTime.diff(currentTime, "seconds");
      console.log("Countdown time (in seconds):", diffInSeconds);
      setTime(diffInSeconds > 0 ? diffInSeconds : 0);
      setIsMatchStarted(false);
    } else if (hoursDifference < 0) {
      // If the scheduled time is in the past, consider the match started
      setIsMatchStarted(true);
    }
  }, [matchTime]);

  // Capture container width for the "LIVE" positioning
  const handleLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const formatTwoWordTeam = (name) => {
    const words = name.trim().split(/\s+/);
    // If it's exactly two words, insert a newline between them
    if (words.length === 2) {
      return words.join("\n");
    }
    return name; // Otherwise, return as is
  };

  const rContainerStyle = useAnimatedStyle(() => {
    const activeIndex = challengeScrollOffset.value / challengeCardWidth;
    const paddingLeft = (challengeWindowWidth - challengeCardWidth) / 4;
    const translateX = interpolate(
      activeIndex,
      [index - 2, index - 1, index, index + 1],
      [120, 60, 0, -challengeCardWidth - paddingLeft * 2],
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
          translateX: challengeScrollOffset.value + translateX,
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
            <View style={[styles.teamNameBlock, { alignItems: "flex-end" }]}>
              <Text
                style={[styles.teamName, { color: activeColors.accent }]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {formatTwoWordTeam(owner)}
              </Text>
            </View>

            <View style={styles.centerInfo}>
              {isMatchStarted ? (
                <View style={styles.scoreContainer}>
                  <Text style={[styles.score, { color: activeColors.accent }]}>
                    {homeScore ?? "0"}
                  </Text>
                  <Text style={styles.scoreDivider}>-</Text>
                  <Text style={[styles.score, { color: activeColors.accent }]}>
                    {awayScore ?? "0"}
                  </Text>
                </View>
              ) : (
                <Text
                  style={[styles.raceToText, { color: activeColors.accent2 }]}
                >{`( RT ${raceTo} )`}</Text>
              )}
            </View>

            <View style={[styles.teamNameBlock, { alignItems: "flex-start" }]}>
              <Text
                style={[styles.teamName, { color: activeColors.accent }]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {formatTwoWordTeam(opponent)}
              </Text>
            </View>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.divider} />
            <View style={styles.matchStatusRow}>
              {isMatchStarted ? (
                <Text
                  style={[styles.liveText, { color: activeColors.accent2 }]}
                >
                  LIVE
                </Text>
              ) : (
                <CountdownTimer
                  customColor={activeColors.onPrimary}
                  timer={time}
                />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: challengeCardWidth,
    height: (challengeCardWidth / 5) * 2,
    borderRadius: 30,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    position: "absolute",
  },
  contentContainer: {
    // flex: 1,
    height: "100%",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    justifyContent: "space-between",
  },
  teamRow: {
    paddingTop: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  teamNameBlock: {
    width: "30%",
    justifyContent: "center",
    alignItems: "center",
  },
  teamName: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
  },
  centerInfo: {
    width: "40%",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  score: {
    fontSize: 20,
    fontWeight: "700",
  },
  scoreDivider: {
    fontSize: 18,
    marginHorizontal: 4,
    color: "#666",
  },
  raceToText: {
    fontSize: 14,
    fontWeight: "700",
  },
  bottomSection: {
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(128, 128, 128, 0.2)",
    marginBottom: 6,
  },
  matchStatusRow: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 5,
    gap: 5,
  },
  liveText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default CardComponent;
