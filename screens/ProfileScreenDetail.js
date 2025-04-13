import React, { useState, useEffect, useCallback, useRef } from "react"; // useRef нэмсэн
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform, // Platform нэмсэн
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
// MyButton import-г нэг болгох
// import MyButton from "../components/MyButton";
import * as ImagePicker from "expo-image-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Ionicons from "react-native-vector-icons/Ionicons";
// LinearGradient ашиглаагүй тул хассан
// import { LinearGradient } from "expo-linear-gradient";
// Camera, MediaLibrary зэргийг ашиглах бол import хийх
// import { Camera } from 'expo-camera';
// import * as MediaLibrary from 'expo-media-library';

// Орчуулгын функц (Компонентоос гадуур эсвэл дотор нь useCallback ашиглан тодорхойлж болно)
const translateLearningStyle = (styleKey) => {
  const learningStyleNames = {
    kinesthetic: "Практик буюу дадлага",
    visual: "Зураг, график, өнгө ашиглан суралцах арга",
    auditory: "Дуу хоолойгоор, ярилцаж суралцах арга",
    reading_writing: "Бичиж, уншиж, тэмдэглэл хийж суралцах",
  };
  // styleKey null эсвэл undefined байвал 'Тодорхойгүй' буцаана
  return learningStyleNames[styleKey] || "Тодорхойгүй";
};

