import * as SwitchPrimitives from '@rn-primitives/switch';
import React, {useState} from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

const SwitchWeb = React.forwardRef((props, ref) => {
  const { checked, disabled, style, ...rest } = props;

  const [theme, setTheme] = useState({
      mode: "dark",
      colors: {
        dark: {
          primary: "#121212",
          modalSurface: "hsl(240, 10%, 3.9%)",
          modalButton: "hsl(0, 0%, 98%)",
          modalTitle: "hsl(0, 0%, 98%)",
          modalText: "hsl(0, 0%, 98%)",
          modalBorder: "hsl(240, 1.40%, 72.20%)",
          modalBorder2: "hsl(0, 0.00%, 2.00%)",
          foreground: "#EDEDED",
          surface: "#1E1E1E",
          border: "#2B2B2B",
          secondary: "#1C1C1C",
          bottomsheet: "#363636",
          onAccent: "#000000",
          onPrimary: "#ffffff",
          tertiary: "#f9fafb",
          accent: "#BB86FC", //#904CF2
          accentVariant: "#362257",
          accent2: "#03DAC6",
          text: "#ffffff",
          tint: "#f9fafb",
          img: "#f9fafb",
          error: "hsl(0, 72%, 51%)",
          success: "#6ee17c",
          onError: "#000000",
          category: "#3DB9F7",
          chatgreen: "#6ee17c",
          chatblue: "#3b40de",
          chatred: "#e1877d",
          chatyellow: "#f5f68c",
          chatpurple: "#dd261f",
          chatorange: "#dd261f",
          chatbackground: "#000000",
        },
        light: {
          primary: "#FFFFFF",
          secondary: "#03DAC6",
          onAccent: "#ffffff",
          onPrimary: "#000000",
          tertiary: "#4B4B4B",
          accent: "#6200EE",
          accent2: "#3700B3",
          text: "#000000",
          tint: "#111827",
          img: "#fff",
          error: "#B00020",
          category: "#3DB9F7",
        },
      },
    });

  const activeColors = theme.colors[theme.mode];

  // Root style for the web switch
  const rootStyle = {
    flexDirection: 'row',
    height: 24,
    width: 44,
    alignItems: 'center',
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: 'transparent',
    transition: 'background-color 0.2s',
    outline: 'none',
    backgroundColor: checked ? activeColors.accent : activeColors.primary,
    ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : { cursor: 'pointer' }),
  };

  // Thumb style with a simple transform based on checked state
  const thumbStyle = {
    height: 20,
    width: 20,
    borderRadius: 9999,
    backgroundColor: activeColors.accent,
    shadowColor: activeColors.accent,
    shadowOpacity: 0.05,
    transition: 'transform 0.2s',
    transform: [{ translateX: checked ? 20 : 0 }],
  };

  return (
    <SwitchPrimitives.Root
      {...rest}
      ref={ref}
      style={[rootStyle, style]}
      checked={checked}
      disabled={disabled}
    >
      <SwitchPrimitives.Thumb style={thumbStyle} />
    </SwitchPrimitives.Root>
  );
});

SwitchWeb.displayName = 'SwitchWeb';

const RGB_COLORS = {
  light: {
    primary: 'rgb(24, 24, 27)',
    input: 'rgb(228, 228, 231)',
  },
  dark: {
    primary: 'rgb(250, 250, 250)',
    input: 'rgb(39, 39, 42)',
  },
};

const SwitchNative = React.forwardRef((props, ref) => {
  const { checked, disabled, style, ...rest } = props;
  const [theme, setTheme] = useState({
      mode: "dark",
      colors: {
        dark: {
          primary: "#121212",
          modalSurface: "hsl(240, 10%, 3.9%)",
          modalButton: "hsl(0, 0%, 98%)",
          modalTitle: "hsl(0, 0%, 98%)",
          modalText: "hsl(0, 0%, 98%)",
          modalBorder: "hsl(240, 1.40%, 72.20%)",
          modalBorder2: "hsl(0, 0.00%, 2.00%)",
          foreground: "#EDEDED",
          surface: "#1E1E1E",
          border: "#2B2B2B",
          secondary: "#1C1C1C",
          bottomsheet: "#363636",
          onAccent: "#000000",
          onPrimary: "#ffffff",
          tertiary: "#f9fafb",
          accent: "#BB86FC", //#904CF2
          accentVariant: "#362257",
          accent2: "#03DAC6",
          text: "#ffffff",
          tint: "#f9fafb",
          img: "#f9fafb",
          error: "hsl(0, 72%, 51%)",
          success: "#6ee17c",
          onError: "#000000",
          category: "#3DB9F7",
          chatgreen: "#6ee17c",
          chatblue: "#3b40de",
          chatred: "#e1877d",
          chatyellow: "#f5f68c",
          chatpurple: "#dd261f",
          chatorange: "#dd261f",
          chatbackground: "#000000",
        },
        light: {
          primary: "#FFFFFF",
          secondary: "#03DAC6",
          onAccent: "#ffffff",
          onPrimary: "#000000",
          tertiary: "#4B4B4B",
          accent: "#6200EE",
          accent2: "#3700B3",
          text: "#000000",
          tint: "#111827",
          img: "#fff",
          error: "#B00020",
          category: "#3DB9F7",
        },
      },
    });
  const activeColors = theme.colors[theme.mode];
  const colorScheme = theme.mode; // using global theme mode (light/dark)

  const translateX = useDerivedValue(() => (checked ? 18 : 0));

  const animatedRootStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        translateX.value,
        [0, 18],
        [RGB_COLORS[colorScheme].input, RGB_COLORS[colorScheme].primary]
      ),
    };
  });

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(translateX.value, { duration: 200 }) }],
  }));

  // Container style for the switch on native
  const containerStyle = {
    height: 32,
    width: 46,
    borderRadius: 9999,
    overflow: 'hidden',
    ...(disabled ? { opacity: 0.5 } : {}),
  };

  // Root switch style
  const switchRootStyle = {
    flexDirection: 'row',
    height: 32,
    width: 46,
    alignItems: 'center',
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: activeColors.primary,
    backgroundColor: checked ? '#3f216b' : activeColors.primary,
  };

  // Thumb base style
  const thumbBaseStyle = {
    height: 28,
    width: 28,
    borderRadius: 9999,
    backgroundColor: checked ? activeColors.accent : '#3f216b',
    shadowColor: activeColors.accent,
    shadowOpacity: 0.25,
  };
  

  return (
    <Animated.View style={[containerStyle, animatedRootStyle, style]}>
      <SwitchPrimitives.Root
        {...rest}
        ref={ref}
        style={switchRootStyle}
        checked={checked}
        disabled={disabled}
      >
        <Animated.View style={animatedThumbStyle}>
          <SwitchPrimitives.Thumb style={thumbBaseStyle} />
        </Animated.View>
      </SwitchPrimitives.Root>
    </Animated.View>
  );
});
SwitchNative.displayName = 'SwitchNative';

const Switch = Platform.select({
  web: SwitchWeb,
  default: SwitchNative,
});

export { Switch };
