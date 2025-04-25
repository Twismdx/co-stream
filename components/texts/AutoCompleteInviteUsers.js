import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Keyboard,
} from "react-native";
import { useGlobalContext } from "../timer/context";
import debounce from "lodash.debounce";
import { useNavigation } from "@react-navigation/native";
import { Portal } from "@gorhom/portal";
// Updated: Import fetchUsers from supabase.js instead of API.js
import { fetchUsers } from "../utils/supabase";
// Import Avatar components (adjust the path as necessary)
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";

const AutoCompleteInviteUsers = () => {
  const { theme, setSelectedUser, selectedUser, user } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputLayout, setInputLayout] = useState(null); // For dropdown positioning
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const textInputRef = useRef(null);
  const navigation = useNavigation();
  // Helper function to get initials from a name.
  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  // Fetch users using Supabase helper.
  const fetchUsersFromSupabase = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchUsers();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter suggestions based on the query, ignoring the already selected user.
  const filteredSuggestions = suggestions
    .filter((u) => typeof u.name === "string")
    .filter((u) => u.name.toLowerCase().includes(query.toLowerCase()))
    .filter((u) => u.name.toLowerCase() !== user?.name?.toLowerCase());

  // Debounce fetching to avoid too many API calls while typing.
  const debouncedFetch = useCallback(
    debounce(() => {
      fetchUsersFromSupabase();
    }, 300),
    [fetchUsersFromSupabase]
  );

  useEffect(() => {
    if (query.length <= 2) {
      setSuggestions([]);
      setIsDropdownVisible(true);
      return;
    }

    if (selectedUser && query === selectedUser.name) {
      setSuggestions([]);
      setIsDropdownVisible(false);
      return;
    }
    debouncedFetch();
  }, [query, debouncedFetch, selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      setQuery("");
      setSuggestions([]);
      textInputRef.current.blur();
      setIsDropdownVisible(false);
    }
  }, [selectedUser]);

  // Hide dropdown when the user navigates away.
  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setIsDropdownVisible(false);
      setSuggestions([]);
    });

    return unsubscribe;
  }, [navigation]);

  // Hide dropdown when the keyboard is dismissed.
  useEffect(() => {
    const keyboardHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setIsDropdownVisible(false);
    });

    return () => {
      keyboardHideListener.remove();
    };
  }, []);

  // When a user is selected from the suggestions, update the global context and navigate.
  const handleSelectUser = (user) => {
    setQuery("");
    setSuggestions([]);
    setSelectedUser(user);
    setIsDropdownVisible(false);
    // navigation.navigate('SearchModal');
  };

  // Render the suggestions dropdown using a Portal.
  const renderDropdown = () => {
    if (!isDropdownVisible || suggestions.length === 0 || !inputLayout)
      return null;

    return (
      <Portal>
        <View
          style={[
            styles.suggestionList,
            {
              top: inputLayout.y + inputLayout.height + 25, // Position dropdown below input
              left: inputLayout.x,
              width: inputLayout.width,
              backgroundColor: activeColors.foreground,
            },
          ]}
        >
          <FlatList
            data={filteredSuggestions}
            keyExtractor={(item) => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelectUser(item)}
              >
                <Avatar style={styles.avatar} alt={getInitials(item.name)}>
                  <AvatarImage
                    source={
                      item.avatar
                        ? { uri: item.avatar }
                        : require("~/assets/placeholder.png")
                    }
                    onError={(e) =>
                      console.error(
                        "Avatar image failed to load:",
                        e.nativeEvent.error
                      )
                    }
                  />
                  <AvatarFallback>
                    <Text>{getInitials(item.name)}</Text>
                  </AvatarFallback>
                </Avatar>
                <Text style={styles.suggestionText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Portal>
    );
  };

  // When the input is focused, show the dropdown if query length is sufficient.
  const handleInputFocus = () => {
    if (query.length > 2) {
      setIsDropdownVisible(true);
    }
  };

  // Capture the layout of the input field for dropdown positioning.
  const handleInputLayout = () => {
    if (textInputRef.current) {
      textInputRef.current.measureInWindow((x, y, width, height) => {
        setInputLayout({ x, y, width, height });
      });
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={textInputRef}
        style={[styles.input, { backgroundColor: activeColors.foreground }]}
        value={query}
        onChangeText={setQuery}
        placeholder="Search for users..."
        placeholderTextColor={activeColors.placeholder}
        onFocus={handleInputFocus} // Show dropdown when input is focused
        onBlur={() => setIsDropdownVisible(false)} // Hide dropdown on blur
        onLayout={handleInputLayout} // Calculate layout for positioning
      />
      {/* {isLoading && <Text style={styles.loadingText}>Loading...</Text>} */}
      {renderDropdown()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    zIndex: 1,
  },
  input: {
    borderRadius: 15,
    padding: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    zIndex: 2,
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    marginVertical: 10,
  },
  suggestionList: {
    position: "absolute",
    backgroundColor: "#fff",
    maxHeight: 200,
    elevation: 5, // For Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    zIndex: 10, // Ensure it appears above other elements
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    borderRadius: 15,
  },
  suggestionText: {
    fontSize: 15,
    marginLeft: 10,
  },
  avatar: {
    width: 40,
    height: 40,
  },
});

export default AutoCompleteUsers;
