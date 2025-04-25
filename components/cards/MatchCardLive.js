import React, {
  useContext,
  useState,
  useEffect,
  startTransition,
  useMemo,
} from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
import { useGlobalContext } from "../timer/context";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

export const liveWindowWidth = Dimensions.get("window").width;
export const liveCardWidth = liveWindowWidth * 0.8;
export const liveCardHeight = (liveCardWidth / 3) * 2;

const MatchCardLive = ({
  imageSource,
  title,
  home,
  away,
  matchId,
  homeScore,
  awayScore,
  matchTime,
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
  index,
  liveScrollOffset,
  openPoolstatA,
}) => {
  const {
    liveStats,
    selectedMatch,
    setSelectedMatch,
    theme,
    showModal,
    setShowModal,
    setShowModal1,
    streamTitle,
    setStreamTitle,
    desc,
    setDesc,
    actionSheet,
    setActionSheet,
  } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];
  const navigation = useNavigation();
  const handleData = () => {
    setActionSheet({
      show: true,
      matchTime: matchTime,
      matchId: matchId,
      compId: compId,
      orgCode: orgCode,
    });
    setStreamTitle(`${home} Vs ${away}`);
    setDesc(`${home} Vs ${away}`);
    openPoolstatA();
  };

  const rContainerStyle = useAnimatedStyle(() => {
    const activeIndex = liveScrollOffset.value / liveCardWidth;
    const paddingLeft = (liveWindowWidth - liveCardWidth) / 4;
    const translateX = interpolate(
      activeIndex,
      [index - 2, index - 1, index, index + 1],
      [120, 60, 0, -liveCardWidth - paddingLeft * 2],
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
          translateX: liveScrollOffset.value + translateX,
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
            <Text
              style={[styles.teamName, { color: activeColors.accent }]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {home}
            </Text>

            <View style={styles.scoreWrapper}>
              <Text style={[styles.score, { color: activeColors.accent2 }]}>
                {homeScore || 0}
              </Text>
              <Text style={styles.scoreDivider}>-</Text>
              <Text style={[styles.score, { color: activeColors.accent2 }]}>
                {awayScore || 0}
              </Text>
            </View>

            <Text
              style={[styles.teamName, { color: activeColors.accent }]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {away}
            </Text>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.divider} />
            <View style={styles.matchStatusRow}>
              <Text
                style={[styles.matchStatus, { color: activeColors.error }]}
                numberOfLines={1}
              >
                LIVE
              </Text>
              <Text style={[styles.bullet, { color: activeColors.accent }]}>
                •
              </Text>
              <Text style={[styles.frameText, { color: activeColors.accent2 }]}>
                {homePoints || awayPoints
                  ? `Frame ${homePoints + awayPoints}`
                  : raceTo}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: liveCardWidth,
    height: (liveCardWidth / 5) * 2,
    borderRadius: 30,
    margin: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    position: "absolute",
  },
  contentContainer: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    height: "100%",
    justifyContent: "space-between",
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
  },
  teamName: {
    flex: 1,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 15,
    lineHeight: 20,
  },
  scoreWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
  },
  score: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  scoreDivider: {
    fontSize: 18,
    marginHorizontal: 6,
    color: "#888",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: "100%",
  },
  vsText: {
    fontSize: 16,
    fontWeight: "600",
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
  matchStatusRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
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
});

export default React.memo(MatchCardLive);
