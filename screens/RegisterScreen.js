import React, { useState, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { useGlobalContext } from "../components/timer/context";
import { supabase } from "../components/utils/supabase";
import InputField from "../components/texts/InputField";
import { MaterialIcons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import CustomButton from "../components/CustomButton";
import Ionicons from "@expo/vector-icons/Ionicons";

const RegisterScreen = ({ navigation }) => {
  const { theme } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [registerError, setRegisterError] = useState("");

  const fullnameRef = useRef(null);
  const emailRef = useRef(null);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Required");
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  const validatePassword = () => {
    if (!password) {
      setPasswordError("Required");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const validateConfirmPassword = () => {
    if (!confirmPassword) {
      setConfirmPasswordError("Required");
      return false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match!");
      return false;
    } else {
      setConfirmPasswordError("");
      return true;
    }
  };

  const onEmailSignup = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        name: fullName,
        email: email,
        password: password,
        options: username ? { data: { username } } : undefined,
      });

      if (error) {
        console.log("Signup Error:", error);
      } else {
        setRegisterError("");
        navigation.navigate("Login", { fullName });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView
      style={{
        backgroundColor: activeColors.primary,
        flex: 1,
        justifyContent: "center",
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ paddingHorizontal: 25, marginTop: 50 }}
      >
        <View style={{ alignItems: "center" }}>
          <Image
            source={require("../images/costream_launch_foreground.png")}
            style={{ height: 175, width: 175, tintColor: activeColors.accent }}
          />
        </View>

        <Text
          style={{
            fontSize: 28,
            fontWeight: "500",
            color: activeColors.tint,
            marginBottom: 30,
          }}
        >
          Register
        </Text>

        <InputField
          ref={fullnameRef}
          label={"Full Name"}
          icon={
            <Ionicons
              name="person-outline"
              size={20}
              color="#666"
              style={{ marginRight: 5 }}
            />
          }
          keyboardType="default"
          returnKeyType="next"
          onSubmitEditing={() => fullnameRef.current.focus()}
          onChangeText={(text) => setFullName(text)}
        />

        {/* Email Field */}
        {emailError ? (
          <View style={{ flexDirection: "row" }}>
            <MaterialIcons
              name="error-outline"
              size={20}
              color="red"
              style={{ marginRight: 5 }}
            />
            <Text style={{ color: "red", marginBottom: 10 }}>{emailError}</Text>
          </View>
        ) : null}
        <InputField
          ref={emailRef}
          label="Email ID"
          icon={
            <MaterialIcons
              name="alternate-email"
              size={20}
              color="#666"
              style={{ marginRight: 5 }}
            />
          }
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={() => usernameRef.current.focus()}
          onBlur={validateEmail}
          onChangeText={(text) => setEmail(text)}
        />

        {/* Nickname Field */}
        <InputField
          ref={usernameRef}
          label="Nickname (optional)"
          icon={
            <Ionicons
              name="text-outline"
              size={20}
              color="#666"
              style={{ marginRight: 5 }}
            />
          }
          keyboardType="default"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current.focus()}
          onChangeText={(text) => setUsername(text)}
        />

        {/* Password Field */}
        {passwordError ? (
          <View style={{ flexDirection: "row" }}>
            <MaterialIcons
              name="error-outline"
              size={20}
              color="red"
              style={{ marginRight: 5 }}
            />
            <Text style={{ color: "red", marginBottom: 10 }}>
              {passwordError}
            </Text>
          </View>
        ) : null}
        <InputField
          ref={passwordRef}
          label="Password"
          icon={
            <MaterialCommunityIcons
              name="shield-lock-outline"
              size={20}
              color="#666"
              style={{ marginRight: 5 }}
            />
          }
          inputType="password"
          returnKeyType="next"
          onSubmitEditing={() => confirmPasswordRef.current.focus()}
          onBlur={validatePassword}
          onChangeText={(text) => setPassword(text)}
        />

        {/* Confirm Password Field */}
        {confirmPasswordError ? (
          <View style={{ flexDirection: "row" }}>
            <MaterialIcons
              name="error-outline"
              size={20}
              color="red"
              style={{ marginRight: 5 }}
            />
            <Text style={{ color: "red", marginBottom: 10 }}>
              {confirmPasswordError}
            </Text>
          </View>
        ) : null}
        <InputField
          ref={confirmPasswordRef}
          label="Confirm Password"
          icon={
            <MaterialCommunityIcons
              name="shield-lock-outline"
              size={20}
              color="#666"
              style={{ marginRight: 5 }}
            />
          }
          inputType="password"
          returnKeyType="done"
          onBlur={validateConfirmPassword}
          onChangeText={(text) => setConfirmPassword(text)}
        />

        {/* Register Button */}
        <CustomButton label="Register" onPress={onEmailSignup} />

        {/* Already Registered */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 30,
          }}
        >
          <Text style={{ color: activeColors.tint }}>Already registered? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: activeColors.accent, fontWeight: "700" }}>
              {" "}
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
