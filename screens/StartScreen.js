import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native"; // Correct import

export default function Start({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace("Main");
    }, 1000);
  }, []); // Add empty dependency array to run only once

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Сурах чиг хандлага тодорхойлогч
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
    textAlign: "center" // Fixed typo
  },
  text: {
    fontWeight: "800",
    fontSize: 30,
    color: "white",
  },
});
