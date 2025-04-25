import React, { useEffect, useContext, useState } from 'react';
import { useGlobalContext } from './context';
import {
  View,
  Button,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  useWindowDimensions 
} from 'react-native';
import {} from 'react-native-safe-area-context';

const Controllers = () => {
  const {
    newClassName,
    setNewClassName,
    frameCount,
    setFrameCount,
    isDisabled,
    setIsDisabled,
    setIsPlaying,
    selectedFont,
    newFrame,
    setNewFrame,
    selectedController,
    extUsed,
    setExtUsed,
    setSelectedController,
    colorChoosed,
    setTime,
    shortTimer,
    minuteTimer,
    extension,
    setClockStatus,
    setActionText,
    setProgressBarPercentage,
    time,
    fontFamily,
    key,
    setKey,
    extOn,
    setExtOn,
    theme,
  } = useGlobalContext();
  let activeColors = theme.colors[theme.mode];
  const { width, height } = useWindowDimensions(); // Use `useWindowDimensions` for dynamic updates
  const newFrameWidth = width - 15;
  const newFrameHeight = height - 15;
  const [isPortrait, setIsPortrait] = useState(true);
  const buttonWidth = isPortrait ? width * 0.294 : width * 0.2; // Dynamic width
  const containerHeight = isPortrait ? height * 0.1 : height * 0.20; // Dynamic height

  const checkOrientation = () => {
    const { width, height } = Dimensions.get('window');
    setIsPortrait(height > width);
  };

  // Listen to orientation changes
  useEffect(() => {
    checkOrientation(); // Set the initial orientation
    const subscription = Dimensions.addEventListener('change', checkOrientation); // Add listener

    return () => {
      subscription?.remove(); // Clean up the listener
    };
  }, []);

  const styles = {
    mainContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: -200,
    },
    landscapeContainer: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginTop: -150,
    },
    controllersDiv: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#1b1d3a',
      borderRadius: 35,
      width: '100%',
	  height: containerHeight, // Match container height dynamically
    },
    controllersDivNew: {
      backgroundColor: '#1b1d3a',
      flex: 1,
      maxHeight: 80,
      borderRadius: 75,
      marginBottom: 5,
      // padding: 5,
      zIndex: 10,
      justifyContent: 'center',
      // marginBottom: 15,
      alignItems: 'center',
      width: newFrameWidth,
    },
    button: {
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 35,
      padding: 15,
      margin: 5,
      width: buttonWidth, // Dynamic width
	  height: containerHeight * 0.8, // Adjust button height to fit within container
      backgroundColor: activeColors.secondary,
    },
    selectedButton: {
      backgroundColor: activeColors.accent,
    },
    disabledButton: {
      backgroundColor: activeColors.primary, // Indicate disabled state
      opacity: 0.5, // Reduce opacity for visual feedback
    },
    buttonText: {
      fontFamily: 'System',
      fontSize: 17,
      fontWeight: 'bold',
      color: activeColors.onPrimary,
      textAlign: 'center',
    },
    selectedButtonText: {
      color: activeColors.onAccent,
    },
  };

  const changeControllerAndTime = (controllerName) => {
    setSelectedController(controllerName);
    if (controllerName === 'shortTimer') {
      setKey((prevKey) => prevKey + 1);
      setTime(shortTimer);
      setProgressBarPercentage(shortTimer);
      setIsPlaying(false);
    } else if (controllerName === 'minuteTimer') {
      setKey((prevKey) => prevKey + 1);
      setTime(minuteTimer);
      setIsPlaying(false);
      setProgressBarPercentage(minuteTimer);
    }
    setClockStatus('Stopped');
    setActionText('START');
  };

  const NewFrameController = () => {
    setNewFrame(true);
    setExtUsed(false);
    setIsDisabled(false);
    setKey((prevKey) => prevKey + 1);
    changeControllerAndTime(selectedController);
  };

  const addExtension = () => {
    setTime(time + extension);
    setProgressBarPercentage(setProgressBarPercentage + extension);
    setExtUsed(true);
  };

  const handleExtension = () => {
    setExtUsed(true);
    setTime((prevTime) => prevTime + extension);
    setProgressBarPercentage((prevProgress) => prevProgress + extension);
  };

  return (
    <View style={isPortrait ? styles.mainContainer : styles.landscapeContainer}>
      <View style={[styles.controllersDivNew]}>
        <TouchableOpacity
          style={[
            {
              // flex: 1,
              // flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: 50,
              width: newFrameWidth - 15,
              // marginLeft: 5,
              // marginRight: 5,
              padding: 15,
              borderRadius: 35,
              fontFamily: selectedFont,
              backgroundColor: activeColors.accent,
              opacity: 1,
            },
          ]}
          onPress={NewFrameController}
        >
          <Text
            style={{
              fontFamily: selectedFont,
              fontSize: 25,
              fontWeight: 'bold',
              color: activeColors.onAccent,
            }}
          >
            Start New Frame
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.controllersDiv,
          {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#1b1d3a',
            borderRadius: 35,
            width: newFrameWidth,
            maxHeight: 80,
            // top: -250,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            selectedController === 'shortTimer' && styles.selectedButton,
          ]}
          onPress={() => changeControllerAndTime('shortTimer')}
        >
          <Text
            style={[
              styles.buttonText,
              selectedController === 'shortTimer' && styles.selectedButtonText,
            ]}
          >
            {shortTimer} Secs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            selectedController === 'minuteTimer' && styles.selectedButton,
          ]}
          onPress={() => changeControllerAndTime('minuteTimer')}
        >
          <Text
            style={[
              styles.buttonText,
              selectedController === 'minuteTimer' && styles.selectedButtonText,
            ]}
          >
            {minuteTimer} Secs
          </Text>
        </TouchableOpacity>
        {extOn == 'yes' ? (
          <View>
            {extOn === 'yes' && (
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: extUsed
                      ? activeColors.primary
                      : activeColors.accent2,
                  },
                ]}
                disabled={extUsed || isDisabled}
                onPress={handleExtension}
              >
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color: extUsed
                        ? activeColors.error
                        : activeColors.onAccent,
                    },
                  ]}
                >
                  {extUsed ? 'Ext Used!' : 'Extension!'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default Controllers;
