import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useGlobalContext } from './context';

function CountdownTimer({ timer, customColor, customSize }) {
  const { theme } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];
  const [seconds, setSeconds] = useState(timer);

  useEffect(() => {
    setSeconds(timer);
  }, [timer]);

  useEffect(() => {
    if (seconds <= 0) return;

    const interval = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View>
      <Text
        style={{
          color: customColor || activeColors.onPrimary,
          fontSize: customSize || 14,
        }}
      >
        {seconds <= 0 ? 'Due to start now!' : formatTime(seconds)}
      </Text>
    </View>
  );
}

export default CountdownTimer;
