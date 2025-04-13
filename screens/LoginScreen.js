import React, { useState, useEffect,useRef  } from "react";
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
  Alert // Alert-г import хийхээ мартсан байж магадгүй тул нэмсэн
} from "react-native";
import axios from "axios";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"; // Энэ импортыг ашиглаагүй тул шаардлагагүй бол хасаж болно
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MyButton from "../components/MyButton";
import "../assets/global.css";
import { Ionicons } from "@expo/vector-icons"; // Энэ импортыг ашиглаагүй тул шаардлагагүй бол хасаж болно

const LoginScreen = ({ navigation }) => { // onLogged проп ашиглагдаагүй байна
  const baseUrl = "https://learningstyle-project-back-end.onrender.com/";

  const [uname, setUname] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(""); // Энэ state ашиглагдаагүй байна
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false); // 'Нэвтрэх нэр сануулах' switch-ийн state
  const [error, setError] = useState(null);
  const passwordInputRef = useRef(null);

  // Компонент анх mount хийгдэхэд сануулсан нэвтрэх нэрийг татах
  useEffect(() => {
    AsyncStorage.getItem("saved_uname").then((value) => {
      if (value) {
        setUname(value);
        setIsEnabled(true); // Сануулсан нэр байвал switch-г идэвхтэй болгох
      }
    });
  }, []); // Хоосон dependency array нь зөвхөн анх mount хийгдэхэд ажиллана гэсэн үг

  // Нэвтрэх үйлдэл
  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    // 1. Input Validation (Оролтын шалгалт)
    if (uname.trim().length === 0) { // trim() нэмж хоосон зайг шалгах
      setError("Имэйл хаягаа оруулна уу!");
      setIsLoading(false);
      return;
    }
    if (password.length === 0) {
      setError("Нууц үгээ оруулна уу!");
      setIsLoading(false);
      return;
    }

    try {
      // 2. API Call (Сервер лүү хүсэлт илгээх)
      const response = await axios.post(`${baseUrl}api/login`, {
        uname: uname.trim(), // Хоосон зайг арилгаад илгээх
        password: password,
      });

      // 3. Response Handling (Хариуг боловсруулах)
      if (response.data.token && response.data.user) {
        const userData = JSON.stringify(response.data.user);
        const userToken = response.data.token;

        // Token болон хэрэглэгчийн мэдээллийг AsyncStorage-д хадгалах
        await AsyncStorage.setItem("user_token", userToken);
        await AsyncStorage.setItem("user_data", userData);

        // "Нэвтрэх нэр сануулах" сонгосон бол нэвтрэх нэрийг хадгалах, үгүй бол устгах
        if (isEnabled) {
            await AsyncStorage.setItem("saved_uname", uname.trim());
        } else {
            await AsyncStorage.removeItem("saved_uname");
        }


        // console.log("Хадгалсан хэрэглэгчийн мэдээлэл:", userData);
        // console.log("Хадгалсан токен:", userToken);

        // Хэрэглэгчийн мэдээллээс learningStyle-г шалгах
        const userObj = response.data.user;

        // **Гол логик: learningStyle байгаа эсэхийг шалгах**
        // - userObj.learningStyle үнэн (null, undefined биш) БА
        // - userObj.learningStyle нь хоосон биш (string эсвэл array байж болзошгүй тул length-г шалгана)
        if (userObj.learningStyle && userObj.learningStyle.length > 0) {
          // Learning Style тодорхойлогдсон бол Main дэлгэц рүү шилжих
          console.log("Learning style олдлоо. Main руу шилжиж байна.");
          navigation.navigate("Main");
          // Эсвэл onLogged функц байвал дуудах (Жишээ нь: onLogged(true); )
        } else {
          // Learning Style тодорхойлогдоогүй бол Test дэлгэц рүү шилжих
          console.log("Learning style олдсонгүй. Test рүү шилжиж байна.");
          navigation.navigate("Main");
          // Эсвэл onLogged функц байвал дуудах (Жишээ нь: onLogged(true); )
        }

        // Нэвтрэлт амжилттай болсны дараа нууц үгийн талбарыг цэвэрлэх
        setPassword("");
        setError(null); // Алдааг арилгах

      } else {
        // Серверээс токен эсвэл хэрэглэгчийн мэдээлэл ирээгүй тохиолдол
        throw new Error("Серверийн хариу буруу байна. Хэрэглэгчийн мэдээлэл олдсонгүй!");
      }
    } catch (error) {
      // 4. Error Handling (Алдааг барих)
      console.error("Нэвтрэх үед алдаа гарлаа:", error);
      if (error.response) {
        // Серверээс алдааны статус кодтой хариу ирсэн (4xx, 5xx)
        console.error("Серверийн алдаа:", error.response.data);
        // Жишээ нь, 401 (Unauthorized) үед тодорхой мессеж харуулах
        if (error.response.status === 401) {
          setError("Таны оруулсан нэвтрэх нэр эсвэл нууц үг буруу байна!");
        } else {
           setError(`Алдаа гарлаа: ${error.response.data.message || "Сервертэй холбогдоход алдаа гарлаа."}`);
        }
      } else if (error.request) {
        // Хүсэлт илгээгдсэн ч хариу ирээгүй (Сүлжээний алдаа гэх мэт)
        console.error("Серверээс хариу ирсэнгүй:", error.request);
        setError("Сүлжээний алдаа. Интернэт холболтоо шалгана уу.");
      } else {
        // Хүсэлтийг тохируулах үед алдаа гарсан
        console.error("Хүсэлт тохируулах үеийн алдаа:", error.message);
        setError(`Алдаа гарлаа: ${error.message}`);
      }
    } finally {
      // 5. Cleanup (Цэвэрлэгээ)
      // Нэвтрэх оролдлого дууссаны дараа (амжилттай эсвэл алдаатай) isLoading-г false болгох
      setIsLoading(false);
    }
  };

  // "Нэвтрэх нэр сануулах" switch-ийн утгыг өөрчлөх функц
  const toggleSwitch = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    // Switch-г унтраах үед хадгалсан нэрийг шууд устгах шаардлагагүй.
    // Нэвтрэх үед isEnabled утгаар нь хадгалах эсэхийг шийднэ.
    // if (!newState) {
    //   AsyncStorage.removeItem("saved_uname");
    // }
  };

  // Энэ хэсэг useEffect дотор байх ёстой эсвэл хэрэггүй бол устгах.
  // Яагаад гэвэл энэ нь render бүрт дуудагдаж, state-г байнга шинэчилнэ.
  // useEffect(() => {
  //   AsyncStorage.getItem("user_token")
  //     .then((result) => setToken(result)) // setToken ашиглагдаагүй тул энэ хэсэг шаардлагагүй байж магадгүй
  //     .catch((err) => console.error("Токен татах үед алдаа:", err.message));
  // }, []);


  // Энэ useEffect нь зөвхөн user_data-г авч байна, юу ч хийхгүй байна.
  // Шаардлагагүй бол устгаж болно.
  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     const storedUserData = await AsyncStorage.getItem("user_data");
  //     // console.log("Storage-с авсан хэрэглэгчийн дата:", storedUserData);
  //   };
  //   fetchUserData();
  // }, []);

  return (
    <SafeAreaView style={styles.containerSafeArea}>
      {/* KeyboardAvoidingView нь гар гарч ирэхэд input талбаруудыг түлхэхэд тусална */}
      <KeyboardAvoidingView
        style={styles.containerKeyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : "height"} // iOS болон Android-д тохируулах
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} // Шаардлагатай бол offset тохируулах
      >
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        {/* ScrollView нэмснээр жижиг дэлгэцтэй үед агуулга багтахгүй бол гүйлгэх боломжтой болно */}
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.header}>
              <Image
                alt="App Logo"
                resizeMode="contain"
                style={styles.headerImg}
                source={require("../assets/nexoraLogoWhite.png")} // Замыг шалгаарай
              />
              <Text style={styles.title}>
                <Text style={styles.subtitle}>
                Өнөөдөр дотор маргааш багтадаг
                </Text>
              </Text>
            </View>

            <View style={styles.form}>
              {/* Алдааны мэдээллийг харуулах хэсэг */}
              {error && <Text style={styles.error}>{error}</Text>}

              {/* Нэвтрэх нэрний input */}
              <View style={styles.inputContainer}>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address" // Эсвэл 'default' байж болно, username-с шалтгаална
                  onChangeText={setUname}
                  placeholder="Нэвтрэх нэр"
                  placeholderTextColor="#6b7280"
                  style={styles.inputControl}
                  value={uname}
                  returnKeyType="next" // Дараагийн талбар луу шилжих товч
                  onSubmitEditing={() => {
                    // passwordInputRef.current рүү фокусыг шилжүүлнэ
                    // ?. ашиглах нь ref холбогдоогүй байх үеийн алдаанаас сэргийлнэ
                    passwordInputRef.current?.focus();
                  }}
                  blurOnSubmit={false}
                  // 3. Буруу ref-г устгах
                  // ref={(input) => { this.passwordInput = input; }}
                />
              </View>

              {/* Нууц үгний input */}
              <View style={styles.inputContainer}>
                <TextInput
                  ref={(input) => { this.passwordInput = input; }} // Нууц үгийн input-д ref оноох
                  autoCorrect={false}
                  onChangeText={setPassword}
                  placeholder="Нууц үг"
                  placeholderTextColor="#6b7280"
                  style={styles.inputControl}
                  secureTextEntry={!showPassword} // Нууц үгийг нуух/харуулах
                  value={password}
                  returnKeyType="done" // Keyboard дээр 'Done' товч харуулах
                  onSubmitEditing={handleLogin} 
                />
                {/* Нууц үг харах/нуух товч */}
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconTouchable}>
                  <MaterialCommunityIcons
                    name={showPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#aaa"
                    style={styles.icon}
                  />
                </TouchableOpacity>
              </View>

              {/* Нэмэлт үйлдлүүд: Сануулах, Нууц үг мартсан */}
              <View style={styles.actionsContainer}>
                <View style={styles.switchContainer}>
                  <Switch
                    trackColor={{ false: "#e5e7eb", true: "#fcd34d" }} // Илүү гоё өнгө
                    thumbColor={isEnabled ? "#fbbf24" : "#f9fafb"} // Илүү гоё өнгө
                    ios_backgroundColor="#e5e7eb"
                    onValueChange={toggleSwitch}
                    value={isEnabled}
                    style={styles.switch}
                  />
                  <Text style={styles.switchLabel}>Нэвтрэх нэр сануулах</Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate("ForgotPassword")} // Энэ дэлгэц байгаа эсэхийг шалгаарай
                >
                  <Text style={styles.forgotPasswordText}>Нууц үг мартсан?</Text>
                </TouchableOpacity>
              </View>

              {/* Нэвтрэх товч */}
              <MyButton onPress={handleLogin} isLoading={isLoading} disabled={isLoading}>
                <Text style={styles.btnText}>
                  {isLoading ? "Нэвтрэж байна..." : "Нэвтрэх"}
                </Text>
              </MyButton>

              {/* Бүртгүүлэх хэсэг рүү шилжих товч */}
              <TouchableOpacity
                style={styles.signupTouchable}
                onPress={() => navigation.navigate("SignUp")} // Энэ дэлгэц байгаа эсэхийг шалгаарай
              >
                <Text style={styles.signupText}>
                  Шинэ хэрэглэгч үү? <Text style={styles.signupLink}>Бүртгүүлэх</Text>
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
    backgroundColor: "#fff",
  },
  containerKeyboardAvoiding: {
    flex: 1,
  },
   scrollViewContent: {
    flexGrow: 1, // Агуулга дэлгэцнээс бага байсан ч дэлгэцийг дүүргэх оролдлого хийнэ
    justifyContent: 'center', // Агуулгыг босоо тэнхлэгт голлуулах (хэрэв хангалттай зай байвал)
    paddingVertical: 24, // Дээр доор зай авах
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20, // Зайг багасгасан
  },
  headerImg: {
    width: 80,
    height: 80,
    marginBottom: 16, // Зайг багасгасан
  },
   title: { // Үндсэн гарчиг (ерөнхий container)
    marginBottom: 6,
    paddingHorizontal: 10, // Хажуу талаас зай авах
    textAlign: 'center', // Голлуулах
  },
  subtitle: { // Доторх текстний стиль
    fontSize: 18, // Хэмжээг багасгасан
    color: "#ffb22c",
    fontWeight: "600", // Бага зэрэг тодруулсан
  },
  form: {
    flex: 1, // Үлдсэн зайг эзлэх оролдлого хийнэ
    paddingHorizontal: 24,
    justifyContent: 'center', // Талбаруудыг голлуулах оролдлого (хэрэв зай байвал)
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 16, // Зайг нэмсэн
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: '#f3f4f6', // Input-н дэвсгэр өнгө
    borderRadius: 12, // Булан дугуйлах
    marginBottom: 16, // Доорх элементээс авах зай
    paddingHorizontal: 14, // Доторх зүүн, баруун зай
    // borderBottomWidth: 1, // Зөвхөн доогуур зураас үлдээх (сонголтоор)
    // borderColor: '#d1d5db',
  },
  inputControl: {
    flex: 1, // Input талбар боломжит өргөнийг эзэлнэ
    height: 50,
    fontSize: 15,
    fontWeight: "500",
    color: "#1f2937", // Текстний өнгө
    // backgroundColor: "#fff", // Дээрх container-т өнгө өгсөн тул энд шаардлагагүй
    // paddingHorizontal: 16, // Container-т өгсөн тул энд багасгах эсвэл авах
    // paddingVertical: 10, // height өгсөн тул шаардлагагүй байж магадгүй
    // borderRadius: 10, // Container-т өгсөн
    // borderWidth: 1, // Container-т өгсөн эсвэл өөр стиль хэрэглэсэн
    // borderColor: "#C9D3DB",
    // borderStyle: "solid",
  },
  iconTouchable: { // Icon-г дарахад илүү том талбайтай болгох
     padding: 8, // Icon орчим зай авах
  },
  icon: {
    // position: "absolute", // Шаардлагагүй, flexbox-р зохицуулна
    // right: 10, // Шаардлагагүй
     marginLeft: 8, // Input-с авах зай
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Хоёр тийш нь шахах
    alignItems: "center",
    marginVertical: 20,
    paddingHorizontal: 4, // Бага зэрэг дотор зай
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switch: {
    marginRight: 8, // Текстнээс авах зай
     transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] // Бага зэрэг жижигрүүлэх (заавал биш)
  },
  switchLabel: {
    fontSize: 14,
    color: '#4b5563', // Бараан саарал өнгө
  },
  forgotPasswordText: {
    color: "#FFB22C",
    fontSize: 14,
    fontWeight: '600',
  },
  btnText: {
    fontSize: 16, // Бага зэрэг томсгосон
    lineHeight: 24, // Мөр хоорондын зай
    fontWeight: "bold", // Bold болгосон
    color: "#fff",
  },
  signupTouchable: {
    marginTop: 24, // Дээрх товчноос авах зай
    alignSelf: "center", // Голд байрлуулах
  },
  signupText: {
    fontSize: 14,
    fontWeight: "500",
    color: '#4b5563', // Саарал өнгө
    textAlign: "center",
  },
  signupLink: {
     color: "#FFB22C", // Холбоосны өнгө
     fontWeight: "bold",
  },
  // Шаардлагагүй стильүүдийг устгасан (formLink, backArrow, backArrowTitle, formFooter, input, inputLabel г.м)
});

export default LoginScreen;