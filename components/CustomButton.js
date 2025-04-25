import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const DEFAULT_GRADIENT_COLORS = ["#BB86FC", "#6200EA"];
const SUBMIT_GRADIENT_COLORS = ["#43A047", "#2E7D32"];
const CANCEL_GRADIENT_COLORS = ["#E53935", "#B71C1C"];
const FACEBOOK_GRADIENT_COLORS = ["#1A73E8", "#1877F2"];
const GOOGLE_GRADIENT_COLORS = ["#fff", "#c4c4c4"];
const DEFAULT_TEXT_COLOR = "#FFFFFF";
const YELLOW_GRADIENT_COLORS = ["#FBC02D", "#F9A825"];

/**
 * A customizable button component with support for gradients, disabled state,
 * loading indication and variant colors for submit, cancel, Facebook & Google.
 * If children are provided they will be rendered (for example an icon) instead of the label.
 * The component does not enforce a specific width; you can supply your own style.
 */
const CustomButton = ({
  label,
  color = DEFAULT_TEXT_COLOR,
  onPress,
  style,
  textStyle,
  pending = false,
  disabled = false,
  loading = false,
  submit = false,
  cancel = false,
  facebook = false,
  google = false,
  accessibilityLabel,
  accessibilityHint,
  children,
  ...rest
}) => {
  // Determine which gradient colors to use.
  let gradientColors = DEFAULT_GRADIENT_COLORS;
  if (submit) {
    gradientColors = SUBMIT_GRADIENT_COLORS;
  } else if (cancel) {
    gradientColors = CANCEL_GRADIENT_COLORS;
  } else if (facebook) {
    gradientColors = FACEBOOK_GRADIENT_COLORS;
  } else if (google) {
    gradientColors = GOOGLE_GRADIENT_COLORS;
  } else if (pending) {
    gradientColors = YELLOW_GRADIENT_COLORS;
  }

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel || (label ? `${label} button` : "Button")
      }
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, busy: loading }}
      {...rest}
    >
      <LinearGradient
        colors={disabled ? ["#ccc", "#aaa"] : gradientColors}
        style={[styles.gradientBackground, style]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {loading ? (
          <ActivityIndicator color={color} size="small" />
        ) : children ? (
          children
        ) : label ? (
          <Text style={[styles.buttonText, { color }, textStyle]}>{label}</Text>
        ) : null}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 4,
    marginVertical: 5,
    overflow: "hidden",
  },
  gradientBackground: {
    width: "100%",
    height: 40,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default CustomButton;
