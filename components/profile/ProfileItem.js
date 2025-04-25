import { Text, View, StyleSheet } from 'react-native'
import React, { useContext } from 'react'
import { useGlobalContext } from '../timer/context'
import CustomButton from '../CustomButton'
import StyledText from '../texts/StyledText'

// receives font size and weight as input

const ProfileItem = ({ children, align, width, opacity, style, minHeight, minWidth }) => {
	const { theme, toggleTheme } = useGlobalContext()
	let activeColors = theme.colors[theme.mode]

	const styles = {
		ProfileItem: {
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			width: width,
			borderRadius: 15,
			margin: 10,
			padding: 5,
			opacity: opacity,
			minWidth: minWidth ? minWidth : null,
			minHeight: minHeight ? minHeight : null,
		},
		label: {
			fontStyle: 'italic',
		},
	}

	return (
        <View
			style={[
				{
					backgroundColor: activeColors.secondary,
					alignSelf: align ? align : null,
				},
				styles.ProfileItem,
				style,
			]}
		>
            {children}
        </View>
    );
}

export default ProfileItem