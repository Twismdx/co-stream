import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useGlobalContext } from "../timer/context";
import StyledText from "../texts/StyledText";
import CustomButton from "../CustomButton";
import {
  getMatches,
  acceptChallenge,
  counterOfferChallenge,
  declineChallenge,
} from "../utils/API";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
import AccordionCard from "~/components/modals/AccordionCard"; // adjust path if needed

// Extend dayjs with necessary plugins
dayjs.extend(utc);
dayjs.extend(customParseFormat);

const PendingMatches = () => {
  const [challenges, setChallenges] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { theme, user } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch pending challenges
  const getChallenges = async () => {
    try {
      if (!user || !user.id) {
        console.error("Error: User or User ID is undefined.");
        return;
      }
      const data = await getMatches({
        userId: user.id,
        complete: "incomplete",
      });
      // Ensure we store an array; if data isn’t iterable, default to []
      setChallenges(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(async () => {
      await getChallenges();
      setRefreshing(false);
    }, 1500);
  }, [user?.id]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await getChallenges();
      setIsLoading(false);
    };
    fetchData();
  }, [user?.id]);

  // Action handlers
  const handleAccept = async (challengeid) => {
    try {
      await acceptChallenge(challengeid);
    } catch (error) {
      console.error("Error accepting challenge:", error);
    }
    await onRefresh();
    navigation.navigate("Home");
  };

  const handleCounterOffer = (challenge) => {
    // Here you can update your global context challengeParams
    // For example:
    // setChallengeParams({ selectedChallenge: challenge, initialModalVisible: true, counterOffer: true });
    // And navigate to ChallengeMatch screen.
    navigation.navigate("ChallengeMatch", {
      selectedChallenge: challenge,
      initialModalVisible: true,
      counterOffer: true,
    });
    onRefresh();
  };

  const handleDecline = async (challengeid, challengedUserName) => {
    try {
      await declineChallenge(challengeid, challengedUserName);
    } catch (error) {
      console.error("Error declining challenge:", error);
    }
    await onRefresh();
    navigation.navigate("Home");
  };

  const renderItem = ({ item }) => {
    // Determine opponent name: show the one not equal to the current user.id.
    const opponentName =
      item.opponent === user.id
        ? item.owner_full_name
        : item.opponent_full_name;
    const formattedDate = item.date
      ? dayjs
          .utc(item.date, "YYYY-MM-DD HH:mm:ssZ")
          .local()
          .format("MMM D, YYYY, h:mm A")
      : "No date available";

    // Create title and subtitle for the accordion header.
    const title = opponentName || "Unknown";
    const subTitle = `${formattedDate} • Race to ${item.race_length}`;

    return (
      <AccordionCard title={title} subTitle={subTitle}>
        {/* Expanded content */}
        <View style={styles.detailRow}>
          <StyledText
            small
            weight="bold"
            style={{ color: activeColors.onPrimary }}
          >
            Challenger:
          </StyledText>
          <StyledText
            small
            style={{ color: activeColors.accent, marginLeft: 8 }}
          >
            {item.owner_full_name || "Unknown"}
          </StyledText>
        </View>
        <View style={styles.detailRow}>
          <StyledText
            small
            weight="bold"
            style={{ color: activeColors.onPrimary }}
          >
            Challenged:
          </StyledText>
          <StyledText
            small
            style={{ color: activeColors.accent, marginLeft: 8 }}
          >
            {item.opponent_full_name || "Unknown"}
          </StyledText>
        </View>
        <View style={styles.detailRow}>
          <StyledText
            small
            weight="bold"
            style={{ color: activeColors.onPrimary }}
          >
            Status:
          </StyledText>
          <StyledText
            small
            style={{ color: activeColors.accent, marginLeft: 8 }}
          >
            {item.status || "No status available"}
          </StyledText>
        </View>
        <View style={styles.detailRow}>
          <StyledText
            small
            weight="bold"
            style={{ color: activeColors.onPrimary }}
          >
            Discipline:
          </StyledText>
          <StyledText
            small
            style={{ color: activeColors.accent, marginLeft: 8 }}
          >
            {item.discipline || "No discipline available"}
          </StyledText>
        </View>
        <View style={styles.detailRow}>
          <StyledText
            small
            weight="bold"
            style={{ color: activeColors.onPrimary }}
          >
            Handicap:
          </StyledText>
          <StyledText
            small
            style={{ color: activeColors.accent, marginLeft: 8 }}
          >
            {item.handicap || "No handicap available"}
          </StyledText>
        </View>
        <View style={styles.detailRow}>
          <StyledText
            small
            weight="bold"
            style={{ color: activeColors.onPrimary }}
          >
            Break Type:
          </StyledText>
          <StyledText
            small
            style={{ color: activeColors.accent, marginLeft: 8 }}
          >
            {item.break_type || "No break type available"}
          </StyledText>
        </View>
        {/* Action buttons only if pending and user is the challenged recipient */}
        {item.status === "pending" && item.opponent === user.id && (
          <View style={styles.buttonContainer}>
            <CustomButton
              label="Accept"
              onPress={() => handleAccept(item.challengeid)}
              buttonColor={activeColors.accent}
              submit
              color={activeColors.foreground}
              style={styles.actionButton}
            />
            <CustomButton
              label="Decline"
              onPress={() =>
                handleDecline(item.challengeid, item.opponent_full_name)
              }
              buttonColor={activeColors.error || "#F44336"}
              cancel
              color={activeColors.foreground}
              style={styles.actionButton}
            />
            <CustomButton
              label="Counter Offer"
              onPress={() => handleCounterOffer(item)}
              buttonColor={activeColors.warning || "orange"}
              color={activeColors.foreground}
              pending
              style={styles.actionButton}
            />
          </View>
        )}
      </AccordionCard>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <FlatList
        // Ensure data is an array (fallback to an empty array if not)
        data={Array.isArray(challenges) ? challenges : []}
        keyExtractor={(item) => item.challengeid.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <>
            <ActivityIndicator
              animating={isLoading}
              color={activeColors.accent}
              size="large"
            />
            {!challenges && (
              <Text
                style={{ color: activeColors.onPrimary, textAlign: "center" }}
              >
                No challenges available.
              </Text>
            )}
          </>
        }
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 25 }}
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
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 10,
  },
  actionButton: {
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginVertical: 5,
  },
});

export default PendingMatches;
