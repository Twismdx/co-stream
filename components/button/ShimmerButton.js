import React from 'react';
import {
  Pressable,
  Animated,
  View,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const ShimmerButton = React.forwardRef(({
  shimmerColor = '#3700B3',
  shimmerSize = 4,
  shimmerDuration = 6000,
  borderRadius = 100,
  background = 'rgba(0, 0, 0, 1)',
  style,
  children,
  ...props
}, ref) => {
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const translateAnim = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: shimmerDuration,
        useNativeDriver: true,
      })
    ).start();

    // Translation animation for shimmer effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateAnim, {
          toValue: 1,
          duration: shimmerDuration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: shimmerDuration / 2,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const translateX = translateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200]
  });

  return (
    <Pressable
      ref={ref}
      style={({pressed}) => [
        styles.button,
        {
          borderRadius,
          backgroundColor: background,
          transform: [
            { translateY: pressed ? 1 : 0 }
          ]
        },
        style
      ]}
      {...props}
    >
      {/* Shimmer effect */}
      <View style={[styles.shimmerContainer, { borderRadius }]}>
        <Animated.View
          style={[
            styles.shimmerWrapper,
            {
              transform: [
                { rotate: spin },
              ]
            }
          ]}
        >
          <Animated.View
            style={[
              styles.shimmerGradient,
              {
                transform: [
                  { translateX }
                ]
              }
            ]}
          >
            <LinearGradient
              colors={[
                'transparent',
                shimmerColor,
                'transparent'
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.gradient}
            />
          </Animated.View>
        </Animated.View>
      </View>
      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
      {/* Highlight overlay */}
      <View style={[
        styles.highlight,
        { borderRadius }
      ]} />
      {/* Backdrop */}
      <View
        style={[
          styles.backdrop,
          {
            backgroundColor: background,
            borderRadius,
            margin: shimmerSize,
          }
        ]}
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: -1,
  },
  shimmerWrapper: {
    position: 'absolute',
    width: '200%',
    height: '200%',
    top: '-50%',
    left: '-50%',
  },
  shimmerGradient: {
    position: 'absolute',
    width: '100%',
    height: '8%',  // Made slightly thinner
    top: '46%',    // Adjusted position
  },
  gradient: {
    flex: 1,
    opacity: 0.4,  // Slightly increased opacity
  },
  content: {
    zIndex: 1,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
});

ShimmerButton.displayName = "ShimmerButton";

export default ShimmerButton;