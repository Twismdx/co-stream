import RNCSlider from '@react-native-community/slider';
import React from 'react';
import { useGlobalContext } from '../timer/context';

function Slider(props) {
  const { theme } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];

  const {
    minimumValue = 0,
    maximumValue = 1,
    minimumTrackTintColor = activeColors.bottomsheet,
    maximumTrackTintColor = activeColors.accentVariant,
    thumbTintColor = activeColors.accent,
    ...rest
  } = props;

  return (
    <RNCSlider
      role="slider"
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      minimumTrackTintColor={minimumTrackTintColor}
      maximumTrackTintColor={maximumTrackTintColor}
      thumbTintColor={thumbTintColor}
      {...rest}
    />
  );
}

export { Slider };
