globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true
import React, {useState, useEffect} from 'react'
import {View, Text, FlatList} from 'react-native'
import firebase from '@react-native-firebase/app'

const ResultsPage = ({compId}) => {
	const [results, setResults] = useState([])

	useEffect(() => {
		const fetchResults = async () => {
			const resultsSnapshot = await db.ref(`/comps/${compId}/results`).once('value')
			if (resultsSnapshot.exists()) {
				setResults(Object.values(resultsSnapshot.val()))
			}
		}

		fetchResults()
	}, [compId])

	return (
		<View>
			<FlatList
				data={results}
				keyExtractor={(item) => item.id}
				renderItem={({item}) => (
					<View>
						<Text>Player: {item.player}</Text>
						<Text>Player Score: {item.playerScore}</Text>
						<Text>Ghost Score: {item.ghostScore}</Text>
						<Text>Handicap: {item.handicap}</Text>
						<Text>Result: {item.result}</Text>
					</View>
				)}
			/>
		</View>
	)
}

export default ResultsPage
