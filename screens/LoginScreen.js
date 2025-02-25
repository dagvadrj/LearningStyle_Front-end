import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Image,
  Text,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Switch,
} from "react-native";
import tw from "twrnc";
import axios from "axios";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthContext } from "../../frontend/hooks/useAuthLogin";
import { useLogin } from "../../frontend/hooks/useLogin";
import MyButton from "../components/MyButton";

const LoginScreen = ({ navigation }) => {
  const baseUrl = "https://learningstyle-project-back-end.onrender.com/";
  const [uname, setUname] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const { dispatch, user } = useAuthContext();
  const { loginUser, setLoginUser } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [error, setError] = useState(null);


  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${baseUrl}api/login`, {
        uname: uname,
        password: password,
      });
      //console.log("Серверээс ирсэн мэдээлэл:", response.data);

      if (response.data.token && response.data.user) {
        const userData = JSON.stringify(response.data.user);
        await AsyncStorage.setItem("user_token", response.data.token);
        await AsyncStorage.setItem("user_data", userData);
        //console.log("Хадгалсан хэрэглэгчийн мэдээлэл:", userData);
        navigation.navigate("Main");
      } else {
        throw new Error("Алдаа гарлаа. Хэрэглэгчийн мэдээлэл олдсонгүй!");
      }
      setPassword("");
      setError(null);
    } catch (error) {
      setError(error.message || "Сүлжээний алдаа гарлаа. Дахин оролдоно уу!");
    } finally {
      setIsLoading(false);
    }
    if (!response.ok) {
      if (uname.length === 0) {
        setError("Имэйл хаягаа оруулна уу!");
        setIsLoading(false);
        return;
      } else if (password.length === 0) {
        setError("Нууц үгээ оруулна уу!");
        setIsLoading(false);
        return;
      }
      throw new Error(data.message || "Нэвтрэх үед алдаа гарлаа!");
    }
  };
  useEffect(() => {
    const fetchUserData = async () => {
      const storedUserData = await AsyncStorage.getItem("user_data");
      console.log("Хадгалагдсан хэрэглэгчийн мэдээлэл:", storedUserData);
    };

    fetchUserData();
  }, []);
  useEffect(() => {
    AsyncStorage.getItem("saved_uname").then((value) => {
      if (value) {
        setUname(value);
        setIsEnabled(true); // Switch-г идэвхтэй байлгах
      }
    });
  }, []);
  const toggleSwitch = () => {
    setIsEnabled((previousState) => {
      const newState = !previousState;
      if (newState) {
        AsyncStorage.setItem("saved_uname", uname);
      } else {
        AsyncStorage.removeItem("saved_uname");
      }
      return newState;
    });
  };

  AsyncStorage.getItem("user_token")
    .then((result) => setToken(result))
    .catch((err) => console.error(err.message));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#e8ecf4" }}>
      <KeyboardAwareScrollView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Image
            alt="App Logo"
            resizeMode="contain"
            style={styles.headerImg}
            source={{ uri: "https://assets.withfra.me/SignIn.2.png" }}
          />
          <Text style={styles.title}>
            <Text style={{ color: "#075eec" }}>Номын сангийн систем</Text>
          </Text>
        </View>

        <View style={styles.form}>
          {error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.inputContainer}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={setUname}
              placeholder="Нэвтрэх нэр"
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              value={uname}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              autoCorrect={false}
              onChangeText={setPassword}
              placeholder="Нууц үг"
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              secureTextEntry={!showPassword}
              value={password}
              required
            />

            <MaterialCommunityIcons
              onPress={() => setShowPassword(!showPassword)}
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="#aaa"
              style={styles.icon}
            ></MaterialCommunityIcons>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              position: "relative",
              alignSelf: "center",
              justifyContent: "center",
              marginVertical: 20,
            }}
          >
            <Switch
              trackColor={{ false: "#767577", true: "#075eec" }}
              thumbColor={isEnabled ? "#ffffff" : "#f4f3f4"}
              ios_backgroundColor="#767577"
              onValueChange={toggleSwitch}
              style={{
                alignSelf: "flex-start",
                marginRight: 12,
              }}
              value={isEnabled}
            />
            <Text style={{ marginRight: 20, fontSize: 14 }}>
              Нэвтрэх нэр сануулах
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity onPress={() => {}}>
                <Text style={{ color: "#075eec" }}>Нууц үг сэргээх</Text>
              </TouchableOpacity>
            </View>
          </View>
          <MyButton onPress={handleLogin} isLoading={isLoading}>
            <Text style={styles.btnText}>
              {isLoading ? "Нэвтрэж байна..." : "Нэвтрэх"}
            </Text>
          </MyButton>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
          <Text style={{ alignSelf: "center", fontWeight: "600" }}>
            Бүртгүүлэх
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  formLink: {
    color: "#075eec",
    marginHorizontal: 4,
    textAlign: "right",
  },
  btnText: {
    fontSize: 14,
    lineHeight: 26,
    fontWeight: "600",
    color: "#fff",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    position: "relative",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    position: "absolute",
    alignItems: "center",
    right: 10,
    color: "gray",
    paddingRight: 16,
  },
  title: {
    fontSize: 31,
    fontWeight: "700",
    color: "#1D2A32",
    marginBottom: 6,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 36,
  },
  headerImg: {
    width: 80,
    height: 80,
    alignSelf: "center",
    marginBottom: 36,
  },
  form: {
    marginBottom: 24,
    paddingHorizontal: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  formFooter: {
    paddingVertical: 24,
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    textAlign: "center",
    letterSpacing: 0.15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#222",
    margin: 12,
  },
  inputControl: {
    height: 50,
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
    borderWidth: 1,
    borderColor: "#C9D3DB",
    borderStyle: "solid",
  },
});

export default LoginScreen;
