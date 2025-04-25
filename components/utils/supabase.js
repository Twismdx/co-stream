import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-url-polyfill/auto";
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_ANON_KEY } from "@env";

// Load the Supabase URL and anon key from environment variables.
const supabaseUrl = EXPO_PUBLIC_SUPABASE_URL;
// const supabaseUrl = "https://qzuowuqeoyhqfghsiovm.supabase.co";
const supabaseAnonKey = EXPO_PUBLIC_ANON_KEY;
// const supabaseAnonKey =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dW93dXFlb3locWZnaHNpb3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODI0MjIsImV4cCI6MjA1OTk1ODQyMn0.KQztDDM2nq9sY8z1yURve6Bmr4Pk9HQvbTrtiEmMz6o";

// Create the Supabase client with AsyncStorage for React Native
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ---------------------
// AUTHENTICATION HELPERS
// ---------------------

// Get the current authenticated user using Supabase Auth.
export async function getCurrentUser(userid) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userid)
    .single();
  if (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
  return data;
}

export const fetchPlayersByChallengeId = async (challengeid) => {
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("challengeid", challengeid);

  if (error) {
    console.error("Error fetching challenge data:", error.message);
    return { error: error.message };
  }
  const players = {
    owner: data[0].owner,
    opponent: data[0].opponent,
  };

  return players;
};

// ---------------------
// USER DATA FUNCTIONS (using auth.users)
// ---------------------

// Fetch users by their IDs from auth.users.
export const fetchUserByIds = async (currentUserId, opponentId) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .in("id", [currentUserId, opponentId]);

    if (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
    return data; // Returns an array of user objects from auth.users
  } catch (error) {
    console.error("Error fetching users by IDs:", error);
    return [];
  }
};

export async function fetchUser(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }
  return data;
}

// Fetch all users from auth.users.
export const fetchUsers = async () => {
  try {
    // Updated to query the "profiles" table rather than "auth.users"
    const { data, error } = await supabase.from("users").select("*");

    if (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

// ---------------------
// LINKED ACCOUNTS & FCM TOKENS
// ---------------------

// Fetch linked identities for a given user from the 'linked_accounts' table.
// If a provider is specified (e.g., 'google'), the function returns only linked identities for that provider.
export const fetchLinkedIdentities = async (userId, provider = null) => {
  try {
    let query = supabase
      .from("linked_accounts")
      .select("*")
      .eq("user_id", userId);

    if (provider) {
      query = query.eq("provider", provider);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching linked identities: ${error.message}`);
    }
    return data;
  } catch (error) {
    console.error("Error fetching linked identities:", error);
    return [];
  }
};

// Fetch FCM tokens for a given user from the 'fcm_tokens' table.
export const fetchFcmTokens = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("fcm_tokens")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Error fetching FCM tokens: ${error.message}`);
    }
    return data;
  } catch (error) {
    console.error("Error fetching FCM tokens:", error);
    return [];
  }
};

export const linkAccount = async ({
  provider,
  provider_user_id,
  provider_email,
}) => {
  // Retrieve the current session to ensure the user is authenticated.
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError) {
    throw new Error("Error retrieving auth session: " + sessionError.message);
  }
  if (!session) {
    throw new Error("User is not authenticated");
  }

  // Use the authenticated user's id to link the account.
  const user_id = session.user.id;

  // Insert the new record directly into the 'linked_accounts' table.
  const { data, error } = await supabase.from("linked_accounts").insert([
    {
      user_id,
      provider,
      provider_user_id,
      provider_email,
    },
  ]);

  if (error) {
    throw new Error(error.message || "Error linking account");
  }

  return data;
};

// ---------------------
// FCM TOKEN HELPER
// ---------------------

/**
 * Creates or updates the FCM token record for the current user.
 *
 * @param {Object} params
 * @param {string} params.token - The FCM token string.
 * @param {string} [params.device_type] - Optional device type (e.g., 'android', 'ios').
 * @returns {Promise<Object[]>} The upserted FCM token record(s).
 * @throws {Error} If the user is not authenticated or the upsert fails.
 */
export const updateFcmToken = async ({ fcmToken, userId }) => {
  const { data, error } = await supabase.from("fcm_tokens").upsert({
    user_id: userId,
    fcm_token: fcmToken,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(`Failed to update FCM token: ${error.message}`);
  }

  return data;
};
