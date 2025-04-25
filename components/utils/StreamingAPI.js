// import { GraphRequest, GraphRequestManager } from 'react-native-fbsdk-next';
// import { AccessToken } from 'react-native-fbsdk-next';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export const getConfig = {
//   httpMethod: 'GET',
//   version: 'v19.0',
// };

// export const postConfig = {
//   httpMethod: 'POST',
//   version: 'v19.0',
// };

// export const pagePostConfig = {
//   httpMethod: 'POST',
//   version: 'v19.0',
// };

// export const pageGetConfig = {
//   httpMethod: 'POST',
//   version: 'v19.0',
// };

// export const fetchViewerCount = (liveVideoId, setViewerCount) => {
//   if (!liveVideoId) return;

//   const request = new GraphRequest(
//     `/${liveVideoId}`,
//     {
//       parameters: {
//         fields: {
//           string: 'live_views',
//         },
//       },
//     },
//     (error, result) => {
//       if (error) {
//         console.error('Error fetching viewer count:', error.message);
//         return;
//       }
//       setViewerCount(result.live_views || 0);
//     }
//   );

//   new GraphRequestManager().addRequest(request).start();
// };

// export const getProfileUrls = async (
//   streamTitle,
//   description,
//   setId,
//   setLiveVideoId,
//   setToken,
//   setStreamURL
// ) => {
//   try {
//     const privacy = JSON.stringify({ value: 'EVERYONE' });
//     // Retrieve the access token from AsyncStorage
//     const accessTokenValue = await AsyncStorage.getItem('fbAccessToken');
//     if (!accessTokenValue) {
//       throw new Error('Facebook access token not found');
//     }

//     const url = `https://graph.facebook.com/me/live_videos?status=LIVE_NOW&privacy=${encodeURIComponent(
//       privacy
//     )}&title=${encodeURIComponent(streamTitle)}&description=${encodeURIComponent(
//       description
//     )}&access_token=${accessTokenValue}`;

//     const response = await fetch(url, {
//       method: 'POST',
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const result = await response.json();

//     setId(result.id);
//     setLiveVideoId(result.id);
//     setToken(result.AccessToken);
//     setStreamURL(result.stream_url);
//     return result;
//   } catch (error) {
//     console.error('Error fetching profile URLs:', error);
//     throw error;
//   }
// };

// export const getPageUrls = (destination, streamTitle, description, setId, setStreamURL, setEndpoint) => {
//   return new Promise((resolve, reject) => {
//     const privacy = JSON.stringify({ value: 'EVERYONE' });
//     const liveVideoRequest = new GraphRequest(
//       `${destination}/live_videos?status=LIVE_NOW&privacy=${encodeURIComponent(privacy)}&title=${streamTitle}&description=${description}`,
//       pageGetConfig,
//       (error, result) => {
//         if (error) {
//           console.error('Something has gone wrong: ', error.message);
//           reject(error);
//         } else {
//           setId(result.id);
//           setStreamURL(`rtmps://live-api-s.facebook.com:443/rtmp/`);
//           setEndpoint(result.stream_url.split('rtmp/')[1]);
//           resolve();
//         }
//       }
//     );
//     new GraphRequestManager().addRequest(liveVideoRequest).start();
//   });
// };

// export const getPreview = async (id, postType, setToken) => {
//   try {
//     let accessToken;
//     if (postType === 'page') {
//       // Use the page configuration/token
//       accessToken = pageGetConfig; // Adjust this if pageGetConfig isn't a token string.
//     } else {
//       accessToken = await AsyncStorage.getItem('fbAccessToken');
//       if (!accessToken) {
//         throw new Error('Facebook access token not found');
//       }
//     }

//     // Construct the URL to get the preview URL.
//     const url = `https://graph.facebook.com/${id}?fields=dash_preview_url&access_token=${accessToken}`;

//     const response = await fetch(url, { method: 'GET' });
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     const result = await response.json();
//     // Optionally, if you need to update the token via setToken, you can do so here.
//     return result.dash_preview_url;
//   } catch (error) {
//     console.error('Error fetching preview:', error);
//     throw error;
//   }
// };

// export const getPageToken = (setToken) => {
//     return new Promise((resolve, reject) => {
//       const graphRequest = new GraphRequest(
//         `me/accounts?access_token=${AccessToken.getCurrentAccessToken()}`,
//         getConfig,
//         (error, result) => {
//           if (error) {
//             console.error('Something has gone wrong: ', error.message);
//             reject(error);
//           } else {
//             setToken(result.data[0].access_token);
//             resolve();
//           }
//         }
//       );
//       new GraphRequestManager().addRequest(graphRequest).start();
//     });
//   };
