import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Image,
  ActivityIndicator,
} from "react-native";
import { useGlobalContext } from "./timer/context";
import StyledText from "./texts/StyledText";
import AccordionCard from "~/components/modals/AccordionCard";
import { getMatches } from "../components/utils/API";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Extend dayjs with necessary plugins
dayjs.extend(utc);
dayjs.extend(customParseFormat);

const MatchHistory = () => {
  const [matches, setMatches] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user, theme } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];

  // Fetch all completed matches (i.e. complete challenges)
  const fetchMatches = async () => {
    if (!user || !user.id) {
      console.error("User information is not available");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Fetching all completed challenges");
      // Pass complete: 'complete' to fetch completed matches.
      const data = await getMatches({ userId: user.id, complete: "complete" });

      // Map API data to our component's format, using dayjs to correctly parse the date.
      const formattedMatches = data.map((match) => ({
        id: match.challengeid,
        discipline: match.discipline,
        date: match.date
          ? dayjs.utc(match.date, "YYYY-MM-DD HH:mm:ssZ").local().toDate()
          : null,
        raceLength: match.race_length,
        breakType: match.break_type,
        // Use the joined fields for names and avatars.
        homeTeam: {
          id: match.owner,
          name: match.owner_full_name || user.name,
          avatar: match.owner_avatar || user.avatar,
        },
        awayTeam: {
          id: match.opponent,
          name: match.opponent_full_name || "Unknown",
          avatar: match.opponent_avatar || "",
        },
      }));
      setMatches(formattedMatches);
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMatches();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [user]);

  return (
    <View style={[styles.container, { backgroundColor: activeColors.primary }]}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const headerDate = item.date
            ? dayjs(item.date).format("MMM D, YYYY, h:mm A")
            : "No date available";

          return (
            <AccordionCard title={item.discipline} subTitle={headerDate}>
              <View
                style={[
                  styles.scoresContainer,
                  {
                    backgroundColor:
                      item.homeTeam.id === user.id
                        ? activeColors.chatgreen
                        : activeColors.chatred,
                    borderRadius: 15,
                    padding: 10,
                  },
                ]}
              >
                {/* Home Team */}
                <View style={styles.teamContainer}>
                  <Image
                    source={{ uri: item.homeTeam.avatar || "" }}
                    style={styles.avatar}
                  />
                  <Text style={styles.userName}>
                    {item.homeTeam.name || "Unknown"}
                  </Text>
                </View>

                {/* Details */}
                <View style={styles.scoreSection}>
                  <Text style={styles.detailsText}>
                    Race to {item.raceLength} | {item.breakType} Breaks
                  </Text>
                </View>

                {/* Away Team */}
                <View style={styles.teamContainer}>
                  <Image
                    source={{ uri: item.awayTeam.avatar || "" }}
                    style={styles.avatar}
                  />
                  <Text style={styles.userName}>
                    {item.awayTeam.name || "Unknown"}
                  </Text>
                </View>
              </View>
            </AccordionCard>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator
              animating={true}
              color={activeColors.accent}
              size="large"
            />
          ) : (
            <Text
              style={{ color: activeColors.onPrimary, textAlign: "center" }}
            >
              No completed matches found.
            </Text>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[activeColors.accent]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
  },
  scoresContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamContainer: {
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  scoreSection: {
    alignItems: "center",
    flex: 2,
  },
  detailsText: {
    fontSize: 14,
    color: "black",
    textAlign: "center",
  },
});

export default MatchHistory;
