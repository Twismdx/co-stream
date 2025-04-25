import React, { useContext, useState, useEffect } from 'react'
import {
	View,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	Text,
} from 'react-native'
import DealsCard from '../cards/DealsCard'

const HorizontalDealsSection = ({
	selectedCategory,
	orgname,
	compname,
	roundId,
	cardTitle,
	desc,
	stats,
}) => {
	const { theme } = useGlobalContext()
	let activeColors = theme.colors[theme.mode]

	const [id, setId] = useState(null)
	const [selectedRound, setSelectedRound] = useState(1)
	const [data, setData] = useState([])

	const handlePress = (index) => {
		onOpen()
		setId(index)
	}
	const handleSelectedRound = (index) => {
		// setSelectedRound(index + 1)
	}

	const compNames = [
		...new Set(Object.values(stats).map((item) => item.compname)),
	]

	const matchIdsArray = {}
	compNames.forEach((compName) => {
		const matchIds = Object.keys(stats).reduce((acc, key) => {
			if (stats[key].compname === compName) acc.push(key)
			return acc
		}, [])
		matchIdsByComp[compName] = matchIds
	})

	return (
        <View>
            {/* {Object.entries(stats).map((item, index) => {
        const data = Object.keys(item).map(function (key) {
          return item[key]
        })
        return (
          <Text
            key={index}
            style={{
              fontSize: 18,
              fontWeight: "bold",
              marginTop: 5,
              textAlign: 'left',
              marginLeft: 10,
              color: activeColors.text,
            }}
          >
            {data[1].org.name} -{'\n'}{data[1].compname}
          </Text>
        )
      })}
      <View style={styles.divider} /> */}
            <ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
			>
				<TouchableOpacity
					onPress={() => handleSelectedRound()}
					style={{
						marginVertical: 15,
					}}
					key={index}
				>
					<DealsCard
						key={matchIds[matchIndex]}
						home={match.home.teamname}
						away={match.away.teamname}
						homeScore={match.home.framepoints}
						awayScore={match.away.framepoints}
						matchTime={match.matchtime}
						homePoints={match.homepoints}
						awayPoints={match.awaypoints}
						matchId={matchIds[matchIndex]}
					/>
				</TouchableOpacity>
			</ScrollView>
            <Text
				style={{
					fontSize: 24,
					fontWeight: 'bold',
					textAlign: 'left',
					marginTop: 10,
					paddingTop: 10,
					marginLeft: 10,
					color: activeColors.text,
				}}
			>
				Matches
			</Text>
            <View style={styles.divider} />
            <ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
			>
				{compNames.map((compName) => (
					<TouchableOpacity
						key={compName}
						onPress={() => handlePress(index)}
					>
						{/* {matchIdsByComp[compName].map(matchId => (
              // <DealsCard
              //   key={item.matchId}
              //   matchId={item.matchId}
              //   title={`Match No. ${item.matchno}`}
              //   home={item.home.teamname}
              //   away={item.away.teamname}
              //   homeScore={item.homescore}
              //   awayScore={item.awayscore}
              //   matchTime={item.matchtime}
              //   homePoints={item.homepoints}
              //   awayPoints={item.awaypoints}
              //   />
              // console.log(matchId)
              // console.log(stats[matchId])
            ))} */}
					</TouchableOpacity>
				))}
			</ScrollView>
        </View>
    );
}

export default HorizontalDealsSection

const styles = StyleSheet.create({
	divider: {
		height: 1,
		backgroundColor: 'grey',
		marginVertical: 10,
		marginRight: 100,
		marginLeft: 10,
	},
})
