import React, {
  useMemo,
  useCallback,
  useImperativeHandle,
  useRef,
  createContext,
  useContext
} from "react";
import { View, Keyboard, Pressable, GestureResponderEvent, ViewStyle, Button } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetFlatList as GBottomSheetFlatList,
  BottomSheetFooter as GBottomSheetFooter,
  BottomSheetTextInput as GBottomSheetTextInput,
  BottomSheetView as GBottomSheetView,
  useBottomSheetModal
} from "@gorhom/bottom-sheet";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useGlobalContext } from "../timer/context";
import { DarkTheme } from "@react-navigation/native";

// Create context for compound sheet components
const BottomSheetContext = createContext({});

const BottomSheet = React.forwardRef((props, ref) => {
  const sheetRef = useRef(null);
  return (
    <BottomSheetContext.Provider value={{ sheetRef }}>
      <View ref={ref} {...props} />
    </BottomSheetContext.Provider>
  );
});

function useBottomSheetContext() {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error(
      "BottomSheet compound components cannot be rendered outside the BottomSheet component"
    );
  }
  return context;
}

const CLOSED_INDEX = -1;

const BottomSheetContent = React.forwardRef(
  (
    {
      enablePanDownToClose = true,
      enableDynamicSizing = true,
      index = 0,
      backdropProps,
      backgroundStyle,
      // android_keyboardInputMode = "adjustResize",
      ...props
    },
    ref
  ) => {
    const insets = useSafeAreaInsets();
    const { theme } = useGlobalContext();
    const activeColors = theme.colors[theme.mode];
    const { sheetRef } = useBottomSheetContext();

    useImperativeHandle(
      ref,
      () => sheetRef.current || {},
      []
    );

    const renderBackdrop = useCallback(
      (props) => {
        const {
          pressBehavior = "close",
          opacity = theme.mode === "dark" ? 0.2 : 0.3,
          disappearsOnIndex = CLOSED_INDEX,
          style,
          onPress,
          ...rest
        } = { ...props, ...backdropProps };
        return (
          <BottomSheetBackdrop
            opacity={opacity}
            disappearsOnIndex={disappearsOnIndex}
            pressBehavior={pressBehavior}
            style={[
              { backgroundColor: "rgba(0,0,0,0.8)" },
              style
            ]}
            onPress={() => {
              if (Keyboard.isVisible()) {
                Keyboard.dismiss();
              }
              onPress && onPress();
            }}
            {...rest}
          />
        );
      },
      [backdropProps, theme.mode]
    );

    return (
      <BottomSheetModal
        ref={sheetRef}
        index={index}
        enablePanDownToClose={enablePanDownToClose}
        backdropComponent={renderBackdrop}
        enableDynamicSizing={enableDynamicSizing}
        backgroundStyle={[
          { backgroundColor: activeColors.surface },
          backgroundStyle
        ]}
        handleIndicatorStyle={{
          backgroundColor: activeColors.foreground
        }}
        topInset={insets.top}
        // android_keyboardInputMode={android_keyboardInputMode}
        {...props}
      />
    );
  }
);

const BottomSheetOpenTrigger = React.forwardRef(
  ({ onPress, asChild = false, ...props }, ref) => {
    const { sheetRef } = useBottomSheetContext();
    function handleOnPress(ev) {
      sheetRef.current && sheetRef.current.present();
      onPress && onPress(ev);
    }
    const Trigger = asChild ? require("@rn-primitives/slot").Pressable : Pressable;
    return <Trigger ref={ref} onPress={handleOnPress} {...props} />;
  }
);

const BottomSheetCloseTrigger = React.forwardRef(
  ({ onPress, asChild = false, ...props }, ref) => {
    const { dismiss } = useBottomSheetModal();
    function handleOnPress(ev) {
      dismiss();
      if (Keyboard.isVisible()) {
        Keyboard.dismiss();
      }
      onPress && onPress(ev);
    }
    const Trigger = asChild ? require("@rn-primitives/slot").Pressable : Pressable;
    return <Trigger ref={ref} onPress={handleOnPress} {...props} />;
  }
);

const BOTTOM_SHEET_HEADER_HEIGHT = 60;

function BottomSheetView({ children, hadHeader = true, style, ...props }) {
  const insets = useSafeAreaInsets();
  return (
    <GBottomSheetView
      style={[
        { paddingHorizontal: 16, paddingBottom: insets.bottom + (hadHeader ? BOTTOM_SHEET_HEADER_HEIGHT : 0) },
        style
      ]}
      {...props}
    >
      {children}
    </GBottomSheetView>
  );
}

const BottomSheetTextInput = React.forwardRef(
  ({ placeholder, style, ...props }, ref) => {
    const { theme } = useGlobalContext();
    const activeColors = theme.colors[theme.mode];
    return (
      <GBottomSheetTextInput
        ref={ref}
        placeholder={placeholder}
        style={[
          {
            borderWidth: 1,
            borderColor: activeColors.border || "#fff",
            backgroundColor: activeColors.surface || "#fff",
            paddingHorizontal: 12,
            fontSize: 18,
            fontWeight: "600",
            height: 56,
            color: activeColors.surface,
            borderRadius: 8
          },
          style
        ]}
        {...props}
      />
    );
  }
);

const BottomSheetFlatList = React.forwardRef(
  ({ style, contentContainerStyle, ...props }, ref) => {
    const insets = useSafeAreaInsets();
    return (
      <GBottomSheetFlatList
        ref={ref}
        contentContainerStyle={[
          { paddingVertical: 16, paddingBottom: insets.bottom },
          contentContainerStyle
        ]}
        style={style}
        keyboardShouldPersistTaps="handled"
        {...props}
      />
    );
  }
);

const BottomSheetHeader = React.forwardRef(
  ({ children, style, ...props }, ref) => {
    const { dismiss } = useBottomSheetModal();
    const { theme } = useGlobalContext();
    const activeColors = theme.colors[theme.mode];
    function close() {
      if (Keyboard.isVisible()) {
        Keyboard.dismiss();
      }
      dismiss();
    }
    return (
      <View
        ref={ref}
        style={[
          {
            borderBottomWidth: 1,
            borderBottomColor: activeColors.border || "#fff",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: 16,
            height: BOTTOM_SHEET_HEADER_HEIGHT
          },
          style
        ]}
        {...props}
      >
        {children}
        <Pressable onPress={close} style={{paddingRight: 16, paddingBottom: 6}}>
          <Ionicons name="close" size={30} color={activeColors.foreground} />
        </Pressable>
      </View>
    );
  }
);

const BottomSheetFooter = React.forwardRef(
  ({ bottomSheetFooterProps, children, style, ...props }, ref) => {
    const insets = useSafeAreaInsets();
    return (
      <GBottomSheetFooter {...bottomSheetFooterProps}>
        <View
          ref={ref}
          style={[
            { paddingHorizontal: 16, paddingTop: 6, paddingBottom: insets.bottom + 6 },
            style
          ]}
          {...props}
        >
          {children}
        </View>
      </GBottomSheetFooter>
    );
  }
);

function useBottomSheet() {
  const ref = useRef(null);
  const open = useCallback(() => {
    ref.current && ref.current.present();
  }, []);
  const close = useCallback(() => {
    ref.current && ref.current.dismiss();
  }, []);
  return { ref, open, close };
}

export {
  BottomSheet,
  BottomSheetCloseTrigger,
  BottomSheetContent,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetOpenTrigger,
  BottomSheetTextInput,
  BottomSheetView,
  useBottomSheet
};