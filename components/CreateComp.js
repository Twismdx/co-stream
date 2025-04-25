globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useGlobalContext } from "./timer/context";
import { useNavigation } from "@react-navigation/native";

const CreateComp = () => {
  const { theme, user } = useGlobalContext();
  const navigation = useNavigation();
  const activeColors = theme.colors[theme.mode];
  const [compName, setCompName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [finishDate, setFinishDate] = useState(new Date());
  const [players, setPlayers] = useState([]);
  const [playerSearch, setPlayerSearch] = useState("");
  const [playerResults, setPlayerResults] = useState([]);
  const [compCreated, setCompCreated] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showFinishDatePicker, setShowFinishDatePicker] = useState(false);
  const [newCompId, setNewCompId] = useState("");
  const [name, setName] = useState(null);

  const searchPlayers = async () => {
    const users = await getUsers();
    const results = Object.keys(users)
      .map((id) => ({ ...users[id], id }))
      .filter(
        (user) => user.name.toLowerCase().includes(playerSearch.toLowerCase()),
        setName(user.name)
      );
    setPlayerResults(results);
  };

  const addPlayer = (player) => {
    if (!players.find((p) => p.id === player.id)) {
      setPlayers([...players, player]);
    }
  };

  const createComp = async () => {
    const newCompKey = db.ref().child("comps").push().key;
    setNewCompId(newCompKey);
    const compData = {
      name: compName,
      startDate: startDate.toISOString(),
      finishDate: finishDate.toISOString(),
      players: players.reduce((acc, player) => {
        if (player.id) {
          // Ensure player.id is defined
          acc[player.id] = {
            name: player.name,
            handicap: calculateHandicap(player),
            matches: generateMatchesForPlayer(
              player.id,
              calculateHandicap(player)
            ),
          };
        }
        return acc;
      }, {}),
    };
    await db.ref(`/comps/${newCompKey}`).set(compData);
    setCompCreated(true);
  };

  const calculateHandicap = (player) => {
    if (!player.stats || !player.stats.wins) {
      return 0;
    }
    return Math.max(0, player.stats.wins - 35) * -1;
  };

  const generateMatchesForPlayer = (playerId, handicap) => {
    const matches = [];
    for (let i = 0; i < 2; i++) {
      const matchKey = db.ref().child("matches").push().key;
      matches.push({
        id: matchKey,
        name: name,
        player: playerId,
        opponent: "ghost",
        status: "pending",
        playerScore: 0,
        ghostScore: 0,
        handicap: handicap,
      });
      db.ref(`/matches/${matchKey}`).set({
        player: playerId,
        name: name,
        opponent: "ghost",
        status: "pending",
        playerScore: 0,
        ghostScore: 0,
        handicap: handicap,
      });
    }
    return matches;
  };

  const navigateToCompDetails = () => {
    navigation.navigate("CompDetails", { compId: newCompId });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={150} // Adjust this offset as needed
    >
      <ScrollView
        contentContainerStyle={[
          { backgroundColor: activeColors.primary },
          styles.innerContainer,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.label, { color: activeColors.text }]}>
          Competition Name
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Comp Name"
          value={compName}
          onChangeText={setCompName}
        />
        <Text style={[styles.label, { color: activeColors.text }]}>
          Start Date
        </Text>
        <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
          <TextInput
            style={styles.input}
            placeholder="Select Start Date"
            value={startDate.toDateString()}
            editable={false}
          />
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(false);
              if (selectedDate) {
                setStartDate(selectedDate);
              }
            }}
          />
        )}
        <Text style={[styles.label, { color: activeColors.text }]}>
          Finish Date
        </Text>
        <TouchableOpacity onPress={() => setShowFinishDatePicker(true)}>
          <TextInput
            style={styles.input}
            placeholder="Select Finish Date"
            value={finishDate.toDateString()}
            editable={false}
          />
        </TouchableOpacity>
        {showFinishDatePicker && (
          <DateTimePicker
            value={finishDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowFinishDatePicker(false);
              if (selectedDate) {
                setFinishDate(selectedDate);
              }
            }}
          />
        )}
        <Text style={[styles.label, { color: activeColors.text }]}>
          Search Players
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Search Players"
          value={playerSearch}
          onChangeText={setPlayerSearch}
        />
        <Button title="Search" onPress={searchPlayers} />
        <FlatList
          style={styles.list}
          data={playerResults}
          keyExtractor={(item) =>
            item.id ? item.id.toString() : "default_key"
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => addPlayer(item)}
            >
              <Text style={styles.listItemText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
        <Text style={[styles.label, { color: activeColors.text }]}>
          Added Players
        </Text>
        <FlatList
          style={styles.list}
          data={players}
          keyExtractor={(item) =>
            item.id ? item.id.toString() : "default_key"
          }
          renderItem={({ item }) => (
            <Text style={styles.listItemText}>{item.name}</Text>
          )}
        />
        <Button title="Create Comp" onPress={createComp} />
        {compCreated && (
          <View style={styles.confirmationContainer}>
            <Text
              style={[styles.confirmationText, { color: activeColors.text }]}
            >
              Competition Created!
            </Text>
            <Button
              title="View Competition Details"
              onPress={navigateToCompDetails}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  innerContainer: {
    justifyContent: "center",
    padding: 20,
    flexGrow: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "white",
  },
  list: {
    marginTop: 10,
  },
  listItem: {
    padding: 10,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  listItemText: {
    fontSize: 16,
    color: "white",
  },
  confirmationContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  confirmationText: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default CreateComp;
