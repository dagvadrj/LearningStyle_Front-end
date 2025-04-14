import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
} from "react-native";
import axios from "axios";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Feather from "@expo/vector-icons/Feather";
// import FontAwesome5 from '@expo/vector-icons/FontAwesome5'; // Хэрэв ашиглахгүй бол устгана уу

const isAndroid = Platform.OS === "android";
const BASE_URL = "https://learningstyle-project-back-end.onrender.com/";
const DEFAULT_LESSON_IMAGE = {
  uri: "https://via.placeholder.com/80x80?text=Lesson",
};

// --- Helper Functions ---
const getWeatherInfo = (weatherData) => {
  // ... (Энэ функц хэвээрээ байна) ...
  if (!weatherData || !weatherData.weather || !weatherData.weather[0]) {
    return { text: "Цаг агаарын мэдээлэл алга", icon: "help-circle-outline" };
  }
  const description = weatherData.weather[0].description;
  const temp = weatherData.main?.temp;
  const name = weatherData.name;
  let cloudText = "";
  let iconName = "weather-cloudy";

  switch (description) {
    case "clear sky":
      cloudText = "Цэлмэг";
      iconName = "weather-sunny";
      break;
    case "few clouds":
    case "scattered clouds":
    case "broken clouds":
    case "overcast clouds":
      cloudText = "Үүлэрхэг";
      iconName = "weather-partly-cloudy";
      break;
    case "rain":
    case "light rain":
    case "moderate rain":
      cloudText = "Бороотой";
      iconName = "weather-rainy";
      break;
    case "drizzle":
    case "light drizzle":
      cloudText = "Шиврээ бороо";
      iconName = "weather-partly-rainy";
      break;
    case "thunderstorm":
      cloudText = "Аадар бороо";
      iconName = "weather-lightning-rainy";
      break;
    case "snow":
    case "light snow":
    case "heavy snow":
      cloudText = "Цастай";
      iconName = "weather-snowy";
      break;
    case "mist":
    case "fog":
    case "haze":
      cloudText = "Манантай";
      iconName = "weather-fog";
      break;
    case "squall":
      cloudText = "Салхитай";
      iconName = "weather-windy";
      break;
    default:
      cloudText = "Тодорхойгүй";
      iconName = "weather-cloudy-alert";
      break;
  }

  const tempText = temp !== undefined ? `${Math.round(temp)}°C` : "N/A";
  const locationText = name || "";
  return {
    text: `${locationText} ${tempText} ${cloudText}`,
    icon: iconName,
  };
};
const LESSON_COLORS = {
  math: "#4285F4", // Цэнхэр
  english: "#DB4437", // Улаан
  it: "#0F9D58", // Ногоон
  literature: "#AB47BC", // Ягаан
  mongol_bichig: "#F4B400", // Шар/Улбар шар
  mongol_hel: "#00ACC1", // Цайвар цэнхэр
  design: "#E91E63", // Ягаан
  russian: "#C51162", // Бараан улаан
  health: "#03A9F4", // Тэнгэрийн цэнхэр
  civics: "#795548", // Бор
  default: "#9E9E9E", // Саарал
};

