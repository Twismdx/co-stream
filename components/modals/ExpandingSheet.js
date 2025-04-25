import React, { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { Portal } from "@gorhom/portal";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

export function ExpandingPanel({
  isOpen,
  top,
  left,
  width,
  targetHeight,
  maxHeight,
  style,
  children,
}) {
  const progress = useSharedValue(isOpen ? 1 : 0);
  const [isMounted, setIsMounted] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      // when opening, make sure it’s in the tree, then animate up
      setIsMounted(true);
      progress.value = withTiming(1, { duration: 450 });
    } else {
      // when closing, animate down and then remove from tree
      progress.value = withTiming(
        0,
        { duration: 450 },
        (finished) => finished && runOnJS(setIsMounted)(false)
      );
    }
  }, [isOpen]);

  const animStyle = useAnimatedStyle(() => ({
    height: progress.value * targetHeight,
  }));

  if (!isMounted) return null;

  return (
    <Portal>
      <Animated.View
        style={[
          styles.container,
          { top, left, width, maxHeight, height: targetHeight },
          style,
          animStyle,
        ]}
      >
        {children}
      </Animated.View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    overflow: "hidden",
  },
});
