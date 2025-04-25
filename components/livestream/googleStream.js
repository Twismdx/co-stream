import axios from 'axios'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { Alert } from 'react-native'

export default function useYoutubeLivestream(title) {

  const GOOGLE_API_KEY = 'AIzaSyDZkn24z68LH4GhGfWYDRc-4pq58Cza2p0'

  async function getAccessToken() {
    const currentUser = GoogleSignin.getCurrentUser()
    if (!currentUser) {
      googleSignIn()
    }
    const tokens = await GoogleSignin.getTokens()
    return tokens.accessToken
  }

  const createBroadcast = async () => {
    try {
      const accessToken = await getAccessToken()
      const response = await axios.post(
        `https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status&key=${GOOGLE_API_KEY}`,
        {
          snippet: {
            title: title,
            scheduledStartTime: new Date().toISOString(),
          },
          status: {
            privacyStatus: 'public',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
      return response.data.id
    } catch (error) {
      console.error('Error creating broadcast:', error)
      throw error
    }
  }

  const createStream = async () => {
    try {
      const accessToken = await GoogleSignin.getTokens().then(tokens => tokens.accessToken)
      const response = await axios.post(
        `https://www.googleapis.com/youtube/v3/liveStreams?part=snippet,cdn&key=${GOOGLE_API_KEY}`,
        {
          snippet: {
            title: title,
          },
          cdn: {
            format: '720p',
            ingestionType: 'rtmp',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error creating stream:', error)
      throw error
    }
  }

  const bindBroadcastToStream = async (broadcastId, streamId) => {
    try {
      const accessToken = await GoogleSignin.getTokens().then(tokens => tokens.accessToken)
      await axios.post(
        `https://www.googleapis.com/youtube/v3/liveBroadcasts/bind?id=${broadcastId}&streamId=${streamId}&part=id&key=${GOOGLE_API_KEY}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
    } catch (error) {
      console.error('Error binding broadcast to stream:', error)
      throw error
    }
  }

  const startLivestream = async () => {
    try {
      const broadcastId = await createBroadcast()
      const stream = await createStream()
      await bindBroadcastToStream(broadcastId, stream.id)

      // Here, you would start sending video data to the ingestion URL
      // This part requires a native module or third-party library for video encoding and streaming
      // Example (pseudo-code):
      // await startStreaming(cameraRef.current, stream.cdn.ingestionInfo.ingestionAddress);

      Alert.alert('Livestream started successfully!')
      console.log(broadcastId)
      return { broadcastId, streamId: stream.id, ingestionAddress: stream.cdn.ingestionInfo.ingestionAddress }
    } catch (error) {
      console.error('Error starting livestream:', error)
      Alert.alert('Failed to start livestream')
      throw error
    }
  }

  startLivestream(title)
}
