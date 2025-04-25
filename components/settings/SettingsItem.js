import { Text, View, StyleSheet } from 'react-native'
import React, { useContext } from 'react'
import { useGlobalContext } from '../timer/context'

import StyledText from '../texts/StyledText'

//receives font size and weight as input

const SettingsItem = ({ children, label, spaceBetween, disabled, center, evenly }) => {
  const { theme, toggleTheme } = useGlobalContext()
  let activeColors = theme.colors[theme.mode]
  return (
    <View
      style={[
        {
          opacity: disabled ? 0.5 : 1,
          backgroundColor: activeColors.secondary,
          justifyContent: spaceBetween ? 'space-between' : center ? 'center' : evenly ? 'space-evenly' : null,
        },
        styles.settingsItem,
      ]}
    >
      <StyledText
        style={[{ color: disabled ? '#999999' : activeColors.tertiary }, styles.label]}
      >
        {label}
      </StyledText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 25,
    marginBottom: 2,  
  },
  label: {
    fontStyle: 'italic',
  },
})

export default SettingsItem