// Default icon
const DEFAULT_LESSON_ICON = {
  name: "cube-outline",
  library: "Ionicons",
  color: LESSON_COLORS.default,
};
const getLessonIconInfo = (lessonName) => {
  if (!lessonName) return DEFAULT_LESSON_ICON;

  switch (lessonName.toLowerCase()) {
    case "математик":
      return {
        name: "calculator-outline",
        library: "Ionicons",
        color: LESSON_COLORS.math,
      };
    case "англи хэл":
      return {
        name: "language-outline",
        library: "Ionicons",
        color: LESSON_COLORS.english,
      };
    case "мэдээллийн технологи":
      return {
        name: "laptop-outline",
        library: "Ionicons",
        color: LESSON_COLORS.it,
      };
    case "уран зохиол":
      return {
        name: "book-outline",
        library: "Ionicons",
        color: LESSON_COLORS.literature,
      };
    case "монгол бичиг":
      // 'script-text-outline' (MCI) эсвэл 'pencil-outline' (Ionicons)
      return {
        name: "pencil-outline",
        library: "Ionicons",
        color: LESSON_COLORS.mongol_bichig,
      };
    case "монгол хэл":
      return {
        name: "chatbubble-ellipses-outline",
        library: "Ionicons",
        color: LESSON_COLORS.mongol_hel,
      };
    case "дизайн зураг зүй, технологи":
      return {
        name: "color-palette-outline",
        library: "Ionicons",
        color: LESSON_COLORS.design,
      };
    case "орос хэл":
      // Англи хэлтэй ижил icon, өөр өнгөөр
      return {
        name: "language-outline",
        library: "Ionicons",
        color: LESSON_COLORS.russian,
      };
    case "эрүүл мэнд":
      return {
        name: "medkit-outline",
        library: "Ionicons",
        color: LESSON_COLORS.health,
      };
    case "иргэний ёс зүйн боловсрол":
      return {
        name: "school-outline",
        library: "Ionicons",
        color: LESSON_COLORS.civics,
      };
    // TODO: Өөр хичээлүүд нэмэгдвэл энд нэмэх
    default:
      return DEFAULT_LESSON_ICON;
  }
};
const renderIcon = (iconInfo, size = 30, defaultColor = "#000") => {
  const { name, library, color } = iconInfo;
  const iconColor = iconInfo.iconColor || defaultColor; // Icon өнгө (өөрчилж болно)

  if (library === "Ionicons") {
    return <Ionicons name={name} size={size} color={iconColor} />;
  } else if (library === "MaterialCommunityIcons") {
    return <MaterialCommunityIcons name={name} size={size} color={iconColor} />;
  }
  // Add other libraries if needed
  return (
    <Ionicons
      name={DEFAULT_LESSON_ICON.name}
      size={size}
      color={DEFAULT_LESSON_ICON.color}
    />
  ); // Default fallback
};

// --- Components (StyleSheet ашигласан хувилбар) ---
const LessonGridItem = React.memo(({ item, navigation, onShowMorePress }) => {
  const iconInfo = item.isMore
    ? { name: "apps-outline", library: "Ionicons", color: "#888" }
    : getLessonIconInfo(item.lessonName);

  if (item.isMore) {
    return (
      <TouchableOpacity
        style={styles.gridItemTouchable}
        // onPress-д дамжиж ирсэн onShowMorePress-г ашиглана
        onPress={onShowMorePress}
        activeOpacity={0.7}
      >
        <View style={[styles.gridItemIconContainer, styles.moreItemContainer]}>
          {renderIcon({ ...iconInfo, iconColor: iconInfo.color }, 30)}
        </View>
        <Text style={styles.gridItemText} numberOfLines={1}>
          Бүгд
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.gridItemTouchable}
      onPress={() =>
        navigation.navigate("LessonLearningType", {
          lessonId: item._id,
          lessonName: item.lessonName,
        })
      }
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.gridItemIconContainer,
          { backgroundColor: iconInfo.color },
        ]}
      >
        {renderIcon({ ...iconInfo, iconColor: "white" }, 30)}
      </View>
      <Text style={styles.gridItemText} numberOfLines={1}>
        {item.lessonName || "Хичээл"}
      </Text>
    </TouchableOpacity>
  );
});

const ClassLessonItem = React.memo(({ item, navigation }) => {
  const iconInfo = getLessonIconInfo(item.lessonName);
  return (
    <TouchableOpacity
      style={styles.classLessonTouchable}
      onPress={() =>
        navigation.navigate("LessonDetail", {
          lessonId: item._id,
          lessonName: item.lessonName,
        })
      }
      activeOpacity={0.7}
    >
      {/* Image-н оронд Icon харуулна */}
      <View style={styles.classLessonIconContainer}>
        {/* Энд icon-ийн өөрийнх нь өнгийг ашиглана */}
        {renderIcon(iconInfo, 24, iconInfo.color)}
      </View>
      <View style={styles.classLessonTextContainer}>
        <Text style={styles.classLessonTitle} numberOfLines={1}>
          {item.lessonDescription || item.lessonName}
        </Text>
        <Text style={styles.classLessonSubtitle} numberOfLines={1}>
          {item.lessonName} • {item.studentClass || "?"}-р анги
        </Text>
      </View>
      <Ionicons
        name="chevron-forward-outline"
        size={20}
        color="#ccc"
        style={styles.classLessonArrow}
      />
    </TouchableOpacity>
  );
});

