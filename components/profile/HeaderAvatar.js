import React from "react";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import AutoCompleteUsers from "../texts/AutoCompleteUsers";
import { useGlobalContext } from "../timer/context";
import { useNavigation } from "@react-navigation/native";

const HeaderAvatar = () => {
  const { theme, user } = useGlobalContext();
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {/* Avatar */}
      <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
        <Image
          source={{ uri: user?.avatar || "https://via.placeholder.com/50" }}
          style={styles.avatar}
        />
      </TouchableOpacity>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <AutoCompleteUsers />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 0,
    flex: 1,
    // width: 325
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 30,
  },
  searchBar: {
    flex: 1,
    marginLeft: 25,
  },
});

export default HeaderAvatar;
