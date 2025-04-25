globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true
import React, {useEffect, useState} from 'react'
import {View, Text, FlatList, StyleSheet} from 'react-native'
import {useGlobalContext} from '../timer/context'

const updateLeaderboard = async (compId) => {
	try {
		const compRef = db.ref(`/comps/${compId}`)
		const compSnapshot = await compRef.once('value')
		const comp = compSnapshot.val()

		if (!comp) {
			throw new Error('Competition data is null or undefined')
		}
		if (!comp.players) {
			throw new Error('Competition players data is missing')
		}

		const matchesSnapshot = await db.ref('/matches').once('value')
		const matches = matchesSnapshot.val()

		if (!matches) {
			throw new Error('Matches data is missing')
		}

		const leaderboard = []
		Object.keys(comp.players).forEach((id) => {
			const player = comp.players[id]
			if (!player) {
				console.warn(`Player data for ${id} is missing`)
				return
			}

			const playerMatches = player.matches || []
			let totalScore = 0
			let handicap = player.handicap

			playerMatches.forEach((match) => {
				const matchData = matches[match.id]
				if (matchData && matchData.playerScore !== undefined) {
					totalScore += matchData.playerScore - handicap
				}
			})

			leaderboard.push({
				id,
				totalScore,
			})
		})

		leaderboard.sort((a, b) => b.totalScore - a.totalScore)

		await compRef.update({leaderboard})
	} catch (error) {
		console.error('Error updating leaderboard:', error)
	}
}

const LeaderboardPage = ({compId}) => {
	const {theme} = useGlobalContext()
	const activeColors = theme.colors[theme.mode]
	const [leaderboard, setLeaderboard] = useState([])

	useEffect(() => {
		const fetchAndUpdateLeaderboard = async () => {
			await updateLeaderboard(compId) // Call updateLeaderboard here
			const leaderboardSnapshot = await db.ref(`/comps/${compId}/leaderboard`).once('value')
			const leaderboardData = leaderboardSnapshot.val() || []
			const playersSnapshot = await db.ref(`/comps/${compId}/players`).once('value')
			const playersData = playersSnapshot.val() || {}

			const leaderboardWithNames = leaderboardData.map((item) => ({
				...item,
				name: playersData[item.id] ? playersData[item.id].name : 'Unknown Player',
			}))

			setLeaderboard(leaderboardWithNames.sort((a, b) => b.totalScore - a.totalScore))
		}

		fetchAndUpdateLeaderboard()
	}, [compId])

	return (
		<View style={[styles.container, {backgroundColor: activeColors.primary}]}>
			<FlatList
				data={leaderboard}
				keyExtractor={(item) => item.id}
				renderItem={({item, index}) => (
					<View style={styles.itemContainer}>
						<Text style={styles.itemText}>Rank: {index + 1}</Text>
						<Text style={styles.itemText}>Player Name: {item.name}</Text>
						<Text style={styles.itemText}>Total Score: {item.totalScore}</Text>
					</View>
				)}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 10,
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

export default LeaderboardPage
