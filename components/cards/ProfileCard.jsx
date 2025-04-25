import React from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';
import { useGlobalContext } from '~/components/timer/context';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'

const ProfileCard = ({
  avatar,
  isOnline,
  name,
  stats,
  winPercentage,
  played
}) => {
  const { theme } = useGlobalContext();
  const activeColors = theme.colors[theme.mode]

  return (
    <View style={[styles.cardContainer, { backgroundColor: activeColors.secondary }]}>
      {/* Avatar Section */}
      <View style={styles.avatarContainer}>
        <Avatar style={{ width: 60, height: 60 }}>
          <AvatarImage
            source={avatar ? { uri: avatar } : require('~/assets/placeholder.png')}
            onError={(e) => {
              console.error('Avatar image failed to load:', e.nativeEvent.error)
            }}
          />
          <AvatarFallback>
            <Image
              source={require('~/assets/placeholder.png')}
              style={styles.avatar}
            />
          </AvatarFallback>
        </Avatar>
        <View
          style={[
            styles.badge,
            { backgroundColor: isOnline ? 'green' : 'grey' }
          ]}
        />
      </View>
      {/* Info Section */}
      <View style={styles.infoContainer}>
        <Text style={[styles.userName, { color: activeColors.accent }]}>
          {name || 'No Name'}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statsTitle, { color: activeColors.accent }]}>
              Win %
            </Text>
            <Text style={[styles.statsValue, { color: activeColors.accent }]}>
              {winPercentage} %
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statsTitle, { color: activeColors.accent }]}>
              Played
            </Text>
            <Text style={[styles.statsValue, { color: activeColors.accent }]}>
              {played}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProfileCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: '90%',
    borderRadius: 15,
    margin: 10,
    padding: 20,
    // iOS shadow properties
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    // Android elevation
    elevation: 5,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  badge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    top: 5,
    right: 10,
    // borderWidth: 1,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#fff',
  },
  infoContainer: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginTop: 4,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  statsTitle: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
});
