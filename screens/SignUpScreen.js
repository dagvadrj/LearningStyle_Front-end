import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Alert,
} from "react-native";
import MyButton from "../components/MyButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { launchImageLibrary } from "react-native-image-picker";
import Icon from "react-native-vector-icons/Ionicons";
import RegisterInput from "../components/register_number";
import axios from "axios";

const SignUp = ({ navigation }) => {
  const [first_name, setFirstname] = useState("");
  const [last_name, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [register, setRegister] = useState("");
  const [phone_number, setPhonenumber] = useState("");
  //const [role_id, setRoleid] = useState("");
  const [password, setPassword] = useState("");
  const [password1, setPassword1] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const isValidRegister = (register) => /^[А-Я]{2}[0-9]{8}$/.test(register);

  const handleSubmit = async () => {
    setError("");
    setIsLoading(true);

  

    if (!isValidRegister(register)) {
      setError("Регистрийн дугаар буруу байна!");
      setIsLoading(false);
      return;
    }

    if (password !== password1) {
      setError("Нууц үг таарахгүй байна!");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "https://learningstyle-project-back-end.onrender.com/api/users",
        {
          first_name,
          last_name,
          email,
          phone_number,
          register,
          password,
          password1,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Response:", response.data);

      if (response.data.success) {
        Alert.alert("Амжилттай", "Бүртгэл амжилттай! Нэвтэрнэ үү.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        throw new Error(response.data.error || "Алдаа гарлаа.");
      }
    } catch (error) {
      console.log("Алдаа:", error.response?.data || error.message);
      setError(error.response?.data?.error || "Серверээс хариу ирсэнгүй.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAwareScrollView contentContainerStyle={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.form}>
          <Text style={styles.header}>Бүртгүүлэх</Text>

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={{ flexDirection: "row", marginTop: 20 }}>
            <TextInput
              style={styles.rowInput}
              placeholder="Нэр"
              value={first_name}
              onChangeText={setFirstname}
            />
            <TextInput
              style={styles.rowInput}
              placeholder="Овог"
              value={last_name}
              onChangeText={setLastname}
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="И-мэйл"
            value={email}
            keyboardType="email-address"
            onChangeText={setEmail}
          />

          <RegisterInput
            onRegisterChange={(isValid, registerString) => {
              if (isValid) {
                setRegister(registerString);
              }
            }}
          />
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            placeholder="Утасны дугаар"
            value={phone_number}
            onChangeText={setPhonenumber}
          />
          <View style={{ flexDirection: "row", marginBottom: 20 }}>
            <TextInput
              style={styles.rowInput}
              placeholder="Нууц үг"
              value={password}
              secureTextEntry
              onChangeText={setPassword}
            />
            <TextInput
              style={styles.rowInput}
              placeholder="Нууц үг давтах"
              value={password1}
              secureTextEntry
              onChangeText={setPassword1}
            />
          </View>

          <MyButton onPress={handleSubmit} disabled={isLoading}>
            <Text style={styles.buttonText}>
              {isLoading ? "Бүртгүүлж байна..." : "Бүртгүүлэх"}
            </Text>
          </MyButton>

          <TouchableOpacity
            disabled={isLoading}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Text
              style={{
                alignSelf: "center",
                marginVertical: 20,
                fontWeight: "600",
              }}
            >
              Нэвтрэх
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", alignItems: "center" },
  imageContainer: { alignItems: "center", marginBottom: 15 },
  imagePickerText: { color: "#ffffff" },
  imagePreview: { width: 100, height: 100, borderRadius: 15, marginBottom: 15 },
  form: { width: 350, padding: 20, borderRadius: 10 },
  header: {
    fontSize: 24,
    fontWeight: "400",
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 10,
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  rowInput: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    width: "50%",
  },
  error: { color: "red", textAlign: "center", marginBottom: 10 },
  buttonText: {
    fontSize: 14,
    lineHeight: 26,
    fontWeight: "600",
    color: "#fff",
  },
});

export default SignUp;
