import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import {
	Ionicons,
	FontAwesome,
	MaterialCommunityIcons,
} from '@expo/vector-icons'
import { useGlobalContext } from '../timer/context'

const LiveBadge = ({ viewCount }) => {
	const { theme } = useGlobalContext()
	let activeColors = theme.colors[theme.mode]

	const styles = {
		container: {
			backgroundColor: '#eceff1',
			alignItems: 'center',
			justifyContent: 'center',
			flexDirection: 'row',
			padding: 5,
			borderRadius: 10,
			position: 'absolute',
			margin: 10,
			borderColor: '#bdbdbd',
			borderWidth: 1,
		},
		title: {
			color: '#000',
			fontWeight: 'bold',
		},
		dot: {
			backgroundColor: 'red',
			padding: 6,
			borderRadius: 20,
			marginRight: 5,
		},
		count: {
			backgroundColor: activeColors.secondary,
			opacity: 0.5,
			width: 20,
			height: 10,
		},
		eye: {
			marginRight: 10,
			padding: 5,
		},
	}

	return (
        <View style={styles.container}>
            <View style={styles.dot} />
            <Text style={styles.title}>LIVE</Text>
            <View style={styles.count}>
				<View style={styles.eye}>
					<Ionicons
						name='eye-outline'
						size={24}
						color='black'
					/>
					<Text>{viewCount}</Text>
				</View>
			</View>
        </View>
    );
}

export default LiveBadge
