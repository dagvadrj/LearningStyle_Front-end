import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  StatusBar,
  Image,
} from "react-native";
import React, { useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyInput from "../components/MyInput";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const SearchScreen = () => {
  const [text, setText] = useState("");

  const handleClick = (name) => {
    Alert.alert(`Сайн байна уу : ${name}`);
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.myList} showsVerticalScrollIndicator={false}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.addContainer}>
          <Image
            source={{
              uri: "https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js",
            }}
          />
          <MyInput style={styles.addInput} />
          <TouchableOpacity style={styles.addBtn}>
            <Text style={styles.addBtnText}>Нэмэх</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  myList: {
    marginHorizontal: 20,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    marginVertical: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#075eec",
  },
  addBtnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    color: "#fff",
  },
  addInput: {
    width: "70%",
    padding: 10,
    backgroundColor: "#ccc",
    borderRadius: 5,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  addContainer: {
    flexDirection: "row",
    padding: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
  btn: {
    flex: 0.1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    marginVertical: 50,
    paddingVertical: 10,
    width: "30%",
    backgroundColor: "#075eec",
  },

  btnText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "grey",
  },
});
