import { useCallback } from "react";
import { Gesture, Directions } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { v4 as uuidv4 } from "uuid"; // Add this for generating unique IDs

export const useCircularNavigation = (leftScreen, rightScreen) => {
  const navigation = useNavigation();
  // Function to handle navigation based on direction
  const handleNavigate = useCallback(
    (direction) => {
      if (direction === "left") {
        navigation.navigate({
          name: leftScreen,
          key: `${leftScreen}-${uuidv4()}`, // Unique key for each navigation
          params: { direction: "left" },
        });
      } else if (direction === "right") {
        navigation.navigate({
          name: rightScreen,
          key: `${rightScreen}-${uuidv4()}`, // Unique key for each navigation
          params: { direction: "right" },
        });
      }
    },
    [navigation, leftScreen, rightScreen]
  );

  // Define gesture for swiping left
  const swipeLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      runOnJS(handleNavigate)("left");
    });

  // Define gesture for swiping right
  const swipeRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      runOnJS(handleNavigate)("right");
    });

  // Create a combined gesture that allows swiping in both directions
  const gesture = Gesture.Race(swipeLeft, swipeRight);

  return { gesture };
};
