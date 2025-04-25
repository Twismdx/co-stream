import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useGlobalContext } from '../timer/context';

const PlayersTab = ({ players }) => {
  const { theme } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];

  return (
    <View style={[styles.container, { backgroundColor: activeColors.primary }]}>
      <FlatList
        data={Object.values(players)}
        keyExtractor={(item) => item.id ? item.id.toString() : 'default_key'}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={[styles.itemText, { color: activeColors.text }]}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
};

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
  },
});

export default PlayersTab;