const ProfileDetailScreen = ({ navigation, onLogout }) => {
  const baseUrl = "https://learningstyle-project-back-end.onrender.com/";
  const [user, setUser] = useState(null); // Эхлэлд null байх нь дээр
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [register, setRegister] = useState("");
  const [learningStyle, setLearningStyle] = useState(""); // API-с ирсэн key-г хадгална (жишээ нь: "kinesthetic")
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userPhoto, setUserPhoto] = useState(null); // Зургийн URI эсвэл null
  const [angi, setAngi] = useState("");
  const [myDescription, setMyDescription] = useState(""); // Description-г array биш string болгосон
  // learningStyleName state шаардлагагүй болсон
  // const [learningStyleName, setLearningStyleName] = useState("");

  // Зураг авах/сонгох зөвшөөрөл (Шаардлагатай бол)
  // const [hasCameraPermission, setHasCameraPermission] = useState(null);
  // const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState(null);
  // const cameraRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true); // Ачааллаж эхлэх
      try {
        const token = await AsyncStorage.getItem("user_token");
        if (token) {
          const response = await axios.get(`${baseUrl}api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data) {
            const userData = response.data;
            setUser(userData);
            setFirstName(userData.first_name || "");
            setLastName(userData.last_name || "");
            setEmail(userData.email || "");
            setRegister(userData.register || "");
            setPhoneNumber(userData.phone_number || "");
            setAngi(response.data.class || "");
            setUserPhoto(userData.user_photo ? `${baseUrl}public${userData.user_photo}` : null);
            setMyDescription(userData.description || ""); // Description string байх ёстой
            setLearningStyle(userData.learningStyle || ""); // learningStyle state-г шинэчлэх

            // learningStyleName state-г ашиглах шаардлагагүй болсон
            // const learningStyleNames = { ... };
            // setLearningStyleName(learningStyleNames[userData.learningStyle] || "Тодорхойгүй");
            console.log(response.data.class)
          } else {
             // response.data байхгүй тохиолдолд хэрэглэгчийг null болгох
             setUser(null);
             Alert.alert("Алдаа", "Хэрэглэгчийн мэдээлэл олдсонгүй.");
          }
        } else {
           // Токен байхгүй бол хэрэглэгчийг null болгох
           setUser(null);
           console.log("Токен олдсонгүй.");
        }
      } catch (error) {
        setUser(null); // Алдаа гарвал хэрэглэгчийг null болгох
        console.error("Хэрэглэгчийн мэдээлэл татах үед алдаа:", error);
        // Хэрэглэгчид ойлгомжтой алдааны мэдээлэл харуулах
        if (error.response && error.response.status === 401) {
           Alert.alert("Алдаа", "Нэвтрэх хугацаа дууссан. Дахин нэвтэрнэ үү.");
           // Логин руу үсэргэх эсвэл logout хийх
           handleLogout(); // Эсвэл navigation.navigate('Login');
        } else {
           Alert.alert("Алдаа", "Хэрэглэгчийн мэдээлэл татахад алдаа гарлаа.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []); // Эхний удаа ажиллана

  // Камерын зөвшөөрөл авах useEffect (шаардлагатай бол)
  // useEffect(() => {
  //   (async () => {
  //     try {
  //         const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
  //         const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
  //         setHasCameraPermission(cameraStatus === 'granted');
  //         setHasMediaLibraryPermission(mediaStatus === 'granted');
  //     } catch (e) {
  //         console.error("Зөвшөөрөл асуухад алдаа:", e);
  //         Alert.alert("Алдаа", "Камер эсвэл медиа сангийн зөвшөөрөл авахад алдаа гарлаа.");
  //     }
  //   })();
  // }, []);

  // Галерейгаас зураг сонгох
  const handleImagePick = async () => {
    try {
       // Зөвшөөрөл шалгах (iOS дээр заавал шаардлагагүй ч Android дээр хэрэгтэй)
       const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Зөвшөөрөл шаардлагатай', 'Зураг сонгохын тулд медиа сангийн зөвшөөрөл олгоно уу.');
          return;
        }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Профайл зураг тул 1:1 байвал зүгээр
        quality: 0.7, // Чанарыг багасгаж файлын хэмжээг багасгах
      });

      // result.canceled -> result.cancelled (хуучин хувилбарт)
      if (!result.canceled && result.assets && result.assets.length > 0) {
         // Шинэ хувилбарт assets массив дотор мэдээлэл ирнэ
        setUserPhoto(result.assets[0].uri); // Сонгосон зургийн URI-г state-д хадгалах
        // Энд шууд upload хийх эсвэл handleSave дотор upload хийхээр тохируулж болно
      }
    } catch (error) {
        console.error("Зураг сонгоход алдаа гарлаа:", error);
        Alert.alert("Алдаа", "Зураг сонгоход алдаа гарлаа.");
    }
  };

  // Камераас зураг авах (шаардлагатай бол)
  // const takePicture = async () => {
  //   if (!hasCameraPermission) {
  //       Alert.alert('Зөвшөөрөл шаардлагатай', 'Зураг авахын тулд камерын зөвшөөрөл олгоно уу.');
  //       return;
  //   }
  //   if (cameraRef.current) {
  //      try {
  //           let photo = await cameraRef.current.takePictureAsync({
  //               quality: 0.7,
  //               base64: false, // Base64 ихэвчлэн шаардлагагүй, URI-г ашиглах нь дээр
  //           });
  //           setUserPhoto(photo.uri);
  //           // Энд шууд upload хийх эсвэл handleSave дотор upload хийхээр тохируулж болно
  //      } catch (error) {
  //           console.error("Зураг авахад алдаа:", error);
  //           Alert.alert("Алдаа", "Зураг авахад алдаа гарлаа.");
  //      }
  //   }
  // };

  // Мэдээлэл хадгалах
  const handleSave = async () => {
    if (!user || !user._id) {
      Alert.alert("Алдаа", "Хэрэглэгчийн мэдээлэл олдсонгүй. Дахин нэвтэрнэ үү.");
      return;
    }

    const token = await AsyncStorage.getItem("user_token");
    if (!token) {
      Alert.alert("Алдаа", "Токен олдсонгүй. Та дахин нэвтэрнэ үү.");
      // Шаардлагатай бол login руу үсэргэх
      // navigation.navigate("Login");
      return;
    }

    setLoading(true); // Хадгалж эхлэх үед loading гаргах

    try {
      const formData = new FormData();
      let hasChanges = false; // Өөрчлөлт орсон эсэхийг хянах flag

      // Талбар бүрийг анхны утгатай нь харьцуулж, өөрчлөгдсөн бол нэмнэ
      if (firstName !== user.first_name) {
         formData.append("first_name", firstName);
         hasChanges = true;
      }
      if (lastName !== user.last_name) {
         formData.append("last_name", lastName);
         hasChanges = true;
      }
      // Email өөрчлөх боломжгүй байвал энэ шалгалтыг хасах
      if (email !== user.email) {
        formData.append("email", email);
        hasChanges = true;
      }
       // Регистр өөрчлөх боломжгүй байвал энэ шалгалтыг хасах
       if (register !== user.register) {
        formData.append("register", register);
        hasChanges = true;
      }
      if (phoneNumber !== user.phone_number) {
        formData.append("phone_number", phoneNumber);
        hasChanges = true;
      }
      if (angi !== user.class) {
        formData.append("class", angi);
        hasChanges = true;
      }
       // Description-г string болгосон тул шууд харьцуулна
      if (myDescription !== (user.description || "")) {
         formData.append("description", myDescription);
         hasChanges = true;
      }
      // Learning style өөрчлөх боломжгүй бол энэ шалгалтыг хасах
      if (learningStyle !== user.learningStyle) {
        formData.append("learningStyle", learningStyle);
        hasChanges = true;
      }

      // Зураг шинээр сонгогдсон эсэхийг шалгах (userPhoto state нь анхны URL биш, шинэ URI болсон эсэх)
       // Анхны зураг null биш, одоогийн userPhoto нь анхныхоос өөр URI байвал
       const initialPhotoUrl = user.user_photo ? `${baseUrl}public${user.user_photo}` : null;
       if (userPhoto && userPhoto !== initialPhotoUrl) {
            // Шинэ зураг сонгогдсон байна
            const uriParts = userPhoto.split('.');
            const fileType = uriParts[uriParts.length - 1];
            formData.append('user_photo', {
                uri: Platform.OS === 'android' ? userPhoto : userPhoto.replace('file://', ''), // Android, iOS path ялгаатай байж болно
                name: `photo_${user._id}.${fileType}`, // Файлын нэр
                type: `image/${fileType}`, // MIME type
            });
            hasChanges = true;
            console.log("Шинэ зураг нэмэгдлээ:", formData.get('user_photo'));
       }


       // formData._parts ажиллахгүй байж магадгүй тул flag ашигласан нь дээр
      if (!hasChanges) {
        Alert.alert("Анхаар!", "Ямар нэг мэдээлэл өөрчлөгдөөгүй байна.");
        setLoading(false); // Loading зогсоох
        return;
      }

       console.log('Sending FormData:', formData); // Ямар дата явж байгааг шалгах

      const response = await axios.patch(
        `${baseUrl}api/users/${user._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Content-Type-г заавал 'multipart/form-data' гэж өгөх шаардлагагүй, axios ихэвчлэн автоматаар танина
            // 'Content-Type': 'multipart/form-data',
          },
           // Upload явцыг харуулах (сонголтоор)
           /*
           onUploadProgress: progressEvent => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log(`Upload Progress: ${percentCompleted}%`);
           }
           */
        }
      );

       console.log("Update response:", response.data); // Серверээс ирсэн хариуг шалгах

      // Серверээс шинэчлэгдсэн хэрэглэгчийн мэдээллийг авах (response.data.user эсвэл response.data гэх мэт)
       // Backend response ямар байгаагаас хамаарна
       const updatedUserData = response.data.user || response.data;

      if(updatedUserData) {
          // AsyncStorage-г шинэ мэдээллээр солих
          await AsyncStorage.setItem("user_data", JSON.stringify(updatedUserData));

          // Компонентийн state-г шинэчлэх
          setUser(updatedUserData);
          setFirstName(updatedUserData.first_name || "");
          setLastName(updatedUserData.last_name || "");
          setEmail(updatedUserData.email || "");
          setRegister(updatedUserData.register || "");
          setPhoneNumber(updatedUserData.phone_number || "");
          setAngi(updatedUserData.class || "");
           setUserPhoto(updatedUserData.user_photo ? `${baseUrl}public${updatedUserData.user_photo}` : null);
          setMyDescription(updatedUserData.description || "");
          setLearningStyle(updatedUserData.learningStyle || "");

          Alert.alert("Амжилттай", "Мэдээлэл шинэчлэгдлээ!");
      } else {
           Alert.alert("Анхаар", "Мэдээлэл хадгалагдсан ч шинэчлэгдсэн дата ирсэнгүй.");
      }

    } catch (error) {
      console.error("Мэдээлэл хадгалах үед алдаа:", error);
       if (error.response) {
         // Серверээс ирсэн алдааны мэдээллийг харуулах
         console.error("Серверийн алдаа:", error.response.data);
         const message = error.response.data?.message || error.response.data?.error || `Серверийн алдаа: ${error.response.status}`;
         Alert.alert("Алдаа", message);
       } else if (error.request) {
         Alert.alert("Алдаа", "Сервертэй холбогдож чадсангүй. Интернэт холболтоо шалгана уу.");
       } else {
         Alert.alert("Алдаа", "Мэдээлэл шинэчлэх явцад тодорхойгүй алдаа гарлаа.");
       }
    } finally {
      setLoading(false); // Алдаа гарсан ч, амжилттай болсон ч loading зогсоох
    }
  };

  // Гарах үйлдэл
  // const handleLogout = async () => {
  //   try {
  //       setLoading(true); // гарч байхад loading харуулах
  //       await AsyncStorage.removeItem("user_token");
  //       await AsyncStorage.removeItem("user_data");
  //       // Шаардлагатай бол бусад хадгалсан зүйлсийг устгах
  //       // await AsyncStorage.removeItem("saved_uname");

  //       setUser(null); // Хэрэглэгчийн мэдээллийг state-с устгах
  //       if (onLogout) { // Хэрэв parent component-с onLogout функц дамжуулсан бол дуудах
  //           onLogout();
  //       }
  //       // Login дэлгэц рүү шилжих
  //       // navigation.navigate("Login"); // эсвэл replace ашиглах
  //        navigation.replace('Login'); // replace нь stack-с одоогийн дэлгэцийг хасна
  //   } catch (error) {
  //       console.error("Гарах үед алдаа:", error);
  //       Alert.alert("Алдаа", "Системээс гарахад алдаа гарлаа.");
  //       setLoading(false); // Алдаа гарвал loading зогсоох
  //   }
  //    // setLoading(false) finally блокт байх ёсгүй, учир нь navigation хийсний дараа unmount болно.
  // };

  // Ачааллаж байх үед харуулах UI
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#FFB22C" />
        <Text style={{ marginTop: 10, color: "#555" }}>Ачааллаж байна...</Text>
      </View>
    );
  }

  // Хэрэглэгч нэвтрээгүй эсвэл мэдээлэл татаж чадаагүй үед харуулах UI
  if (!user) {
    return (
      <SafeAreaView style={styles.loggedOutContainer}>
         <View style={styles.header}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={{padding: 5}}>
             <Ionicons name="chevron-back-outline" size={30} color="black" />
           </TouchableOpacity>
           <Text style={styles.headerTitle}>Миний мэдээлэл</Text>
         </View>
        <View style={styles.loggedOutContent}>
          <Ionicons name="person-circle-outline" size={80} color="#ccc" />
          <Text style={styles.loggedOutText}>
            Та нэвтэрч орно уу.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.replace("Login")}
          >
            <Text style={styles.loginButtonText}>Нэвтрэх</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Хэрэглэгч нэвтэрсэн үед харуулах UI
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
          <Ionicons name="chevron-back-outline" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Миний мэдээлэл</Text>
        {/* Гарах товчийг header-т байрлуулах нь илүү цэвэрхэн байж болно */}
         
      </View>
      <KeyboardAwareScrollView
         style={styles.scrollView}
         contentContainerStyle={styles.scrollViewContent}
         enableOnAndroid={true}
         extraScrollHeight={Platform.OS === 'ios' ? 40 : 0}
         keyboardShouldPersistTaps='handled' // Keyboard нээлттэй үед scroll доторх товч дарагдах боломжтой болгох
      >
        {/* Профайл зураг */}
        <View style={styles.imageContainer}>
          <Image
            // source={userPhoto ? { uri: userPhoto } : require("../assets/user_logo.jpg")}
            // Замыг шалгах: ../assets/user_logo.jpg эсвэл ./assets/user_logo.jpg
             source={
              //userPhoto ? { uri: userPhoto } : 
              require("../assets/user_logo.jpg")}
            style={styles.profileImage}
          />
           {/* Зураг солих товч */}
          <TouchableOpacity
            style={styles.imageButton}
            disabled
            onPress={handleImagePick} // Зураг сонгох функц дуудна
          >
            <Icon name="camera" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Нэр, Овог */}
        <View style={styles.rowContainer}>
          <View style={styles.column}>
            <Text style={styles.label}>Овог</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Овог"
            />
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Нэр</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Нэр"
            />
          </View>
        </View>

        {/* И-мэйл */}
        <Text style={styles.label}>И-мэйл</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="you@example.com"
          // editable={false} // Имэйлийг өөрчлөх боломжгүй болгох
        />

        {/* Утас, Регистр */}
        <View style={styles.rowContainer}>
          <View style={styles.column}>
            <Text style={styles.label}>Утасны дугаар</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder="99xxxxxx"
            />
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Регистрийн дугаар</Text>
            <TextInput
              style={styles.input}
              value={register}
              onChangeText={setRegister}
              autoCapitalize="characters" // Том үсгээр бичүүлэх
              placeholder="АА00000000"
              // editable={false} // Регистрийг өөрчлөх боломжгүй болгох
            />
          </View>
        </View>

        {/* Сурах чиглэл */}
        <Text style={styles.label}>Миний сурах чиглэл</Text>
        <TextInput
          style={[styles.input, styles.readOnlyInput]} // Засах боломжгүй бол өөр стиль өгөх
          // Орчуулсан утгыг харуулах
          value={translateLearningStyle(learningStyle)}
          editable={false} // Засах боломжгүй
        />

        {/* Анги */}
        <Text style={styles.label}>Анги</Text>
        <TextInput
          style={styles.input}
          value={angi}
          onChangeText={setAngi}
          placeholder="Анги бүлэг"
        />

        {/* Дэлгэрэнгүй */}
        <Text style={styles.label}>Миний тухай</Text>
        <TextInput
          style={styles.descriptionInput}
          multiline
          numberOfLines={4}
          value={myDescription} // String state-г ашиглана
          onChangeText={setMyDescription} // Шууд string-р шинэчилнэ
          placeholder="Өөрийн тухай товч..."
          textAlignVertical="top" // Android дээр текст дээрээс эхлэх
        />

      </KeyboardAwareScrollView>

        {/* Хадгалах товч (KeyboardAwareScrollView-н гадна байрлуулсан нь дээр) */}
        <TouchableOpacity style={styles.buttonSave} onPress={handleSave} disabled={loading}>
            <Text style={styles.btnSaveText}>Хадгалах</Text>
        </TouchableOpacity>

      {/* Гарах товч (absolute position - хуучнаар) */}
      {/* <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
             <Icon name="log-out" size={24} color="white" />
           </TouchableOpacity> */}

    </SafeAreaView>
  );
};

