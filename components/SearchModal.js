import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "~/components/CustomButton";
import { useGlobalContext } from "./timer/context";
import ProfileItem from "./profile/ProfileItem";
import StyledText from "./texts/StyledText";
import PendingMatches from "./profile/PendingMatches";
// Import the API function to get challenge stats
import { getChallengeStats } from "../components/utils/API";
import ProfileCard from "./cards/ProfileCard";

const SearchModal = ({ route }) => {
  const [stats, setStats] = useState({});
  const { theme, selectedUser, user } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];
  const navigation = useNavigation();
  const [render, setRender] = useState("default");
  const pending = route.params?.pending;

  // Fetch challenge statistics for the selected user.
  const getStats = async () => {
    if (!selectedUser || !selectedUser.id) {
      console.error("Selected user information is not available");
      return;
    }
    try {
      const data = await getChallengeStats(selectedUser.id);
      setStats(data || {});
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    getStats();
  }, [selectedUser]);

  useEffect(() => {
    setRender(pending === "pending" ? "pending" : "default");
  }, [pending]);

  const totalMatches = (stats?.wins ?? 0) + (stats?.losses ?? 0);
  const winPercentage =
    totalMatches > 0 ? (stats.wins / totalMatches) * 100 : 0;

  const handleChallengeMatch = () => {
    console.log("Navigating to ChallengeMatch...");
    navigation.navigate("ChallengeMatch", {
      initialModalVisible: true,
      challengedUser: selectedUser,
      currentUser: user,
      initialChallenge: true,
    });
  };

  function getWinPercentage(wins, losses) {
    const total = (wins ?? 0) + (losses ?? 0);
    const percentage = total > 0 ? (wins / total) * 100 : 0;
    return percentage.toFixed(2);
  }

  return (
    <View style={{ flex: 1 }}>
      <View
        style={[styles.container, { backgroundColor: activeColors.primary }]}
      >
        {selectedUser && render === "default" && (
          <ProfileCard
            name={selectedUser?.name}
            avatar={selectedUser?.avatar}
            isOnline={selectedUser?.isOnline}
            stats={stats}
            winPercentage={winPercentage}
            played={totalMatches}
          />
        )}
        {selectedUser && (
          <View style={styles.centeredView}>
            <CustomButton
              onPress={handleChallengeMatch}
              default
              style={{
                borderRadius: 6,
                paddingHorizontal: 21,
                shadowColor: "hsl(240, 5.9%, 90%)",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 2,
              }}
              textStyle={{
                color: activeColors.modalSurface,
                fontWeight: "600",
              }}
              label="Challenge to match"
            />
          </View>
        )}
        {render === "pending" && <PendingMatches />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    // flexDirection: 'column',
    // backgroundColor: 'transparent',
  },
  centeredView: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  profileItem: {
    marginTop: 15,
    alignItems: "center",
    padding: 10,
    borderRadius: 15,
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
    color: "white",
    textAlign: "center",
  },
  challengeButton: {
    backgroundColor: "#1976d2",
    marginVertical: 10,
  },
  winPercentage: {
    position: "absolute",
    top: 10,
    left: 25,
  },
  played: {
    position: "absolute",
    top: 10,
    right: 25,
    textAlign: "center",
  },
  statsTitle: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "bold",
  },
  stats: {
    fontSize: 12,
    textAlign: "center",
  },
});

export default SearchModal;
