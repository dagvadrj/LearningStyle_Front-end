import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
  Alert
} from "react-native";
import axios from "axios";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

const ForgotPassword = ({ navigation }) => {
  const baseUrl = "https://learningstyle-project-back-end.onrender.com/";
  const [uname, setUname] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [timer, setTimer] = useState(180);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Log current step for debugging
  useEffect(() => {
    console.log("Current step:", step);
  }, [step]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && step === 2) {
      setError("Хугацаа дууслаа. Дахин код авна уу.");
      setStep(1);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Reset timer when step changes to 2
  useEffect(() => {
    if (step === 2) {
      setTimer(180);
    }
  }, [step]);

  const generateCode = async () => {
    try {
      if (!uname) {
        setError("Имэйл хаяг эсвэл утасны дугаараа оруулна уу");
        return;
      }
  
      setLoading(true);
      setError(null);
  
      const response = await axios.post(`${baseUrl}api/users/forgot-password`, { email: uname });
      console.log("Response:", response.data);
      
      if (response.data.message === "Сэргээх код амжилттай илгээгдлээ." || 
          response.data.success || 
          response.status === 200) {
        setStep(2);
        setMessage("Сэргээх код амжилттай илгээгдлээ.");
        Alert.alert("Код амжилттай илгээгдлээ.");
      } else {
        setError(response.data.error || "Алдаа гарлаа!");
      }
    } catch (error) {
      console.log("Error response:", error.response?.data);
      const responseData = error.response?.data;
      setError(responseData?.message || "Код илгээх хүсэлт явуулахад алдаа гарлаа!");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!code) {
      setError("Баталгаажуулах кодоо оруулна уу");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${baseUrl}api/users/verify-code`, {
        email: uname,
        code,
      });

      if (
        response.data.success || 
        response.data.status === "success" || 
        response.status === 200
      ) {
        setStep(3);
      } else {
        setError("Баталгаажуулах код буруу байна!");
      }
    } catch (error) {
      const responseData = error.response?.data;

      if (responseData === 400) {
        setStep(3);
      } else {
        setError(responseData?.message || "Код буруу байна!");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!password || !confirmPassword) {
      setError("Бүх талбарыг бөглөнө үү");
      return;
    }

    if (password !== confirmPassword) {
      setError("Нууц үг таарахгүй байна!");
      return;
    }

    if (password.length < 6) {
      setError("Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(`${baseUrl}api/users/reset-password`, {
        email: uname,
        newPassword: password,
      });

      if (
        response.data.success || 
        response.data.status === "success" || 
        response.status === 200
      ) {
        Alert.alert("Амжилттай", "Нууц үг амжилттай шинэчлэгдлээ", [
          { text: "OK", onPress: () => navigation.navigate("Login") }
        ]);
      } else {
        setError("Нууц үг солиход алдаа гарлаа!");
      }
    } catch (error) {
      const responseData = error.response?.data;

      if (responseData &&
          (responseData.message?.includes("success") || 
           responseData.status === "success")) {
        Alert.alert("Амжилттай", "Нууц үг амжилттай шинэчлэгдлээ", [
          { text: "OK", onPress: () => navigation.navigate("Login") }
        ]);
      } else {
        setError(responseData?.message || "Нууц үг солиход алдаа гарлаа!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Нууц үг сэргээх</Text>
      </View>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          {error && <Text style={styles.error}>{error}</Text>}
          {message && <Text style={{color:"green"}}>{message}</Text>}

          {step === 1 && (
            <>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Имэйл хаяг эсвэл утасны дугаар"
                  value={uname}
                  onChangeText={setUname}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity 
                onPress={generateCode} 
                style={[styles.btn, loading && styles.btnDisabled]}
                disabled={loading}
              >
                <Text style={styles.btnText}>
                  {loading ? "Уншиж байна..." : "Баталгаажуулах код авах"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.timerText}>
                Код ирэх хүртэл: {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Баталгаажуулах код"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                />
              </View>
              <TouchableOpacity 
                onPress={verifyCode} 
                style={[styles.btn, loading && styles.btnDisabled]}
                disabled={loading}
              >
                <Text style={styles.btnText}>
                  {loading ? "Уншиж байна..." : "Баталгаажуулах"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  setStep(1);
                  setCode("");
                }} 
                style={styles.linkBtn}
                disabled={loading}
              >
                <Text style={styles.linkText}>Дахин код авах</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 3 && (
            <>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Шинэ нууц үг"
                  value={password}
                  secureTextEntry={!showPassword}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#aaa"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Нууц үг давтах"
                  value={confirmPassword}
                  secureTextEntry={!showPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                />
              </View>
              <TouchableOpacity 
                onPress={resetPassword} 
                style={[styles.btn, loading && styles.btnDisabled]}
                disabled={loading}
              >
                <Text style={styles.btnText}>
                  {loading ? "Уншиж байна..." : "Нууц үг шинэчлэх"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableWithoutFeedback>
      <Modal visible={modalVisible} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Хэрэглэгч олдсонгүй!</Text>
            <TouchableOpacity 
              onPress={() => setModalVisible(false)} 
              style={styles.btn}
            >
              <Text style={styles.btnText}>Хаах</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", padding: 15 },
  headerTitle: { fontSize: 18, marginLeft: 10, fontWeight: "500" },
  innerContainer: {
    padding: 20,
    flex: 1,
    alignItems: "center",
  },
  inputWrapper: {
    width: "100%",
    marginBottom: 15,
    position: "relative"
  },
  input: {
    height: 50,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
    borderWidth: 1,
    borderColor: "#C9D3DB",
    width: "100%"
  },
  btn: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    width: "70%",
    height: 45,
    backgroundColor: "#FFB22C",
    marginTop: 10
  },
  btnDisabled: {
    backgroundColor: "#FFB22C99"
  },
  btnText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 16
  },
  error: { color: "red", marginBottom: 15, textAlign: "center" },
  timerText: { marginBottom: 15, fontWeight: "500" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: { 
    backgroundColor: "white", 
    padding: 20, 
    borderRadius: 10,
    width: "80%",
    alignItems: "center"
  },
  eyeIcon: { position: "absolute", right: 15, top: 13 },
  linkBtn: {
    marginTop: 15
  },
  linkText: {
    color: "#FFB22C",
    textDecorationLine: "underline"
  }
});

export default ForgotPassword;