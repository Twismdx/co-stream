import React, { startTransition } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useGlobalContext } from "../timer/context";

const CardComponent = ({
  title,
  playerName,
  awayName,
  matchNumber,
  matchId,
}) => {
  const { theme, setStreamTitle, setDesc, setActionSheet, setLocal } =
    useGlobalContext();

  const activeColors = theme.colors[theme.mode];

  const handleData = () => {
    setActionSheet((prevState) => ({
      ...prevState,
      show: true,
      matchId: matchId,
    }));
    setLocal(true);
    setStreamTitle(`${playerName} Vs 50 Frames`);
    setDesc(`${playerName} Vs 50 Frames`);
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <TouchableOpacity
        style={[
          styles.container,
          { backgroundColor: activeColors.secondary }, // Fallback color
        ]}
        onPress={handleData}
      >
        <View style={styles.contentContainer}>
          <Text
            style={[
              styles.title,
              { marginTop: -2, color: activeColors.accent, textAlign: "left" },
            ]}
            numberOfLines={1}
          >
            Match No. {matchNumber + 1}
          </Text>
          <View style={styles.divider} />
          <Text
            style={[styles.description, { color: activeColors.accent2 }]}
            numberOfLines={1}
          >
            vs
          </Text>
          <View style={styles.divider} />
          <Text
            style={[
              styles.title,
              {
                marginBottom: -0.8,
                color: activeColors.accent,
                textAlign: "right",
              },
            ]}
            numberOfLines={1}
          >
            {awayName}
          </Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: "grey",
    marginVertical: 5,
  },
  container: {
    flex: 1,
    width: 250,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    borderRadius: 20,
    margin: 10,
  },
  image: {
    width: 200,
    borderRadius: 20,
    height: 100,
  },
  contentContainer: {
    padding: 10,
    justifyContent: "center",
    // flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 5,
    marginBottom: 5,
  },
  description: {
    fontSize: 20,
    color: "#777",
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    textAlign: "center",
    alignItems: "center",
    lineHeight: 22,
    marginTop: -1,
  },
  description2: {
    fontSize: 20,
    color: "#777",
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    textAlign: "center",
    alignItems: "flex-start",
    lineHeight: 22,
  },
  description3: {
    fontSize: 20,
    color: "#777",
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    textAlign: "right",
    alignItems: "flex-start",
    lineHeight: 22,
  },
});

export default CardComponent;
