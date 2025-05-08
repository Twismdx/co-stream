globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
import { useDeviceOrientation } from "@react-native-community/hooks";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useGlobalContext } from "../components/timer/context";
import GoLive from "../images/GoLive";
import {
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Platform,
  DeviceEventEmitter,
  NativeModules,
  NativeEventEmitter,
  View,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CameraView from "../components/Fragment";
import VoiceCommand from "../components/VoiceCommand";
import { supabase } from "../components/utils/supabase";
import NumberTicker from "../components/texts/NumberTicker";
import { getItem, setItem } from "../components/utils/AsyncStorage";
import ActivityLoader from "@/components/utils/ActivityLoader";
import Toast from "~/components/ui/toast";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import DropDown from "~/components/modals/DropDown";
import VerticalSlider from "rn-vertical-slider";

const StreamScreen = ({ route, navigation }) => {
  const {
    landscape,
    setLandscape,
    isStreaming,
    setIsStreaming,
    disconnect,
    setDisconnect,
    theme,
    selectedSource,
    user,
    postType,
    token,
    setToken,
    streamURL,
    setStreamURL,
    endpoint,
    setEndpoint,
    id,
    setId,
    userToken,
    defaultStream,
    useScoreboard,
    setUseScoreboard,
    matchData,
    isLoading,
    setIsLoading,
  } = useGlobalContext();

  const RTMPModule = NativeModules.RTMPPublisher;
  // if (!RTMPModule.addListener) {
  // 	RTMPModule.addListener = () => {}
  // }
  // if (!RTMPModule.removeListeners) {
  // 	RTMPModule.removeListeners = () => {}
  // }
  const [viewerCount, setViewerCount] = useState(0);
  const [liveVideoId, setLiveVideoId] = useState(null);
  const pollingInterval = useRef(null);
  const [test, setTest] = useState(0);
  const cameraRef = useRef(null);
  const cameraEventEmitter = new NativeEventEmitter(RTMPModule);
  const [ready, setReady] = useState(false);
  const [isPortrait, setIsPortrait] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [hasBluetoothDevice, setHasBluetoothDevice] = useState(false);
  const [microphoneModalVisibility, setMicrophoneModalVisibility] =
    useState(false);
  const [showModal, setShowModal] = useState(false);
  const activeColors = theme.colors[theme.mode];
  const [maxRange, setMaxRange] = useState(null);
  const [minRange, setMinRange] = useState(1.0);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [errorUserTitle, setErrorUserTitle] = useState(null);
  const { portrait } = useDeviceOrientation();
  const orientation = useDeviceOrientation();
  const compId = matchData?.compId ?? null;
  const matchId = matchData?.matchId ?? null;
  const challengeId = matchData?.challengeId ?? null;
  const pin = matchData?.pin ?? null;
  const streamTitle = matchData?.title ?? null;
  const description = matchData?.description ?? null;
  const destination = matchData?.destination ?? null;

  const sliderRef = useRef(null);
  const zoomPercent = ((zoomLevel - minRange) / (maxRange - minRange)) * 100;

  const successToast = useCallback((toast1, toast2) => {
    Toast.show({
      type: "success",
      text1: toast1 ? toast1 : "Success!",
      text2: toast2 ? toast2 : "",
      visibilityTime: 3000,
    });
  }, []);

  const errorToast = useCallback((error1, error2) => {
    Toast.show({
      type: "error",
      text1: error1 ? error1 : "Oops, Something has gone wrong.",
      text2: error2
        ? error2
        : `We can't seem to work out what's wrong, Please close and restart the app.`,
      visibilityTime: 3000,
    });
  }, []);

  const sliderPosition = isPortrait ? styles.portrait : styles.landscape;

  const setIsVertical = () => {
    if (ready) {
      setIsPortrait(true);
      RTMPModule.setIsPortrait(true);
    }
  };

  const setIsHorizontal = () => {
    if (ready) {
      setIsPortrait(false);
      RTMPModule.setIsPortrait(false);
    }
  };

  useEffect(() => {
    if (ready) {
      console.log(orientation);
      orientation === "portrait" ? setIsVertical() : setIsHorizontal();
    }
  }, [ready, orientation]);

  const getProfileUrls = async (
    streamTitle,
    description,
    setId,
    setLiveVideoId,
    setToken,
    setStreamURL
  ) => {
    setIsLoading(true);
    try {
      const privacy = { value: "EVERYONE" };
      const accessToken = await getItem("fbAccessToken");
      if (!accessToken) throw new Error("Facebook access token not found");

      const url = `https://graph.facebook.com/me/live_videos?access_token=${accessToken}`;
      const bodyContent = `status=LIVE_NOW&privacy=${JSON.stringify(
        privacy
      )}&title=${streamTitle}&description=${description}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: bodyContent,
      });
      const data = await response.json();
      setReady(true);

      if (data.error) {
        errorToast(
          data.error.error_user_title ? data.error.error_user_title : null,
          data.error.error_user_message
            ? data.error.error_user_message
            : data.error.message
        );
        return;
      }

      // Process the result normally.
      setId(data?.id);
      setLiveVideoId(data?.id);
      setToken(accessToken);
      setStreamURL(data?.stream_url);
      setIsLoading(false);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const getPreview = async () => {
    setIsLoading(true);
    try {
      const url = `https://graph.facebook.com/${id}?fields=dash_preview_url&access_token=${token}`;
      const response = await fetch(url, { method: "GET" });
      // if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const result = await response.json();
      setStreamURL(result.dash_preview_url);
      setIsLoading(false);
    } catch (error) {
      errorToast(null, error.message);
    }
  };

  // const fetchViewerCount = async (liveVideoId, setViewerCount) => {
  //   if (!liveVideoId) return;
  //   try {
  //     const {
  //       data: { session },
  //     } = await supabase.auth.getSession();
  //     const accessToken = session?.access_token;
  //     if (!accessToken) throw new Error("Facebook access token not found");

  //     const url = `https://graph.facebook.com/${liveVideoId}?fields=live_views&access_token=${accessToken}`;
  //     const response = await fetch(url, { method: "GET" });
  //     if (!response.ok)
  //       throw new Error(`HTTP error! status: ${response.status}`);

  //     const result = await response.json();
  //     setViewerCount(result?.live_views || 0);
  //   } catch (error) {
  //     errorToast("Error fetching viewer count", error.message);
  //   }
  // };

  // const getPageUrls = async (
  //   destination,
  //   streamTitle,
  //   description,
  //   setId,
  //   setStreamURL,
  //   setEndpoint
  // ) => {
  //   try {
  //     const privacy = encodeURIComponent(JSON.stringify({ value: "EVERYONE" }));
  //     const {
  //       data: { session },
  //     } = await supabase.auth.getSession();
  //     const accessToken = session?.access_token;
  //     if (!accessToken) throw new Error("Facebook access token not found");

  //     const url = `https://graph.facebook.com/${destination}/live_videos?status=LIVE_NOW&privacy=${privacy}&title=${encodeURIComponent(
  //       streamTitle
  //     )}&description=${encodeURIComponent(
  //       description
  //     )}&access_token=${accessToken}`;
  //     const response = await fetch(url, { method: "POST" });
  //     if (!response.ok)
  //       throw new Error(`HTTP error! status: ${response.status}`);

  //     const result = await response.json();
  //     setId(result?.id);
  //     // Set a fixed stream URL for pages
  //     setStreamURL(`rtmps://live-api-s.facebook.com:443/rtmp/`);
  //     // Extract endpoint from the returned stream_url if available
  //     const endpointStr = result?.stream_url
  //       ? result.stream_url.split("rtmp/")[1]
  //       : "";
  //     setEndpoint(endpointStr);
  //     return result;
  //   } catch (error) {
  //     errorToast("Error fetching page URLs", error.message);
  //   }
  // };

  // const getPageToken = async (setToken) => {
  //   try {
  //     const {
  //       data: { session },
  //     } = await supabase.auth.getSession();
  //     const accessToken = session?.access_token;
  //     if (!accessToken) throw new Error("Facebook access token not found");

  //     const url = `https://graph.facebook.com/me/accounts?access_token=${accessToken}`;
  //     const response = await fetch(url, { method: "GET" });
  //     if (!response.ok)
  //       throw new Error(`HTTP error! status: ${response.status}`);

  //     const result = await response.json();
  //     if (result?.data && result.data.length > 0) {
  //       setToken(result.data[0].access_token);
  //     }
  //     return result;
  //   } catch (error) {
  //     errorToast("Error fetching page token", error.message);
  //   }
  // };

  // // To lock the screen:
  // RTMPModule.lockScreen()
  //   .then(() => console.log('Screen locked'))
  //   .catch((err) => console.error('Error locking screen', err));

  // // To unlock the screen:
  // RTMPModule.unlockScreen()
  //   .then(() => console.log('Screen unlocked'))
  //   .catch((err) => console.error('Error unlocking screen', err));

  useEffect(() => {
    // Handler for orientation change: defer the state update to avoid interrupting render cycles.
    const handleOrientationChanged = () => {
      requestAnimationFrame(() => {
        setLandscape(!isPortrait);
      });
    };

    // Handler for navigating back from the camera.
    const handleBackFromCamera = () => {
      // If popBack might affect render, schedule it after the current render cycle.
      requestAnimationFrame(() => {
        RTMPModule.popBack();
      });
    };

    // Other event handlers.
    const handleConnectionFailed = (reason) => {
      errorToast("Connection Failed:", reason);
    };

    const handleConnectionStarted = (url) => {
      successToast("You're Live!", "Good luck & Have fun!");
      console.log("Connection Started:", url);
    };

    const handleConnectionSuccess = () => {
      requestAnimationFrame(() => setIsStreaming(true));
    };

    const handleDisconnect = () => {
      requestAnimationFrame(() => setIsStreaming(false));
    };

    const handleAuthError = (reason) => {
      errorToast("Authentication Error", reason);
    };

    const handleAuthSuccess = () => {
      console.log("Authentication Success");
    };

    // Subscribe to events using the cameraEventEmitter.
    const subscriptions = [
      cameraEventEmitter.addListener("onBackFromCamera", handleBackFromCamera),
      cameraEventEmitter.addListener(
        "onConnectionFailed",
        handleConnectionFailed
      ),
      cameraEventEmitter.addListener(
        "onConnectionStarted",
        handleConnectionStarted
      ),
      cameraEventEmitter.addListener(
        "onConnectionSuccess",
        handleConnectionSuccess
      ),
      cameraEventEmitter.addListener("onDisconnect", handleDisconnect),
      cameraEventEmitter.addListener("onAuthError", handleAuthError),
      cameraEventEmitter.addListener("onAuthSuccess", handleAuthSuccess),
    ];

    // Cleanup all subscriptions on unmount.
    return () => {
      subscriptions.forEach((sub) => sub.remove());
    };
  }, [RTMPModule, cameraEventEmitter, isPortrait]);

  const fetchViewerCountCallback = useCallback(() => {
    fetchViewerCount(liveVideoId, setViewerCount);
  }, [liveVideoId]);

  // useEffect(() => {
  // 	if (liveVideoId) {
  // 		const fetchViewerCountCallback = () => fetchViewerCount(liveVideoId, setViewerCount)
  // 		fetchViewerCountCallback()
  // 		pollingInterval.current = setInterval(fetchViewerCountCallback, 5000)

  // 		return () => {
  // 			clearInterval(pollingInterval.current)
  // 			pollingInterval.current = null // Avoid dangling references
  // 		}
  // 	}
  // }, [liveVideoId])

  const ViewerCounter = useMemo(
    () => (
      <View style={styles.viewerCountContainer}>
        {/* <Ionicons name="eye" size={24} color={activeColors.text} />
        <NumberTicker
          value={viewerCount}
          direction="up"
          delay={0.2}
          decimalPlaces={0}
          style={[styles.viewerCount, { color: activeColors.text }]}
        /> */}
      </View>
    ),
    [viewerCount, activeColors.text]
  );

  useEffect(() => {
    const setupLiveVideo = () => {
      if (destination === "profile") {
        getProfileUrls(
          streamTitle,
          description,
          setId,
          setLiveVideoId,
          setToken,
          setStreamURL
        );
      } else if (destination === "page") {
        getPageUrls(
          destination,
          streamTitle,
          description,
          setId,
          setStreamURL,
          setEndpoint
        );
      } else {
        console.warn("Invalid destination type.");
      }
    };
    const timer = setTimeout(setupLiveVideo, 5000);

    return () => clearTimeout(timer);
  }, [destination, streamTitle, description]);

  useEffect(() => {
    if (selectedSource === "live") {
      setTest(0);
    } else if (selectedSource === "test") {
      setTest(1);
    }
  }, [selectedSource]);

  function isPreviewOn() {
    RTMPModule.isCameraOnPreview()
      .then((isOnPreview) => {
        console.log(isOnPreview);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function setupZoom() {
    RTMPModule.getZoomRange()
      .then((zoomRange) => {
        if (zoomRange && typeof zoomRange === "object") {
          setMaxRange(zoomRange.upper || 8.0);
          setMinRange(zoomRange.lower || 1.0);
          console.log("Zoom Range: ", zoomRange);
        } else {
          console.warn("Zoom range data is invalid");
          setMaxRange(8.0);
          setMinRange(1.0);
        }
      })
      .catch((error) => {
        setMaxRange(8.0);
        setMinRange(1.0);
      });
  }

  const handleZoomChange = useCallback(
    (value) => {
      if (maxRange && value >= minRange && value <= maxRange) {
        setZoomLevel(value);
        RTMPModule.setZoom(value);

        // ← drive the slider’s shared‐value so it animates:
        sliderRef.current?.setValue(value);
      }
    },
    [maxRange, minRange, RTMPModule]
  );

  const checkIfStreaming = async () => {
    try {
      const isStreaming = await RTMPModule.isStreaming();
      return isStreaming;
    } catch (error) {
      return false;
    }
  };

  const removeOverlay = () => {
    RTMPModule.removeOverlay();
  };

  useEffect(() => {
    const setupZoomAndRemoveOverlay = async () => {
      if (ready) {
        try {
          RTMPModule.getSupportedFps()
            .then((fpsRanges) => {
              console.log("Supported FPS ranges:", fpsRanges);
            })
            .catch((error) => {
              console.error(error);
            });
          await setupZoom();
          removeOverlay(); // Only run if component is still mounted
        } catch (error) {
          errorToast("Error setting up the zoom function", error.message);
        }
      }
    };

    const timeout = setTimeout(() => {
      setupZoomAndRemoveOverlay();
    }, 2000);

    return () => {
      clearTimeout(timeout); // Clean up the timeout on unmount
    };
  }, [ready]);

  useEffect(() => {
    if (useScoreboard) {
      const challenge = !matchId && challengeId ? true : false;
      const currentCompId = compId || "0";
      const isLandscape = isPortrait ? false : true;
      console.log("challenge: ", challenge);
      console.log("challengeId: ", challengeId);
      console.log("matchId:", matchId);
      console.log("compId:", currentCompId);
      const timeout = setTimeout(() => {
        if (challenge == true) {
          RTMPModule.setChallengeOverlay(
            challengeId.toString(),
            challenge,
            isLandscape
          );
        } else if (challenge == false) {
          RTMPModule.setMatchOverlay(
            currentCompId,
            matchId,
            challenge,
            isLandscape
          );
        }
      }, 1000);

      return () => {
        clearTimeout(timeout);
      };
    } else if (useScoreboard === false) {
      removeOverlay();
    }
  }, [useScoreboard, isPortrait]);

  const handleUnmute = () => {
    RTMPModule.unmute();
    setIsMuted(false);
  };

  const handleMute = () => {
    RTMPModule.mute();
    setIsMuted(true);
  };

  const handleStartStream = async () => {
    try {
      if (streamURL) {
        await RTMPModule.startStream(streamURL);
        await getPreview();
        setIsStreaming(true);
        setDisconnect(false);
      }
    } catch (error) {
      errorToast("Failed to start stream", error.message);
    }
  };

  const handleStopStream = async () => {
    try {
      const isStreaming = await RTMPModule.isStreaming();
      if (isStreaming) {
        await RTMPModule.stopStream();
        setIsStreaming(false);
        setStreamURL();
        setUseScoreboard(false);
        setId();
      }
    } catch (error) {
      errorToast("Failed to stop streaming", error.message);
    }
  };

  const handleSwitchCamera = () => {
    RTMPModule.switchCamera();
  };

  useEffect(() => {
    if (disconnect) {
      handleStopStream();
    }
  }, [disconnect]);

  const p1up = () => updateMatchScore(matchId, user.id, "up", null);
  const p1down = () => updateMatchScore(matchId, user.id, "down", null);
  const p2up = () => updateMatchScore(matchId, user.id, null, "up");
  const p2down = () => updateMatchScore(matchId, user.id, null, "down");
  const finalize = () => finalizeMatch(matchId, user.id);

  const handleSwitchScoreboard = () => {
    setLandscape((prev) => !prev);
  };

  // const setLandscapeMode = useCallback(async () => {
  //   try {
  //     // Update the record and return the updated record
  //     const { data, error } = await supa
  //       .from('challenges')
  //       .update({ isLandscape: true })
  //       .eq('challengeId', matchId)
  //       .select(); // Return the updated record

  //     if (error) {
  //       throw error;
  //     }
  //     console.log('Landscape mode set to true:', data);

  //     // Optionally, if you want to immediately update local state (optimistic UI update)
  //     // setMatchData(prev => ({ ...prev, isLandscape: true }));
  //   } catch (error) {
  //     console.error('Error setting landscape mode:', error.message);
  //   }
  // }, [matchId]);

  // const unsetLandscapeMode = useCallback(async () => {
  //   try {
  //     const { data, error } = await supa
  //       .from('challenges')
  //       .update({ isLandscape: false })
  //       .eq('challengeId', matchId)
  //       .select();

  //     if (error) {
  //       throw error;
  //     }
  //     console.log('Landscape mode set to false:', data);

  //     // Optionally update local state:
  //     // setMatchData(prev => ({ ...prev, isLandscape: false }));
  //   } catch (error) {
  //     console.error('Error unsetting landscape mode:', error.message);
  //   }
  // }, [matchId]);
  return (
    <View style={styles.container}>
      {/* {errorMessage && (
				<Alert variant="solid" action="error" style={{width: 350}}>
					<HStack>
						<VStack>
							<AlertIcon size="md" as={InfoIcon} />
							<AlertText bold size="md">
								{errorMessage}
							</AlertText>
						</VStack>
					</HStack>
				</Alert>
			)} */}
      <CameraView
        ref={cameraRef}
        style={{ width: "100%", height: "100%", zIndex: -1 }}
      />
      <View style={styles.header_container}>
        <View style={styles.menu_container}>
          {/* <TouchableOpacity
                onPress={() => {}}
                style={{ justifyContent: "center", alignItems: "center" }}
              >
                <Ionicons name="menu" size={40} color="white" />
              </TouchableOpacity> */}
          <DropDown />
        </View>
      </View>
      <View style={styles.footer_container}>
        <View style={styles.mute_container}>
          {/* <View style={[sliderPosition, { height: 300 }]}>
            <TouchableOpacity
              style={{ width: 40, height: 40, marginBottom: 25 }}
              onPress={() => handleZoomChange(zoomLevel + 0.1)}
            >
              <Ionicons
                name="add-circle-outline"
                size={40}
                color="white"
                style={{ opacity: 0.5 }}
              />
            </TouchableOpacity>
            {minRange != null && maxRange != null && (
              <VerticalSlider
                ref={sliderRef}
                min={minRange}
                max={maxRange}
                value={zoomLevel}
                onChange={handleZoomChange}
                step={0.1}
                borderRadius={5}
                showIndicator
                height={180}
                width={40}
                renderIndicator={() => (
                  <View
                    style={{
                      height: 30,
                      width: 30,
                      marginLeft: 45,
                      borderRadius: 100,
                      backgroundColor: activeColors.modalSurface,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: activeColors.accent }}>
                      {(
                        ((zoomLevel - minRange) / (maxRange - minRange)) *
                        100
                      ).toFixed(0)}
                      %
                    </Text>
                  </View>
                )}
                containerStyle={{
                  backgroundColor: activeColors.modalSurface,
                  borderRadius: 25,
                }}
                sliderStyle={{
                  backgroundColor: activeColors.modalSurface,
                  borderRadius: 25,
                }}
              />
            )}
            <TouchableOpacity
              style={{ width: 40, height: 40, marginTop: 25 }}
              onPress={() => handleZoomChange(zoomLevel - 0.1)}
              disabled={zoomLevel - 0.1 < minRange}
            >
              <Ionicons
                name="remove-circle-outline"
                size={40}
                color="white"
                style={{ opacity: 0.5 }}
              />
            </TouchableOpacity>
          </View> */}
        </View>
        <View style={styles.stream_container}>
          <TouchableOpacity
            style={styles.goLive}
            onPress={isStreaming ? handleStopStream : handleStartStream}
          >
            <GoLive color={isStreaming ? "red" : "white"} />
          </TouchableOpacity>
        </View>
        <View style={styles.controller_container}>
          {isMuted ? (
            <TouchableOpacity
              style={styles.mute}
              onPress={() => RTMPModule.unmute() && setIsMuted(false)}
            >
              <Ionicons name="volume-mute-outline" size={42} color="red" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.mute}
              onPress={() => RTMPModule.mute() && setIsMuted(true)}
            >
              <Ionicons name="volume-high-outline" size={42} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {isStreaming && ViewerCounter}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  icons: {
    flexDirection: "row", // If you need a separate row style for your icons container
    justifyContent: "space-evenly",
    flex: 1,
  },
  viewerCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 8,
    borderRadius: 20,
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1000,
  },
  viewerCount: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
  header_container: {
    position: "absolute",
    top: 25,
    right: 25,
    flexDirection: "row",
  },
  menu_container: {
    flex: 1,
    alignItems: "flex-end",
    zIndex: 100,
  },
  menu: {
    color: "black",
  },
  publisher_camera: {
    // flex: 1,
    width: "100%",
    height: "80%",
  },
  footer_container: {
    position: "absolute", // Remove from normal flow
    bottom: 0, // Stick to the bottom of the screen
    left: 20,
    right: 15,
    flexDirection: "row", // Arrange children in a row
    justifyContent: "space-between", // Space items evenly
    // alignItems: 'center', // Vertically center icons
    paddingVertical: 10,
  },
  mute_container: {
    flex: 1,
    alignItems: "flex-start",
    marginLeft: 5,
  },
  stream_container: {
    flex: 1,
    alignItems: "center",
  },
  controller_container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    marginRight: 10,
  },
  button: {
    marginTop: -5,
  },
  portrait: {
    position: "absolute",
    left: 15,
    bottom: 125,
  },
  landscape: {
    position: "absolute",
    left: 15,
    bottom: 0,
  },
});

export default StreamScreen;
