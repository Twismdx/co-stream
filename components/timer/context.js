import React, { useState, useContext, useEffect, useRef } from "react";

const AppContext = React.createContext();

const AppProvider = ({ children }) => {
  const [selectedController, setSelectedController] = useState("shortTimer");
  const [shortTimer, setShortTimer] = useState(40);
  const [minuteTimer, setMinuteTimer] = useState(60);
  const [extension, setExtension] = useState(30);
  const [selectedFont, setSelectedFont] = useState("semiBold");
  const [actionText, setActionText] = useState("START");
  const [clockStatus, setClockStatus] = useState("Stopped");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [colorChoosed, setColorChoosed] = useState("#F87070");
  const [time, setTime] = useState(60);
  const [progressBarPercentage, setProgressBarPercentage] = useState(time);
  const [extUsed, setExtUsed] = useState(false);
  const [newFrame, setNewFrame] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [maxValue, setMaxValue] = useState(time);
  const [selectedControllerHead, setSelectedControllerHead] = useState(null);
  const [activePlayer, setActivePlayer] = useState(1);
  const [p1Score, setp1Score] = useState(0);
  const [p2Score, setp2Score] = useState(0);
  const [p1Name, setp1Name] = useState("");
  const [p2Name, setp2Name] = useState("");
  const [breaks1, setBreaks1] = useState(0);
  const [breaks2, setBreaks2] = useState(0);
  const [fouls1, setFouls1] = useState(0);
  const [fouls2, setFouls2] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [newClassName, setNewClassName] = useState("new-button");
  const [p1Handicap, setP1Handicap] = useState("");
  const [p2Handicap, setP2Handicap] = useState("");
  const [appSelectedController, setAppSelectedController] = useState();
  const [key, setKey] = useState(0);
  const [landscape, setLandscape] = useState(false);
  const [stats, setStats] = useState([]);
  const [url, setUrl] = useState();
  const [selected, setSelected] = useState();
  const [compID, setCompID] = useState(null);
  const [matchID, setMatchID] = useState(null);
  const [matchPin, setMatchPin] = useState(null);
  const [initialSetup, setInitialSetup] = useState(true);
  const [selectValue1, setSelectValue1] = useState(null);
  const [streamChoice, setStreamChoice] = useState(null);
  const [jwtToken, setJwtToken] = useState(null);
  const [extOn, setExtOn] = useState("yes");
  const [liveStats, setLiveStats] = useState([null]);
  const [selectedMatch, setSelectedMatch] = useState();
  const [isStreaming, setIsStreaming] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [destination, setDestination] = useState();
  const [disconnect, setDisconnect] = useState(false);
  const [globalFont, setGlobalFont] = useState();
  const [selectedSource, setSelectedSource] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState();
  const [postType, setPostType] = useState();
  const [showModal1, setShowModal1] = useState(false);
  const [token, setToken] = useState();
  const [endpoint, setEndpoint] = useState(null);
  const [streamURL, setStreamURL] = useState(null);
  const [id, setId] = useState();
  const [userToken, setUserToken] = useState();
  const [editable, setEditable] = useState(false);
  const [selectDisabled, setSelectedDisabled] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [JWTToken, setJWTToken] = useState();
  const [selectedUser, setSelectedUser] = useState(null);
  const [googleUserInfo, setGoogleUserInfo] = useState([]);
  const [defaultStream, setDefaultStream] = useState([
    { name: "Facebook", value: true },
    // { name: 'Youtube', value: false },
    // { name: 'Twitch', value: false },
    // { name: 'Discord', value: false },
    // { name: 'Kick', value: false }
  ]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [local, setLocal] = useState(false);
  const [orientation, setOrientation] = useState("portrait");
  const [isLiveMatches, setIsLiveMatches] = useState(false);
  const [isChallengeModalVisible, setIsChallengeModalVisible] = useState(false);
  const [isEmailSignIn, setIsEmailSignIn] = useState(false);
  const [useScoreboard, setUseScoreboard] = useState(false);
  const [p1Avatar, setP1Avatar] = useState(false);
  const [p2Avatar, setP2Avatar] = useState(false);
  const [p1AvatarUrl, setP1AvatarUrl] = useState("");
  const [p2AvatarUrl, setP2AvatarUrl] = useState("");
  const [copy, setCopy] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState();
  const [freshSignIn, setFreshSignIn] = useState(false);
  const [challengeParams, setChallengeParams] = useState({});
  const [route, setRoute] = useState({});
  const [matchData, setMatchData] = useState({});
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [openA, setOpenA] = useState(false);
  const [openB, setOpenB] = useState(false);
  const [openC, setOpenC] = useState(false);
  const [openD, setOpenD] = useState(false);
  const [openE, setOpenE] = useState(false);
  const [openF, setOpenF] = useState(false);
  const [isTourEnabled, setIsTourEnabled] = useState(true);

  const updateFacebookProfile = async (profile) => {
    try {
      await AsyncStorage.setItem("facebookProfile", JSON.stringify(profile));
      setUser((prevUser) => ({
        ...prevUser,
        facebook: profile,
      }));
    } catch (error) {
      console.error("Error saving Facebook profile to AsyncStorage:", error);
    }
  };

  const updateGoogleProfile = async (profile) => {
    try {
      await AsyncStorage.setItem("googleProfile", JSON.stringify(profile));
      setUser((prevUser) => ({
        ...prevUser,
        google: profile,
      }));
    } catch (error) {
      console.error("Error saving Google profile to AsyncStorage:", error);
    }
  };

  const retrieveProfiles = async () => {
    try {
      const facebookProfile = await AsyncStorage.getItem("facebookProfile");
      const googleProfile = await AsyncStorage.getItem("googleProfile");
      const friends = await AsyncStorage.getItem("friends");
      const stats = await AsyncStorage.getItem("stats");
      const matchHistory = await AsyncStorage.getItem("matchHistory");

      setUser({
        facebook: facebookProfile ? JSON.parse(facebookProfile) : null,
        google: googleProfile ? JSON.parse(googleProfile) : null,
        friends: friends ? JSON.parse(friends) : [],
        stats: stats ? JSON.parse(stats) : [],
        matchHistory: matchHistory ? JSON.parse(matchHistory) : [],
      });
    } catch (error) {
      console.error("Error retrieving profiles from AsyncStorage:", error);
    }
  };

  const removeFacebookProfile = async () => {
    try {
      await AsyncStorage.removeItem("facebookProfile");
      setUser((prevUser) => ({
        ...prevUser,
        facebook: null,
      }));
    } catch (error) {
      console.error(
        "Error removing Facebook profile from AsyncStorage:",
        error
      );
    }
  };

  const removeGoogleProfile = async () => {
    try {
      await AsyncStorage.removeItem("googleProfile");
      setUser((prevUser) => ({
        ...prevUser,
        google: null,
      }));
    } catch (error) {
      console.error("Error removing Google profile from AsyncStorage:", error);
    }
  };

  const clearAllProfiles = async () => {
    try {
      await AsyncStorage.multiRemove(["facebookProfile", "googleProfile"]);
      setUser((prevUser) => ({
        ...prevUser,
        facebook: null,
        google: null,
      }));
    } catch (error) {
      console.error("Error clearing profiles from AsyncStorage:", error);
    }
  };

  const [actionSheet, setActionSheet] = useState({
    show: false,
    matchTime: null,
    matchId: null,
    orgCode: null,
    compId: null,
  });

  const sources = [
    {
      id: "live",
      sourcename: "Poolstat Live (default)",
    },
    {
      id: "test",
      sourcename: "Poolstat Play-site (Testing site)",
    },
  ];

  const [selectedItem, setSelectedItem] = useState(sources[0].id);

  const liveUrls = {
    orgsURL: "https://www.poolstat.net.au/cslapi/v1/organisation",
    compsURL: "https://www.poolstat.net.au/cslapi/v1/compstoday",
  };

  const testUrls = {
    orgsURL: "https://play.poolstat.net.au/cslapi/v1/organisation",
    compsURL: "https://play.poolstat.net.au/cslapi/v1/compstoday",
  };

  const [theme, setTheme] = useState({
    mode: "dark",
    colors: {
      dark: {
        primary: "#121212",
        modalSurface: "hsl(240, 10%, 3.9%)",
        modalButton: "hsl(0, 0%, 98%)",
        modalTitle: "hsl(0, 0%, 98%)",
        modalText: "hsl(0, 0%, 98%)",
        modalBorder: "hsl(240, 1.40%, 72.20%)",
        modalBorder2: "hsl(0, 0.00%, 2.00%)",
        foreground: "#EDEDED",
        surface: "#1E1E1E",
        border: "#2B2B2B",
        secondary: "#1C1C1C",
        bottomsheet: "#363636",
        onAccent: "#000000",
        onPrimary: "#ffffff",
        tertiary: "#f9fafb",
        accent: "#BB86FC", //#904CF2
        accentVariant: "#362257",
        accent2: "#03DAC6",
        text: "#ffffff",
        tint: "#f9fafb",
        img: "#f9fafb",
        error: "hsl(0, 72%, 51%)",
        success: "#6ee17c",
        onError: "#000000",
        category: "#3DB9F7",
        chatgreen: "#6ee17c",
        chatblue: "#3b40de",
        chatred: "#e1877d",
        chatyellow: "#f5f68c",
        chatpurple: "#dd261f",
        chatorange: "#dd261f",
        chatbackground: "#000000",
      },
      light: {
        primary: "#FFFFFF",
        secondary: "#03DAC6",
        onAccent: "#ffffff",
        onPrimary: "#000000",
        tertiary: "#4B4B4B",
        accent: "#6200EE",
        accent2: "#3700B3",
        text: "#000000",
        tint: "#111827",
        img: "#fff",
        error: "#B00020",
        category: "#3DB9F7",
      },
    },
  });
  const toggleTheme = () => {
    setTheme((prevTheme) => ({
      ...prevTheme,
      mode: prevTheme.mode === "dark" ? "light" : "dark",
    }));
  };

  // configureAbly({
  // 	key: '9zzpLg.YrD7jw:RCOMB9Lq4mkx0-5Zn99PFY4iKEA1WtvpBWG-5fRkv0M',
  // 	clientId: 'TimerApp',
  // })

  // const [channel] = useChannel('PlayerNames', (message) => {
  // 	console.log(message.data.p1Name)
  // 	console.log(message.data.p2Name)
  // 	setp1Name(message.data.p1Name)
  // 	setp2Name(message.data.p2Name)
  // })

  // useEffect(() => {
  // 	channel.publish('PlayerData', [
  // 		{
  // 			p1Score: p1Score,
  // 			p2Score: p2Score,
  // 			time: time,
  // 			clockStatus: clockStatus,
  // 			frameCount: frameCount,
  // 		},
  // 	])
  // 	// eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [p1Score, p2Score, time, clockStatus, frameCount])

  const timeOfSelectedControler = () => {
    if (selectedController === "shortTimer") {
      setTime(shortTimer);
      setProgressBarPercentage(shortTimer);
    } else if (selectedController === "minuteTimer") {
      setTime(minuteTimer);
      setProgressBarPercentage(minuteTimer);
    }
  };

  return (
    <AppContext.Provider
      value={{
        appSelectedController,
        setAppSelectedController,
        p1Handicap,
        p2Handicap,
        setP1Handicap,
        setP2Handicap,
        newClassName,
        setNewClassName,
        frameCount,
        setFrameCount,
        isDisabled,
        setIsDisabled,
        p1Name,
        setp1Name,
        p2Name,
        setp2Name,
        breaks1,
        setBreaks1,
        breaks2,
        setBreaks2,
        fouls1,
        setFouls1,
        fouls2,
        setFouls2,
        p1Score,
        setp1Score,
        p2Score,
        setp2Score,
        activePlayer,
        setActivePlayer,
        selectedControllerHead,
        setSelectedControllerHead,
        isPlaying,
        maxValue,
        setIsPlaying,
        setMaxValue,
        newFrame,
        setNewFrame,
        extUsed,
        setExtUsed,
        selectedController,
        setSelectedController,
        selectedFont,
        actionText,
        isModalOpen,
        setIsModalOpen,
        colorChoosed,
        shortTimer,
        minuteTimer,
        extension,
        setShortTimer,
        setMinuteTimer,
        setExtension,
        setSelectedFont,
        setColorChoosed,
        clockStatus,
        setClockStatus,
        setActionText,
        time,
        setTime,
        timeOfSelectedControler,
        progressBarPercentage,
        setProgressBarPercentage,
        key,
        setKey,
        landscape,
        setLandscape,
        stats,
        setStats,
        url,
        setUrl,
        selected,
        setSelected,
        compID,
        setCompID,
        matchPin,
        setMatchPin,
        initialSetup,
        setInitialSetup,
        matchID,
        setMatchID,
        selectValue1,
        setSelectValue1,
        streamChoice,
        setStreamChoice,
        jwtToken,
        setJwtToken,
        extOn,
        setExtOn,
        liveStats,
        setLiveStats,
        selectedMatch,
        setSelectedMatch,
        isStreaming,
        setIsStreaming,
        showWarning,
        setShowWarning,
        destination,
        setDestination,
        theme,
        setTheme,
        toggleTheme,
        disconnect,
        setDisconnect,
        globalFont,
        setGlobalFont,
        showModal,
        setShowModal,
        streamTitle,
        setStreamTitle,
        desc,
        setDesc,
        selectedOrg,
        setSelectedOrg,
        actionSheet,
        setActionSheet,
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        selectedSource,
        setSelectedSource,
        sources,
        liveUrls,
        testUrls,
        postType,
        setPostType,
        showModal1,
        setShowModal1,
        token,
        setToken,
        endpoint,
        setEndpoint,
        streamURL,
        setStreamURL,
        id,
        setId,
        userToken,
        setUserToken,
        selectDisabled,
        setSelectedDisabled,
        editable,
        setEditable,
        lastEvent,
        setLastEvent,
        selectedItem,
        setSelectedItem,
        comments,
        setComments,
        JWTToken,
        setJWTToken,
        selectedUser,
        setSelectedUser,
        googleUserInfo,
        setGoogleUserInfo,
        defaultStream,
        setDefaultStream,
        updateFacebookProfile,
        updateGoogleProfile,
        retrieveProfiles,
        removeFacebookProfile,
        removeGoogleProfile,
        clearAllProfiles,
        drawerOpen,
        setDrawerOpen,
        local,
        setLocal,
        orientation,
        setOrientation,
        isLiveMatches,
        setIsLiveMatches,
        isChallengeModalVisible,
        setIsChallengeModalVisible,
        isEmailSignIn,
        setIsEmailSignIn,
        useScoreboard,
        setUseScoreboard,
        p1Avatar,
        setP1Avatar,
        p2Avatar,
        setP2Avatar,
        p1AvatarUrl,
        setP1AvatarUrl,
        p2AvatarUrl,
        setP2AvatarUrl,
        copy,
        setCopy,
        isLoading,
        setIsLoading,
        session,
        setSession,
        freshSignIn,
        setFreshSignIn,
        challengeParams,
        setChallengeParams,
        route,
        setRoute,
        matchData,
        setMatchData,
        openSearchModal,
        setOpenSearchModal,
        openA,
        setOpenA,
        openB,
        setOpenB,
        openC,
        setOpenC,
        openD,
        setOpenD,
        openE,
        setOpenE,
        openF,
        setOpenF,
        isTourEnabled,
        setIsTourEnabled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

const useGlobalContext = () => {
  return useContext(AppContext);
};

export { AppProvider, useGlobalContext };
