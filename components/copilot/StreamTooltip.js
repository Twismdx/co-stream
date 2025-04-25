import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { CustomToolTipButton } from "./CustomToolTipButton";
import { useCopilot } from "react-native-copilot";
import { useGlobalContext } from "../timer/context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export const StreamTooltip = ({ labels }) => {
  const { setStats, selectedItem, selectedOrg } = useGlobalContext();
  const navigation = useNavigation();
  const setFirstTime = async () => {
    try {
      await AsyncStorage.setItem("@streamScreen_firstTime", "false");
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

  const handleMenu = () => {
    stop();
  };

  return (
    <View>
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
          lastEvent === "menu" ? (
            <TouchableOpacity onPress={handleMenu}>
              <CustomToolTipButton>{labels.next}</CustomToolTipButton>
            </TouchableOpacity>
          ) : lastEvent === "size" ? (
            <TouchableOpacity onPress={handleFinish}>
              <CustomToolTipButton>{labels.finish}</CustomToolTipButton>
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
    </View>
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
