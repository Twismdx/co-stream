import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { CustomToolTipButton } from "./CustomToolTipButton";
import { useCopilot } from "react-native-copilot";
import { useGlobalContext } from "../timer/context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import testData from "../../assets/testData.json";
import { useNavigation } from "@react-navigation/native";

export const HomeTooltip = ({ labels }) => {
  const { setStats, selectedItem, selectedOrg } = useGlobalContext();

  const {
    goToNext,
    goToPrev,
    stop,
    currentStep,
    isFirstStep,
    isLastStep,
    copilotEvents,
    goToNth,
    start,
  } = useCopilot();
  const [lastEvent, setLastEvent] = useState(null);
  const navigation = useNavigation();
  const setFirstTime = async () => {
    try {
      await AsyncStorage.setItem("@homeScreen_firstTime", "false");
    } catch (e) {
      console.error(e);
    }
  };

  const handleStop = () => {
    stop();
  };
  const handleNext = () => {
    goToNext();
  };

  const handlePrev = () => {
    goToPrev();
  };

  const handleFinish = async () => {
    setFirstTime();
    stop();
  };

  const handleFour = () => {
    stop();
  };

  const handleThree = () => {
    goToNth(4);
  };

  // useEffect(() => {
  // 	if (selectedOrg !== null) {
  // 		goToNth(6)
  // 	}
  // }, [selectedOrg])

  // useEffect(() => {
  // 	if (selectedItem !== null) {
  // 		goToNth(5)
  // 	}
  // }, [selectedItem])

  return (
    <>
      <View style={styles.tooltipContainer}>
        <Text testID="stepDescription" style={styles.tooltipText}>
          {currentStep?.text}
        </Text>
      </View>
      <View style={[styles.bottomBar]}>
        {!isLastStep ? (
          <TouchableOpacity onPress={handleStop}>
            <CustomToolTipButton>{labels.skip}</CustomToolTipButton>
          </TouchableOpacity>
        ) : null}
        {!isFirstStep ? (
          <TouchableOpacity onPress={handlePrev}>
            <CustomToolTipButton>{labels.previous}</CustomToolTipButton>
          </TouchableOpacity>
        ) : null}
        {!isLastStep ? (
          lastEvent === "four" ? (
            <TouchableOpacity onPress={handleFour}>
              <CustomToolTipButton>{labels.next}</CustomToolTipButton>
            </TouchableOpacity>
          ) : lastEvent === "three" ? (
            <TouchableOpacity onPress={handleThree}>
              <CustomToolTipButton>{labels.next}</CustomToolTipButton>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleNext}>
              <CustomToolTipButton>{labels.next}</CustomToolTipButton>
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity onPress={handleFinish}>
            <CustomToolTipButton>{labels.finish}</CustomToolTipButton>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  tooltipContainer: {
    flex: 1,
  },
  tooltipText: {},
  bottomBar: {
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
