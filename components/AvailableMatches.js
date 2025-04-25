globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { db } from './utils/firebaseMethods';
import CardComponent from './cards/CardComponent.js';
import { useGlobalContext } from './timer/context';

const AvailableMatches = () => {
    const { user } = useGlobalContext();
    const [matches, setMatches] = useState([]);

    const fetchMatches = async (userId) => {
		const matches = [];
		const compsSnapshot = await db.ref('/comps').once('value');
	  
		compsSnapshot.forEach((compSnapshot) => {
		  const comp = compSnapshot.val();
		  if (comp.players && comp.players[userId]) {
			const userMatches = comp.players[userId].matches || [];
			userMatches.forEach((userMatch, index) => {
			  const opponentId = userMatch.opponent;
			  const opponentName = opponentId === 'ghost' ? 'Ghost' : (comp.players[opponentId]?.name || 'Unknown Opponent');
			  matches.push({
				matchId: userMatch.id,
				matchNumber: index,
				...userMatch,
				compTitle: comp.name,
				playerName: comp.players[userId].name,
				opponentName: opponentName,
			  });
			});
		  }
		});
	  
		return matches;
	  };
	  

    useEffect(() => {
        const loadMatches = async () => {
            if (user?.id) {
                const result = await fetchMatches(user.id);
                setMatches(result);
            }
        };

        loadMatches();
    }, [user?.id]);

    return (
        <View>
            {matches.length > 0 ? (
                <FlatList
                    data={matches}
                    keyExtractor={(item) => item.matchId}
                    renderItem={({ item }) => (
                        <CardComponent
                            imageSource={null}
                            title={item.compTitle}
                            home={item.home}
                            away={item.away}
                            matchId={item.matchId}
                            homeScore={item.homeScore}
                            awayScore={item.awayScore}
                            matchTime={item.matchTime}
                            homePoints={item.homePoints}
                            awayPoints={item.awayPoints}
                            stats={item.stats}
                            orgCode={item.orgCode}
                            compId={item.compId}
                            hasMatchPoints={item.hasMatchPoints}
                            route={item.route}
                            compTitle={item.compTitle}
                            playerName={item.playerName}
							awayName={item.opponentName}
							matchNumber={item.matchNumber}
                        />
                    )}
                />
            ) : (
                <Text>No available matches.</Text>
            )}
        </View>
    );
};

export default AvailableMatches;
