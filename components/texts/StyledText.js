import { Text } from "react-native"
import React, { useContext } from "react"
import { useGlobalContext } from '../timer/context'


//receives font size and weight as input

const StyledText = ({ children, small, big, style, text, bold, color, sans, ...props }) => {
  const { theme } = useGlobalContext()
  let activeColors = theme.colors[theme.mode]
  return (
    <Text
      style={[
        {
          color: color ? color : activeColors.accent,
          fontSize: small ? 12 : big ? 24 : 16,
          fontWeight: bold || big ? "bold" : "normal",
          fontFamily: 'OpenSans_600SemiBold'
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export default StyledText
