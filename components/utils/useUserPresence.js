import React, { useState, useEffect } from "react";
import { AppState } from "react-native";
import { supabase } from "~/components/utils/supabase";

export default function useUserPresence(userId) {
  const [appState, setAppState] = useState(AppState.currentState);

  async function updateUserStatus(isOnline) {
    // If no valid userId is provided, simply skip the update.
    if (!userId) {
      return;
    }

    const payload = {
      is_online: isOnline,
      last_online: isOnline ? null : new Date().toISOString(),
    };

    const { error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", userId);

    if (error) {
      console.error("Error updating user status:", error);
    }
  }

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      // Only update if there's a valid userId.
      if (!userId) return;

      if (nextAppState === "active") {
        updateUserStatus(true);
      } else {
        updateUserStatus(false);
      }
      setAppState(nextAppState);
    });

    return () => subscription.remove();
  }, [userId]); // only re-run if userId changes

  useEffect(() => {
    const interval = setInterval(() => {
      if (appState === "active") {
        updateUserStatus(true);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [appState, userId]); // include userId as dependency

  return null;
}
