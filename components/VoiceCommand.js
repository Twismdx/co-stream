// import React, { useEffect, useState } from 'react';
// import { View, StyleSheet, Platform, PermissionsAndroid } from 'react-native';
// // import { PicovoiceManager } from '@picovoice/picovoice-react-native';
// // import RNFS from 'react-native-fs';

// const VoiceCommand = ({ p1up, p1down, p2up, p2down, p1score, p2score }) => {
//     const [picovoiceManager, setPicovoiceManager] = useState(null);
//     const [ready, setReady] = useState(false);

//     // Add permission check
//     const checkPermission = async () => {
//         if (Platform.OS === 'android') {
//             try {
//                 const granted = await PermissionsAndroid.request(
//                     PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//                     {
//                         title: 'Microphone Permission',
//                         message: 'App needs access to your microphone.',
//                         buttonNeutral: 'Ask Me Later',
//                         buttonNegative: 'Cancel',
//                         buttonPositive: 'OK',
//                     },
//                 );
//                 return granted === PermissionsAndroid.RESULTS.GRANTED;
//             } catch (err) {
//                 console.error('Failed to request permission:', err);
//                 return false;
//             }
//         }
//         return true;
//     };

//     useEffect(() => {
//         const initVoiceCommand = async () => {
//             const hasPermission = await checkPermission();
//             if (!hasPermission) {
//                 console.error('No microphone permission');
//                 return;
//             }

//             const accessKey = '77VLUsWtvIysQ2pXiGNyGtoLuEjVjYXtLpzQXaXNPHo2WII7geLlwg==';
//             try {
//                 const rhinoModelPath = `${RNFS.DocumentDirectoryPath}/score_en_android_v3_0_0.rhn`;
//                 const keywordPath = `${RNFS.DocumentDirectoryPath}/co-stream_en_android_v3_0_0.ppn`;

//                 await Promise.all([
//                     RNFS.copyFileAssets('score_en_android_v3_0_0.rhn', rhinoModelPath),
//                     RNFS.copyFileAssets('co-stream_en_android_v3_0_0.ppn', keywordPath)
//                 ]);

//                 const manager = await PicovoiceManager.create(
//                     accessKey,
//                     keywordPath,
//                     wakeWordCallback,
//                     rhinoModelPath,
//                     inferenceCallback,
//                     errorCallback
//                 );

//                 setPicovoiceManager(manager);
//                 setReady(true);
//             } catch (err) {
//                 console.error('Error initializing voice command:', err);
//             }
//         };

//         initVoiceCommand();

//         return () => {
//             if (picovoiceManager) {
//                 picovoiceManager.delete();
//             }
//         };
//     }, []);

//     useEffect(() => {
//         const startListening = async () => {
//             if (picovoiceManager && ready) {
//                 try {
//                     await picovoiceManager.start();
//                     console.log('Voice command started successfully');
//                 } catch(e) {
//                     console.error("Failed to start voice command:", e);
//                 }
//             }
//         };

//         startListening();
//     }, [ready, picovoiceManager]);

//     const wakeWordCallback = () => {
//         console.log('Wake word detected');
//     };

//     const errorCallback = (error) => {
//         console.error('Voice command error:', error.message);
//     };

//     const inferenceCallback = (inference) => {
//         console.log('Inference received:', JSON.stringify(inference, null, 2));
//         if (inference?.isUnderstood) {
//             const intent = inference.intent;
//             const slots = inference.slots;
//             handleInference(intent, slots);
//         } else {
//             console.log('Inference not understood');
//         }
//     };

//     const handleInference = (intent, slots) => {
//         if (!intent || !slots) return;

//         console.log('Handling inference:', intent, slots);
//         if (intent === 'score-up') {
//             if (slots.playerPick === 'one') {
//                 p1up();
//                 console.log('Player one score up');
//             } else if (slots.playerPick === 'two') {
//                 p2up();
//                 console.log('Player two score up');
//             }
//         } else if (intent === 'score-down') {
//             if (slots.playerPick === 'one') {
//                 p1down();
//                 console.log('Player one score down');
//             } else if (slots.playerPick === 'two') {
//                 p2down();
//                 console.log('Player two score down');
//             }
//         } else {
//             console.log('Unrecognized intent:', intent);
//         }
//     };

//     useEffect(() => {
//         if ((p1score > 0 || p2score > 0) && typeof window !== 'undefined' && window.speechSynthesis) {
//             speakScore();
//         }
//     }, [p1score, p2score]);

//     const speakScore = () => {
//         if (typeof window !== 'undefined' && window.speechSynthesis) {
//             const utterance = new SpeechSynthesisUtterance(`The score is ${p1score} to ${p2score}`);
//             window.speechSynthesis.speak(utterance);
//         } else {
//             console.log('Speech synthesis not available');
//         }
//     };

//     return <View/>;
// };

// export default VoiceCommand;
