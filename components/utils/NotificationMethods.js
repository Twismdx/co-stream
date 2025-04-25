globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
import notifee, { AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMessaging } from '@react-native-firebase/messaging';
import { getFcmToken, upsertFcmToken } from './API';

const baseUrl = 'https://scrbd.co-stream.live/api';

// Request notification permission
const requestNotificationPermission = async () => {
  try {
    const settings = await notifee.requestPermission();
    if (settings.authorizationStatus === notifee.AuthorizationStatus.DENIED) {
      console.warn('Notification permissions were denied.');
      return false;
    }
    console.log('Notification permissions granted.');
    return true;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Function to retrieve the FCM token from your API
const getReceiverToken = async (receiverId) => {
  try {
    const response = await getFcmToken(receiverId);
    // Assumes your API returns an object with a key "fcm_token"
    return response.fcm_token;
  } catch (error) {
    console.error('Error fetching FCM token:', error);
    throw new Error('Failed to retrieve FCM token');
  }
};

// Function to send remote notification using FCM
const sendRemoteNotification = async (receiverId, notificationData) => {
  try {
    const fcmToken = await getReceiverToken(receiverId);

    if (!fcmToken) {
      throw new Error('No FCM token found for receiver');
    }

    const payload = {
      to: fcmToken,
      notification: {
        title: notificationData.title,
        body: notificationData.body,
      },
      data: notificationData.data,
    };

    await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=YOUR_SERVER_KEY_HERE`, // Replace with your server key
      },
      body: JSON.stringify(payload),
    });

    console.log('Remote notification sent to:', receiverId);
  } catch (error) {
    console.error('Error sending remote notification:', error);
  }
};

// Save and send FCM token to your backend via API.js
// export const getAndSendToken = async (userId) => {
//   if (!userId) {
//     console.error('getAndSendToken called with undefined userId');
//     return;
//   }

//   try {
//     // Request permission via Firebase Messaging
//     const authStatus = await getMessaging().requestPermission();
//     const enabled =
//       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//       authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//     if (!enabled) {
//       console.warn('Notification permissions not granted.');
//       return;
//     }

//     // Retrieve the FCM token from Firebase
//     const fcmToken = await getMessaging().getToken();
//     console.log('FCM token retrieved:', fcmToken);

//     if (!fcmToken) {
//       throw new Error('Invalid FCM token retrieved');
//     }

//     // Update (upsert) the token on your backend using API.js
//     const response = await upsertFcmToken(userId, fcmToken);
//     if (response.error) {
//       throw new Error(`Error saving token: ${response.error}`);
//     }

//     // Store token locally
//     const storedToken = await AsyncStorage.getItem('notificationToken');
//     if (storedToken !== fcmToken) {
//       await AsyncStorage.setItem('notificationToken', fcmToken);
//       console.log('FCM token saved in AsyncStorage:', fcmToken);
//     }

//     console.log('FCM token saved via API.');
//   } catch (error) {
//     console.error('Error fetching and sending FCM token:', error);
//   }
// };

// Notification functions calling your API endpoints remain largely unchanged

export const notifyStatusChange = async (challengeId, beforeStatus, afterStatus, receiverId) => {
  try {
    await fetch(`${baseUrl}/notifyStatusChange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, beforeStatus, afterStatus, receiverId }),
    });

    await sendRemoteNotification(receiverId, {
      title: 'Challenge Status Updated',
      body: `The status of your challenge has changed from ${beforeStatus} to ${afterStatus}.`,
      data: { challengeId, navigationId: 'PendingMatches' },
    });
  } catch (error) {
    console.error('Error notifying status change:', error);
  }
};

export const notifyNewChallenge = async (challengeId, receiverId) => {
  try {
    await fetch(`${baseUrl}/notifyNewChallenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, receiverId }),
    });

    await sendRemoteNotification(receiverId, {
      title: 'New Challenge',
      body: 'You have received a new challenge!',
      data: { challengeId, navigationId: 'PendingMatches' },
    });
  } catch (error) {
    console.error('Error notifying new challenge:', error);
  }
};

export const notifyCounterOffer = async (challengeId, beforeStatus, afterStatus, receiverId) => {
  try {
    await fetch(`${baseUrl}/notifyCounterOffer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, beforeStatus, afterStatus, receiverId }),
    });

    await sendRemoteNotification(receiverId, {
      title: 'Counter-Offer Updated',
      body: `The counter-offer status has changed from ${beforeStatus} to ${afterStatus}.`,
      data: { challengeId, navigationId: 'PendingMatches' },
    });
  } catch (error) {
    console.error('Error notifying counter offer:', error);
  }
};

export const notifyDeclineChallenge = async (challengeId, receiverId, declinedByName) => {
  try {
    await fetch(`${baseUrl}/notifyDeclineChallenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, receiverId, declinedByName }),
    });

    await sendRemoteNotification(receiverId, {
      title: 'Challenge Declined',
      body: `${declinedByName} has declined your challenge.`,
      data: { challengeId, navigationId: 'PendingMatches' },
    });
  } catch (error) {
    console.error('Error notifying decline challenge:', error);
  }
};
