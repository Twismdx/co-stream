import React, { useState, useEffect } from "react";
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
import {
  TourGuideZone,
  TourGuideZoneByPosition,
  useTourGuideController,
} from "rn-tourguide";

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
  const { start, canStart, stop, eventEmitter, tourKey, getCurrentStep } =
    useTourGuideController("home");
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

  useEffect(() => {
    // Defensive patch: only set event listeners if eventEmitter exists
    if (!eventEmitter || typeof eventEmitter.on !== "function") {
      // Optionally log a warning so dev sees the limitation
      if (__DEV__) {
        console.warn(
          "[MainTabNavigator] TourGuide eventEmitter is undefined or missing .on. Tour feature will be disabled."
        );
      }
      return;
    }

    const handleStepChange = (step) => {
      // `step` is the Step instance; its `order` (or your custom `zone`) tells you which step.
      // Whichever number you used on your <TourGuideZone zone={…}> around the Avatar:
      if (step.order === 4) {
        // open the dropdown when you reach step #3
        triggerRef.current?.open();
      } else {
        // optionally close it on all other steps
        triggerRef.current?.close();
      }
    };

    eventEmitter.on("stepChange", handleStepChange);
    return () => {
      eventEmitter.off("stepChange", handleStepChange);
    };
  }, [eventEmitter]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: activeColors.secondary,
        },
        headerShown: true,
        gestureEnabled: false,
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Home: focused ? "home" : "home-outline",
            Timer: focused ? "stopwatch" : "stopwatch-outline",
            Settings: focused ? "settings" : "settings-outline",
          };
          const zones = {
            Home: 5,
            Timer: 6,
            Settings: 7,
          };

          return (
            <TourGuideZone
              zone={zones[route.name]}
              text={`This is the ${route.name} tab`}
              borderRadius={6}
            >
              <Ionicons name={icons[route.name]} size={24} color={color} />
            </TourGuideZone>
          );
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
                  <TourGuideZone
                    zone={3}
                    text={"Tap on your avatar to open the menu."}
                    borderRadius={6}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        triggerRef.current?.open();

                        const currentStep = getCurrentStep();
                        if (currentStep && currentStep.order === 3) {
                          setTimeout(() => start(4), 100);
                        }
                      }}
                    >
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
                  </TourGuideZone>
                </View>
              </DropdownMenuTrigger>
              <TourGuideZone
                zone={4}
                text={
                  "You can navigate to your profile, View and accept/decline pending match requests and view your challenge match history."
                }
                borderRadius={6}
              >
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
                            onPress={() =>
                              navigation.navigate("PendingMatches")
                            }
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

                    {/* <DropdownMenuSub>
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
                  /> */}

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
              </TourGuideZone>
            </DropdownMenu>
            <TourGuideZone
              zone={2}
              text={
                "Search for other users to view their profile or challenge them to a 1v1 match!"
              }
              borderRadius={6}
            >
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
            </TourGuideZone>
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
