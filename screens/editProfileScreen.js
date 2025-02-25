import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const EditProfileScreen = ({ route, navigation }) => {
  const { user } = route.params;
  const [firstName, setFirstName] = useState(user.first_name);
  const [lastName, setLastName] = useState(user.last_name);
  const [email, setEmail] = useState(user.email);
  const [phoneNumber, setPhoneNumber] = useState(user.phone_number);

  const handleSave = async () => {
    try {
      const updatedUser = {
        ...user,
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phoneNumber,
      };

      // Сервер рүү шинэчлэх хүсэлт явуулах
      await axios.put(
        `http://192.168.1.235:3000/api/users/${user.user_id}`,
        updatedUser
      );

      // AsyncStorage дээр хадгалах
      await AsyncStorage.setItem("user_data", JSON.stringify(updatedUser));

      Alert.alert("Амжилттай", "Мэдээлэл шинэчлэгдлээ!");
      navigation.goBack();
    } catch (error) {
      console.error("Алдаа:", error);
      Alert.alert("Алдаа", "Шинэчлэх явцад алдаа гарлаа!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Овог</Text>
      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
      />

      <Text style={styles.label}>Нэр</Text>
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
      />

      <Text style={styles.label}>И-мэйл</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Text style={styles.label}>Утасны дугаар</Text>
      <TextInput
        style={styles.input}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      <TouchableOpacity onPress={handleSave} style={styles.buttonSave}>
        <Text style={styles.btnSaveText}>Хадгалах</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  buttonSave: {
    width: "70%",
    backgroundColor: "#FF6348",
    height: 30,
    justifyContent: "center",
    borderRadius: 10,
    alignItems: "center",
  },
  btnSaveText: {
    color: "white",
  },
});

export default EditProfileScreen;
