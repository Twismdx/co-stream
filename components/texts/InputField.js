import React, { forwardRef } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import {useGlobalContext} from '../../components/timer/context'

const InputField = forwardRef(
  ({ label, icon, inputType, keyboardType, fieldButtonLabel, fieldButtonFunction, ...props }, ref) => {
    const { theme } = useGlobalContext();
	const activeColors = theme.colors[theme.mode]

    return (
      <View
        style={{
          flexDirection: "row",
          borderBottomColor: "#ccc",
          borderBottomWidth: 1,
          paddingBottom: 8,
          marginBottom: 25,
        }}
      >
        {icon}
        <TextInput
          ref={ref}
          placeholderTextColor={activeColors.text}
          placeholder={label}
          keyboardAppearance="dark"
          keyboardType={keyboardType}
          style={{ flex: 1, paddingVertical: 0, color: activeColors.tint }}
          secureTextEntry={inputType === "password"}
          {...props} // Spread additional props (e.g., onChangeText, onBlur, returnKeyType, etc.)
        />
        {fieldButtonLabel && (
          <TouchableOpacity onPress={fieldButtonFunction}>
            <Text style={{ color: activeColors.accent, fontWeight: "700" }}>
              {fieldButtonLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

export default InputField;
