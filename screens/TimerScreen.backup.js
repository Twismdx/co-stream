import React, { useState, useEffect } from "react";
import {
  View,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import LinearGradient from "expo-linear-gradient";
import Timer from "../components/timer/Timer";
import TimerModal from "../components/timer/TimerModal";
import { useGlobalContext } from "../components/timer/context";
import { StatusBar } from "expo-status-bar";
import { supabase } from "../components/utils/supabase";
// import TimerComponent from '~/components/timer/TimerComponent';

const TimerScreen = ({ route, navigation }) => {
  const { theme } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];
  const matchId = route.params?.matchId;
  const { width, height } = Dimensions.get("window");
  const [isPortrait, setIsPortrait] = useState(true);
  const containerScale = isPortrait ? 1 : 0.5;

  // Local state for challenge data and player objects.
  const [matchData, setMatchData] = useState(null);
  const [home, setHome] = useState(null);
  const [away, setAway] = useState(null);
  const [isPromptShown, setIsPromptShown] = useState(false);

  // Finalize the match by updating the challenge record (set isComplete to true)
  const finalizeMatch = async (winner) => {
    Alert.alert(
      "Match Complete",
      `Congratulations ${winner.full_name}! Do you want to finalize the match?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Finalize",
          onPress: async () => {
            try {
              const { error: matchError } = await supabase
                .from("challenges")
                .update({ isComplete: true })
                .eq("challengeId", matchId);

              if (matchError) throw matchError;
              Alert.alert("Match Finalized", "The match has been finalized.");
              navigation.navigate("MatchHistory");
            } catch (error) {
              console.error("Error finalizing match:", error.message);
            }
          },
        },
      ]
    );
  };

  // Subscribe to realtime updates for the current challenge.
  useEffect(() => {
    if (!matchId) return;

    // Create a realtime channel that listens for UPDATE events on the current challenge.
    const channel = supabase
      .channel(`public:challenges:challengeId=eq.${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "challenges",
          filter: `challengeId=eq.${matchId}`,
        },
        (payload) => {
          const updated = payload.new;
          setMatchData(updated);
          // If the player objects exist, update their scores.
          if (home && away) {
            setHome((prev) => ({ ...prev, score: updated.homescore }));
            setAway((prev) => ({ ...prev, score: updated.awayscore }));
          }
        }
      )
      .subscribe();

    // Cleanup subscription when the component unmounts or dependencies change.
    return () => {
      if (channel) {
        // <-- Add this check
        channel.unsubscribe();
      }
    };
  }, [matchId, home, away]);

  // Fetch match data from Supabase (including joined user info)
  useEffect(() => {
    const fetchMatchData = async () => {
      if (!matchId) return;
      try {
        // Fetch the challenge record along with the challenger’s and challenged user's info.
        const { data, error } = await supabase
          .from("challenges")
          .select(
            `
            *,
            challengerUser:owner(*),
            challengedUser:opponent(*)
          `
          )
          .eq("challengeId", matchId)
          .single();

        if (error) throw error;
        setMatchData(data);

        // Prompt for first-to-break if home is not yet set.
        if (!data.home && !isPromptShown) {
          setIsPromptShown(true);
          Alert.alert(
            "Who is breaking first?",
            "Choose the player breaking first.",
            [
              {
                text: data.challengerUser.full_name,
                onPress: async () => {
                  setHome({
                    ...data.challengerUser,
                    score: data.homescore || 0,
                  });
                  setAway({
                    ...data.challengedUser,
                    score: data.awayscore || 0,
                  });
                  const { error: updateError } = await supabase
                    .from("challenges")
                    .update({
                      firstToBreak: data.challengerUser.id,
                      home: data.challengerUser.id,
                      away: data.challengedUser.id,
                    })
                    .eq("challengeId", matchId);
                  if (updateError) {
                    console.error(
                      "Failed to update home and away:",
                      updateError
                    );
                  }
                },
              },
              {
                text: data.challengedUser.full_name,
                onPress: async () => {
                  setHome({
                    ...data.challengedUser,
                    score: data.homescore || 0,
                  });
                  setAway({
                    ...data.challengerUser,
                    score: data.awayscore || 0,
                  });
                  const { error: updateError } = await supabase
                    .from("challenges")
                    .update({
                      firstToBreak: data.challengedUser.id,
                      home: data.challengedUser.id,
                      away: data.challengerUser.id,
                    })
                    .eq("challengeId", matchId);
                  if (updateError) {
                    console.error(
                      "Failed to update home and away:",
                      updateError
                    );
                  }
                },
              },
            ],
            { cancelable: false }
          );
        } else {
          // Initialize player state based on the fetched data.
          if (data.home && data.away) {
            setHome({
              id: data.home,
              full_name: data.challengerUser?.full_name || "Player 1",
              score: data.homescore || 0,
            });
            setAway({
              id: data.away,
              full_name: data.challengedUser?.full_name || "Player 2",
              score: data.awayscore || 0,
            });
          } else {
            setHome({
              id: data.owner,
              full_name: data.challengerUser
                ? data.challengerUser.full_name
                : "Player 1",
              score: data.homescore || 0,
            });
            setAway({
              id: data.opponent,
              full_name: data.challengedUser
                ? data.challengedUser.full_name
                : "Player 2",
              score: data.awayscore || 0,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching match data:", error.message);
      }
    };

    fetchMatchData();
  }, [matchId, isPromptShown]);

  // Update score in the database (for either homescore or awayscore)
  const updateScore = async (scoreField, newScore) => {
    const { error } = await supabase
      .from("challenges")
      .update({ [scoreField]: newScore })
      .eq("challengeId", matchId);
    if (error) console.error("Error updating score:", error.message);
  };

  // Increase the player's score and check if the match is complete
  const incrementScore = async (player) => {
    const isHome = player.id === home.id;
    const currentScore = isHome
      ? matchData.homescore || 0
      : matchData.awayscore || 0;
    const newScore = currentScore + 1;
    const scoreField = isHome ? "homescore" : "awayscore";

    await updateScore(scoreField, newScore);

    // If the score reaches the race_length, finalize the match.
    if (newScore === matchData.race_length) {
      finalizeMatch(player);
    }
  };

  // Decrease the player's score and update the database
  const decrementScore = async (player) => {
    const isHome = player.id === home.id;
    const currentScore = isHome
      ? matchData.homescore || 0
      : matchData.awayscore || 0;
    if (currentScore > 0) {
      const newScore = currentScore - 1;
      const scoreField = isHome ? "homescore" : "awayscore";
      await updateScore(scoreField, newScore);
    }
  };

  // Handle orientation changes
  const checkOrientation = () => {
    const { width, height } = Dimensions.get("window");
    setIsPortrait(height > width);
  };

  useEffect(() => {
    checkOrientation();
    const subscription = Dimensions.addEventListener(
      "change",
      checkOrientation
    );
    return () => subscription?.remove();
  }, []);

  return (
    <></>
    // <View style={styles.screen}>
    //   <LinearGradient
    //     colors={['#2e325a', '#0e112a']}
    //     start={{ x: 0, y: 0 }}
    //     end={{ x: 0, y: 1 }}
    //     style={styles.gradient}
    //   >
    //     {home && away && (
    //       <>
    //         {/* Home Section */}
    //         <View style={styles.left}>
    //           <TouchableOpacity onPress={() => incrementScore(home)} style={styles.button}>
    //             <Text style={styles.buttonText}>+</Text>
    //           </TouchableOpacity>
    //           <Text style={styles.scoreText}>{home.score}</Text>
    //           <TouchableOpacity onPress={() => decrementScore(home)} style={styles.button}>
    //             <Text style={styles.buttonText}>-</Text>
    //           </TouchableOpacity>
    //           <Text style={styles.playerNameText}>{home.full_name}</Text>
    //         </View>
    //         {/* Away Section */}
    //         <View style={styles.right}>
    //           <TouchableOpacity onPress={() => incrementScore(away)} style={styles.button}>
    //             <Text style={styles.buttonText}>+</Text>
    //           </TouchableOpacity>
    //           <Text style={styles.scoreText}>{away.score}</Text>
    //           <TouchableOpacity onPress={() => decrementScore(away)} style={styles.button}>
    //             <Text style={styles.buttonText}>-</Text>
    //           </TouchableOpacity>
    //           <Text style={styles.playerNameText}>{away.full_name}</Text>
    //         </View>
    //       </>
    //     )}
    //     <View style={[styles.container, { transform: [{ scale: containerScale }] }]}>
    //       <Timer matchId={matchId} />
    //       <TimerModal />
    //     </View>
    //   </LinearGradient>
    // </View>
    // <TimerComponent />
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, height: "100%" },
  gradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  left: { position: "absolute", left: 25, alignItems: "center" },
  right: { position: "absolute", right: 25, alignItems: "center" },
  button: {
    backgroundColor: "#4CAF50",
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
  },
  buttonText: { fontSize: 24, color: "#fff", fontWeight: "bold" },
  scoreText: { fontSize: 32, color: "#fff", fontWeight: "bold" },
  playerNameText: { fontSize: 18, color: "#fff", marginTop: 5 },
  container: { justifyContent: "center", alignItems: "center", height: "100%" },
});

export default TimerScreen;
