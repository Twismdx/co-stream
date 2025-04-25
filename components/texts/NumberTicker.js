import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { useSharedValue, withSpring, useAnimatedReaction, runOnJS } from "react-native-reanimated";

export default function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  decimalPlaces = 0,
  style,
}) {
  const initialValue = direction === "down" ? value : 0;
  const motionValue = useSharedValue(initialValue);
  const [displayValue, setDisplayValue] = useState(
    Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(initialValue)
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      motionValue.value = withSpring(direction === "down" ? 0 : value, {
        damping: 60,
        stiffness: 100,
      });
    }, delay * 1000);

    return () => clearTimeout(timeoutId);
  }, [value, direction, delay, motionValue]);

  useAnimatedReaction(
    () => motionValue.value,
    (currentValue) => {
      const formattedNumber = Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }).format(Number(currentValue.toFixed(decimalPlaces)));
      runOnJS(setDisplayValue)(formattedNumber);
    },
    [decimalPlaces]
  );

  return (
    <View>
      <Text style={[styles.numberText, style]}>{displayValue}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  numberText: {
    fontSize: 24,
    color: "black",
    fontVariant: ["tabular-nums"],
    textAlign: "center",
  },
});