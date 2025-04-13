"use client"

import { useEffect, useState } from "react"
import { StyleSheet, Text, View, SafeAreaView, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import BeautifulProgressBar from "./ProgressBar"

import AsyncStorage from "@react-native-async-storage/async-storage"

export default function Start() {
  const [progressValue, setProgressValue] = useState(0)
  const navigation = useNavigation()

  useEffect(() => {
    const checkTokenAndNavigate = async () => {
      const savedToken = await AsyncStorage.getItem("user_token");
  
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        setProgressValue(current);
        if (current >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (savedToken) {
              navigation.navigate("Main");
            } else {
              navigation.navigate("Login");
            }
          }, 20); // Progress animation дуусахыг хүлээнэ
        }
      }, 20); // 500ms болгож progress animation-тай уялдуулсан
    };
  
    checkTokenAndNavigate();
  }, []);
  

  return (
    <SafeAreaView style={styles.container}>
      <Image
        style={{ width: 100, height: 100, alignSelf: "center", objectFit: "contain" }}
        source={require("../assets/nexoraLogoWhite.png")}
      />

      <View style={styles.progressContainer}>
        {/* Beautiful progress bar with custom colors to match your theme */}
        <BeautifulProgressBar
          progress={progressValue}
          height={16}
          gradientColors={["#ffb22c", "#ff9900"]}
          backgroundColor="#f0f0f0"
          textColor="#ffb22c"
          animated={true}
          showPercentage={false}
          style={{ width: 250 }}
        />

        {/* Keep the existing percentage text */}
        <Text style={styles.progressText}>{progressValue}%</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 50,
  },
  progressContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 50,
  },
  text: {
    fontWeight: "800",
    fontSize: 30,
    color: "white",
    marginBottom: 20,
  },
  progressText: {
    fontSize: 18,
    color: "#ffb22c",
    fontWeight: "bold",
    marginTop: 10,
  },
})
