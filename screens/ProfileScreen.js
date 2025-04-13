import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  Alert, // Alert нэмсэн
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Feather from "@expo/vector-icons/Feather";

// Constants
const BASE_URL = "https://learningstyle-project-back-end.onrender.com/";
const LEARNING_STYLE_NAMES = {
  kinesthetic: "Практик", // Нэрийг богиносгосон
  visual: "Визуал",
  auditory: "Сонсгол",
  reading_writing: "Унших/Бичих",
};

// Helper function for translating learning style
const translateLearningStyle = (styleKey) => {
  return LEARNING_STYLE_NAMES[styleKey] || "Тодорхойгүй";
};

function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  // learningStyleName state-г тусдаа байлгах шаардлагагүй, user state-с шууд гаргаж авч болно
  // const [learningStyleName, setLearningStyleName] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null); // Алдаа хадгалах state

  // Гарах функц
  const handleLogout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(["user_token", "user_data"]); // Олон зүйлсийг зэрэг устгах
      // navigation.replace нь stack-с одоогийн дэлгэцийг устгаад шинээр нээнэ
      navigation.replace("Login");
    } catch (e) {
      console.error("Гарах үед алдаа:", e);
      Alert.alert("Алдаа", "Системээс гарахад алдаа гарлаа.");
    }
  }, [navigation]);

  // Хэрэглэгчийн мэдээлэл татах функц
  const fetchUserData = useCallback(async () => {
    setError(null); // Шинээр татахдаа өмнөх алдааг арилгах
    // setLoading(true); // Refresh хийх үед энэ нь refreshing state-р зохицуулагдана

    try {
      const token = await AsyncStorage.getItem("user_token");
      if (!token) {
        console.log("Токен олдсонгүй, нэвтрэх хуудас руу шилжиж байна.");
        handleLogout(); // Токен байхгүй бол шууд гаргах
        return;
      }

      const response = await axios.get(`${BASE_URL}api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000, // 10 секунд хүлээх timeout нэмэх
      });

      if (response.data) {
        setUser(response.data);
        // learningStyleName-г тусад нь state-д хадгалах шаардлагагүй
        // const translatedName = translateLearningStyle(response.data.learningStyle);
        // setLearningStyleName(translatedName);
      } else {
        // Холбогдсон ч дата ирээгүй бол алдаа гэж үзэх эсвэл гаргах
        console.warn("Серверээс хэрэглэгчийн мэдээлэл ирсэнгүй.");
        setError("Хэрэглэгчийн мэдээлэл татахад алдаа гарлаа.");
        // Эсвэл handleLogout(); хийж болно
      }
    } catch (err) {
      console.error("Хэрэглэгчийн мэдээлэл татах үед алдаа:", err);
      if (err.response) {
        // Серверээс статус кодтой алдаа ирсэн
        if (err.response.status === 401 || err.response.status === 403) {
          // Unauthorized эсвэл Forbidden
          console.log("Токен хүчингүй эсвэл хугацаа дууссан, гарч байна.");
          Alert.alert("Нэвтрэлт амжилтгүй", "Таны нэвтрэх хугацаа дууссан байна. Дахин нэвтэрнэ үү.");
          handleLogout();
        } else {
          setError(`Серверийн алдаа: ${err.response.status}. Дахин оролдоно уу.`);
        }
      } else if (err.request) {
        // Сүлжээний алдаа эсвэл timeout
        setError("Сүлжээний алдаа. Интернэт холболтоо шалгаад дахин оролдоно уу.");
      } else {
        // Бусад алдаа
        setError("Мэдээлэл татахад тодорхойгүй алдаа гарлаа.");
      }
      setUser(null); // Алдаа гарсан үед хэрэглэгчийн мэдээллийг хоослох
    } finally {
      // Эхний ачааллалтын loading-г унтраах
      // Refresh хийх үед setLoading(false) хийх шаардлагагүй, onRefresh дотор refreshing state зохицуулна
      if (loading) setLoading(false);
    }
  }, [handleLogout, loading]); // loading-г хамааралд нэмсэн

  // Refresh хийх үйлдэл
  const onRefresh = useCallback(async () => {
    console.log("Refreshing data...");
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
    console.log("Refresh finished.");
  }, [fetchUserData]); // fetchUserData өөрчлөгдөхгүй тул хамааралд байх нь зөв

  // Анх ороход болон navigation буцаж ирэхэд датаг татах
  useEffect(() => {
    // navigation focus event-г сонсох
    const unsubscribe = navigation.addListener('focus', () => {
      console.log("Profile screen focused, fetching data...");
      // setLoading(true); // Фокус хийх бүрт loading харуулах эсэхийг шийднэ
      fetchUserData();
    });

    // Компонент unmount хийгдэхэд listener-г устгах
    return unsubscribe;
  }, [navigation, fetchUserData]); // хамаарлуудыг нэмсэн

  // Learning style нэрийг user state-с гаргаж авах
  const learningStyleName = user ? translateLearningStyle(user.learningStyle) : "Тодорхойгүй";

  // --- UI Rendering ---

  // Loading state UI
  if (loading) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#ffb22c" />
        <Text style={styles.loadingText}>Ачааллаж байна...</Text>
      </SafeAreaView>
    );
  }

  // Error state UI
  if (error && !user) { // Хэрэглэгчийн дата байхгүй үед л алдааг бүтэн дэлгэцээр харуулах
    return (
      <SafeAreaView style={styles.centeredContainer}>
         <StatusBar barStyle="dark-content" backgroundColor={styles.container.backgroundColor} />
          {/* Header-г алдааны дэлгэцэнд харуулах эсэх */}
          <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate("Main")} style={styles.headerButton}>
                    <Ionicons name="chevron-back-outline" size={30} color="#333"/>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Профайл</Text>
                <View style={styles.headerButton} /> {/* Title-г голлуулахын тулд хоосон зай */}
            </View>
        <View style={styles.errorContent}>
            <MaterialIcons name="error-outline" size={60} color="#FF6347" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
                 <Text style={styles.retryButtonText}>Дахин оролдох</Text>
             </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }


  // Main content UI
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={styles.container.backgroundColor} />
        {/* Сайжруулсан Header */}
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Профайл</Text>
            {/* Header-н баруун талд товч нэмэх боломжтой, эсвэл title-г голлуулахын тулд хоосон зай */}
        </View>

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false} // Scrollbar нуух
        refreshControl={
          <RefreshControl
             refreshing={refreshing}
             onRefresh={onRefresh}
             colors={["#ffb22c", "#FF6347"]} // Refresh icon өнгө
             tintColor="#ffb22c" // iOS-д зориулсан өнгө
           />
        }
      >
         {/* Pull-to-refresh үед гарч болох алдааг харуулах */}
         {error && user && (
            <View style={styles.inlineErrorContainer}>
                 <Text style={styles.inlineErrorText}>{error}</Text>
            </View>
          )}

        {/* Хэрэглэгчийн мэдээлэл хэсэг */}
        <TouchableOpacity
          style={styles.userCard}
          onPress={() => navigation.navigate("ProfileDetail")}
          activeOpacity={0.8} // Дарах үеийн тунгалагшилтыг тохируулах
        >
          <View style={styles.userAvatarPlaceholder}>
             {/* TODO: Хэрэглэгчийн зургийг нэмэх */}
            <Ionicons name="person-outline" size={32} color="white" />
          </View>
          <View style={styles.userInfo}>
             {/* Нэр, Овог хамтдаа */}
            <Text style={styles.userName}>
                {`${user?.first_name || ""} ${user?.last_name || "Хэрэглэгч"}`}
            </Text>
            <Text style={styles.userDetails}>Анги: {user?.class || "Тодорхойгүй"}</Text>
            <Text style={styles.userDetails}>Сурах арга: {learningStyleName}</Text>
          </View>
          {/* Сумыг Icon болгосон */}
          <Feather name="chevron-right" size={26} color="white" />
        </TouchableOpacity>

        {/* Үйлдэлүүдийн жагсаалт */}
        <View style={styles.actionListContainer}>
             {/* Найз */}
             <ActionItem
                icon={<FontAwesome5 name="user-friends" size={18} color="#ffb22c" />}
                label="Найзууд" // Нэрийг өөрчилсөн
                onPress={() => navigation.navigate("Friends")}
             />
              {/* Content Management Section */}
              <ActionSection title="Контент Удирдах">
                 <ActionItem
                    icon={<MaterialIcons name="library-add" size={20} color="#ffb22c" />} // Icon өөрчилсөн
                    label="Хичээл Нэмэх" // Нэрийг өөрчилсөн
                    onPress={() => navigation.navigate("AddLesson")}
                 />
                 <ActionItem
                    icon={<AntDesign name="filetext1" size={20} color="#ffb22c" />}
                    label="Текст Оруулах" // Нэрийг өөрчилсөн
                    onPress={() => navigation.navigate("AddLessonText")}
                 />
                 <ActionItem
                    icon={<AntDesign name="addfile" size={20} color="#ffb22c" />}
                    label="Файл Оруулах" // Нэрийг өөрчилсөн
                    onPress={() => navigation.navigate("AddLessonMaterial")}
                 />
             </ActionSection>

              {/* Tools Section */}
              <ActionSection title="Хэрэгслүүд">
                  <ActionItem
                    icon={<FontAwesome6 name="eye" size={20} color="#ffb22c" />}
                    label="Нүдний хөдөлгөөн хянах" // Нэрийг тодруулсан
                    onPress={() => navigation.navigate("EyeTracking")}
                  />
              </ActionSection>

            {/* Information Section */}
            <ActionSection title="Мэдээлэл">
               <ActionItem
                  icon={<Ionicons name="information-circle-outline" size={24} color="#ffb22c" />}
                  label="Бидний тухай"
                  onPress={() => navigation.navigate("Info")}
                />
            </ActionSection>


            {/* Гарах товч */}
             <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
                <Feather name="log-out" size={20} color="#FF6347"/>
                 <Text style={styles.logoutButtonText}>Системээс Гарах</Text>
             </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Үйлдэлийн зүйлсийг харуулах туслах компонент
const ActionItem = ({ icon, label, onPress }) => (
     <TouchableOpacity style={styles.actionItem} onPress={onPress} activeOpacity={0.7}>
         <View style={styles.actionIconContainer}>{icon}</View>
         <Text style={styles.actionLabel}>{label}</Text>
         <Feather name="chevron-right" size={22} color="#ccc" />
     </TouchableOpacity>
 );

 // Үйлдэлийн хэсгийг харуулах туслах компонент
 const ActionSection = ({ title, children }) => (
     <View style={styles.actionSection}>
         {title && <Text style={styles.actionSectionTitle}>{title}</Text>}
         {children}
     </View>
 );


// Сайжруулсан стильүүд
const styles = StyleSheet.create({
  centeredContainer: { // Loading болон Error үед ашиглах
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8", // container-тай ижил
    paddingHorizontal: 20,
  },
  container: { // Үндсэн дэлгэцийн container
    flex: 1,
    backgroundColor: "#f8f8f8", // Бага зэрэг өнгө нэмсэн
    // paddingHorizontal: 10, // ScrollView дотор өгөх
  },
  loadingText: {
     marginTop: 10,
     fontSize: 14,
     color: '#555',
  },
  errorContent: { // Бүтэн дэлгэц эзлэх алдааны хэсэг
    alignItems: 'center',
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: "#FF6347",
    textAlign: "center",
    marginBottom: 20,
  },
  inlineErrorContainer: { // ScrollView доторх жижиг алдааны мөр
      backgroundColor: '#FFEBEB',
      padding: 10,
      borderRadius: 8,
      marginHorizontal: 15,
      marginBottom: 10,
  },
  inlineErrorText: {
      color: '#CC0000',
      fontSize: 14,
      textAlign: 'center',
  },
  retryButton: {
      backgroundColor: '#ffb22c',
      paddingVertical: 10,
      paddingHorizontal: 25,
      borderRadius: 8,
  },
  retryButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
  },
  header: { // Сайжруулсан Header стиль
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10, // Зайг багасгасан
    backgroundColor: '#f8f8f8', // Container өнгөтэй ижил
    // borderBottomWidth: 1, // Зураас хэрэггүй байж магадгүй
    // borderBottomColor: "#eee",
  },
  headerButton: { // Буцах болон баруун талын товчны зай
     width: 40, // Ижил хэмжээтэй байлгах
     alignItems: 'center',
  },
  headerTitle: { // Header гарчиг
    flex: 1, // Үлдсэн зайг эзэлнэ
    fontSize: 18,
    fontWeight: "600",
    color: "#333", // Бараан өнгө
    textAlign: "center", // Голлуулах
  },
  scrollViewContent: { // ScrollView доторх агуулгын стиль
    paddingBottom: 30, // Доод талд зай авах
     paddingHorizontal: 0, // Хажуугийн зайг картнууд өөрсдөө авна
  },
  userCard: { // Хэрэглэгчийн мэдээлэл харуулах карт
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffb22c",
    borderRadius: 15, // Илүү дугуй булан
    padding: 18, // Доторх зайг нэмсэн
    marginHorizontal: 15, // Хажуугийн зай
    marginTop: 15, // Дээрээс авах зай
    marginBottom: 20, // Доороос авах зай
    elevation: 4, // Сүүдэр (Android)
    shadowColor: "#ffb22c", // Сүүдэр өнгө
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  userAvatarPlaceholder: { // Аватар байрлуулах тойрог
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "rgba(255, 255, 255, 0.3)", // Бага зэрэг тунгалаг цагаан
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15, // Текстнээс авах зай
  },
  userInfo: { // Нэр, анги, арга барил багтах хэсэг
    flex: 1, // Үлдсэн зайг эзэлнэ
  },
  userName: {
    color: "white",
    fontSize: 17, // Нэрийг томсгосон
    fontWeight: "bold", // Тодруулсан
    marginBottom: 4,
  },
  userDetails: {
    color: "white",
    fontSize: 13, // Жижиг текст
    fontWeight: "500",
    opacity: 0.9, // Бага зэрэг тунгалаг
  },
  actionListContainer: { // Үйлдлийн жагсаалт багтаах container
    paddingHorizontal: 15, // Доторх item-уудад хажуугийн зай өгөх
  },
   actionSection: {
     marginBottom: 15, // Хэсгүүдийн хооронд зай
     backgroundColor: 'white',
     borderRadius: 12,
     overflow: 'hidden', // Доторх item-уудын булан гарч ирэхгүй
     elevation: 2,
     shadowColor: "#ccc",
     shadowOffset: { width: 0, height: 1 },
     shadowOpacity: 0.2,
     shadowRadius: 2,
   },
   actionSectionTitle: {
     fontSize: 13,
     fontWeight: '600',
     color: '#555',
     paddingHorizontal: 15,
     paddingTop: 12,
     paddingBottom: 5,
     // textTransform: 'uppercase',
   },
  actionItem: { // Үйлдэл тус бүрийн мөр
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 14, // Зайг нэмсэн
    paddingHorizontal: 15,
    borderBottomWidth: 1, // Зураасаар тусгаарлах
    borderBottomColor: '#f0f0f0', // Маш цайвар зураас
  },
  actionIconContainer: { // Icon багтаах хэсэг
    width: 35, // Зай гаргах
    alignItems: 'center',
    marginRight: 15, // Текстнээс авах зай
  },
  actionLabel: { // Үйлдлийн нэр
    flex: 1, // Үлдсэн зайг эзэлнэ
    color: "#333",
    fontSize: 15, // Хэмжээг бага зэрэг нэмсэн
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F0', // Улаавтар цайвар дэвсгэр
    borderRadius: 10,
    paddingVertical: 12,
    marginHorizontal: 15, // Хажуугийн зай
    marginTop: 25, // Дээрээс авах зай
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFDADA', // Улаавтар цайвар хүрээ
  },
  logoutButtonText: {
    color: '#FF6347', // Улаан өнгө
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Хуучин стильүүд (шаардлагагүй болсон байж магадгүй)
  // backArrow: { ... },
  // backArrowTitle: { ... },
  // userButton: { ... }, // userCard-р солигдсон
  // userIconContainer: { ... }, // userAvatarPlaceholder болсон
  // userContent: { ... }, // userInfo болсон
  // userText: { ... }, // userName, userDetails болсон
  // Button: { ... }, // ActionItem болсон
  // IconContainer: { ... }, // actionIconContainer болсон
  // Content: { ... },
  // Text: { ... }, // actionLabel болсон
});

export default ProfileScreen;