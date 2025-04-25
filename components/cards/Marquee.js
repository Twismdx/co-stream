import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  cancelAnimation,
  withRepeat,
  withTiming,
  Easing,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

export default function Marquee({ style, children }) {
  const translateX = useSharedValue(0);
  const [width, setWidth] = useState(0);

  // Measure content width (since children are duplicated, use half the width)
  const onContentLayout = (event) => {
    const newWidth = event.nativeEvent.layout.width / 2;
    setWidth(newWidth);
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      cancelAnimation(translateX);
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
    },
    onEnd: (event) => {
      translateX.value = withDecay({ velocity: event.velocityX });
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    if (width === 0) return {};
    // Use modulo arithmetic to create a continuous scroll effect.
    let modX = translateX.value % width;
    if (modX > 0) {
      modX -= width;
    }
    return {
      transform: [{ translateX: modX }],
    };
  });

  // More obvious pulsing animation using both opacity and scale.
  // const arrowOpacity = useSharedValue(1);
  // const arrowScale = useSharedValue(1);
  // useEffect(() => {
  //   arrowOpacity.value = withRepeat(
  //     withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
  //     -1,
  //     true
  //   );
  //   arrowScale.value = withRepeat(
  //     withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
  //     -1,
  //     true
  //   );
  // }, []);
  // const arrowAnimatedStyle = useAnimatedStyle(() => ({
  //   opacity: arrowOpacity.value,
  //   transform: [{ scale: arrowScale.value }],
  // }));

  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.marqueeContainer}>
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View
            style={[{ flexDirection: 'row' }, animatedStyle]}
            onLayout={onContentLayout}
          >
            {children}
            {children}
          </Animated.View>
        </PanGestureHandler>
      </View>
      {/* Left Chevron
      <Animated.View
        style={[styles.arrowContainer, styles.leftArrow, arrowAnimatedStyle]}
        pointerEvents="none"
      >
        <Ionicons name="chevron-back" size={40} color="white" />
      </Animated.View>
      {/* Right Chevron */}
      {/* <Animated.View
        style={[styles.arrowContainer, styles.rightArrow, arrowAnimatedStyle]}
        pointerEvents="none"
      >
        <Ionicons name="chevron-forward" size={40} color="white" />
      </Animated.View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    width: '100%',
    overflow: 'visible',
  },
  marqueeContainer: {
    overflow: 'hidden',
    width: '100%',
  },
  arrowContainer: {
    position: 'absolute',
    top: '50%',
    marginTop: -20, // Centers a 40px icon vertically
    width: 50,
    height: 50,
    borderRadius: 25,
    // Background removed as requested.
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftArrow: {
    left: -5,
    zIndex: 100,
    elevation: 100,
  },
  rightArrow: {
    right: -5,
    zIndex: 100,
    elevation: 100,
  },
});
