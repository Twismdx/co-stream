import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useMemo,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  InteractionManager,
} from "react-native";
import { useGlobalContext } from "../timer/context";
import { useNavigation } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { supabase } from "../utils/supabase";
import CustomButton from "../CustomButton";
import PinCode from "./PinCode";
import { Separator } from "../ui/separator";
import {
  BottomSheetModal,
  useBottomSheetModal,
  BottomSheetHandle,
} from "@gorhom/bottom-sheet";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";

const ChallengeSheet = forwardRef((props, ref) => {
  // Global context values
  const {
    theme,
    showModal1,
    setShowModal,
    actionSheet,
    setActionSheet,
    setShowModal1,
    copy,
    setCopy,
    streamTitle,
    setStreamTitle,
    desc,
    setDesc,
    local,
    destination,
    setDestination,
    matchData,
    setMatchData,
    samplePages,
    sampleGroups,
  } = useGlobalContext();

  const activeColors = theme.colors[theme.mode];
  const navigation = useNavigation();
  // Local state and refs
  const [checked, setChecked] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("profile");
  const [pagesOrGroups, setPagesOrGroups] = useState([]);
  const [selectedPageOrGroup, setSelectedPageOrGroup] = useState(null);
  const [showQR2, setShowQR2] = useState(false);
  const titleRef = useRef(null);
  const descRef = useRef(null);

  // BottomSheetModal refs for modals A–E
  const modalARef = useRef(null);
  const modalBRef = useRef(null);
  const modalCRef = useRef(null);
  const modalDRef = useRef(null);
  const modalERef = useRef(null);
  // BottomSheet ref for modal F (QR Code modal)
  const modalFRef = useRef(null);

  const { dismiss, dismissAll } = useBottomSheetModal();

  useImperativeHandle(ref, () => ({
    modalARef,
    openChallengeA: () => modalARef.current?.present(),
  }));

  // Memoized constants
  const snapPoints = useMemo(() => ["50%", "80%"], []);
  const psLink = useMemo(
    () => `https://www.poolstat.net.au/${actionSheet.orgCode}`,
    [actionSheet.orgCode]
  );

  // Memoized callbacks for main sheet buttons
  const onStreamPress = useCallback(() => {
    handleDismissAPress();
    handlePresentBPress();
  }, [handleDismissAPress, handlePresentBPress]);

  const onRefereePress = useCallback(() => {
    handleScoring();
  }, [handleScoring]);

  const onPoolstatPress = useCallback(() => {
    Linking.openURL(psLink);
  }, [psLink]);

  // FlatList memoized callbacks
  const keyExtractor = useCallback((item) => item.id, []);
  const renderPageOrGroup = useCallback(
    ({ item }) => (
      <TouchableOpacity
        onPress={() => setSelectedPageOrGroup(item)}
        style={{
          paddingVertical: 7,
          paddingHorizontal: 15,
          backgroundColor:
            selectedPageOrGroup && selectedPageOrGroup.id === item.id
              ? activeColors.primary
              : activeColors.background,
          borderRadius: 6,
          marginVertical: 4,
        }}
      >
        <Text style={{ color: activeColors.onPrimary }}>{item.name}</Text>
      </TouchableOpacity>
    ),
    [activeColors, selectedPageOrGroup]
  );

  // --- Header Component for all modals ---
  const CustomModalHeader = useCallback(
    ({ modalLetter, onClose, onBack, style, ...rest }) => (
      <BottomSheetHandle
        style={[
          style,
          { paddingBottom: 2, paddingHorizontal: 16, zIndex: 99999 },
        ]}
        indicatorStyle={{
          height: 4,
          opacity: 0.8,
          backgroundColor: activeColors.foreground,
        }}
        {...rest}
      >
        <View style={styles.headerContainer}>
          {modalLetter !== "Match Setup" ? (
            <TouchableOpacity onPress={onBack}>
              <Ionicons name="arrow-back-sharp" size={24} color="white" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} />
          )}
          <Text style={styles.headerTitle}>{modalLetter}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-sharp" size={28} color={activeColors.error} />
          </TouchableOpacity>
        </View>
      </BottomSheetHandle>
    ),
    [activeColors]
  );

  // --- Modal Open/Close Handlers ---
  const handlePresentAPress = useCallback(() => {
    modalARef.current?.present();
  }, []);

  const handleDismissAPress = useCallback(() => {
    modalARef.current?.dismiss();
  }, []);

  const handlePresentBPress = useCallback(() => {
    modalBRef.current?.present();
  }, []);

  const handleDismissBPress = useCallback(() => {
    modalBRef.current?.dismiss();
  }, []);

  const handlePresentCPress = useCallback(() => {
    modalCRef.current?.present();
  }, []);

  const handleDismissCPress = useCallback(() => {
    modalCRef.current?.dismiss();
  }, []);

  const handlePresentDPress = useCallback(() => {
    modalDRef.current?.present();
  }, []);

  const handleDismissDPress = useCallback(() => {
    modalDRef.current?.dismiss();
  }, []);

  const handlePresentEPress = useCallback(() => {
    modalERef.current?.present();
  }, []);

  const handleDismissEPress = useCallback(() => {
    modalERef.current?.dismiss();
  }, []);

  const handleDismissAllPress = useCallback(() => {
    dismissAll();
  }, [dismissAll]);

  const handlePresentFPress = useCallback(() => {
    setShowQR2(true);
    modalFRef.current?.expand();
  }, []);

  const handleDismissFPress = useCallback(() => {
    setShowQR2(false);
    modalFRef.current?.close();
  }, []);

  // --- Business Logic Functions ---
  const handleBreakingFirst = async () => {
    const { error } = await supabase
      .from("challenges")
      .update({ firsttobreak: checked })
      .eq("challengeid", actionSheet.challengeId);
    if (error) {
      console.error("Error updating firsttobreak: ", error.message);
      return;
    }
    const { data: matchData, error: matchError } = await supabase
      .from("challenges")
      .select("homeTeam,awayTeam")
      .eq("challengeid", actionSheet.challengeId)
      .single();
    if (matchError) {
      console.error("Error retrieving home & away: ", matchError.message);
      return;
    }
    setActionSheet((prev) => ({
      ...prev,
      home: {
        id: matchData?.homeTeam?.id,
        name: matchData?.homeTeam?.name,
        avatar: matchData?.homeTeam?.avatar,
      },
      away: {
        id: matchData?.awayTeam?.id,
        name: matchData?.awayTeam?.name,
        avatar: matchData?.awayTeam?.avatar,
      },
    }));
    handleDismissBPress();
    handlePresentCPress();
  };

  const handleScoring = async () => {
    handleDismissAPress();
    navigation.navigate("PinCode", {
      challengeId: actionSheet.challengeId,
      pin: actionSheet.matchPin,
    });
  };

  const getData = async () => {
    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .eq("challengeid", actionSheet.challengeId)
      .single();
    if (error) {
      console.error(error);
      return;
    }
    setP1(data?.owner);
    setP2(data?.opponent);
  };

  useEffect(() => {
    if (actionSheet.challengeId) {
      getData();
    }
  }, [actionSheet]);

  const createPoolstatPin = async () => {
    const { insertError } = await supabase
      .from("poolstat_match_pins")
      .insert([{ matchid: actionSheet.matchId }])
      .select();
    if (insertError) {
      console.error("Error inserting match pin: ", insertError.message);
      return;
    }
  };

  const handleSubmit = () => {
    setMatchData({
      challengeId: actionSheet.challengeId,
      pin: actionSheet.matchPin,
      title: streamTitle,
      local: local ? local : false,
      description: desc,
      destination: destination || "profile",
    });
    setActionSheet({});
    handleDismissEPress();
    Linking.openURL("com.costream://go-live");
  };

  const handleQRSubmit = () => {
    setMatchData({
      challengeId: actionSheet.challengeId,
      pin: actionSheet.matchPin,
      title: streamTitle,
      local: local ? local : false,
      description: desc,
      destination: destination || "profile",
    });
    setActionSheet({});
    handleDismissFPress();
    Linking.openURL("com.costream://go-live");
  };

  const getPoolstatPin = async () => {
    const { data: newData, error: newError } = await supabase
      .from("poolstat_match_pins")
      .select("pin")
      .eq("matchid", actionSheet.matchId)
      .single();
    if (newError) {
      console.error("Error retrieving new match pin: ", newError.message);
      return;
    }
    await setActionSheet((prev) => ({
      ...prev,
      matchPin: newData.pin,
    }));
    return newData.pin;
  };

  // --- Render Content Functions ---
  const renderMainSheet = useCallback(
    () => (
      <BottomSheetView style={styles.contentContainer}>
        <Separator />
        <TouchableOpacity style={{ paddingBottom: 5 }} onPress={onStreamPress}>
          <Text style={styles.contentText}>Stream this match</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ paddingBottom: 5 }} onPress={onRefereePress}>
          <Text style={styles.contentText}>Referee this match</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ paddingBottom: 5 }}
          onPress={onPoolstatPress}
        >
          <Text style={styles.contentText}>View on poolstat</Text>
        </TouchableOpacity>
      </BottomSheetView>
    ),
    [onStreamPress, onRefereePress, onPoolstatPress]
  );

  const renderBreakFirst = useCallback(
    () => (
      <BottomSheetView style={styles.contentContainer}>
        <Separator />
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
          }}
        >
          <TouchableOpacity
            onPress={() => setChecked(p1)}
            style={[
              styles.optionButton,
              checked === p1 && { backgroundColor: activeColors.accent },
            ]}
          >
            <Text style={styles.optionButtonText}>
              {actionSheet?.owner ?? ""}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setChecked(p2)}
            style={[
              styles.optionButton,
              checked === p2 && { backgroundColor: activeColors.accent },
            ]}
          >
            <Text style={styles.optionButtonText}>
              {actionSheet?.opponent ?? ""}
            </Text>
          </TouchableOpacity>
        </View>
        <CustomButton
          onPress={handleBreakingFirst}
          label="Next"
          style={styles.customButton}
          textStyle={styles.customButtonText}
        />
      </BottomSheetView>
    ),
    [p1, p2, checked, actionSheet, activeColors]
  );

  const renderDestinationSelection = useCallback(
    () => (
      <BottomSheetView style={styles.contentContainer}>
        <Separator />
        <View style={{ flexDirection: "column" }}>
          {["profile", "page", "group"].map((dest) => (
            <TouchableOpacity
              key={dest}
              onPress={() => {
                setSelectedDestination(dest);
                if (dest === "page") {
                  setPagesOrGroups(samplePages);
                } else if (dest === "group") {
                  setPagesOrGroups(sampleGroups);
                } else {
                  setPagesOrGroups([]);
                  setSelectedPageOrGroup(null);
                }
              }}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 15,
                marginVertical: 10,
                marginHorizontal: 50,
                backgroundColor:
                  selectedDestination === dest
                    ? activeColors.accent
                    : activeColors.border,
                borderRadius: 4,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: activeColors.onPrimary, fontSize: 16 }}>
                {dest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {(selectedDestination === "page" ||
          selectedDestination === "group") && (
          <FlatList
            data={pagesOrGroups}
            keyExtractor={keyExtractor}
            renderItem={renderPageOrGroup}
          />
        )}
        <CustomButton
          onPress={() => {
            handleDismissCPress();
            handlePresentDPress();
          }}
          label="Next"
          style={styles.customButton}
          textStyle={styles.customButtonText}
        />
      </BottomSheetView>
    ),
    [
      selectedDestination,
      pagesOrGroups,
      samplePages,
      sampleGroups,
      handleDismissCPress,
      handlePresentDPress,
      activeColors,
      keyExtractor,
      renderPageOrGroup,
    ]
  );

  const renderStreamTitleOptions = useCallback(
    () => (
      <BottomSheetView style={styles.contentContainer}>
        <Separator />
        <View>
          <TouchableOpacity onPress={() => titleRef.current?.focus()}>
            <Text
              style={{
                fontSize: 16,
                paddingBottom: 8,
                color: activeColors.onPrimary,
              }}
            >
              Stream Title
            </Text>
          </TouchableOpacity>
          <TextInput
            ref={titleRef}
            defaultValue={streamTitle}
            onChangeText={setStreamTitle}
            onSubmitEditing={() => descRef.current?.focus()}
            style={{
              borderWidth: 1,
              borderColor: activeColors.border,
              borderRadius: 6,
              padding: 6,
              fontSize: 16,
              backgroundColor: activeColors.foreground,
              textAlign: "center",
            }}
          />
        </View>
        <View style={{ marginTop: 6 }}>
          <TouchableOpacity onPress={() => descRef.current?.focus()}>
            <Text
              style={{
                fontSize: 16,
                paddingBottom: 8,
                color: activeColors.onPrimary,
              }}
            >
              Description
            </Text>
          </TouchableOpacity>
          <TextInput
            ref={descRef}
            defaultValue={desc}
            onChangeText={setDesc}
            style={{
              borderWidth: 1,
              borderColor: activeColors.border,
              borderRadius: 6,
              padding: 6,
              fontSize: 16,
              backgroundColor: activeColors.foreground,
              textAlign: "center",
            }}
          />
        </View>
        <CustomButton
          onPress={() => {
            handleDismissDPress();
            handlePresentEPress();
          }}
          label="Next"
          style={styles.customButton}
          textStyle={styles.customButtonText}
        />
      </BottomSheetView>
    ),
    [streamTitle, desc, activeColors, handleDismissDPress, handlePresentEPress]
  );

  const renderMatchPin = useCallback(() => {
    const pin = actionSheet.matchPin;
    return (
      <BottomSheetView style={styles.contentContainer}>
        <Separator />
        <Text
          style={{
            textAlign: "center",
            fontSize: 10,
            color: activeColors.foreground,
            opacity: 0.5,
          }}
        >
          Invite a user to be referee, or share the pin with them and they can
          join when they are ready!
        </Text>
        <TouchableOpacity onPress={() => setCopy(pin)}>
          <Text
            style={{
              fontSize: 48,
              marginTop: -15,
              fontWeight: "bold",
              color: activeColors.foreground,
              textAlign: "center",
            }}
          >
            {pin}
          </Text>
          <Text
            style={{
              textAlign: "center",
              fontSize: 10,
              paddingBottom: 5,
              paddingTop: 5,
              color: activeColors.foreground,
              opacity: 0.5,
            }}
          >
            Tap to copy!
          </Text>
        </TouchableOpacity>
        <View style={styles.container}>
          <View style={styles.row}>
            <View style={styles.sideButtonWrapper}>
              <CustomButton
                disabled={true}
                label="Invite"
                style={styles.sideButton}
                textStyle={styles.sideButtonText}
              />
            </View>
            <View style={styles.sideButtonWrapper}>
              <CustomButton
                label="QR Code"
                onPress={() => {
                  handleDismissEPress();
                  handlePresentFPress();
                }}
                style={styles.sideButton}
                textStyle={styles.sideButtonText}
              />
            </View>
          </View>
          <CustomButton
            label="Submit"
            onPress={handleSubmit}
            style={styles.submitButton}
            textStyle={styles.submitButtonText}
          />
        </View>
      </BottomSheetView>
    );
  }, [
    actionSheet,
    activeColors,
    setCopy,
    handleDismissEPress,
    handlePresentFPress,
  ]);

  // --- Render QR Code Modal Content for Modal F ---
  const renderQRcode = useCallback(() => {
    return (
      <BottomSheetView
        style={{
          flex: 1,
          paddingHorizontal: 25,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 60,
          marginBottom: 60,
        }}
      >
        <Text style={[styles.headerTitle, { paddingVertical: 5 }]}>
          Scan this QR code
        </Text>
        <Separator />
        <BottomSheetView
          contentContainerStyle={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 25,
          }}
        >
          <View style={{ marginTop: 15 }}>
            <QRCode
              value={
                actionSheet.challengeId
                  ? `com.costream://MainTabs/Home?pin=true&challengeId=${actionSheet.challengeId}`
                  : `com.costream://MainTabs/Home?pin=true&matchId=${actionSheet.matchId}`
              }
              size={200}
              color="black"
              backgroundColor="white"
            />
          </View>
          <View style={{ marginVertical: 15 }}>
            <TouchableOpacity onPress={handleQRSubmit} style={styles.qrButton}>
              <Text style={styles.qrButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetView>
    );
  }, [actionSheet, handleQRSubmit]);

  // --- Return: Render All Modals ---
  return (
    <>
      {/* Modal A: Match Setup */}
      <BottomSheetModal
        name="A"
        ref={modalARef}
        snapPoints={["40%"]}
        enableDynamicSizing={false}
        backgroundStyle={styles.modalBackground}
        handleComponent={() => (
          <CustomModalHeader
            modalLetter="Match Setup"
            onClose={() => {
              dismissAll();
              setActionSheet({});
            }}
          />
        )}
      >
        {renderMainSheet()}
      </BottomSheetModal>

      {/* Modal B: Select first to break */}
      <BottomSheetModal
        name="B"
        ref={modalBRef}
        snapPoints={["45%"]}
        enableDynamicSizing={false}
        backgroundStyle={styles.modalBackground}
        handleComponent={() => (
          <CustomModalHeader
            modalLetter="Select first to break"
            onClose={() => {
              dismissAll();
              setActionSheet({});
            }}
            onBack={() => {
              handleDismissBPress();
              handlePresentAPress();
            }}
          />
        )}
      >
        {renderBreakFirst()}
      </BottomSheetModal>

      {/* Modal C: Share To */}
      <BottomSheetModal
        name="C"
        ref={modalCRef}
        snapPoints={["55%"]}
        enableDynamicSizing={false}
        backgroundStyle={styles.modalBackground}
        handleComponent={() => (
          <CustomModalHeader
            modalLetter="Share To"
            onClose={() => {
              dismissAll();
              setActionSheet({});
            }}
            onBack={() => {
              handleDismissCPress();
              handlePresentBPress();
            }}
          />
        )}
      >
        {renderDestinationSelection()}
      </BottomSheetModal>

      {/* Modal D: Title & Description */}
      <BottomSheetModal
        name="D"
        ref={modalDRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        backgroundStyle={styles.modalBackground}
        handleComponent={() => (
          <CustomModalHeader
            modalLetter="Title & Description"
            onClose={() => {
              dismissAll();
              setActionSheet({});
            }}
            onBack={() => {
              handleDismissDPress();
              handlePresentCPress();
            }}
          />
        )}
      >
        {renderStreamTitleOptions()}
      </BottomSheetModal>

      {/* Modal E: Match Pin */}
      <BottomSheetModal
        name="E"
        ref={modalERef}
        snapPoints={["52%"]}
        enableDynamicSizing={false}
        backgroundStyle={styles.modalBackground}
        handleComponent={() => (
          <CustomModalHeader
            modalLetter="Match Pin"
            onClose={() => {
              dismissAll();
              setActionSheet({});
            }}
            onBack={() => {
              handleDismissEPress();
              handlePresentDPress();
            }}
          />
        )}
      >
        {renderMatchPin()}
      </BottomSheetModal>

      {/* Modal F: QR Code – Render only if showQR2 is true */}
      {showQR2 && (
        <BottomSheet
          style={{
            marginHorizontal: 25,
            flex: 1,
            borderRadius: 16,
            shadowColor: activeColors.primary,
            shadowOffset: {
              width: 0,
              height: 5,
            },
            shadowOpacity: 0.25,
            shadowRadius: 16.0,
            elevation: 24,
          }}
          name="F"
          ref={modalFRef}
          enablePanDownToClose={true}
          enableDynamicSizing={true}
          maxDynamicContentSize={350}
          detached={true}
          bottomInset={125}
          backgroundStyle={{
            backgroundColor: activeColors.surface,
            borderColor: activeColors.border,
            borderWidth: 2,
            borderRadius: 10,
          }}
          handleIndicatorStyle={{
            height: 4,
            opacity: 0.8,
            backgroundColor: activeColors.foreground,
            marginTop: 5,
          }}
        >
          {renderQRcode()}
        </BottomSheet>
      )}
    </>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    marginTop: 16,
    fontWeight: "bold",
    color: "white",
    fontSize: 24,
    lineHeight: 24,
  },
  contentContainer: {
    paddingHorizontal: 30,
    paddingTop: 5,
    gap: 20,
  },
  contentText: {
    color: "#EDEDED",
    fontSize: 16,
    paddingVertical: 5,
  },
  optionButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    width: "80%",
    alignItems: "center",
    marginBottom: 10,
  },
  optionButtonText: { color: "#fff", fontSize: 16 },
  customButton: { borderRadius: 6, paddingHorizontal: 15 },
  customButtonText: { fontSize: 16 },
  modalBackground: {
    backgroundColor: "#1E1E1E",
    borderColor: "#2B2B2B",
    borderWidth: 2,
    borderRadius: 10,
  },
  container: { width: "100%", paddingHorizontal: 20 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sideButtonWrapper: { flex: 0.45, minWidth: 100, marginBottom: -10 },
  sideButton: { height: 40, justifyContent: "center", alignItems: "center" },
  sideButtonText: { fontSize: 16, textAlign: "center" },
  submitButton: {
    height: 40,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: { fontSize: 16, fontWeight: "bold", textAlign: "center" },
  qrButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    marginBottom: 20,
    paddingHorizontal: 25,
    borderRadius: 4,
  },
  qrButtonText: { color: "white", fontWeight: "600", textAlign: "center" },
});

export default React.memo(ChallengeSheet);
