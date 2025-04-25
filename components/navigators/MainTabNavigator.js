import React, { useState } from "react";
import { Pressable } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useGlobalContext } from "../timer/context";
import { View, Dimensions, TouchableOpacity, Button, Text } from "react-native";
import {
  createBottomTabNavigator,
  BottomTabBar,
} from "@react-navigation/bottom-tabs";
import HomeScreen from "../../screens/HomeScreen";
import SettingsScreen from "../../screens/SettingsScreen";
import TimerScreen from "../../screens/TimerScreen";
import AutoCompleteUsers from "../texts/AutoCompleteUsers";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import ProfileDropDown from "../modals/ProfileDropDown";
import { clear } from "~/components/utils/AsyncStorage";
import { supabase } from "~/components/utils/supabase";
import MeasureView from "../utils/MeasureView";
import { Separator } from "zeego/dropdown-menu";

const { height: windowHeight, width: windowWidth } = Dimensions.get("window");

const MainTabNavigator = ({ openSearch }) => {
  const {
    theme,
    user,
    setUseScoreboard,
    setSelectedSource,
    setSelectedOrg,
    setIsLoggedIn,
    setUser,
  } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];
  const Tab = createBottomTabNavigator();
  const navigation = useNavigation();
  const triggerRef = React.useRef(null);
  const primaryColor = "#2563eb";
  const foregroundColor = "#111827";
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };
  const darkThemeColors = {
    foreground: activeColors.onPrimary, // near-white for text/icons
    surface: activeColors.secondary, // dark background
    border: activeColors.bottomsheet, // slightly lighter gray for borders
    // ...
  };
  const [headerBottom, setHeaderBottom] = useState(0);
  const [tabBarHeight, setTabBarHeight] = useState(0);

  const tabBarTop = windowHeight - tabBarHeight;

  const panelTop = headerBottom;
  const panelMax = tabBarTop + headerBottom;

  // Helper function to extract user initials
  const getUserInitials = () => {
    if (!user || !user.name) return "";
    const nameParts = user.name.trim().split(" ");
    const firstInitial = nameParts[0] ? nameParts[0].charAt(0) : "";
    const lastInitial =
      nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0) : "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const logoutUser = async () => {
    try {
      await clear();
      await setSelectedOrg(null);
      await setSelectedSource(null);
      await setIsLoggedIn(false);
      await setUser();

      navigation.navigate("Login");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        return;
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: activeColors.secondary,
        },
        headerShown: true,
        gestureEnabled: false,
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          } else if (route.name === "Timer") {
            iconName = focused ? "stopwatch" : "stopwatch-outline";
          } else if (route.name === "ProfileStack") {
            iconName = focused ? "person-circle" : "person-circle-outline";
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: activeColors.accent,
        tabBarInactiveTintColor: activeColors.onPrimary,
        header: () => (
          <View
            style={{
              flexDirection: "row",
              backgroundColor: activeColors.secondary,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 5,
              paddingHorizontal: 5,
              width: "100%",
            }}
            onLayout={({ nativeEvent }) => {
              const bottomY = nativeEvent.layout.y + nativeEvent.layout.height;
              setHeaderBottom(bottomY);
            }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger ref={triggerRef} asChild>
                <View
                  style={{
                    paddingRight: 5,
                  }}
                >
                  <TouchableOpacity onPress={() => triggerRef.current?.open()}>
                    <Avatar
                      style={{ width: 60, height: 60 }}
                      alt={getUserInitials()}
                    >
                      <AvatarImage
                        source={
                          user?.avatar_url
                            ? { uri: user?.avatar_url }
                            : require("~/assets/placeholder.png")
                        }
                        onError={(e) => {
                          console.error(
                            "Avatar image failed to load:",
                            e.nativeEvent.error
                          );
                        }}
                      />
                      <AvatarFallback>
                        <Text>{getUserInitials()}</Text>
                      </AvatarFallback>
                    </Avatar>
                  </TouchableOpacity>
                </View>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                insets={contentInsets}
                style={{
                  width: 288, // w-72
                  backgroundColor: darkThemeColors.surface,
                  borderWidth: 1,
                  borderColor: darkThemeColors.border,
                  borderRadius: 8,
                  paddingVertical: 8,
                }}
              >
                <Separator
                  style={{ backgroundColor: darkThemeColors.border }}
                />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onPress={() => {
                      navigation.navigate("Profile");
                    }}
                  >
                    {/* Use 'foreground' so it appears in white (or light) against a dark background */}
                    <Feather
                      name="user"
                      style={{
                        color: darkThemeColors.foreground,
                        marginRight: 8,
                      }}
                      size={14}
                    />
                    <Text style={{ color: darkThemeColors.foreground }}>
                      My Profile
                    </Text>
                  </DropdownMenuItem>

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <MaterialCommunityIcons
                        name="tournament"
                        style={{
                          color: darkThemeColors.foreground,
                          marginRight: 8,
                        }}
                        size={14}
                      />
                      <Text style={{ color: darkThemeColors.foreground }}>
                        Challenges
                      </Text>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent
                      style={{
                        // Use the same background/border approach
                        backgroundColor: darkThemeColors.surface,
                        borderWidth: 0,
                        borderColor: darkThemeColors.border,
                      }}
                    >
                      <Animated.View entering={FadeIn.duration(200)}>
                        <DropdownMenuItem
                          onPress={() => navigation.navigate("MatchHistory")}
                        >
                          <MaterialCommunityIcons
                            name="history"
                            style={{
                              color: darkThemeColors.foreground,
                              marginRight: 8,
                            }}
                            size={14}
                          />
                          <Text style={{ color: darkThemeColors.foreground }}>
                            History
                          </Text>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onPress={() => navigation.navigate("PendingMatches")}
                        >
                          <MaterialIcons
                            name="pending-actions"
                            style={{
                              color: darkThemeColors.foreground,
                              marginRight: 8,
                            }}
                            size={14}
                          />
                          <Text style={{ color: darkThemeColors.foreground }}>
                            Pending Challenges
                          </Text>
                        </DropdownMenuItem>
                      </Animated.View>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <Separator
                    style={{ backgroundColor: darkThemeColors.border }}
                  />

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <MaterialCommunityIcons
                        name="tournament"
                        style={{
                          color: darkThemeColors.foreground,
                          marginRight: 8,
                        }}
                        size={14}
                      />
                      <Text style={{ color: darkThemeColors.foreground }}>
                        Competitions
                      </Text>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent
                      style={{
                        backgroundColor: darkThemeColors.surface,
                        borderWidth: 0,
                        borderColor: darkThemeColors.border,
                      }}
                    >
                      <Animated.View entering={FadeIn.duration(200)}>
                        <DropdownMenuItem>
                          <MaterialIcons
                            name="add-circle"
                            style={{
                              color: darkThemeColors.foreground,
                              marginRight: 8,
                            }}
                            size={14}
                          />
                          <Text style={{ color: darkThemeColors.foreground }}>
                            Create a Comp
                          </Text>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MaterialIcons
                            name="pending-actions"
                            style={{
                              color: darkThemeColors.foreground,
                              marginRight: 8,
                            }}
                            size={14}
                          />
                          <Text style={{ color: darkThemeColors.foreground }}>
                            Invitations
                          </Text>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MaterialIcons
                            name="add-circle"
                            style={{
                              color: darkThemeColors.foreground,
                              marginRight: 8,
                            }}
                            size={14}
                          />
                          <Text style={{ color: darkThemeColors.foreground }}>
                            More...
                          </Text>
                        </DropdownMenuItem>
                      </Animated.View>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <Separator
                    style={{ backgroundColor: darkThemeColors.border }}
                  />

                  <DropdownMenuItem onPress={logoutUser}>
                    <MaterialIcons
                      name="logout"
                      style={{
                        color: darkThemeColors.foreground,
                        marginRight: 8,
                      }}
                      size={14}
                    />
                    <Text style={{ color: darkThemeColors.foreground }}>
                      Log out
                    </Text>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                width: windowWidth - 90,
              }}
            >
              <AutoCompleteUsers
                top={panelTop}
                maxHeight={panelMax}
                openSearch={openSearch}
              />
            </View>
          </View>
        ),
      })}
      tabBar={(props) => (
        <View
          onLayout={({ nativeEvent }) => {
            const { height } = nativeEvent.layout;
            setTabBarHeight(height);
          }}
        >
          <BottomTabBar {...props} />
        </View>
      )}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: true }}
        initialParams={navigation}
      />
      <Tab.Screen
        name="Timer"
        component={TimerScreen}
        options={{ headerShown: false }}
        initialParams={navigation}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }}
        initialParams={navigation}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
