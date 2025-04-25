import React, { useState, useEffect, startTransition } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useGlobalContext } from "../timer/context";
import CountdownTimer from "../timer/CountdownTimer";
import moment from "moment-timezone";
import { getTimeZone } from "react-native-localize";

/**
 * A card that shows upcoming or ongoing matches with a countdown or "LIVE" status.
 */
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
  } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];
  const [time, setTime] = useState(null);
  const [isMatchStarted, setIsMatchStarted] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  // Handle pressing the card
  const handleData = () => {
    setActionSheet((prevState) => ({
      ...prevState,
      show: true,
      challengeId: challengeid,
      matchPin: matchPin,
      owner: owner,
      opponent: opponent,
    }));
    setStreamTitle(`${owner} Vs ${opponent}`);
    setDesc(`${owner} Vs ${opponent}`);
    setShowModal1(true);
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

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: activeColors.secondary }]}
      onPress={handleData}
    >
      <View style={styles.contentContainer}>
        <View style={styles.teamContainer}>
          <View
            style={[
              styles.teamSection,
              { marginLeft: -12, alignItems: "center" },
            ]}
          >
            <Text
              style={[styles.title, { color: activeColors.accent }]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {formatTwoWordTeam(owner)}
            </Text>
          </View>

          <View style={styles.scoreSection}>
            {isMatchStarted ? (
              // Display the score if the match has started
              <>
                <Text style={[styles.score, { color: activeColors.accent }]}>
                  {homeScore ?? "0"}
                </Text>
                <Text style={styles.scoreDivider}>-</Text>
                <Text style={[styles.score, { color: activeColors.accent }]}>
                  {awayScore ?? "0"}
                </Text>
              </>
            ) : (
              // Display the "Race to X" if not started
              <Text
                style={[
                  styles.raceToText,
                  { marginLeft: -7.5, color: activeColors.accent2 },
                ]}
              >
                {`( RT ${raceTo} )`}
              </Text>
            )}
          </View>

          <View
            style={[
              styles.teamSection,
              { marginRight: -12, alignItems: "center" },
            ]}
          >
            <Text
              style={[styles.title, { color: activeColors.accent }]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {formatTwoWordTeam(opponent)}
            </Text>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.divider} />
          <View style={styles.matchStatusContainer} onLayout={handleLayout}>
            {isMatchStarted ? (
              <Text
                style={[
                  styles.matchStatus,
                  {
                    color: activeColors.accent2,
                    left: containerWidth / 2,
                    transform: [{ translateX: -containerWidth / 20 }],
                  },
                ]}
              >
                LIVE
              </Text>
            ) : (
              <View style={styles.matchStatus}>
                <View style={styles.countdownContainer}>
                  <CountdownTimer
                    customColor={activeColors.onPrimary}
                    timer={time}
                  />
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CardComponent;

const styles = StyleSheet.create({
  container: {
    width: 250,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderRadius: 20,
    margin: 10,
    height: 100,
  },
  contentContainer: {
    paddingVertical: 15,
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
    flex: 0.5,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreSection: {
    position: "absolute",
    left: "50%",
    flexDirection: "row",
    transform: [{ translateX: -20 }],
    zIndex: 1,
  },
  score: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  scoreDivider: {
    fontSize: 22,
    fontWeight: "400",
    marginHorizontal: 4,
    color: "#666",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: "100%",
  },
  raceToText: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
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
    fontSize: 14,
  },
  countdownContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
