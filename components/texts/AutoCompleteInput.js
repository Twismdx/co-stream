import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
} from "react-native";
import { useGlobalContext } from "../timer/context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import debounce from "lodash.debounce";
import { Portal } from "@gorhom/portal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const AutoCompleteInput = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputLayout, setInputLayout] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const textInputRef = useRef(null);
  const insets = useSafeAreaInsets();

  const {
    theme,
    setSelectedOrg,
    selectedSource,
    selectedOrg,
    setInitialSetup,
    liveUrls,
    testUrls,
  } = useGlobalContext();

  const activeColors = theme.colors[theme.mode];

  useLayoutEffect(() => {
    textInputRef.current?.measureInWindow((x, y, width, height) => {
      setInputLayout({ x, y, width, height });
    });
  }, [setInputLayout, query]);

  const fetchOrganizations = useCallback(
    async (searchQuery) => {
      setIsLoading(true);
      try {
        const url =
          selectedSource === "live" ? liveUrls.orgsURL : testUrls.orgsURL;
        const response = await fetch(url, {
          method: "POST",
          body: JSON.stringify({ query: searchQuery }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setSuggestions(Object.values(data));
      } catch (error) {
        console.error("Error fetching organizations:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedSource, liveUrls.orgsURL, testUrls.orgsURL]
  );

  const debouncedFetch = useCallback(
    debounce((searchQuery) => fetchOrganizations(searchQuery), 300),
    [fetchOrganizations]
  );

  useEffect(() => {
    if (query.length <= 2) {
      setSuggestions([]);
      setIsDropdownVisible(true);
      return;
    }

    // If an org is selected and the query exactly matches its name, skip fetching
    if (selectedOrg && query === selectedOrg.orgname) {
      setSuggestions([]);
      setIsDropdownVisible(false);
      return;
    }

    debouncedFetch();
  }, [query, debouncedFetch, selectedOrg]);

  const filteredSuggestions = suggestions.filter((org) =>
    org.orgname.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectOrg = async (org) => {
    setQuery("");
    setSelectedOrg(org.id);
    setSuggestions([]);
    setInitialSetup(false); // Clear suggestions after selection
    setIsDropdownVisible(false);
    try {
      await AsyncStorage.setItem("@selectedOrg", org.id);
    } catch (error) {
      console.error("Error saving selected org:", error);
    }
  };

  const handleInputFocus = () => {
    if (query.length > 2) {
      setIsDropdownVisible(true);
    }
  };

  const handleInputLayout = () => {
    if (textInputRef.current) {
      textInputRef.current.measureInWindow((x, y, width, height) => {
        setInputLayout({ x, y, width, height });
      });
    }
  };

  useEffect(() => {
    if (selectedOrg) {
      setQuery("");
      setSuggestions([]);
      textInputRef.current.blur();
      setIsDropdownVisible(false);
    }
  }, [selectedOrg]);

  const renderDropdown = () => {
    if (!isDropdownVisible || suggestions.length === 0 || !inputLayout)
      return null;

    return (
      <Portal>
        <View
          ref={dropdownRef}
          style={[
            styles.suggestionList,
            {
              top: inputLayout.y + inputLayout.height + insets.top,
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
                key={item.id}
                style={styles.suggestionItem}
                onPress={() => handleSelectOrg(item)}
              >
                {/* Left side: takes up remaining space, can wrap */}
                <Text style={styles.suggestionName}>{item.orgname}</Text>

                {/* Right side: fixed width so the separator lines up vertically */}
                <View style={styles.rightContainer}>
                  <Text style={styles.separator}>|</Text>
                  <Text style={styles.suggestionId}>ID: {item.id}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </Portal>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={textInputRef}
        style={[styles.input, { backgroundColor: activeColors.foreground }]}
        value={query}
        onChangeText={setQuery}
        placeholder="Example: 9 Ball SA Inc"
        placeholderTextColor={activeColors.placeholder}
        onFocus={handleInputFocus}
        onBlur={() => setIsDropdownVisible(false)}
        onLayout={handleInputLayout}
      />
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
    borderRadius: 10,
    padding: 6,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    zIndex: 2,
  },
  suggestionList: {
    position: "absolute",
    elevation: 5,
    maxHeight: 200,
    borderRadius: 10,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    zIndex: 10,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  suggestionName: {
    flex: 1, // takes remaining space
    flexWrap: "wrap", // allows wrapping to multiple lines
    flexShrink: 1,
    marginRight: 5,
    fontSize: 14,
  },
  rightContainer: {
    width: 60, // fixed width to keep the pipe in a fixed spot
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  separator: {
    marginHorizontal: 3,
    color: "#999",
    fontWeight: "bold",
  },
  suggestionId: {
    fontSize: 14,
    color: "#555",
    textAlign: "right",
  },
});

export default AutoCompleteInput;
