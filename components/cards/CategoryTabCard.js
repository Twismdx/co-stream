import React, { useContext } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useGlobalContext } from '../timer/context'

const CategoryCard = ({ title, onPress, isActive }) => {
	const { theme } = useGlobalContext()
	let activeColors = theme.colors[theme.mode]

	const styles = {
		container: {
			backgroundColor: '#FFFFFF',
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.2,
			borderRadius: 20,
			shadowRadius: 2,
			elevation: 3,
			paddingHorizontal: 20,
			paddingVertical: 10,
			marginHorizontal: 10,
			marginVertical: 5,
		},
		activeContainer: {
			backgroundColor: '#FFA500',
		},
		contentContainer: {
			justifyContent: 'center',
			alignItems: 'center',
		},
		title: {
			fontSize: 16,
			fontWeight: 'bold',
		},
		activeTitle: {
			color: '#FFFFFF',
		},
	}

	return (
        <TouchableOpacity onPress={onPress}>
            <View
				style={[
					styles.container,
					{
						backgroundColor: isActive
							? activeColors.accent
							: activeColors.secondary,
					},
				]}
			>
				<Text
					style={{
						color: isActive
							? activeColors.onAccent
							: activeColors.onPrimary,
						fontWeight: 'bold',
					}}
				>
					{title}
				</Text>
			</View>
        </TouchableOpacity>
    );
}

export default CategoryCard
