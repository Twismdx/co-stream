import React from "react"
import { View, Text, TouchableOpacity, TextInput } from "react-native"
import { useGlobalContext } from './timer/context'

const InputField = React.forwardRef(({
    label,
    icon,
    inputType,
    keyboardType,
    fieldButtonLabel,
    fieldButtonFunction,
    onChangeText,
    ...rest
}, ref) => {
    const { theme } = useGlobalContext()
    let activeColors = theme.colors[theme.mode]

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
            {inputType === "password" ? (
                <TextInput
                    ref={ref}
                    placeholderTextColor={activeColors.text}
                    placeholder={label}
                    keyboardAppearance="default"
                    keyboardType={keyboardType}
                    style={{ flex: 1, paddingVertical: 0, color: activeColors.tint }}
                    secureTextEntry={true}
                    onChangeText={onChangeText}
                    {...rest}
                />
            ) : (
                <TextInput
                    ref={ref}
                    placeholderTextColor={activeColors.text}
                    placeholder={label}
                    keyboardAppearance="default"
                    keyboardType={keyboardType}
                    style={{ flex: 1, paddingVertical: 0, color: activeColors.tint }}
                    onChangeText={onChangeText}
                    {...rest}
                />
            )}
            {fieldButtonLabel ? (
                <TouchableOpacity onPress={fieldButtonFunction}>
                    <Text style={{ color: activeColors.accent, fontWeight: "700" }}>
                        {fieldButtonLabel}
                    </Text>
                </TouchableOpacity>
            ) : null}
        </View>
    )
}) 

export default InputField