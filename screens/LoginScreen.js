import React, { useState, useEffect, useRef } from "react";
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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert, // Make sure Alert is used or remove if not needed
} from "react-native";
import axios from "axios";
// Removed unused import: import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MyButton from "../components/MyButton";
import "../assets/global.css"; // Make sure this path is correct and the file exists
// Removed unused import: import { Ionicons } from "@expo/vector-icons";

const LoginScreen = ({ navigation }) => {
  // onLogged prop is not used
  const baseUrl = "https://learningstyle-project-back-end.onrender.com/";

  const [uname, setUname] = useState("");
  const [password, setPassword] = useState("");
  // Removed unused state: const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false); // State for 'Remember username' switch
  const [error, setError] = useState(null);
  const passwordInputRef = useRef(null); // Correctly defined ref for password input

  // Fetch saved username when component mounts
  useEffect(() => {
    AsyncStorage.getItem("saved_uname").then((value) => {
      if (value) {
        setUname(value);
        setIsEnabled(true); // Enable switch if username was saved
      }
    });
  }, []); // Empty dependency array means this runs only once on mount

  // Login action
  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    // 1. Input Validation
    if (uname.trim().length === 0) {
      setError("Имэйл хаягаа оруулна уу!"); // Please enter your email!
      setIsLoading(false);
      return;
    }
    if (password.length === 0) {
      setError("Нууц үгээ оруулна уу!"); // Please enter your password!
      setIsLoading(false);
      return;
    }

    try {
      // 2. API Call
      const response = await axios.post(`${baseUrl}api/login`, {
        uname: uname.trim(), // Send trimmed username
        password: password,
      });

      // 3. Response Handling
      if (response.data.token && response.data.user) {
        const userData = JSON.stringify(response.data.user);
        const userToken = response.data.token;

        // Save token and user data to AsyncStorage
        await AsyncStorage.setItem("user_token", userToken);
        await AsyncStorage.setItem("user_data", userData);

        // Save or remove username based on the switch state
        if (isEnabled) {
          await AsyncStorage.setItem("saved_uname", uname.trim());
        } else {
          await AsyncStorage.removeItem("saved_uname");
        }

        // console.log("Saved user data:", userData);
        // console.log("Saved token:", userToken);

        // Check for learningStyle in user data
        const userObj = response.data.user;

        // **Navigation Logic: Check if learningStyle exists**
        // Note: Currently, it navigates to "Main" in both cases.
        // You might want to navigate to "Test" if learningStyle is empty/null.
        if (userObj.learningStyle && userObj.learningStyle.length > 0) {
          // If Learning Style is defined, navigate to Main screen
          console.log("Learning style found. Navigating to Main.");
          navigation.navigate("Main");
        } else {
          // If Learning Style is not defined, navigate to Test screen (or Main as currently coded)
          console.log(
            "Learning style not found. Navigating to Main (originally intended Test?)."
          );
          navigation.navigate("Main"); // <<< Consider changing to "Test" if that's the desired flow
        }

        // Clear password field after successful login
        setPassword("");
        setError(null); // Clear any previous errors
      } else {
        // Handle cases where server response is missing token or user data
        throw new Error(
          "Серверийн хариу буруу байна. Хэрэглэгчийн мэдээлэл олдсонгүй!" // Server response incorrect. User data not found!
        );
      }
    } catch (error) {
      // 4. Error Handling
      console.error("Login error:", error);
      if (error.response) {
        // Server responded with an error status code (4xx, 5xx)
        console.error("Server error:", error.response.data);
        if (error.response.status === 401) {
          setError("Таны оруулсан нэвтрэх нэр эсвэл нууц үг буруу байна!"); // Incorrect username or password!
        } else {
          setError(
            `Алдаа гарлаа: ${
              // Error occurred:
              error.response.data.message ||
              "Сервертэй холбогдоход алдаа гарлаа." // Error connecting to server.
            }`
          );
        }
      } else if (error.request) {
        // Request was made but no response received (Network error, etc.)
        console.error("No response from server:", error.request);
        setError("Сүлжээний алдаа. Интернэт холболтоо шалгана уу."); // Network error. Check your internet connection.
      } else {
        // Error setting up the request
        console.error("Request setup error:", error.message);
        setError(`Алдаа гарлаа: ${error.message}`); // Error occurred: ...
      }
    } finally {
      // 5. Cleanup
      // Set isLoading to false after login attempt (success or failure)
      setIsLoading(false);
    }
  };

  // Function to toggle the 'Remember username' switch
  const toggleSwitch = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    // No need to remove item here; removal/saving happens during login based on isEnabled state
  };

  // Unnecessary useEffects removed

  return (
    <SafeAreaView style={styles.containerSafeArea}>
      {/* KeyboardAvoidingView helps push inputs up when keyboard appears */}
      <KeyboardAvoidingView
        style={styles.containerKeyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjust behavior for iOS/Android
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} // Optional offset
      >
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        {/* ScrollView allows scrolling if content overflows on small screens */}
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.header}>
            <Image
              alt="App Logo"
              resizeMode="cover"
              style={styles.headerImg}
              source={require("../assets/loginBackgroundTransparent.png")} // Check image path
            />
            <Image
              alt="App Logo"
              resizeMode="contain"
              style={{
                height: "13%",
                width: "100%",
                marginBottom: -100,
              }}
              source={require("../assets/nexoraBannerTransparent.png")} // Check image path
            />
          </View>

          <View style={styles.form}>
            {/* Display error message if present */}
            {error && <Text style={styles.error}>{error}</Text>}

            {/* Username input */}
            <View style={styles.inputContainer}>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address" // Or 'default' depending on username type
                onChangeText={setUname}
                placeholder="Нэвтрэх нэр" // Username
                placeholderTextColor="#6b7280"
                style={styles.inputControl}
                value={uname}
                returnKeyType="next" // Show 'Next' button on keyboard
                onSubmitEditing={() => {
                  // Focus the password input using the ref
                  passwordInputRef.current?.focus();
                }}
                blurOnSubmit={false} // Prevent keyboard dismiss on submit
                // Removed incorrect ref comment
              />
            </View>

            {/* Password input */}
            <View style={styles.inputContainer}>
              <TextInput
                // *** CORRECTED: Assign the useRef object directly to the ref prop ***
                ref={passwordInputRef}
                autoCorrect={false}
                onChangeText={setPassword}
                placeholder="Нууц үг" // Password
                placeholderTextColor="#6b7280"
                style={styles.inputControl}
                secureTextEntry={!showPassword} // Hide/show password based on state
                value={password}
                returnKeyType="done" // Show 'Done' button on keyboard
                onSubmitEditing={handleLogin} // Trigger login on pressing 'Done'
              />
              {/* Show/hide password toggle button */}
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.iconTouchable}
              >
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#aaa"
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>

            {/* Additional actions: Remember me, Forgot password */}
            <View style={styles.actionsContainer}>
              <View style={styles.switchContainer}>
                <Switch
                  trackColor={{ false: "#e5e7eb", true: "#fcd34d" }} // Nicer colors
                  thumbColor={isEnabled ? "#fbbf24" : "#f9fafb"} // Nicer colors
                  ios_backgroundColor="#e5e7eb"
                  onValueChange={toggleSwitch}
                  value={isEnabled}
                  style={styles.switch}
                />
                <Text style={styles.switchLabel}>Нэвтрэх нэр сануулах</Text>
                {/* Remember username */}
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword")} // Ensure this screen exists
              >
                <Text style={styles.forgotPasswordText}>Нууц үг мартсан?</Text>
                {/* Forgot password? */}
              </TouchableOpacity>
            </View>

            {/* Login button */}
            <MyButton
              onPress={handleLogin}
              isLoading={isLoading}
              disabled={isLoading}
            >
              <Text style={styles.btnText}>
                {isLoading ? "Нэвтрэж байна..." : "Нэвтрэх"}
                {/* Logging in... / Login */}
              </Text>
            </MyButton>
            <TouchableOpacity
              style={styles.signupTouchable}
              onPress={() => navigation.navigate("SignUp")} // Ensure this screen exists
            >
              <Text style={styles.signupText}>
                Шинэ хэрэглэгч үү?
                <Text style={styles.signupLink}> Бүртгүүлэх</Text>{" "}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  containerSafeArea: {
    flex: 1,
    marginBottom: -30,
    backgroundColor: "#fff",
  },
  containerKeyboardAvoiding: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1, // Ensure content tries to fill screen even if small
    justifyContent: "center", // Center content vertically if there's space
    paddingVertical: 24, // Vertical padding
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20, // Reduced padding
  },
  headerImg: {
    width: "100%",
    height: "60%",
    marginBottom: 16,
    marginTop: -80, // Reduced margin
  },
  title: {
    // This style is defined but not used in the JSX
    marginBottom: 6,
    paddingHorizontal: 10,
    textAlign: "center",
  },
  subtitle: {
    // This style is defined but not used in the JSX
    fontSize: 18,
    color: "#ffb22c",
    fontWeight: "600",
  },
  form: {
    flex: 1, // Try to take remaining space
    paddingHorizontal: 24,
    marginTop: -100,
    justifyContent: "center", // Try to center inputs if space allows
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 16, // Increased margin
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6", // Input background color
    borderRadius: 12, // Rounded corners
    marginBottom: 16, // Margin below input
    paddingHorizontal: 14, // Inner horizontal padding
  },
  inputControl: {
    flex: 1, // Input takes available width
    height: 50,
    fontSize: 15,
    fontWeight: "500",
    color: "#1f2937", // Text color
  },
  iconTouchable: {
    // Make icon easier to press
    padding: 8, // Padding around icon
  },
  icon: {
    marginLeft: 8, // Space from input text
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Push items to ends
    alignItems: "center",
    marginVertical: 20,
    paddingHorizontal: 4, // Slight inner padding
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  switch: {
    marginRight: 8, // Space from label
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }], // Slightly smaller (optional)
  },
  switchLabel: {
    fontSize: 14,
    color: "#4b5563", // Dark gray color
  },
  forgotPasswordText: {
    color: "#FFB22C",
    fontSize: 14,
    fontWeight: "600",
  },
  btnText: {
    fontSize: 16, // Slightly larger
    lineHeight: 24, // Line height
    fontWeight: "bold", // Bold text
    color: "#fff",
  },
  signupTouchable: {
    marginTop: 24, // Margin above
    alignSelf: "center", // Center horizontally
  },
  signupText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4b5563", // Gray color
    textAlign: "center",
  },
  signupLink: {
    color: "#FFB22C", // Link color
    fontWeight: "bold",
  },
  // Removed unused style definitions
});

export default LoginScreen;
