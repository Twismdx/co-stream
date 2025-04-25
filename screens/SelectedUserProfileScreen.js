// SelectedUserProfileScreen.js
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  Text,
} from "react-native";
import { useGlobalContext } from "~/components/timer/context";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import CustomButton from "../components/CustomButton";
import StyledText from "../components/texts/StyledText";
import SettingsItem from "../components/settings/SettingsItem";
import DatePicker from "react-native-date-picker";
import { Picker } from "@react-native-picker/picker";
import {
  BottomSheetModalProvider,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { getChallengeStats, createChallenge } from "../components/utils/API";
import moment from "moment";
import { Separator } from "~/components/ui/separator";

const SelectedUserProfileScreen = () => {
  const {
    selectedUser,
    theme,
    setIsLoading,
    challengeParams,
    setChallengeParams,
    user,
  } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];

  // ─── Profile stats ─────────────────────────────────────────────
  const [stats, setStats] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const fetchStats = async () => {
    if (!selectedUser?.id) return;
    setIsLoading(true);
    try {
      const data = await getChallengeStats(selectedUser.id);
      setStats(data || {});
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchStats();
  }, [selectedUser]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, [selectedUser]);

  // ─── Bottom Sheet setup ─────────────────────────────────────────
  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ["80%"], []);
  const [date, setDate] = useState(new Date());
  const [discipline, setDiscipline] = useState("8-ball");
  const [raceLength, setRaceLength] = useState(11);
  const [breakType, setBreakType] = useState("winner");
  const [handicapWho, setHandicapWho] = useState(null);
  const [handicap, setHandicap] = useState(null);
  const [dateOpen, setDateOpen] = useState(false);

  // preload if counter-offer
  useEffect(() => {
    const sel = challengeParams.selectedChallenge;
    if (sel) {
      const parsed = moment(sel.date);
      setDate(parsed.isValid() ? parsed.toDate() : new Date());
      setDiscipline(sel.discipline || "8-ball");
      setRaceLength(sel.race_length || 11);
      setBreakType(sel.break_type || "winner");
      setHandicapWho(sel.handicap_who ?? null);
      setHandicap(sel.handicap ?? null);
    }
  }, [challengeParams.selectedChallenge]);

  const players = [
    challengeParams.currentUser,
    challengeParams.challengedUser,
  ].filter(Boolean);
  const renderPickerItems = (vals) =>
    vals.map((v) => (
      <Picker.Item
        style={{
          fontSize: 12,
        }}
        key={v}
        label={String(v)}
        value={v}
        color={activeColors.primary}
      />
    ));

  const handleOpenSheet = () => {
    // set context so form knows who is playing
    setChallengeParams({
      ...challengeParams,
      challengedUser: selectedUser,
      currentUser: user,
      selectedChallenge: null,
    });
    setDateOpen(true);
  };

  const handleSubmit = async () => {
    const formatted = moment(date).format("YYYY-MM-DDTHH:mm:ssZ");
    await createChallenge({
      owner: challengeParams.currentUser.id,
      opponent: selectedUser.id,
      date: formatted,
      discipline,
      race_length: raceLength,
      break_type: breakType,
      handicap_who: handicapWho,
      handicap,
      status: "pending",
    });
    sheetRef.current?.dismiss();
    // refresh or navigate as needed
  };

  const pickerStyle = {
    backgroundColor: activeColors.primary,
    // on Android this will style the closed‐picker box,
    // and on iOS it also flows through to the modal’s backdrop
    color: activeColors.onPrimary,
  };
  const pickerItemStyle = {
    backgroundColor: activeColors.primary,
    // iOS only: styles text in the ActionSheet rows
    color: activeColors.onPrimary,
  };

  // ────────────────────────────────────────────────────────────────
  if (!selectedUser) {
    return (
      <View style={styles.centered}>
        <StyledText>No user selected.</StyledText>
      </View>
    );
  }

  // ────────────────────────────────────────────────────────────────
  return (
    <BottomSheetModalProvider>
      <SafeAreaView
        style={[styles.container, { backgroundColor: activeColors.primary }]}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator
        >
          <Avatar style={[styles.avatar, { width: 90, height: 90 }]} alt="">
            <AvatarImage
              source={
                selectedUser.avatar
                  ? { uri: selectedUser.avatar }
                  : require("~/assets/placeholder.png")
              }
            />
            <AvatarFallback>
              <StyledText>
                {(selectedUser.name || "")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </StyledText>
            </AvatarFallback>
          </Avatar>

          <View style={styles.section}>
            <SettingsItem label="Name" spaceBetween>
              <StyledText>{selectedUser.name}</StyledText>
            </SettingsItem>
          </View>
          <View style={styles.section}>
            <SettingsItem label="Matches Played" spaceBetween>
              <StyledText>{(stats.wins || 0) + (stats.losses || 0)}</StyledText>
            </SettingsItem>
            <SettingsItem label="Matches Won" spaceBetween>
              <StyledText>{stats.wins || 0}</StyledText>
            </SettingsItem>
            <SettingsItem label="Matches Lost" spaceBetween>
              <StyledText>{stats.losses || 0}</StyledText>
            </SettingsItem>
            <SettingsItem label="Win %" spaceBetween>
              <StyledText>
                {((stats.wins || 0) + (stats.losses || 0) > 0
                  ? (
                      ((stats.wins || 0) /
                        ((stats.wins || 0) + (stats.losses || 0))) *
                      100
                    ).toFixed(2)
                  : "0.00") + "%"}
              </StyledText>
            </SettingsItem>
          </View>

          <View style={styles.challengeBtn}>
            <CustomButton
              label="Challenge to Match"
              color="white"
              buttonColor={activeColors.accent}
              onPress={handleOpenSheet}
              style={{ height: 45, borderRadius: 4, paddingHorizontal: 20 }}
            />
          </View>
        </ScrollView>
        {dateOpen && (
          <DatePicker
            theme="dark"
            date={date}
            minuteInterval={15}
            minimumDate={new Date()}
            mode="datetime"
            modal
            title="Select Date of Challenge"
            open={dateOpen}
            onConfirm={(date) => {
              setDateOpen(false);
              setDate(date);
              sheetRef.current?.present();
            }}
            onCancel={() => {
              setDateOpen(false);
            }}
          />
        )}

        {/*  Bottom Sheet Modal  */}
        <BottomSheetModal
          ref={sheetRef}
          index={1}
          snapPoints={snapPoints}
          backgroundStyle={{
            backgroundColor: activeColors.secondary,
            borderColor: activeColors.modalBorder,
            borderWidth: 1,
            borderRadius: 40,
          }}
          handleIndicatorStyle={{ backgroundColor: activeColors.foreground }}
          onDismiss={() => {
            // clear any transient params if needed
          }}
        >
          <BottomSheetScrollView
            style={{ padding: 16, paddingTop: -16, marginBottom: -5 }}
            showsVerticalScrollIndicator
            automaticallyAdjustsScrollIndicatorInsets
            indicatorStyle={{ backgroundColor: activeColors.foreground }}
          >
            <Text style={styles.sheetTitle(activeColors)}>Match Setup</Text>
            <Separator />

            <Text style={styles.sheetLabel(activeColors)}>Discipline:</Text>
            <Picker
              dropdownIconColor="white"
              style={{
                maxHeight: 60,
                fontSize: 10,
                backgroundColor: activeColors.primary,
                color: activeColors.modalText,
              }}
              useNativeAndroidPickerStyle={false}
              selectedValue={discipline}
              onValueChange={setDiscipline}
            >
              {["International Rules", "8-ball", "9-ball", "10-ball"].map(
                (d) => (
                  <Picker.Item
                    style={{
                      fontSize: 12,
                    }}
                    key={d}
                    label={d}
                    value={d}
                    color={activeColors.primary}
                  />
                )
              )}
            </Picker>

            <Text style={styles.sheetLabel(activeColors)}>Race Length:</Text>
            <Picker
              dropdownIconColor="white"
              style={{
                maxHeight: 60,
                fontSize: 10,
                backgroundColor: activeColors.primary,
                color: activeColors.modalText,
              }}
              useNativeAndroidPickerStyle={false}
              selectedValue={raceLength}
              onValueChange={setRaceLength}
            >
              {renderPickerItems([3, 5, 7, 9, 11, 13, 15, 17, 19, 21])}
            </Picker>

            <Text style={styles.sheetLabel(activeColors)}>Break Type:</Text>
            <Picker
              dropdownIconColor="white"
              style={{
                maxHeight: 60,
                fontSize: 10,
                backgroundColor: activeColors.primary,
                color: activeColors.modalText,
              }}
              useNativeAndroidPickerStyle={false}
              selectedValue={breakType}
              onValueChange={setBreakType}
            >
              <Picker.Item
                style={{
                  fontSize: 12,
                }}
                label="Winner Breaks"
                value="winner"
                color={activeColors.primary}
              />
              <Picker.Item
                style={{
                  fontSize: 12,
                }}
                label="Alternate Breaks"
                value="alternate"
                color={activeColors.primary}
              />
            </Picker>

            <Text style={styles.sheetLabel(activeColors)}>
              Handicap (frames):
            </Text>
            <Picker
              dropdownIconColor="white"
              style={{
                maxHeight: 60,
                fontSize: 10,
                backgroundColor: activeColors.primary,
                color: activeColors.modalText,
              }}
              useNativeAndroidPickerStyle={false}
              selectedValue={handicapWho}
              onValueChange={setHandicapWho}
            >
              <Picker.Item
                style={{
                  fontSize: 12,
                }}
                label="Select Player"
                value={null}
                color={activeColors.primary}
              />
              {players.map((p) => (
                <Picker.Item
                  style={{
                    fontSize: 12,
                  }}
                  key={p.id}
                  label={p.name}
                  value={p.id}
                  color={activeColors.primary}
                />
              ))}
            </Picker>

            {handicapWho !== null && (
              <Picker
                dropdownIconColor="white"
                style={{
                  backgroundColor: activeColors.primary,
                  color: activeColors.modalText,
                }}
                useNativeAndroidPickerStyle={false}
                selectedValue={handicap}
                onValueChange={setHandicap}
              >
                {renderPickerItems([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])}
              </Picker>
            )}

            <View style={styles.sheetButtons}>
              <CustomButton
                label="Submit"
                onPress={handleSubmit}
                submit
                style={{ height: 45, borderRadius: 4, paddingHorizontal: 20 }}
              />
              <CustomButton
                label="Cancel"
                onPress={() => sheetRef.current?.dismiss()}
                cancel
                style={{ height: 45, borderRadius: 4, paddingHorizontal: 20 }}
              />
            </View>
          </BottomSheetScrollView>
        </BottomSheetModal>
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
};

export default SelectedUserProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  avatar: { alignSelf: "center", marginVertical: 16 },
  section: {
    marginHorizontal: 25,
    marginTop: 20,
    borderRadius: 30,
    overflow: "hidden",
  },
  challengeBtn: { margin: 25, alignItems: "center" },
  sheetTitle: (c) => ({
    fontSize: 20,
    fontWeight: "bold",
    color: c.accent,
    textAlign: "center",
  }),
  sheetLabel: (c) => ({ color: c.accent, fontWeight: "bold", marginTop: 12 }),
  sheetButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
});
