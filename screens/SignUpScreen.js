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
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
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
  const [role_id, setRoleid] = useState("67bd84aa93e35f33361d25fc");
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
      console.log("Илгээж буй өгөгдөл:", {
        first_name,
        last_name,
        email,
        role_id,
        phone_number,
        register,
        password,
        password1,
      });
      const response = await axios.post(
        "https://learningstyle-project-back-end.onrender.com/api/users",
        {
          first_name,
          last_name,
          email,
          role_id,
          phone_number,
          register,
          password,
          password1,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Response:", response.data);

      if (response.status === 201) {
        Alert.alert("Амжилттай", "Бүртгэл амжилттай! Нэвтэрнэ үү.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        throw new Error(response.data.error || "Алдаа гарлаа.");
      }
    } catch (error) {
      console.log("Бүрэн алдааны мэдээлэл:", error);
      console.log("Хариу:", error.response);
      console.log("Хариуны өгөгдөл:", error.response?.data);

      // Алдааны мессежийг илүү найдвартай болгох
      let errorMessage = "Бүртгэл үүсгэхэд алдаа гарлаа";

      if (error.response && error.response.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.msg) {
          errorMessage = error.response.data.msg;
        }
      }

      setError(errorMessage);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.backArrow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="chevron-back-outline"
            size={30}
            color="black"
          ></Ionicons>
        </TouchableOpacity>
        <Text style={styles.backArrowTitle}>Бүртгүүлэх</Text>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        <View style={styles.form}>
          {error && <Text style={styles.error}>{error}</Text>}
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Image
                alt="App Logo"
                resizeMode="contain"
                style={{ height: "30%", width: "100%" }}
                source={require("../assets/nexoraBannerTransparent.png")} // Check image path
              />
            </View>
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
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", alignItems: "center" },
  imageContainer: { alignItems: "center", marginBottom: 15 },
  imagePickerText: { color: "#ffffff" },
  imagePreview: { width: 100, height: 100, borderRadius: 15, marginBottom: 15 },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  form: { flex: 1, width: "100%", alignItems: "center", paddingTop: 20 },
  backArrow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 15,
    marginBottom: -30,
    borderBottomColor: "#ddd",
    marginLeft: 20,
  },
  backArrowTitle: { fontSize: 18, color: "black", marginLeft: 20 },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20, // Reduced padding
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
  headerImg: {
    width: "100%",
    height: "60%",
    marginBottom: 16, // Reduced margin
  },
});

export default SignUp;
