import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  TextInput,
  Text,
  KeyboardAvoidingView,
} from "react-native";
import StyledText from "../texts/StyledText";
import MatchCardLive from "../cards/MatchCardLive";
import MatchCardUpcoming from "../cards/MatchCardUpcoming";
import { useGlobalContext } from "../timer/context";
import Ionicons from "@expo/vector-icons/Ionicons";
import ChallengeCard from "../cards/ChallengeCard";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import Loader from "../utils/ActivityLoader";
import {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
  withTiming,
  runOnJS,
  useDerivedValue,
  interpolate,
  Easing,
} from "react-native-reanimated";
import Animated from "react-native-reanimated";
import {
  upcomingWindowWidth,
  upcomingCardHeight,
  upcomingCardWidth,
} from "../cards/MatchCardUpcoming";
import {
  challengeWindowWidth,
  challengeCardHeight,
  challengeCardWidth,
} from "../cards/ChallengeCard";
import {
  liveWindowWidth,
  liveCardHeight,
  liveCardWidth,
} from "../cards/MatchCardLive";
import AutoCompleteInput from "~/components/texts/AutoCompleteInput";
import Carousel from "react-native-reanimated-carousel";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const screenWidth = Dimensions.get("window").width;

const Divider = ({ variant = "horizontal", style }) => {
  if (variant === "horizontal") {
    return <View style={[{ height: 1, backgroundColor: "#ccc" }, style]} />;
  }
  return <View style={[{ width: 1, backgroundColor: "#ccc" }, style]} />;
};

