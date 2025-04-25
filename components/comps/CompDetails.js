globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true
import React, {useEffect, useState} from 'react'
import {View, Text, StyleSheet} from 'react-native'
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import {useGlobalContext} from '../timer/context'
import PlayersTab from './PlayersTab'
import MatchesTab from './MatchesTab'
import RankingsTab from './LeaderboardPage'

const Tab = createMaterialTopTabNavigator()

const CompDetailsPage = ({route}) => {
	// Assuming user is passed as a prop
	const {compId} = route.params
	const {theme, user} = useGlobalContext()
	const activeColors = theme.colors[theme.mode]
	const [comp, setComp] = useState(null)

	useEffect(() => {
		const fetchCompDetails = async () => {
			const compSnapshot = await db.ref(`/comps/${compId}`).once('value')
			if (compSnapshot.exists()) {
				const compData = compSnapshot.val()

				if (compData.players && compData.players.undefined) {
					compData.players[user.id] = compData.players.undefined
					delete compData.players.undefined
				}
				setComp(compData)
			}
		}

		fetchCompDetails()
	}, [compId, user.id])

	if (!comp) {
		return (
			<View style={[styles.loadingContainer, {backgroundColor: activeColors.primary}]}>
				<Text style={[styles.loadingText, {color: activeColors.text}]}>Loading...</Text>
			</View>
		)
	}

	return (
		<View style={[styles.container, {backgroundColor: activeColors.primary}]}>
			<Text style={[styles.title, {color: activeColors.text}]}>{comp.name}</Text>
			<Text style={[styles.dates, {color: activeColors.text}]}>
				Start Date: {new Date(comp.startDate).toDateString()}
			</Text>
			<Text style={[styles.dates, {color: activeColors.text}]}>
				Finish Date: {new Date(comp.finishDate).toDateString()}
			</Text>
			<Tab.Navigator
				screenOptions={{
					tabBarActiveTintColor: activeColors.text,
					tabBarIndicatorStyle: {backgroundColor: activeColors.text},
					tabBarStyle: {backgroundColor: activeColors.primary},
				}}>
				<Tab.Screen
					name="Players"
					children={() => <PlayersTab players={comp.players ? Object.values(comp.players) : []} />}
				/>
				<Tab.Screen name="Matches" children={() => <MatchesTab compId={compId} user={user} />} />
				<Tab.Screen name="Rankings" children={() => <RankingsTab compId={compId} user={user} />} />
			</Tab.Navigator>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		textAlign: 'center',
		marginVertical: 10,
	},
	dates: {
		fontSize: 16,
		textAlign: 'center',
		marginVertical: 5,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		fontSize: 18,
	},
	itemContainer: {
		padding: 10,
		borderBottomColor: '#ccc',
		borderBottomWidth: 1,
	},
	itemText: {
		fontSize: 16,
	},
})

export default CompDetailsPage
