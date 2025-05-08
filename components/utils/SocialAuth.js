globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
import { Buffer } from "buffer";
import { Platform } from "react-native";
import * as AuthSession from "expo-auth-session";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";

if (typeof global.atob === "undefined") {
  global.atob = (input) => Buffer.from(input, "base64").toString("binary");
}

import React from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Feather } from "@expo/vector-icons";
import { useGlobalContext } from "../timer/context";
import { supabase } from "./supabase";
import { getItem, setItem, clear } from "./AsyncStorage";

const getLargeAvatar = async (fbToken) => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,name,picture.type(large)&access_token=${fbToken}`
    );
    const result = await response.json();
    return result.picture?.data?.url;
  } catch (error) {
    console.error("Error fetching Facebook profile:", error);
    return "default_avatar_url";
  }
};

const fetchFacebookProfile = async (accessToken) => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching Facebook profile:", error);
    return null;
  }
};

export async function LoginWithFacebook() {
  try {
    const redirectTo = makeRedirectUri();

    const createSessionFromUrl = async (url) => {
      const { params, errorCode } = QueryParams.getQueryParams(url);

      if (errorCode) throw new Error(errorCode);
      const {
        access_token: sbToken,
        refresh_token: sbRefreshToken,
        provider_token: fbAccessToken,
      } = params;

      if (!sbToken) {
        throw new Error(
          "Supabase access token is missing in the callback URL."
        );
      }

      let profile = await fetchFacebookProfile(fbAccessToken);

      if (!profile) {
        throw new Error("Unable to fetch Facebook profile");
      }

      const { data, error } = await supabase.auth.setSession({
        access_token: sbToken,
        refresh_token: sbRefreshToken,
      });

      if (error) {
        throw error;
      }

      await supabase.auth.updateUser({
        data: {
          name: profile.name,
          email: profile.email,
          avatar: profile.picture?.data?.url,
        },
      });

      console.log(fbAccessToken);

      // console.log(profile.picture.data.url);
      if (fbAccessToken) {
        await setItem("fbAccessToken", fbAccessToken);
      }
      return fbAccessToken;
    };

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        scopes:
          "public_profile publish_video pages_show_list pages_read_engagement pages_read_user_content pages_manage_posts pages_manage_engagement pages_manage_metadata user_videos read_insights",
        redirectTo: redirectTo,
        skipBrowserRedirect: true,
      },
    });
    if (error) throw error;

    const res = await WebBrowser.openAuthSessionAsync(
      data?.url ?? "",
      redirectTo
    );

    if (res.type === "success") {
      const { url } = res;
      await createSessionFromUrl(url);
    } else {
      console.log("Browser session did not complete successfully:", res.type);
    }
  } catch (error) {
    console.error("Facebook login error:", error.message);
  }
}

export async function LinkFacebook() {
  try {
    const redirectTo = makeRedirectUri();
    const createSessionFromUrl = async (url) => {
      const { params, errorCode } = QueryParams.getQueryParams(url);
      if (errorCode) throw new Error(errorCode);
      const {
        access_token: sbToken,
        refresh_token: sbRefreshToken,
        provider_token: fbAccessToken,
      } = params;
      if (!sbToken) return;
      let profile = await fetchFacebookProfile(fbAccessToken);
      if (!profile) {
        throw new Error("Unable to fetch Facebook profile");
      }
      const { data, error } = await supabase.auth.setSession({
        access_token: sbToken,
        refresh_token: sbRefreshToken,
      });
      if (error) {
        console.error("Error setting Supabase session:", error);
        return;
      }
      await supabase.auth.updateUser({
        data: {
          name: profile.name,
          email: profile.email,
          avatar: profile.picture?.data?.url,
        },
      });
      if (fbAccessToken) {
        await setItem("fbAccessToken", fbAccessToken);
      }
      return fbAccessToken;
    };

    const { data, error } = await supabase.auth.linkIdentity({
      provider: "facebook",
      options: {
        scopes:
          "public_profile publish_video pages_show_list pages_read_engagement pages_read_user_content pages_manage_posts pages_manage_engagement pages_manage_metadata user_videos read_insights",
        redirectTo: redirectTo,
        skipBrowserRedirect: true,
      },
    });
    if (error) {
      console.log("Error Signing in with Facebook:", error);
      return;
    }

    const res = await WebBrowser.openAuthSessionAsync(
      data?.url ?? "",
      redirectTo
    );

    if (res.type === "success") {
      const fbToken = await createSessionFromUrl(res.url);
      if (!fbToken) {
        throw new Error("Failed to obtain a valid Facebook access token.");
      }

      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData?.session) {
        const currentFbToken = await getItem("fbAccessToken");
        const avatar = await getLargeAvatar(currentFbToken);
        if (avatar) {
          await supabase.auth.updateUser({
            data: { avatar: avatar },
          });
        }
      }
    } else {
      console.warn("Browser session did not complete successfully:", res.type);
      supabase.auth.signOut();
      clear();
    }
  } catch (error) {
    console.error("Facebook login error:", error.message);
  }
}
