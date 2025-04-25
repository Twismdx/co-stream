import React, { useEffect, useState } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Modal as RNModal,
  Image,
} from "react-native";
import { useGlobalContext } from "../../components/timer/context";
import CustomButton from "../../components/CustomButton";
import InputField from "../../components/texts/InputField";
import arrowUp from "../../assets/newArrowUp.png";
import arrowDown from "../../assets/newArrowDown.png";

const TimerModal = () => {
  const {
    isModalOpen,
    setIsModalOpen,
    shortTimer,
    minuteTimer,
    setShortTimer,
    setMinuteTimer,
    extension,
    setExtension,
    extOn,
    setExtOn,
    theme,
  } = useGlobalContext();

  const [selected, setSelected] = useState(extOn === "yes" ? "Yes" : "No");
  const activeColors = theme.colors[theme.mode];

  useEffect(() => {
    setExtOn(selected === "Yes" ? "yes" : "no");
  }, [selected]);

  return (
    <RNModal
      visible={isModalOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsModalOpen(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: activeColors.secondary }]}>
          {/* Header */}
          <Text style={[styles.headerText, { color: activeColors.text }]}>Settings</Text>

          {/* Use Extension? */}
          <View style={styles.row}>
            <Text style={[styles.label, { color: activeColors.text }]}>Use Extension?</Text>
            <View style={styles.buttonGroup}>
              {["Yes", "No"].map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setSelected(option)}
                  style={[
                    styles.optionButton,
                    selected === option ? { backgroundColor: activeColors.accent } : { backgroundColor: "#555" },
                  ]}
                >
                  <Text style={styles.buttonText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Timers */}
          <View style={styles.timersRow}>
            {/* Timer 1 */}
            <View style={styles.timerContainer}>
              <Text style={[styles.timerLabel, { color: activeColors.text }]}>Timer 1</Text>
              <InputField
                style={{ textAlign: 'center', color: 'white'}}
                label="Short Timer"
                keyboardType="numeric"
                value={shortTimer.toString()}
                onChangeText={(text) => setShortTimer(parseInt(text) || 0)}
              />
              <View style={styles.arrowsContainer}>
                <TouchableOpacity onPress={() => setShortTimer(shortTimer + 5)} style={styles.arrowButton}>
                  <Image source={arrowUp} style={styles.arrowImage} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShortTimer(shortTimer - 5)} style={styles.arrowButton}>
                  <Image source={arrowDown} style={styles.arrowImage} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Timer 2 */}
            <View style={styles.timerContainer}>
              <Text style={[styles.timerLabel, { color: activeColors.text }]}>Timer 2</Text>
              <InputField
                style={{ textAlign: 'center', color: 'white'}}
                label="Minute Timer"
                keyboardType="numeric"
                value={minuteTimer.toString()}
                onChangeText={(text) => setMinuteTimer(parseInt(text) || 0)}
              />
              <View style={styles.arrowsContainer}>
                <TouchableOpacity onPress={() => setMinuteTimer(minuteTimer + 5)} style={styles.arrowButton}>
                  <Image source={arrowUp} style={styles.arrowImage} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMinuteTimer(minuteTimer - 5)} style={styles.arrowButton}>
                  <Image source={arrowDown} style={styles.arrowImage} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Extension (only if enabled) */}
          {extOn === "yes" && (
            <View style={styles.extensionContainer}>
              <Text style={[styles.timerLabel, { color: activeColors.text }]}>Extension</Text>
              <InputField
                style={{ textAlign: 'center', color: 'white'}}
                label="Extension Time"
                keyboardType="numeric"
                value={extension.toString()}
                onChangeText={(text) => setExtension(parseInt(text) || 0)}
              />
              <View style={styles.arrowsContainer}>
                <TouchableOpacity onPress={() => setExtension(extension + 5)} style={styles.arrowButton}>
                  <Image source={arrowUp} style={styles.arrowImage} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setExtension(extension - 5)} style={styles.arrowButton}>
                  <Image source={arrowDown} style={styles.arrowImage} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <CustomButton onPress={() => setIsModalOpen(false)} style={styles.footerButton}>
              <Text style={styles.footerButtonText}>Close</Text>
            </CustomButton>
            <CustomButton onPress={() => setIsModalOpen(false)} style={[styles.footerButton, { backgroundColor: activeColors.accent }]}>
              <Text style={styles.footerButtonText}>Apply</Text>
            </CustomButton>
          </View>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 360,
    borderRadius: 12,
    padding: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
  },
  buttonGroup: {
    flexDirection: "row",
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  timersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timerContainer: {
    width: "45%",
    alignItems: "center",
  },
  timerLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  arrowsContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  arrowButton: {
    width: 34,
    height: 34,
    backgroundColor: "#444",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  arrowImage: {
    width: 16,
    height: 16,
  },
  extensionContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  footer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerButton: {
    width: 120,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#555",
  },
  footerButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default TimerModal;
