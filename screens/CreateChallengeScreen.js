// CreateChallengeScreen.js
import React, { useState, useEffect, useRef, useMemo } from "react";
import { View, Text, SafeAreaView, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import DatePicker from "react-native-date-picker";
import {
  BottomSheetModalProvider,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useGlobalContext } from "../components/timer/context";
import CustomButton from "~/components/CustomButton";
import { Separator } from "~/components/ui/separator";
import { createChallenge } from "../components/utils/API";
import moment from "moment";

const CreateChallengeScreen = ({ route }) => {
  const { theme, challengeParams } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];
  const navigation = useNavigation();
  // --- sheet setup ---
  const bottomSheetModalRef = useRef(null);
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  // --- form state ---
  const [date, setDate] = useState(new Date());
  const [discipline, setDiscipline] = useState("8-ball");
  const [raceLength, setRaceLength] = useState(11);
  const [breakType, setBreakType] = useState("winner");
  const [handicap, setHandicap] = useState(null);
  const [handicapWho, setHandicapWho] = useState(null);

  const opponent = route.params?.challengedUser;
  const currentUser = route.params?.currentUser;
  const counterOffer = route.params?.counterOffer;
  const initialChallenge = route.params?.initialChallenge;

  // when the screen opens, immediately present the bottom sheet
  useEffect(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  // if we're counter‑offering an existing challenge, preload its data
  useEffect(() => {
    const { selectedChallenge } = challengeParams;
    if (!selectedChallenge) return;
    const parsed = moment(selectedChallenge.date);
    setDate(parsed.isValid() ? parsed.toDate() : new Date());
    setDiscipline(selectedChallenge.discipline || "8-ball");
    setRaceLength(selectedChallenge.race_length || 11);
    setBreakType(selectedChallenge.break_type || "winner");
    setHandicap(selectedChallenge.handicap ?? null);
    setHandicapWho(selectedChallenge.handicap_who ?? null);
  }, [challengeParams.selectedChallenge]);

  const players = [currentUser, opponent].filter(Boolean);

  const renderPickerItems = (values) =>
    values.map((val) => (
      <Picker.Item
        key={val}
        label={String(val)}
        value={val}
        color={activeColors.primary}
      />
    ));

  const handleSubmit = async () => {
    const formattedDate = moment(date).format("YYYY-MM-DDTHH:mm:ssZ");
    const payload = {
      owner: currentUser.id,
      opponent: opponent.id,
      date: formattedDate,
      discipline,
      race_length: raceLength,
      break_type: breakType,
      handicap,
      handicap_who: handicapWho,
      status: "pending",
    };
    try {
      await createChallenge(payload);
    } catch (err) {
      console.error("Failed to create challenge:", err);
    }
    bottomSheetModalRef.current?.dismiss();
    navigation.navigate("MainTabs");
  };

  const handleCancel = () => {
    bottomSheetModalRef.current?.dismiss();
    navigation.navigate("PendingMatches");
  };

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: activeColors.primary }}>
        {/* invisible container so sheet can overlay */}
        <View style={{ flex: 1 }} />

        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
          backgroundStyle={{ backgroundColor: activeColors.secondary }}
          handleIndicatorStyle={{ backgroundColor: activeColors.accent }}
        >
          <BottomSheetScrollView style={{ padding: 16 }}>
            <Text
              style={{
                fontSize: 20,
                color: activeColors.accent,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Match Setup
            </Text>
            <Separator style={{ marginVertical: 8 }} />

            <Text style={{ color: activeColors.accent, fontWeight: "bold" }}>
              Date & Time:
            </Text>
            <DatePicker
              date={date}
              mode="datetime"
              onDateChange={setDate}
              style={{ alignSelf: "center", marginVertical: 8 }}
            />

            <Text style={{ color: activeColors.accent, fontWeight: "bold" }}>
              Discipline:
            </Text>
            <Picker selectedValue={discipline} onValueChange={setDiscipline}>
              {["International Rules", "8-ball", "9-ball", "10-ball"].map(
                (val) => (
                  <Picker.Item
                    key={val}
                    label={val}
                    value={val}
                    color={activeColors.primary}
                  />
                )
              )}
            </Picker>

            <Text
              style={{
                color: activeColors.accent,
                fontWeight: "bold",
                marginTop: 8,
              }}
            >
              Race Length:
            </Text>
            <Picker selectedValue={raceLength} onValueChange={setRaceLength}>
              {renderPickerItems([3, 5, 7, 9, 11, 13, 15, 17, 19, 21])}
            </Picker>

            <Text
              style={{
                color: activeColors.accent,
                fontWeight: "bold",
                marginTop: 8,
              }}
            >
              Break Type:
            </Text>
            <Picker selectedValue={breakType} onValueChange={setBreakType}>
              <Picker.Item
                label="Winner Breaks"
                value="winner"
                color={activeColors.primary}
              />
              <Picker.Item
                label="Alternate Breaks"
                value="alternate"
                color={activeColors.primary}
              />
            </Picker>

            <Text
              style={{
                color: activeColors.accent,
                fontWeight: "bold",
                marginTop: 8,
              }}
            >
              Handicap (frames):
            </Text>
            <Picker selectedValue={handicapWho} onValueChange={setHandicapWho}>
              <Picker.Item
                label="Select Player"
                value={null}
                color={activeColors.primary}
              />
              {players.map((p) => (
                <Picker.Item
                  key={p.id}
                  label={p.name || p.full_name}
                  value={p.id}
                  color={activeColors.primary}
                />
              ))}
            </Picker>

            {handicapWho !== null && (
              <Picker selectedValue={handicap} onValueChange={setHandicap}>
                {renderPickerItems([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])}
              </Picker>
            )}

            <Separator style={{ marginVertical: 12 }} />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <CustomButton label="Submit" onPress={handleSubmit} submit />
              <CustomButton
                label="Cancel"
                onPress={handleCancel}
                cancel
                style={{ backgroundColor: activeColors.error }}
              />
            </View>
          </BottomSheetScrollView>
        </BottomSheetModal>
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
};

export default CreateChallengeScreen;
