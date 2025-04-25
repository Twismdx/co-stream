import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";

export const AnimatedList = React.memo(({ children, delay = 1000, style }) => {
  const [index, setIndex] = useState(0);
  const childrenArray = React.Children.toArray(children);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % childrenArray.length);
    }, delay);

    return () => clearInterval(interval);
  }, [childrenArray.length, delay]);

  const itemsToShow = useMemo(
    () => childrenArray.slice(0, index + 1).reverse(),
    [index, childrenArray]
  );

  return (
    <View style={[styles.container, style]}>
      {itemsToShow.map((item) => (
        <AnimatedListItem key={item.key}>{item}</AnimatedListItem>
      ))}
    </View>
  );
});

AnimatedList.displayName = "AnimatedList";

function AnimatedListItem({ children }) {
  return (
    <Animated.View
      entering={FadeIn.springify().damping(40).stiffness(350)}
      exiting={FadeOut}
      layout={Layout.springify().damping(40).stiffness(350)}
      style={styles.listItem}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  listItem: {
    width: "100%",
    alignSelf: "center",
  },
});


/* import React from 'react';
import { Text } from 'react-native';
import { AnimatedList } from './AnimatedList';

export default function App() {
  return (
    <AnimatedList delay={1000} style={{ padding: 20 }}>
      <Text style={{ fontSize: 18 }}>Item 1</Text>
      <Text style={{ fontSize: 18 }}>Item 2</Text>
      <Text style={{ fontSize: 18 }}>Item 3</Text>
      <Text style={{ fontSize: 18 }}>Item 4</Text>
    </AnimatedList>
  );
}
*/