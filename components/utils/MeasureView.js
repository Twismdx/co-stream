// MeasureView.js
import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";

const MeasureView = ({ onMeasure, children }) => {
  const viewRef = useRef(null);

  useEffect(() => {
    if (!viewRef.current) return;
    // wait one frame for layout
    requestAnimationFrame(() => {
      viewRef.current.measureInWindow((x, y, width, height) => {
        // y = top‑edge in screen coords
        // y + height = bottom‐edge in screen coords
        onMeasure(y + height);
      });
    });
  }, [children, onMeasure]);

  return (
    <View style={styles.measureContainer} ref={viewRef}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  measureContainer: {
    position: "absolute",
    top: -9999,
    left: -9999,
    opacity: 0,
  },
});

export default MeasureView;