// Стильүүдийг шинэчилсэн
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: { // Энэ стиль одоо safeArea-р солигдсон байж магадгүй
    flex: 1,
    backgroundColor: "#fff",
    // paddingHorizontal: 20, // padding-г ScrollView дотор өгөх нь дээр
  },
  scrollView: {
     flex: 1,
  },
  scrollViewContent: {
      paddingHorizontal: 20, // Хажуугийн зай
      paddingBottom: 80, // Доод талд товч дарагдах зай
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10, // Бага зэрэг зай
    paddingHorizontal: 15, // Хажуугийн зай
    borderBottomWidth: 1, // Доогуур зураас
    borderBottomColor: "#eee", // Цайвар зураас
    backgroundColor: '#fff', // Дэвсгэр өнгө
  },
  headerTitle: {
     flex: 1, // Дунд хэсгийг эзлэх
     fontSize: 18,
     fontWeight: "600", // Бага зэрэг тод
     color: "black",
     textAlign: 'center', // Голлуулах
     marginLeft: -30, // Буцах товчны зайг тооцож голлуулах (тохируулах)
  },
   headerLogoutButton: {
      padding: 5,
      marginLeft: 'auto', // Баруун талд шахах
   },
  imageContainer: {
    alignItems: "center", // Голд байрлуулах
    marginVertical: 20, // Дээр доор зай
    position: "relative", // Доторх absolute товчны суурь
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60, // Бүрэн дугуй
    borderWidth: 3, // Хүрээг зузаатгасан
    borderColor: "#FFB22C",
    backgroundColor: '#e0e0e0', // Зураггүй үед харагдах дэвсгэр
  },
  imageButton: {
    position: "absolute",
    bottom: 0, // Зургийн доод талд
    right: '35%', // Зургийн баруун доод буланд (тохируулах)
    transform: [{ translateX: 15 }], // Байрлалыг бага зэрэг тохируулах
    width: 36, // Хэмжээг томсгосон
    height: 36,
    borderRadius: 18, // Дугуй
    backgroundColor: "#FFB22C",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: '#fff', // Цагаан хүрээ
    // Сүүдэр нэмэх (iOS & Android)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Хоёр тийш нь хуваарилах
    marginBottom: 15,
    marginTop: 15, // Доорх элементээс зай
  },
  column: {
    width: "48%", // Баганын өргөн (хооронд нь зай үлдээнэ)
  },
  label: {
    fontSize: 14, // Бага зэрэг жижиг
    fontWeight: "600", // Тодруулсан
    color: "#333", // Бараан өнгө
    marginBottom: 6,
    marginTop: 15, // Input-с авах зай
  },
  input: {
    backgroundColor: '#f7f7f7', // Цайвар саарал дэвсгэр
    borderWidth: 1,
    borderColor: "#ddd", // Цайвар хүрээ
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10, // Өндрийг тохируулах
    fontSize: 15,
    color: '#333',
    // marginBottom: 15, // rowContainer эсвэл column-д өгсөн зай
  },
  readOnlyInput: {
      backgroundColor: '#eee', // Засах боломжгүйг илтгэх өнгө
      color: '#555', // Текстний өнгө
  },
  descriptionInput: {
    backgroundColor: '#f7f7f7',
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
    height: 100, // Өндрийг тодорхой зааж өгөх
    textAlignVertical: "top", // Android дээр
    marginBottom: 20,
  },
  buttonSave: {
    backgroundColor: "#FFB22C",
    paddingVertical: 14, // Товчны өндрийг нэмсэн
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20, // Хажуугаас зай авах
    marginBottom: 15, // Доороос зай авах
     position: 'absolute', // Дэлгэцийн доод хэсэгт байрлуулах
     bottom: 10,
     left: 20,
     right: 20,
  },
  btnSaveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Хуучин logout button стиль (хэрэггүй болсон)
  // logoutButton: { ... },

  // Нэвтрээгүй үеийн стильүүд
  loggedOutContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loggedOutContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  loggedOutText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#FFB22C',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileDetailScreen;