globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true
import React, {useEffect, useState} from 'react'
import {View, Text, FlatList, StyleSheet} from 'react-native'
import {useGlobalContext} from '../timer/context'

const MatchesTab = ({compId}) => {
	const {theme, user} = useGlobalContext()
	const activeColors = theme.colors[theme.mode]
	const [matches, setMatches] = useState([])
	const [players, setPlayers] = useState({})
	const [error, setError] = useState(null)

	useEffect(() => {
		const fetchMatchesAndPlayers = async () => {
			try {
				const compSnapshot = await db.ref(`/comps/${compId}`).once('value')
				if (compSnapshot.exists()) {
					const compData = compSnapshot.val()
					const matchesData = []
					Object.keys(compData.players).forEach((playerUid) => {
						const playerMatches = compData.players[playerUid].matches
						playerMatches.forEach((match) => {
							matchesData.push({...match, playerUid})
						})
					})
					setMatches(matchesData)
					setPlayers(compData.players)
				} else {
					setMatches([])
					setPlayers({})
					setError('Competition data not found.')
				}
			} catch (err) {
				setError(`Error fetching data: ${err.message}`)
			}
		}

		fetchMatchesAndPlayers()
	}, [compId])

	if (error) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorText}>{error}</Text>
			</View>
		)
	}

	return (
		<View style={[styles.container, {backgroundColor: activeColors.primary}]}>
			<FlatList
				data={matches}
				keyExtractor={(item) => item.id}
				renderItem={({item}) => {
					const playerName = players[item.playerUid]?.name || 'Unknown Player'
					return (
						<View style={styles.itemContainer}>
							<Text style={styles.itemText}>Player: {playerName}</Text>
							<Text style={styles.itemText}>Opponent: {item.opponent}</Text>
							<Text style={styles.itemText}>Player Score: {item.playerScore}</Text>
							<Text style={styles.itemText}>Ghost Score: {item.ghostScore}</Text>
							<Text style={styles.itemText}>Handicap: {item.handicap}</Text>
							<Text style={styles.itemText}>Status: {item.status}</Text>
						</View>
					)
				}}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 10,
	},
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	errorText: {
		color: 'red',
		fontSize: 18,
	},
	itemContainer: {
		padding: 10,
		borderBottomColor: '#ccc',
		borderBottomWidth: 1,
	},
	itemText: {
		fontSize: 16,
		color: 'white',
	},
})

export default MatchesTab
