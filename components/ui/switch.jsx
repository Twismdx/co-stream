import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

const Switch = React.forwardRef((props, ref) => {
  const { 
    checked, 
    disabled = false, 
    style, 
    onValueChange,
    ...rest 
  } = props;

  // Use a default dark theme
  const activeColors = {
    primary: "#121212",
    accent: "#BB86FC",
    surface: "#1E1E1E",
  };

  // Animation for the thumb position
  const offset = useSharedValue(checked ? 1 : 0);

  // Update animation value when checked prop changes
  React.useEffect(() => {
    offset.value = withTiming(checked ? 1 : 0, { duration: 200 });
  }, [checked, offset]);

  // Animated style for the thumb
  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withTiming(checked ? 20 : 0, { duration: 200 }) }],
      backgroundColor: interpolateColor(
        offset.value,
        [0, 1],
        [activeColors.accent, activeColors.accent]
      ),
    };
  });

  // Animated style for the track
  const trackStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        offset.value,
        [0, 1],
        [activeColors.primary, 'rgba(187, 134, 252, 0.5)'] // Transparent version of accent
      ),
    };
  });

  // Safe handler for press events
  const handlePress = React.useCallback(() => {
    if (!disabled && onValueChange) {
      onValueChange(!checked);
    }
  }, [checked, disabled, onValueChange]);

  return (
    <Pressable
      ref={ref}
      style={[styles.container, style, disabled && styles.disabled]}
      onPress={handlePress}
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      {...rest}
    >
      <Animated.View style={[styles.track, trackStyle]} />
      <Animated.View style={[styles.thumb, thumbStyle]} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  disabled: {
    opacity: 0.5,
  },
});

Switch.displayName = 'Switch';

export default Switch;