const CategoryTabSection = ({
  stats,
  challengeData, // already filtered challenge matches from HomeScreen
  openChallengeA,
  openPoolstatA,
  selectedOrg,
}) => {
  const { theme, user, setIsLiveMatches } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];
  const upcomingProgress = useSharedValue(0);
  const challengeProgress = useSharedValue(0);
  const liveProgress = useSharedValue(0);

  // Refs for scrolling/searching
  const categoriesScrollViewRef = useRef(null);
  const upcomingSearchRef = useRef(null);
  const liveSearchRef = useRef(null);
  const categoryPositions = useRef({});

  // Local state for search filters (if needed)
  const [selectedCategory, setSelectedCategory] = useState("Live matches");
  const [searchQueryUpcoming, setSearchQueryUpcoming] = useState("");
  const [searchQueryLive, setSearchQueryLive] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [showSearchUpcoming, setShowSearchUpcoming] = useState(false);
  const [showSearchLive, setShowSearchLive] = useState(false);

  // Animated Refs for scrolling content
  const upcomingRef = useRef(null);
  const challengeAnimatedRef = useAnimatedRef();
  const liveAnimatedRef = useAnimatedRef();

  // Use shared values for scroll positions
  const upcomingScrollOffset = useSharedValue(0);
  const challengeScrollOffset = useSharedValue(0);
  const liveScrollOffset = useSharedValue(0);

  // Animation for search bar
  const searchBarOpacity = useSharedValue(0);
  const searchBarHeight = useSharedValue(0);

  const liveScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      liveScrollOffset.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
      const activeIndex = Math.round(event.contentOffset.x / liveCardWidth);
      const snapPoint = activeIndex * liveCardWidth;

      if (Math.abs(event.contentOffset.x - snapPoint) > 1) {
        liveAnimatedRef.current?.scrollTo({
          x: snapPoint,
          animated: true,
        });
      }
    },
  });

  const challengeScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      challengeScrollOffset.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
      const activeIndex = Math.round(
        event.contentOffset.x / challengeCardWidth
      );
      const snapPoint = activeIndex * challengeCardWidth;

      if (Math.abs(event.contentOffset.x - snapPoint) > 1) {
        challengeAnimatedRef.current?.scrollTo({
          x: snapPoint,
          animated: true,
        });
      }
    },
  });

  // --- Process stats for Live/Upcoming Matches ---
  // Convert stats (if provided) to an array of component data.
  const mapStats = useMemo(() => {
    return Object.entries(stats || {}).map((item) => item);
  }, [stats]);

  const matchesArray = useMemo(() => {
    return mapStats.map(([_, compData]) => compData);
  }, [mapStats]);

  const liveArray = useMemo(() => {
    return matchesArray.reduce((liveMatches, itemValue) => {
      if (
        itemValue &&
        itemValue.matches &&
        typeof itemValue.matches === "object"
      ) {
        const matches = Object.values(itemValue.matches);
        matches.forEach((match) => {
          if (match?.matchislive === 1) {
            liveMatches.push({ ...match });
          }
        });
      }
      return liveMatches;
    }, []);
  }, [matchesArray]);

  const upcomingArray = useMemo(() => {
    return matchesArray.reduce((upcomingMatches, itemValue) => {
      if (
        itemValue &&
        itemValue.matches &&
        typeof itemValue.matches === "object"
      ) {
        const matches = Object.values(itemValue.matches);
        matches.forEach((match) => {
          if (match?.matchislive === 0) {
            upcomingMatches.push({ ...match });
          }
        });
      }
      return upcomingMatches;
    }, []);
  }, [matchesArray]);

  // Create a flat array of match keys from matchesArray.
  const matchKeys = useMemo(() => {
    return matchesArray.reduce((acc, compData) => {
      if (compData?.matches && typeof compData.matches === "object") {
        acc.push(...Object.keys(compData.matches));
      }
      return acc;
    }, []);
  }, [matchesArray]);

  // (Optional) If you need orgCode and similar.
  const orgCode = useMemo(() => {
    return matchesArray[1]?.org?.code;
  }, [matchesArray]);

  useEffect(() => {
    if (liveArray && liveArray.length > 0) {
      setIsLiveMatches(true);
    } else {
      setIsLiveMatches(false);
    }
  }, [liveArray, setIsLiveMatches]);

  // --- Time Formatting Functions ---
  const formatMatchTime = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string") return "";
    try {
      const [hours, minutes] = timeStr.split(":");
      const hour = parseInt(hours, 10);
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${period}`;
    } catch (err) {
      console.error("Failed to format time:", timeStr);
      return "";
    }
  };

  const formatChallengeTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      // Remove the colon from the timezone offset, e.g. +00:00 -> +0000
      const cleanedTimestamp = timestamp.replace(/(\+\d{2}):(\d{2})$/, "$1$2");
      // Use dayjs.utc with a custom format to help with parsing
      const date = dayjs.utc(cleanedTimestamp, "YYYY-MM-DDTHH:mm:ssZ");
      if (!date.isValid()) {
        console.error("Invalid timestamp:", timestamp);
        return "";
      }
      // Convert to local time and format as hh:mm A
      return date.local().format("hh:mm A");
    } catch (err) {
      console.error("Failed to format challenge time:", err, timestamp);
      return "";
    }
  };

  // --- Search Handling (if needed) ---
  const handleSearch = (query, matches, setFilteredMatches) => {
    if (!matches) return;
    if (matches === upcomingArray) {
      setSearchQueryUpcoming(query);
    } else if (matches === liveArray) {
      setSearchQueryLive(query);
    }
    if (!query) {
      setFilteredMatches(matches);
      setSuggestion("");
      return;
    }
    const filtered = matches.filter(
      (m) =>
        m?.home?.teamname?.toLowerCase().includes(query.toLowerCase()) ||
        m?.away?.teamname?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMatches(filtered);
    const allTeamNames = [
      ...new Set(
        matches.flatMap((match) => [
          match?.home?.teamname,
          match?.away?.teamname,
        ])
      ),
    ];
    const matchingSuggestion = allTeamNames.find((team) =>
      team?.toLowerCase().startsWith(query.toLowerCase())
    );
    setSuggestion(matchingSuggestion || "");
  };

  const toggleSearchUpcoming = (show) => {
    setShowSearchUpcoming(show);
    searchBarOpacity.value = withTiming(show ? 1 : 0, { duration: 200 });
    searchBarHeight.value = withTiming(show ? 50 : 0, { duration: 200 });

    if (show) {
      setTimeout(() => {
        upcomingSearchRef.current?.focus();
      }, 100);
    }
  };

  const toggleSearchLive = (show) => {
    setShowSearchLive(show);
    searchBarOpacity.value = withTiming(show ? 1 : 0, { duration: 200 });
    searchBarHeight.value = withTiming(show ? 50 : 0, { duration: 200 });

    if (show) {
      setTimeout(() => {
        liveSearchRef.current?.focus();
      }, 100);
    }
  };

  const handleCategoryPress = useCallback((category, index) => {
    setSelectedCategory(category);
    const screenWidth = Dimensions.get("window").width;
    const { x: categoryX, width: categoryWidth } = categoryPositions.current[
      index
    ] || { x: 0, width: 0 };
    const scrollToX = categoryX - screenWidth / 2 + categoryWidth / 2;
    categoriesScrollViewRef.current?.scrollTo({ x: scrollToX, animated: true });
  }, []);

  const upcomingListPadding = useMemo(() => {
    return upcomingWindowWidth - upcomingCardWidth;
  }, []);

  const challengeListPadding = useMemo(() => {
    return challengeWindowWidth - challengeCardWidth;
  }, []);

  const liveListPadding = useMemo(() => {
    return liveWindowWidth - liveCardWidth;
  }, []);

  // Handle card visibility
  const updateCategoryVisibility = useCallback((event) => {
    // This function would handle tracking which sections are visible
    // and update the selected category accordingly
    // Implementation would depend on your specific requirements
  }, []);

  return (
    <View style={{ flexDirection: "column" }}>
      {/* Upcoming Matches */}
      <View style={{ height: upcomingCardHeight }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "column" }}>
            <StyledText bold color={activeColors.onPrimary}>
              Upcoming Matches
            </StyledText>
            <Divider
              variant="horizontal"
              style={{
                backgroundColor: activeColors.accent,
                width: 140,
                marginVertical: 4,
              }}
            />
          </View>
          <TouchableOpacity
            onPress={() => toggleSearchUpcoming(true)}
            style={{ marginLeft: 10, marginTop: -2.5 }}
          >
            <Ionicons name="search-circle-outline" size={30} color="white" />
          </TouchableOpacity>
        </View>
        {/* (Optional) Search Bar for Upcoming Matches */}
        {showSearchUpcoming && (
          <Animated.View
            style={[
              styles.searchBarContainer,
              {
                opacity: searchBarOpacity,
                height: searchBarHeight,
                transform: [
                  {
                    translateY: interpolate(
                      searchBarOpacity.value,
                      [0, 1],
                      [-10, 0]
                    ),
                  },
                ],
              },
            ]}
          >
            <TextInput
              ref={upcomingSearchRef}
              style={[
                styles.searchBar,
                { backgroundColor: activeColors.onPrimary },
              ]}
              placeholder="Search team name..."
              placeholderTextColor={activeColors.onSurfaceVariant}
              value={searchQueryUpcoming}
              onChangeText={(query) => {
                handleSearch(query, upcomingArray, () => {}); // If needed
              }}
            />
            {searchQueryUpcoming ? (
              <TouchableOpacity
                onPress={() => {
                  setSearchQueryUpcoming("");
                  // Reset search if needed
                  toggleSearchUpcoming(false);
                }}
              >
                <Ionicons name="close-circle" size={24} color="gray" />
              </TouchableOpacity>
            ) : null}
          </Animated.View>
        )}
        <View
          style={{
            paddingTop: selectedOrg ? 10 : 45,
            justifyContent: selectedOrg ? null : "center",
            alignItems: selectedOrg ? null : "center",
          }}
        >
          {selectedOrg === null ? (
            <View style={styles.categoryContainer}>
              <View style={styles.inputContainer}>
                <StyledText
                  color={activeColors.accent}
                  style={{ textAlign: "center", paddingBottom: 10 }}
                >
                  Enter Organization Name
                </StyledText>
                <AutoCompleteInput />
              </View>
            </View>
          ) : (
            <Carousel
              ref={upcomingRef}
              data={upcomingArray}
              width={upcomingCardWidth}
              height={upcomingCardHeight}
              autoPlayInterval={2000}
              loop={true}
              snapEnabled={true}
              mode="parallax"
              modeConfig={{
                parallaxScrollingScale: 0.9,
                parallaxScrollingOffset: 50,
                parallaxAdjacentItemScale: 0.7,
              }}
              overscrollEnabled
              // keep your style logic
              style={{
                width: selectedOrg ? upcomingWindowWidth : "100%",
                justifyContent: "center",
                marginTop: !selectedOrg ? 15 : undefined,
              }}
              // progress callback
              onProgressChange={(offset) => {
                upcomingProgress.value = offset;
              }}
              // the new renderItem API
              renderItem={({ item, index }) => (
                <MatchCardUpcoming
                  upcomingCardWidth={upcomingCardWidth}
                  upcomingCardHeight={upcomingCardHeight}
                  index={index}
                  key={item.key}
                  // upcomingScrollOffset={upcomingScrollOffset}
                  home={item.home.teamname ?? "N/A"}
                  away={item.away.teamname ?? "N/A"}
                  homeScore={item.home.framescore ?? 0}
                  awayScore={item.away.framescore ?? 0}
                  matchTime={formatMatchTime(item.matchtime)}
                  homePoints={item.home.framepoints ?? 0}
                  awayPoints={item.away.framepoints ?? 0}
                  hasMatchPoints={item.hasmatchpoints}
                  matchId={item.key}
                  stats={stats}
                  orgCode={orgCode}
                  compId={mapStats[0]?.[0] || ""}
                  openPoolstatA={openPoolstatA}
                />
              )}
            />
          )}
        </View>
      </View>

      {/* Live Matches */}
      <View style={{ height: liveCardHeight, marginTop: -15 }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "column" }}>
            <StyledText bold color={activeColors.onPrimary}>
              Live Matches
            </StyledText>
            <Divider
              variant="horizontal"
              style={{
                backgroundColor: activeColors.accent,
                width: 97,
                marginVertical: 4,
              }}
            />
          </View>
          <TouchableOpacity
            onPress={() => toggleSearchLive(true)}
            style={{ marginLeft: 10, marginTop: 0 }}
          >
            <Ionicons name="search-circle-outline" size={30} color="white" />
          </TouchableOpacity>
        </View>
        {showSearchLive && (
          <Animated.View
            style={[
              styles.searchBarContainer,
              {
                opacity: searchBarOpacity,
                height: searchBarHeight,
                transform: [
                  {
                    translateY: interpolate(
                      searchBarOpacity.value,
                      [0, 1],
                      [-10, 0]
                    ),
                  },
                ],
              },
            ]}
          >
            <TextInput
              ref={liveSearchRef}
              style={[
                styles.searchBar,
                { backgroundColor: activeColors.onPrimary },
              ]}
              placeholder="Search team name..."
              placeholderTextColor={activeColors.onSurfaceVariant}
              value={searchQueryLive}
              onChangeText={(query) => {
                handleSearch(query, liveArray, () => {}); // If needed
              }}
            />
            {searchQueryLive ? (
              <TouchableOpacity
                onPress={() => {
                  setSearchQueryLive("");
                  toggleSearchLive(false);
                }}
              >
                <Ionicons name="close-circle" size={24} color="gray" />
              </TouchableOpacity>
            ) : null}
          </Animated.View>
        )}
        <View style={{ height: liveCardHeight, width: "100%" }}>
          <Animated.ScrollView
            ref={liveAnimatedRef}
            horizontal
            snapToInterval={liveCardWidth}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={liveScrollHandler}
            disableIntervalMomentum={true}
            removeClippedSubviews={false}
            contentContainerStyle={{
              width: liveCardWidth * liveArray.length + liveListPadding,
            }}
          >
            {liveArray.map((item, index) => (
              <MatchCardLive
                liveCardWidth={liveCardWidth}
                liveCardHeight={liveCardHeight}
                index={index}
                key={index}
                liveScrollOffset={liveScrollOffset}
                home={item?.home?.teamname ?? "N/A"}
                away={item?.away?.teamname ?? "N/A"}
                homeScore={item?.home?.framescore ?? 0}
                awayScore={item?.away?.framescore ?? 0}
                matchTime={formatMatchTime(item?.matchtime)}
                homePoints={item?.home?.framepoints ?? 0}
                awayPoints={item?.away?.framepoints ?? 0}
                hasMatchPoints={item?.hasmatchpoints ?? false}
                matchId={matchKeys[index]}
                stats={stats}
                orgCode={orgCode}
                raceTo={item?.matchformat}
                compId={mapStats[0]?.[0] || ""}
                openPoolstatA={openPoolstatA}
              />
            ))}
          </Animated.ScrollView>
        </View>
      </View>

      {/* Challenge Matches */}
      <View style={{ height: challengeCardHeight, marginTop: -15 }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "column" }}>
            <StyledText bold color={activeColors.onPrimary}>
              Challenge Matches
            </StyledText>
            <Divider
              variant="horizontal"
              style={{
                backgroundColor: activeColors.accent,
                width: 138,
                marginVertical: 4,
              }}
            />
          </View>
        </View>
        {/* Use the challengeData prop directly – this data has been filtered in HomeScreen via Supabase */}
        <View style={{ height: challengeCardHeight, width: "100%" }}>
          <Animated.ScrollView
            ref={challengeAnimatedRef}
            horizontal
            snapToInterval={challengeCardWidth}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={challengeScrollHandler}
            disableIntervalMomentum={true}
            removeClippedSubviews={false}
            contentContainerStyle={{
              width:
                challengeCardWidth * challengeData.length +
                challengeListPadding,
            }}
          >
            {challengeData.map((item, index) => (
              <ChallengeCard
                challengeCardWidth={challengeCardWidth}
                challengeCardHeight={challengeCardHeight}
                index={index}
                key={index}
                challengeScrollOffset={challengeScrollOffset}
                owner={item?.owner_full ?? "N/A"}
                opponent={item?.opponent_full ?? "N/A"}
                homeScore={item?.homeTeam?.score ?? 0}
                awayScore={item?.awayTeam?.score ?? 0}
                matchTime={formatChallengeTime(item?.date)}
                homePoints={item?.challengerUser?.framepoints ?? 0}
                awayPoints={item?.challengedUser?.framepoints ?? 0}
                hasMatchPoints={item?.hasmatchpoints ?? false}
                matchId={item?.challengeid ?? ""}
                stats={challengeData}
                matchPin={item?.pin ?? ""}
                challengeid={item.challengeid}
                raceTo={item?.race_length ?? "N/A"}
                openChallengeA={openChallengeA}
              />
            ))}
          </Animated.ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    overflow: "hidden",
  },
  searchBar: {
    flex: 1,
    height: 30,
    borderRadius: 15,
    marginVertical: 10,
    marginHorizontal: 10,
    fontSize: 16,
    backgroundColor: "white",
  },
  categoryContainer: {
    flexDirection: "row",
  },
  inputContainer: {
    width: "80%",
    justifyContent: "center",
    alignSelf: "center",
    textAlign: "center",
  },
});

export default React.memo(CategoryTabSection);
