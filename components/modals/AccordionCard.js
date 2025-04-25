// AccordionCard.js
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
} from "react-native";
import MeasureView from "~/components/utils/MeasureView";
import Ionicons from "@expo/vector-icons/Ionicons";

// Color palette
const colors = {
  background: "hsl(240, 10%, 3.9%)", // dark background
  foreground: "hsl(0, 0%, 98%)", // light text
  border: "hsl(240, 5.9%, 90%)", // border color
  accent: "hsl(265, 86%, 62%)", // accent color
};

const AccordionCard = ({ title, subTitle, children }) => {
  const [expanded, setExpanded] = useState(false);
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleAccordion = () => {
    const finalValue = expanded ? 0 : measuredHeight;
    setExpanded(!expanded);
    Animated.timing(animation, {
      toValue: finalValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity onPress={toggleAccordion} style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{title}</Text>
          {subTitle ? (
            <Text style={styles.headerSubTitle}>{subTitle}</Text>
          ) : null}
        </View>
        {expanded ? (
          <Ionicons
            name="chevron-down-sharp"
            size={24}
            color={colors.foreground}
            style={{ opacity: 0.7 }}
          />
        ) : (
          <Ionicons
            name="chevron-forward-sharp"
            size={24}
            color={colors.foreground}
            style={{ opacity: 0.7 }}
          />
        )}
      </TouchableOpacity>

      {/* Animated Collapsible Content */}
      <Animated.View
        style={[styles.collapsibleContainer, { height: animation }]}
      >
        <View style={styles.contentInner}>{children}</View>
      </Animated.View>

      {/* Hidden measurement view (only rendered if we haven't measured yet or if content changes) */}
      <MeasureView
        onMeasure={(height) => {
          setMeasuredHeight(height);
          // If it's currently expanded, also update the animated value to match
          if (expanded) {
            animation.setValue(height);
          }
        }}
      >
        <View style={styles.hiddenContent}>{children}</View>
      </MeasureView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderWidth: 0,
    borderColor: colors.border,
    borderRadius: 8,
    marginVertical: 10,
    // Shadows
    shadowColor: colors.border,
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    shadowOffset: { width: 0, height: 3 },
    elevation: 7,
    overflow: Platform.OS === "android" ? "hidden" : "visible",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.foreground,
  },
  headerSubTitle: {
    fontSize: 14,
    color: colors.foreground,
    opacity: 0.8,
    marginTop: 4,
  },
  arrow: {
    fontSize: 16,
    color: colors.accent,
  },
  collapsibleContainer: {
    overflow: "hidden",
    backgroundColor: colors.background,
  },
  contentInner: {
    padding: 16,
  },
  hiddenContent: {
    // same styling as contentInner to get an accurate measurement
    padding: 16,
    backgroundColor: colors.background,
  },
});

export default AccordionCard;
