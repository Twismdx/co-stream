import * as React from "react";
import { View, StyleSheet, Image, Text, ImageBackground } from "react-native";
import LinearGradient from "expo-linear-gradient";

const LandscapeScoreboard = () => {
  return (
    <View style={styles.frameParent}>
      <View style={styles.frame1} />
      <View style={[styles.homeframe, styles.p1scoreLayout]} />
      <View style={[styles.awayframe, styles.center1Position]} />
      <LinearGradient
        style={[styles.center1, styles.center1Position]}
        locations={[0, 0.54]}
        colors={["#f7f5f5", "#d9d8d8"]}
        useAngle={true}
        angle={90.81}
      />
      <View style={[styles.gloss1, styles.gloss1Position]} />
      <View style={styles.progressbarframe} />
      <View style={styles.progressbar} />
      <View style={[styles.extension2, styles.glossIconPosition]} />
      <View style={styles.time2} />
      <Image
        style={[styles.glossIcon, styles.glossIconPosition]}
        resizeMode="cover"
        source="Gloss.png"
      />
      <Text style={[styles.extension3, styles.time3Typo]}>Ext</Text>
      <Text style={[styles.time3, styles.time3Typo]}>1:00</Text>
      <View style={[styles.awayplayer, styles.awayplayerLayout]} />
      <View style={[styles.homeplayer, styles.homeplayerPosition]} />
      <Text style={[styles.damienMcloughlin, styles.alecEvreniadis1Typo]}>
        Damien McLoughlin
      </Text>
      <Text style={[styles.alecEvreniadis1, styles.alecEvreniadis1Typo]}>
        Alec Evreniadis
      </Text>
      {/* <ImageBackground style={[styles.homeflagIcon, styles.iconPosition]} resizeMode="cover" source="HomeFlag.png" /> */}
      {/* <ImageBackground style={[styles.awayflagIcon, styles.iconPosition]} resizeMode="cover" source="AwayFlag.png" /> */}
      <Text style={styles.raceTo111}>Race to 11</Text>
      <Text style={[styles.p1score, styles.p1scoreTypo]}>7</Text>
      <Text style={[styles.p2score, styles.p1scoreTypo]}>9</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  p1scoreLayout: {
    height: 56,
    top: 2,
  },
  center1Position: {
    left: 718,
    position: "absolute",
  },
  gloss1Position: {
    left: 2,
    position: "absolute",
  },
  glossIconPosition: {
    left: 343,
    top: 71,
    position: "absolute",
  },
  time3Typo: {
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    textAlign: "center",
    fontFamily: "Inter-ExtraBold",
    fontWeight: "800",
    fontStyle: "italic",
    position: "absolute",
  },
  awayplayerLayout: {
    width: 552,
    backgroundColor: "rgba(217, 217, 217, 0)",
    position: "absolute",
  },
  homeplayerPosition: {
    left: 66,
    height: 56,
  },
  alecEvreniadis1Typo: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    letterSpacing: 1.7,
    fontSize: 33,
    width: 552,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    textAlign: "center",
    color: "#fff",
    fontStyle: "italic",
    textTransform: "uppercase",
    top: 2,
    position: "absolute",
  },
  iconPosition: {
    width: 55,
    top: 12,
    position: "absolute",
  },
  p1scoreTypo: {
    width: 94,
    fontSize: 48,
    textTransform: "capitalize",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    textAlign: "center",
    color: "#fff",
    fontFamily: "Inter-ExtraBold",
    fontWeight: "800",
    fontStyle: "italic",
    position: "absolute",
  },
  frame1: {
    top: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: 1652,
    height: 60,
    borderRadius: 15,
    position: "absolute",
  },
  homeframe: {
    width: 716,
    backgroundColor: "#1c1c1c",
    height: 56,
    left: 2,
    position: "absolute",
  },
  awayframe: {
    width: 932,
    height: 56,
    top: 2,
    backgroundColor: "#1c1c1c",
  },
  center1: {
    top: 5,
    width: 216,
    height: 50,
    backgroundColor: "transparent",
    borderRadius: 15,
  },
  gloss1: {
    backgroundColor: "rgba(217, 217, 217, 0.2)",
    width: 1648,
    display: "none",
    height: 21,
    top: 2,
    left: 2,
  },
  progressbarframe: {
    left: 403,
    width: 218,
    height: 46,
    backgroundColor: "#fff",
    top: 71,
    position: "absolute",
  },
  progressbar: {
    top: 73,
    left: 405,
    height: 42,
    width: 214,
    backgroundColor: "#fff",
    position: "absolute",
  },
  extension2: {
    backgroundColor: "#42d70e",
    width: 60,
    height: 46,
  },
  time2: {
    left: 621,
    width: 80,
    height: 46,
    top: 71,
    backgroundColor: "#1c1c1c",
    position: "absolute",
  },
  glossIcon: {
    width: 358,
    height: 21,
  },
  extension3: {
    top: 78,
    left: 344,
    fontSize: 26,
    width: 58,
    color: "#fff",
    textTransform: "uppercase",
    alignItems: "center",
    display: "flex",
    textAlign: "center",
    fontFamily: "Inter-ExtraBold",
    fontWeight: "800",
    fontStyle: "italic",
  },
  time3: {
    top: 74,
    fontSize: 32,
    color: "#f22929",
    width: 74,
    left: 624,
    alignItems: "center",
    display: "flex",
    textAlign: "center",
    fontFamily: "Inter-ExtraBold",
    fontWeight: "800",
    fontStyle: "italic",
  },
  awayplayer: {
    left: 1034,
    top: 1,
    width: 552,
    backgroundColor: "rgba(217, 217, 217, 0)",
    height: 56,
  },
  homeplayer: {
    top: 4,
    width: 552,
    backgroundColor: "rgba(217, 217, 217, 0)",
    position: "absolute",
  },
  damienMcloughlin: {
    left: 66,
    height: 56,
  },
  alecEvreniadis1: {
    height: 55,
    left: 1034,
  },
  homeflagIcon: {
    left: 39,
    height: 35,
  },
  awayflagIcon: {
    left: 1558,
    height: 37,
  },
  raceTo111: {
    left: 720,
    color: "#1c1c1c",
    height: 57,
    textTransform: "capitalize",
    fontSize: 33,
    top: 1,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    textAlign: "center",
    fontFamily: "Inter-ExtraBold",
    fontWeight: "800",
    fontStyle: "italic",
    width: 214,
    position: "absolute",
  },
  p1score: {
    left: 624,
    height: 56,
    top: 2,
  },
  p2score: {
    top: 3,
    left: 934,
    height: 54,
  },
  frameParent: {
    flex: 1,
    width: "100%",
    height: 117,
  },
});

export default LandscapeScoreboard;
