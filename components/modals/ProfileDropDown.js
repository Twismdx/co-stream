import * as React from "react";
import {
  Pressable,
  View,
  Text,
  Button,
  StyleProp,
  ViewStyle,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "~/components/ui/dropdown-menu";
import { useGlobalContext } from "../timer/context";
import { useNavigation } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// Replace with your actual primary (for Pressable feedback) and foreground colors
const primaryColor = "#2563eb";
const foregroundColor = "#111827";

export default function ProfileDropDown() {
  const { user, theme } = useGlobalContext();
  const navigation = useNavigation();
  const activeColors = theme.colors[theme.mode];
  const triggerRef = React.useRef(null);
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24, // p-6
        gap: 48, // gap-12
      }}
    >
      {/* Invisible Pressable in top‑right to open menu programmatically */}
      <Pressable
        style={({ pressed }) => [
          {
            position: "absolute",
            top: 0,
            right: 0,
            width: 64, // w-16
            height: 64, // h-16
            backgroundColor: pressed ? `${primaryColor}08` : "transparent",
          },
        ]}
        onPress={() => {
          triggerRef.current?.open();
        }}
      />

      <DropdownMenuRoot style={{ position: "absolute" }}>
        <DropdownMenuTrigger ref={triggerRef}>
          <Button variant="outline">
            <Text>Open</Text>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          insets={contentInsets}
          style={{ width: 288 /* w-72 */ }}
        >
          <DropdownMenuLabel>Menu</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => navigation.navigate("Profile")}>
              <Feather
                name="user"
                size={14}
                style={{ color: foregroundColor }}
              />
              <Text>My Profile</Text>
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <MaterialCommunityIcons
                  name="tournament"
                  size={14}
                  style={{ color: foregroundColor }}
                />
                <Text>Challenges</Text>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <Animated.View entering={FadeIn.duration(200)}>
                  <DropdownMenuItem
                    onSelect={() => navigation.navigate("MatchHistory")}
                  >
                    <MaterialCommunityIcons
                      name="history"
                      size={14}
                      style={{ color: foregroundColor }}
                    />
                    <Text>History</Text>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => navigation.navigate("PendingMatches")}
                  >
                    <MaterialIcons
                      name="pending-actions"
                      size={14}
                      style={{ color: foregroundColor }}
                    />
                    <Text>Pending Challenges</Text>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </Animated.View>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <MaterialCommunityIcons
                  name="tournament"
                  size={14}
                  style={{ color: foregroundColor }}
                />
                <Text>Competitions</Text>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <Animated.View entering={FadeIn.duration(200)}>
                  <DropdownMenuItem>
                    <MaterialIcons
                      name="add-circle"
                      size={14}
                      style={{ color: foregroundColor }}
                    />
                    <Text>Create a Comp</Text>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MaterialIcons
                      name="pending-actions"
                      size={14}
                      style={{ color: foregroundColor }}
                    />
                    <Text>Invitations</Text>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <MaterialIcons
                      name="add-circle"
                      size={14}
                      style={{ color: foregroundColor }}
                    />
                    <Text>More...</Text>
                  </DropdownMenuItem>
                </Animated.View>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <MaterialIcons
                name="logout"
                size={14}
                style={{ color: foregroundColor }}
              />
              <Text>Log out</Text>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenuRoot>
    </View>
  );
}
