import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Switch from "~/components/ui/switch";
import * as Label from "@rn-primitives/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalContext } from "../timer/context";
import { PortalHost } from "@rn-primitives/portal";

export default function DropDown() {
  const { theme, setUseScoreboard } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];
  const insets = useSafeAreaInsets();
  const triggerRef = useRef(null);
  const contentInsets = {
    top: 12,
    bottom: insets.bottom,
    left: 12,
    right: 60,
  };

  const [checked, setChecked] = useState(false);
  const handleCheck = useCallback(() => {
    setChecked((prev) => !prev);
    setUseScoreboard((prev) => !prev);
  }, [setUseScoreboard]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger ref={triggerRef} asChild>
        <View>
          <TouchableOpacity onPress={() => triggerRef.current?.open()}>
            <Ionicons name="menu" size={40} color="white" />
          </TouchableOpacity>
        </View>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        insets={contentInsets}
        style={{
          width: 256,
          backgroundColor: activeColors.secondary,
          borderWidth: 1,
          borderColor: activeColors.bottomsheet,
          borderRadius: 8,
          paddingVertical: 8,
        }}
      >
        <DropdownMenuLabel
          style={{ fontSize: 16, color: activeColors.onPrimary }}
        >
          Scoreboard
        </DropdownMenuLabel>

        <DropdownMenuSeparator
          style={{ backgroundColor: activeColors.bottomsheet }}
        />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                margin: 4,
                marginLeft: -2,
              }}
            >
              <Switch
                id="scoreboard"
                checked={checked}
                onValueChange={handleCheck}
              />
              <Label.Root onPress={handleCheck}>
                <Label.Text
                  style={{
                    marginLeft: 8,
                    fontSize: 16,
                    color: activeColors.onPrimary,
                  }}
                >
                  {checked ? "Scoreboard on" : "Scoreboard off"}
                </Label.Text>
              </Label.Root>
            </View>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => triggerRef.current?.close()}>
          <Text
            style={{
              fontSize: 16,
              color: activeColors.error,
              marginBottom: -8,
            }}
          >
            Close
          </Text>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
