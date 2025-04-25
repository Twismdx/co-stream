globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import ProfileItem from './ProfileItem'
import { useGlobalContext } from '../timer/context'
import StyledText from '../texts/StyledText'
import SettingsItem from '../settings/SettingsItem'
import { getFriendsList, sendFriendRequest, challengeUser } from '../utils/firebaseMethods'
import UserOptionsModal from '../modals/UserOptionsModal'

const FriendsList = ({ onSendMessage }) => {
  const { user, theme } = useGlobalContext()
  const activeColors = theme.colors[theme.mode]
  const [friends, setFriends] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState(null)

  const handleGetFriendsList = async () => {
    try {
      const friendList = await getFriendsList(user?.id)
      setFriends(friendList)
    } catch (error) {
      console.error(error)
    }
  }

  const openModal = (friend) => {
    setSelectedFriend(friend)
    setModalVisible(true)
  }

  const closeModal = () => {
    setSelectedFriend(null)
    setModalVisible(false)
  }

  useEffect(() => {
    if (user && user.id) {
      handleGetFriendsList()
    }
  }, [user])

  return (
    <View style={styles.container}>
      <StyledText style={{ color: activeColors.accent }} bold>Friends List</StyledText>
      <View style={styles.friendsContainer}>
        {friends.length > 0 ? (
          friends.map((friend) => (
            <TouchableOpacity key={friend.id} onPress={() => openModal(friend)}>
              <SettingsItem>
                <View style={styles.friendInfo}>
                  <Image
                    source={{ uri: friend.avatar }}
                    style={styles.avatar}
                  />
                  <StyledText style={{ fontSize: 18 }} >{friend.name}</StyledText>
                </View>
              </SettingsItem>
            </TouchableOpacity>
          ))
        ) : (
          <StyledText>No friends found.</StyledText>
        )}
      </View>
      {selectedFriend && (
        <UserOptionsModal
          visible={modalVisible}
          onClose={closeModal}
          user={selectedFriend}
          onSendFriendRequest={() => {
            sendFriendRequest(user.id, selectedFriend.id)
            closeModal()
          }}
          onMessage={() => {
            onSendMessage(selectedFriend.id)
            closeModal()
          }}
          onRequestChallenge={() => {
            challengeUser(user.id, selectedFriend.id)
            closeModal()
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
    // alignSelf: 'center',
  },
  title: {
    fontFamily: 'OpenSans_600SemiBold',
    fontSize: 24,
    fontWeight: '700',
    padding: 5,
    textAlign: 'center',
  },
  friendsContainer: {
    borderRadius: 30,
    overflow: "hidden",
    marginTop: 25,
    marginBottom: 25,
  },
  profileItem: {
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 10,
  },
})

export default FriendsList
