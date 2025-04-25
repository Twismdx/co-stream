import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export const CustomToolTipButton = ({ wrapperStyle, style, ...rest }) => (
	<View style={[styles.button, wrapperStyle]}>
		<Text
			style={[styles.buttonText, style]}
			{...rest}
		/>
	</View>
)

const styles = StyleSheet.create({
	button: {
		padding: 10,
	},
	buttonText: {
		color: '#27ae60',
	},
})
