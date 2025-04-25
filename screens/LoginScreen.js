import React, { useEffect, useState, useCallback, useRef } from "react";
import Toast from "~/components/ui/toast";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  NativeModules,
} from "react-native";
import * as Linking from "expo-linking";
import { supabase } from "../components/utils/supabase";
import {
  LoginWithFacebook,
  LinkFacebook,
} from "../components/utils/SocialAuth";
import { upsertFcmToken, exchangeFbToken } from "../components/utils/API";
import { MaterialIcons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useGlobalContext } from "../components/timer/context";
import { getItem, clear } from "../components/utils/AsyncStorage";
import CustomButton from "../components/CustomButton";
import InputField from "../components/InputField";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import usePermissions from "../components/utils/usePermissions";
import { getMessaging } from "@react-native-firebase/messaging";
import ActivityLoader from "@/components/utils/ActivityLoader";

const LoginScreen = ({ navigation, route }) => {
  const { permissionGranted } = usePermissions();
  const {
    user,
    setUser,
    isLoggedIn,
    setIsLoggedIn,
    theme,
    isEmailSignIn,
    setIsEmailSignIn,
    setIsLoading,
    isLoading,
    setFirstSignIn,
  } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);

  const passwordRef = useRef(null);
  const emailRef = useRef(null);

  const showToast = useCallback((userName) => {
    Toast.show({
      type: "success",
      text1: "Welcome back!",
      text2: `Glad to see you, ${userName}`,
      visibilityTime: 3000,
    });
  }, []);

  const onFacebookButtonPress = async () => {
    setIsLoading(true);
    await LoginWithFacebook();
    const fbToken = await getItem("fbAccessToken");
    if (!fbToken) {
      console.log(
        "Facebook token not available; user may need to log in again."
      );
      return;
    }
    if (user?.id && fbToken) {
      const res = await exchangeFbToken(user.id, fbToken);
      if (res.error) {
        console.log("Error exchanging Facebook token:", res.error);
        return;
      }
    }
    setFirstSignIn(true);
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      // Optionally handle error display.
    }
  };

  const onGoogleButtonPress = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        skipBrowserRedirect: true,
      });
      if (error) {
        console.log("Google OAuth error:", error);
        return;
      }
      if (data?.url) {
        Linking.openURL(data.url);
      } else {
        console.log("No URL returned from Google OAuth");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onEmailSignIn = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) {
        console.log(error);
        return;
      }
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      setIsEmailSignIn(true);
      setIsLoggedIn(true);
      navigation.navigate("MainTabs");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {permissionGranted && (
        <SafeAreaView
          style={{
            backgroundColor: activeColors.secondary,
            flex: 1,
            justifyContent: "center",
          }}
        >
          <View style={{ paddingHorizontal: 25 }}>
            <View style={{ alignItems: "center", marginBottom: -15 }}>
              <Image
                source={require("../images/costream.png")}
                style={{
                  height: 225,
                  width: 225,
                  tintColor: activeColors.accent,
                }}
              />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "500",
                  color: activeColors.tint,
                  marginBottom: 30,
                }}
              >
                Login
              </Text>
            </View>
            <InputField
              ref={emailRef}
              selectionColor={activeColors.tint}
              label={"Email ID"}
              icon={
                <MaterialIcons
                  name="alternate-email"
                  size={20}
                  color="#666"
                  style={{ marginRight: 5 }}
                />
              }
              keyboardType="email-address"
              onSubmitEditing={() => {
                passwordRef.current && passwordRef.current.focus();
              }}
              onChangeText={(text) => setEmail(text)}
              editable={!isLoading}
            />
            <InputField
              ref={passwordRef}
              label={"Password"}
              icon={
                <MaterialCommunityIcons
                  name="shield-lock-outline"
                  size={20}
                  color="#666"
                  style={{ marginRight: 5 }}
                />
              }
              inputType="password"
              fieldButtonLabel={"Forgot?"}
              fieldButtonFunction={() => {}}
              onSubmitEditing={() => {
                onEmailSignIn();
              }}
              onChangeText={(text) => setPassword(text)}
              editable={!isLoading}
            />
            <CustomButton
              label={"Login"}
              onPress={onEmailSignIn}
              style={{ marginBottom: 20 }}
              disabled={isLoading}
            />
            <Text
              style={{
                textAlign: "center",
                color: activeColors.tint,
                marginBottom: 20,
              }}
            >
              Or, login with ...
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <CustomButton
                onPress={
                  isLoggedIn && !isEmailSignIn
                    ? logout
                    : isLoggedIn && isEmailSignIn
                    ? LinkFacebook
                    : onFacebookButtonPress
                }
                facebook={true}
                style={{
                  height: 40,
                  borderRadius: 10,
                  paddingHorizontal: 50,
                  paddingVertical: 10,
                }}
                disabled={isLoading}
              >
                <Image
                  source={require("../images/a/facebook.png")}
                  style={styles.imageIconStyle}
                />
              </CustomButton>
              <CustomButton
                onPress={onGoogleButtonPress}
                google={true}
                style={{
                  height: 40,
                  borderRadius: 10,
                  paddingHorizontal: 50,
                  paddingVertical: 10,
                }}
                disabled={isLoading}
              >
                <Image
                  source={require("../images/a/google.png")}
                  style={styles.imageIconStyle}
                />
              </CustomButton>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Text style={{ color: activeColors.tint }}>New to the app? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Register")}
                disabled={isLoading}
              >
                <Text style={{ color: activeColors.accent, fontWeight: "700" }}>
                  {" "}
                  Register
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  imageIconStyle: {
    height: 25,
    width: 25,
    resizeMode: "stretch",
    alignSelf: "center",
  },
});

export default LoginScreen;
