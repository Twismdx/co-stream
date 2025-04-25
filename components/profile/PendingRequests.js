globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Button } from 'react-native'
import ProfileItem from './ProfileItem'
import { useGlobalContext } from '../timer/context'
import StyledText from '../texts/StyledText'
import { getUserProfile, respondToFriendRequest, createChatroom, fetchSentRequests, deleteSeenDeniedRequests } from '../utils/firebaseMethods'

const PendingRequests = () => {
  const { user } = useGlobalContext()
  const [requests, setRequests] = useState([])

  const fetchRequests = async () => {
    try {
      const response = await getUserProfile(user?.id)
      const requests = response.friendRequests
        ? Object.entries(response.friendRequests)
          .filter(([id, request]) => {
            const isUserFrom = user.id === request.from
            const hasResponded = request.responded
            return !(isUserFrom && hasResponded)
          })
          .map(([id, request]) => ({ id, ...request }))
        : []

      setRequests(requests)
    } catch (error) {
      console.error('Error fetching friend requests:', error)
    }
  }

  const handleRespond = async (requestId, accept) => {
    try {
      console.log(`Responding to friend request: userId=${user.id}, requestId=${requestId}, accept=${accept}`)

      // Perform the respond action
      await respondToFriendRequest(user?.id, requestId, accept ? 'accept' : 'deny')

      // Update local state immediately to hide the request
      setRequests(prevRequests => prevRequests.filter(request => request.id !== requestId))

      // Fetch updated requests immediately
      await fetchRequests()
      await deleteSeenDeniedRequests(user.id) // Clean up seen and denied requests
    } catch (error) {
      console.error('Error responding to friend request:', error)
    }
  }

  const handleCreateChat = async (user1Id, user2Id) => {
    try {
      const chatroomId = await createChatroom(user1Id, user2Id)
      // await createFriend(user1Id, user2Id, chatroomId)
    } catch (error) {
      console.error('Error creating friendship:', error)
    }
  }

  useEffect(() => {
    if (user?.id) {
      console.log(`Fetching requests for user id: ${user.id}`)
      fetchRequests()
      fetchSentRequests(user.id) // Mark denied requests as seen
      deleteSeenDeniedRequests(user.id) // Clean up seen denied requests
    }
  }, [user?.id])

  return (
    <View style={styles.container}>
      <StyledText style={styles.title}>Pending Friend Requests</StyledText>
      <View style={styles.requestsContainer}>
        {Array.isArray(requests) && requests.map((request, index) => (
          <View key={index} style={styles.requestItem}>
            <ProfileItem
              style={styles.profileItem}
              align='center'
              width='50%'
              opacity={1}
            >
              <View style={styles.requestInfo}>
                <StyledText style={{ padding: 7 }}>
                  {request.name}
                </StyledText>
                <View style={styles.buttonsContainer}>
                  <Button
                    title="Accept"
                    onPress={() => {
                      handleRespond(request.id, true) // Use correct request ID
                      handleCreateChat(user?.id, request.from) // Correct IDs
                    }}
                    color="green"
                    style={styles.button}
                  />
                  <View style={{ width: 10 }} />
                  <Button
                    title="Decline"
                    onPress={() => handleRespond(request.id, false)} // Use correct request ID
                    color="red"
                    style={styles.button}
                  />
                </View>
              </View>
            </ProfileItem>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'column',
  },
  title: {
    marginBottom: 5,
    textAlign: 'center',
  },
  requestsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  requestItem: {
    marginBottom: 10,
  },
  profileItem: {
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginLeft: 10,
    padding: 2,
  },
  button: {
    flex: 1, // Ensure equal width for buttons
  },
})

export default PendingRequests