// --- Main Screen ---
const HomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [weather, setWeather] = useState(null);
  const [user, setUser] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [classLessons, setClassLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllGridLessons, setShowAllGridLessons] = useState(false);
  const handleShowMoreGridItems = useCallback(() => {
    setShowAllGridLessons(true);
  }, []);
  // --- Data Fetching ---
  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh) setLoading(true);
      setError(null);

      try {
        const token = await AsyncStorage.getItem("user_token");
        if (!token) {
          throw new Error("AUTH_TOKEN_MISSING");
        }

        // User, Lessons, Weather зэрэг татах (Timeout нэмэгдсэн)
        const [userResponse, lessonsResponse, weatherResponse] =
          await Promise.all([
            axios.get(`${BASE_URL}api/users/me`, {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000, // 10 секунд
            }),
            axios.get(`${BASE_URL}get-all-lessons`, {
              // Энэ endpoint token шаарддаг бол нэмэх
              // headers: { Authorization: `Bearer ${token}` },
              timeout: 15000, // 15 секунд
            }),
            axios.get(`${BASE_URL}api/weather`, { timeout: 10000 }), // 10 секунд
          ]);

        // User data
        if (userResponse.data) {
          setUser(userResponse.data);
        } else {
          console.warn("User data not found.");
          // Handle missing user data (e.g., logout or show error)
        }

        // Lessons data
        if (lessonsResponse.data && Array.isArray(lessonsResponse.data.data)) {
          const allLessons = lessonsResponse.data.data;
          setLessons(allLessons);
          // Filter by class
          if (userResponse.data?.class) {
            const filtered = allLessons.filter(
              (lesson) => lesson.studentClass === userResponse.data.class
            );
            setClassLessons(filtered);
          } else {
            setClassLessons([]); // User class unknown
          }
        } else {
          console.warn("Lessons data not found or invalid.");
          setLessons([]);
          setClassLessons([]);
        }

        // Weather data
        if (weatherResponse.data) {
          setWeather(weatherResponse.data);
        } else {
          console.warn("Weather data not found.");
          setWeather(null);
        }
      } catch (error) {
        console.error("Error fetching data:", error); // Log the full error
        if (
          error.message === "AUTH_TOKEN_MISSING" ||
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          Alert.alert(
            "Нэвтрэлт амжилтгүй",
            "Хандах эрхгүй эсвэл токен хүчингүй болсон. Дахин нэвтэрнэ үү.",
            [
              {
                text: "OK",
                onPress: async () => {
                  // Logout logic
                  await AsyncStorage.removeItem("user_token");
                  // Navigate to Login Screen (make sure you have 'Login' screen in your navigator)
                  navigation.replace("Login");
                },
              },
            ]
          );
        } else if (axios.isCancel(error)) {
          console.log("Request canceled:", error.message);
        } else if (error.code === "ECONNABORTED") {
          setError("Холболт удаан байна. Сүлжээгээ шалгаад дахин оролдоно уу.");
        } else {
          setError("Мэдээлэл татахад алдаа гарлаа. Дараа дахин оролдоно уу.");
        }
        // Clear state on error
        setUser(null);
        setLessons([]);
        setClassLessons([]);
        setWeather(null);
      } finally {
        setLoading(false);
        if (isRefresh) setRefreshing(false);
      }
    },
    [navigation]
  ); // navigation added for logout

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, [fetchData]);

  // --- Memoized Values ---
  const weatherInfo = useMemo(() => getWeatherInfo(weather), [weather]);

  const gridDisplayData = useMemo(() => {
    const lessonsToShow = lessons || [];
    if (showAllGridLessons) {
      return lessonsToShow;
    }
    if (lessonsToShow.length > 7) {
      // 7 хичээл + "Бүгд" товч
      return [...lessonsToShow.slice(0, 7), { _id: "more", isMore: true }];
    }
    return lessonsToShow;
  }, [lessons, showAllGridLessons]);

  // --- Render Logic ---
  if (loading && !refreshing) {
    // Зөвхөн анхны load үед бүтэн дэлгэцээр харуулах
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#ffb22c" />
      </SafeAreaView>
    );
  }

  if (error && !user && !refreshing) {
    // Хэрэглэгчгүй, refresh хийгээгүй үед алдаа харуулах
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Ionicons name="cloud-offline-outline" size={50} color="#aaa" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchData()}
        >
          <Text style={styles.retryButtonText}>Дахин оролдох</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Хэрэглэгч болон бусад мэдээлэл байвал (эсвэл refresh хийж байвал) UI-г харуулна
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* StatusBar */}
      {isAndroid ? (
        <StatusBar
          barStyle="light-content"
          translucent={true}
          backgroundColor="transparent"
        />
      ) : (
        <StatusBar barStyle="light-content" />
      )}

      {/* Header (Gradient) */}
      <LinearGradient
        colors={["#FFB22C", "#FFA500"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        {isAndroid && <View style={{ height: StatusBar.currentHeight }} />}
        {/* Weather and Notifications */}
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
            <Text style={styles.userDetails}>
              Анги: {user?.class || "Тодорхойгүй"}
            </Text>
          </View>
          {/* Сумыг Icon болгосон */}
          <Feather name="chevron-right" size={26} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTopRow}>
          <View style={styles.weatherContainer}>
            <MaterialCommunityIcons
              name={weatherInfo.icon}
              size={22}
              color="white"
              style={styles.weatherIcon}
            />
            <Text style={styles.weatherText} numberOfLines={1}>
              {weatherInfo.text}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => Alert.alert("Мэдэгдэл", "Шинэ мэдэгдэл алга.")}
            style={styles.notificationButton}
          >
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Wallet Section */}
        <TouchableOpacity
          style={styles.walletTouchable}
          onPress={() => navigation.navigate("Wallet")}
          activeOpacity={0.8}
        >
          <View style={styles.walletIconContainer}>
            <Ionicons name="wallet-outline" size={24} color="white" />
          </View>
          <View style={styles.walletInfo}>
            <Text style={styles.walletLabel}>Хэтэвч</Text>
            <Text style={styles.walletBalance}>
              {user?.balance?.toLocaleString() || 0}₮
            </Text>
          </View>
          <Ionicons
            name="chevron-forward-outline"
            size={24}
            color="white"
            style={styles.walletArrow}
          />
        </TouchableOpacity>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView
        // stickyHeaderIndices={[0]} // Header-г тогтоохыг хүсвэл энийг нэмнэ, гэхдээ LinearGradient дээр ажиллахгүй байж магадгүй
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFB22C" // iOS
            colors={["#FFB22C", "#FFA500"]} // Android
          />
        }
      >
        {/* Refresh үеийн алдааг харуулах */}
        {error && user && refreshing && (
          <View style={styles.inlineErrorContainer}>
            <Text style={styles.inlineErrorText}>{error}</Text>
          </View>
        )}

        {/* Test Section */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => navigation.navigate("Test")}
            activeOpacity={0.7}
          >
            <Text style={styles.testButtonText}>
              Тест Өгч Арга Барилаа Тодорхойлох
            </Text>
          </TouchableOpacity>
          {/* Шаардлагатай бол тайлбар текст нэмж болно */}
        </View>

        {/* Grid Lessons Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Миний Хичээлүүд</Text>
          <FlatList
            data={gridDisplayData}
            ListEmptyComponent={
              !loading && (
                <Text style={styles.emptyListText}>Хичээл олдсонгүй.</Text>
              )
            }
            keyExtractor={(item, index) => item?._id || `grid-item-${index}`}
            numColumns={4}
            // renderItem дотор onShowMorePress-г LessonGridItem руу дамжуулна
            renderItem={({ item }) => {
              // item байгаа эсэхийг шалгах (өмнөх шийдэл)
              if (!item) {
                console.warn(
                  "Grid FlatList renderItem received invalid item:",
                  item
                );
                return null;
              }
              // LessonGridItem-д проп дамжуулах
              return (
                <LessonGridItem
                  item={item}
                  navigation={navigation}
                  // onShowMorePress-г ЭНД дамжуулна
                  onShowMorePress={item.isMore ? handleShowMoreGridItems : null}
                />
              );
            }}
            scrollEnabled={false} // Дотор нь scroll хийхгүй
            columnWrapperStyle={styles.gridRowWrapper}
            // onShowMorePress-г FlatList-н пропоос устгасан!
          />
          {/* "Хураах" товч */}
          {showAllGridLessons && lessons.length > 7 && (
            <TouchableOpacity
              style={styles.collapseButton}
              onPress={() => setShowAllGridLessons(false)}
            >
              <Text style={styles.collapseButtonText}>Хураах</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Class Lessons Section */}
        <View style={[styles.sectionContainer, { marginBottom: 20 }]}>
          {/* Анги байхгүй үед ч гарчгийг харуулах эсвэл логикоор удирдах */}
          <Text style={styles.sectionTitle}>
            {user?.class
              ? `${user.class}-р Ангийн Хичээлүүд`
              : "Санал Болгох Хичээлүүд"}
          </Text>
          <FlatList
            data={classLessons}
            ListEmptyComponent={
              !loading && (
                <View style={styles.emptyListContainer}>
                  <Ionicons
                    name="library-outline"
                    size={35}
                    color="#ccc"
                    style={styles.emptyListIcon}
                  />
                  <Text style={styles.emptyListText}>
                    {user?.class
                      ? `${user.class}-р ангийн хичээл одоогоор алга байна.`
                      : "Танд санал болгох хичээл алга байна."}
                  </Text>
                </View>
              )
            }
            renderItem={({ item }) => (
              <ClassLessonItem item={item} navigation={navigation} />
            )}
            keyExtractor={(item) => item._id}
            scrollEnabled={false} // Дотор нь scroll хийхгүй
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- StyleSheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: "#f8f8f8", // ProfileScreen-тэй ижил дэвсгэр
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  errorText: {
    color: "#D32F2F", // Улаан өнгө
    textAlign: "center",
    marginTop: 15,
    fontSize: 16,
    marginHorizontal: 20,
  },
  retryButton: {
    backgroundColor: "#FFB22C",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  inlineErrorContainer: {
    backgroundColor: "#FFEBEB",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 15,
    marginTop: 10, // Header-с доош зай
    marginBottom: 5,
  },
  inlineErrorText: {
    color: "#D32F2F",
    fontSize: 14,
    textAlign: "center",
  },
  // --- Header ---
  headerGradient: {
    paddingTop: isAndroid ? StatusBar.currentHeight + 10 : 90, // Дээд зай (iOS-д Safe Area-г тооцно)
    paddingBottom: 20,
    top: -90,
    marginBottom: -90,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20, // Доод булангуудыг бөөрөнхийлөх
    borderBottomRightRadius: 20,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15, // Wallet-с авах зай
  },
  weatherContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // Available space авах
    marginRight: 10, // Мэдэгдэл товчноос зай авах
  },
  weatherIcon: {
    marginRight: 8,
  },
  weatherText: {
    color: "white",
    fontSize: 13, // Бага зэрэг жижиг
    fontWeight: "500",
    flexShrink: 1, // Text урт байвал жижгэрэх
  },
  notificationButton: {
    padding: 5, // Дарахад хялбар болгох
  },
  // --- Wallet ---
  walletTouchable: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)", // Бага зэрэг тунгалаг цагаан
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  walletIconContainer: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 99, // Full circle
    marginRight: 12,
  },
  walletInfo: {
    flex: 1, // Нэр, үлдэгдэл зэрэг үлдсэн зайг эзэлнэ
  },
  walletLabel: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.9,
  },
  walletBalance: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 2,
  },
  walletArrow: {
    marginLeft: 8, // Зүүн талд зай авах
  },
  // --- ScrollView & Sections ---
  scrollViewContent: {
    paddingBottom: 30, // Хамгийн доор зай авах
  },
  sectionContainer: {
    backgroundColor: "white", // Хэсгүүдийн дэвсгэр цагаан
    borderRadius: 12,
    marginHorizontal: 15, // Хажуугийн зай
    marginTop: 15, // Дээрээс авах зай
    padding: 15, // Доторх зай
    elevation: 2, // Сүүдэр (Android)
    shadowColor: "#ccc", // Сүүдэр (iOS)
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    overflow: "hidden", // Сүүдэр зөв харагдах
  },
  sectionTitle: {
    fontSize: 17, // ProfileScreen-тэй ойролцоо
    fontWeight: "bold", // Тодруулсан
    color: "#333", // Бараан өнгө
    marginBottom: 15, // Доорх контентоос зай авах
  },
  // --- Test Section ---
  testButton: {
    backgroundColor: "#FFF8E1", // Цайвар шар дэвсгэр (orange-100-тай төстэй)
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  testButtonText: {
    color: "#FFA000", // Тод шар өнгө (orange-600-тай төстэй)
    fontSize: 16,
    fontWeight: "600",
  },
  // --- Grid Lessons ---
  gridRowWrapper: {
    justifyContent: "space-between", // Баганууд хооронд зай автоматаар үүсгэх
    marginBottom: 10, // Мөр хоорондын зай
  },
  gridItemTouchable: {
    width: "23%", // ~1/4 зайг эзлэх (padding/margin тооцно)
    alignItems: "center",
    marginBottom: 5, // Доод талд зай (тексттэй нийлэх)
  },
  gridItemIconContainer: {
    width: 65, // Бага зэрэг жижиг болгов
    height: 65,
    borderRadius: 16, // Илүү бөөрөнхий
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8, // Текстнээс авах зай
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, // Бага зэрэг сүүдэр нэмсэн
    shadowRadius: 2.62,
    elevation: 4, // Android сүүдэр
  },
  moreItemContainer: {
    backgroundColor: "#f0f0f0", // Саарал дэвсгэр
    shadowOpacity: 0.1,
    elevation: 1,
  },
  gridItemImage: {
    width: "100%",
    height: "100%",
  },
  gridItemText: {
    textAlign: "center",
    fontSize: 12,
    color: "#555", // Бага зэрэг бараан саарал
    fontWeight: "500",
  },
  collapseButton: {
    alignSelf: "center",
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  collapseButtonText: {
    color: "#FF9800", // Шар/улбар шар өнгө
    fontWeight: "600",
    fontSize: 14,
  },
  // --- Class Lessons (List) ---
  classLessonTouchable: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10, // Босоо зайг багасгасан
    paddingHorizontal: 5, // Section container-н padding байгаа тул багасгасан
    // backgroundColor: 'white', // Section container цагаан тул хэрэггүй
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0", // Маш цайвар зураас
    // Сүүлийн item-н зураасыг нуух логик хэрэгтэй бол FlatList-н renderItem дотор нөхцөл шалгаж style нэмнэ
  },
  classLessonIconContainer: {
    width: 40, // Хэмжээг бага зэрэг тохируулав
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15, // Текстнээс авах зай
    // backgroundColor: '#eee', // Хэрэггүй болсон
    // borderRadius: 8, // Хэрэггүй болсон
  },
  classLessonTextContainer: {
    flex: 1, // Available space авах
    marginRight: 8, // Сумны зай
  },
  classLessonTitle: {
    fontSize: 15, // Гарчиг том
    fontWeight: "600", // Тод
    color: "#333", // Бараан
    marginBottom: 2,
  },
  classLessonSubtitle: {
    fontSize: 12,
    color: "#777", // Саарал
  },
  classLessonArrow: {
    // Баруун талд байрлана
  },
  // --- Empty List ---
  emptyListContainer: {
    alignItems: "center",
    paddingVertical: 30, // Дээр доор зай
    paddingHorizontal: 20,
  },
  emptyListIcon: {
    marginBottom: 10,
  },
  emptyListText: {
    textAlign: "center",
    color: "#888", // Саарал
    fontSize: 14,
    lineHeight: 20,
  },
});

export default HomeScreen;
