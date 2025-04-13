import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  Modal,
  Alert,
  FlatList
} from "react-native";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRoute } from "@react-navigation/native";
import CustomLoader from "../components/CustomLoader";
import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from "@expo/vector-icons/AntDesign";
const { height } = Dimensions.get("window");
const LessonLearningTypeScreen = ({ navigation }) => {
  const renderContent = () => {
    if (selectedCategory === "Тайлбар") {
      const selectedLesson = useMemo(() => {
        return lessons.find((l) => l.lessonName === activeTopTab);
    }, [lessons, activeTopTab]);

      if (!selectedLesson) return null;

      return (
        <ScrollView className="bg-white mb-60 my-4 p-4 rounded-2xl shadow">
          <TouchableOpacity
            onPress={async () => {
              try {
                const response = await axios.post(
                  "https://learningstyle-project-back-end.onrender.com/api/payment-headers",
                  {
                    user_id: user._id,
                    lesson_id: selectedLesson._id,
                  }
                );
                if (response.status === 201) {
                  setPaymentHeader(response.data._id);
                  console.log(
                    "Амжилттай",
                    response.data.message || "Төлбөр бүртгэгдлээ"
                  );
                } else {
                  console.log(
                    "Амжилтгүй",
                    response.data.message || "Төлбөрийг бүртгэж чадсангүй."
                  );
                }
              } catch (error) {
                console.error("Error:", error);
                Alert.alert(
                  "Алдаа",
                  error.message || "Сүлжээ эсвэл серверийн алдаа гарлаа."
                );
              } finally {
                setModalVisible(true);
              }
            }}
            className="bg-orange-400 mb-8 py-2 px-4 rounded-full w-[50%] justify-end items-center"
          >
            <Text className="text-white font-semibold">
              {selectedLesson.LessonPrice}₮ - Худалдаж авах
            </Text>
          </TouchableOpacity>

          <Text className="text-sm text-gray-800">
            {selectedLesson.lessonDescription}
          </Text>

          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>
                  Төлбөрийн хэлбэр сонгоно уу
                </Text>

                <View style={styles.paymentOptions}>
                  {/* QPay Option */}
                  <TouchableOpacity
                    style={[
                      styles.paymentBox,
                      selectedPayment === "qpay" && styles.selectedPaymentBox,
                    ]}
                    onPress={() => handlePaymentSelection("qpay")}
                  >
                    <Image
                      source={require("../assets/qpay.png")}
                      style={styles.paymentIcon}
                    />
                    <Text style={styles.paymentText}>QPay</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.paymentBox,
                      selectedPayment === "bank" && styles.selectedPaymentBox,
                    ]}
                    onPress={() => handlePaymentSelection("bank")}
                  >
                    <Image
                      source={require("../assets/bankLogo.jpg")}
                      style={styles.paymentIcon}
                    />
                    <Text style={styles.paymentText}>Данс</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.paymentBox,
                      selectedPayment === "Хэтэвч" && styles.selectedPaymentBox,
                    ]}
                    onPress={() => handlePaymentSelection("Хэтэвч")}
                  >
                    <Ionicons name="wallet" size={90} color="orange" />
                    <Text style={styles.paymentText}>Хэтэвч</Text>
                  </TouchableOpacity>
                </View>
                {selectedPayment && (
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSavePayment}
                  >
                    <Text style={styles.saveButtonText}>Төлөх</Text>
                  </TouchableOpacity>
                )}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      setModalVisible(false);
                      setSelectedPayment(null);
                    }}
                  >
                    <Text style={styles.closeButtonText}>Хаах</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      );
    }

    if (selectedCategory === "Текст хичээл") {
      return filteredTexts.map((item) => (
        <TouchableOpacity

key={item._id}
className="bg-white mx-6 mt-2 rounded-2xl shadow-sm p-4"
onPress={() => {
if (item.status === 0) {
navigation.navigate("LessonDetail", {
lessonId: item.lessonId,

contentTitle: item.contentTitle,
});
}
}}

>
{item.status === 1 ? (
<View className="absolute top-2 right-2 bg-orange-300 items-center flex-row rounded-2xl z-10">
<Text className="text-xs font-bold text-white pl-3">Төлбөртэй</Text>

<View className="bg-orange-300 rounded-r-2xl border-gray-200 border-t-hairline border-b-hairline items-center justify-center pr-2 py-1 pl-1">

<Ionicons name="document-lock" size={15} color="white" />

</View>

</View>
):(

<View className="absolute top-2 right-2 bg-orange-300 items-center flex-row rounded-2xl z-10">

<Text className="text-xs font-bold text-white pl-3">Үзэх</Text>

<View className="bg-orange-300 rounded-r-2xl border-gray-200 border-t-hairline border-b-hairline items-center justify-center pr-2 pl-1 py-1">

<Ionicons name="eye" size={15} color="white" />
</View>

</View>)}
<View className="flex-row items-center mb-2 ">

<View className="bg-orange-600 w-8 h-8 justify-center items-center rounded-full">

<AntDesign name="filetext1" size={16} color="white" />
</View>
</View>
<Text className="text-base font-bold text-gray-900 mb-1">
{item.contentTitle}
</Text>
</TouchableOpacity>

      ));
    }

      if (selectedCategory === "Аудио хичээл" ) {
        return filteredTexts.map((item) => (
          <TouchableOpacity
    onPress={() => {
        navigation.navigate("AudioLesson", { textId: item._id, title: item.contentTitle });
    }}
    key={item._id}
    // Үндсэн картны загвар: Цагаан дэвсгэр, захын зай, бөөрөнхий булан, сүүдэр, дотор зай
    className="bg-white mx-4 sm:mx-6 my-2 rounded-xl shadow-md p-4 relative overflow-hidden" // mx-4 эсвэл 6, my-2, rounded-xl, shadow-md, overflow-hidden нэмж болно
>
    {/* --- Статус Заагч (Баруун дээд буланд) --- */}
    {item.status === 1 ? (
        // Төлбөртэй үед: Улбар шар дэвсгэр, цоожтой дүрс
        <View className="absolute top-2 right-2 bg-orange-400 flex-row items-center rounded-full px-2.5 py-1 z-10 shadow-sm">
            <Ionicons name="lock-closed" size={12} color="white" style={{ marginRight: 4 }} />
            <Text className="text-xs font-medium text-white">Төлбөртэй</Text>
        </View>
    ) : (
        // Үнэгүй үед: Ногоон дэвсгэр, нүдтэй дүрс (эсвэл өөр тохирох дүрс)
        <View className="absolute top-2 right-2 bg-green-500 flex-row items-center rounded-full px-2.5 py-1 z-10 shadow-sm">
             <Ionicons name="play-outline" size={12} color="white" style={{ marginRight: 4 }} /> {/* Нүдний оронд Play дүрс? */}
            <Text className="text-xs font-medium text-white">Үнэгүй</Text> {/* "Үзэх"-ийн оронд "Үнэгүй"? */}
        </View>
    )}

    {/* --- Үндсэн Контент (Play дүрс + Гарчиг) --- */}
    <View className="flex-row items-center pr-16"> {/* Баруун талд зай үлдээх (статус заагчтай давхцахгүй) */}
        {/* Play Дүрс (TouchableOpacity биш View) */}
        <View className="bg-orange-500 w-10 h-10 justify-center items-center rounded-full mr-3 shadow">
             <Ionicons
                name="play" // play-circle биш зүгээр play нь илүү цэвэрхэн байж магадгүй
                size={20}
                color="white"
                style={{ marginLeft: 2 }} // Play дүрс голлуулах жижиг тохируулга
             />
        </View>

        {/* Гарчиг (Үлдсэн зайг эзэлнэ) */}
        <View className="flex-1">
            <Text
                className="text-base font-semibold text-gray-800"
                numberOfLines={2} // Урт гарчгийг 2 мөрөнд багтаана
            >
                {item.contentTitle}
            </Text>
            {/* Нэмэлт мэдээлэл (жишээ нь, хичээлийн урт) энд нэмж болно */}
            {/* <Text className="text-sm text-gray-500 mt-1">5 мин</Text> */}
        </View>
    </View>
</TouchableOpacity>
        ));
      }
    if (selectedCategory === "Видео хичээл") {
      return filteredTexts.map((item) => (
        <TouchableOpacity
    key={item._id}
    className="bg-white mx-4 sm:mx-6 my-2 rounded-xl shadow-md p-4 relative overflow-hidden active:bg-gray-100"
    onPress={() => {
        // --- Видео Хичээл Дарах Үйлдэл ---
        console.log("Selected Video Item:", item); // Console log (шаардлагатай бол үлдээнэ үү)

        if (item.status === 0) { // Үнэгүй бол шууд Видео дэлгэц рүү
            navigation.navigate("VideoScreen", {
                contentId: item._id, // Илүү ойлгомжтой нэршил: contentId эсвэл videoId
                title: item.contentTitle, // Гарчгийг дамжуулах нь дэлгэцийн толгойд хэрэгтэй байж магадгүй
            });
        } else { // Төлбөртэй бол мэдээлэл өгөх
            alert(`"${item.contentTitle}" видео хичээл төлбөртэй байна.`);
            // Жишээ: navigation.navigate('PurchaseScreen', { contentId: item._id });
        }
    }}
>
    {/* --- Статус Заагч (Баруун дээд буланд) --- */}
    {item.status === 1 ? (
        // Төлбөртэй: Улбар шар, цоож
        <View className="absolute top-2 right-2 bg-orange-400 flex-row items-center rounded-full px-2.5 py-1 z-10 shadow-sm">
            <Ionicons name="lock-closed-outline" size={12} color="white" style={{ marginRight: 4 }} />
            <Text className="text-xs font-medium text-white">Төлбөртэй</Text>
        </View>
    ) : (
        // Үнэгүй: Ногоон, видео/play дүрс
        <View className="absolute top-2 right-2 bg-green-500 flex-row items-center rounded-full px-2.5 py-1 z-10 shadow-sm">
            {/* Видеог илэрхийлэх дүрс */}
            <Ionicons name="videocam-outline" size={14} color="white" style={{ marginRight: 4 }}/>
            {/* Эсвэл Play дүрс */}
            {/* <Ionicons name="play-outline" size={13} color="white" style={{ marginRight: 4 }}/> */}
            <Text className="text-xs font-medium text-white">Үзэх</Text>
        </View>
    )}

    {/* --- Үндсэн Контент (Дүрс + Гарчиг зэрэгцээ) --- */}
    <View className="flex-row items-center pr-16"> {/* Баруун талд зай үлдээх */}
        {/* Видео Хичээлийн Дүрс (View) */}
        <View className="bg-red-500 w-10 h-10 justify-center items-center rounded-full mr-3 shadow">
            {/* Видеог илэрхийлэх өнгө (жишээ нь улаан) */}
            <Ionicons name="play-outline" size={20} color="white" />
             {/* Видеотой холбоотой дүрс сонгох */}
        </View>

        {/* Гарчиг (Үлдсэн зайг эзэлнэ) */}
        <View className="flex-1">
            <Text
                className="text-base font-semibold text-gray-800"
                numberOfLines={2} // Урт гарчгийг 2 мөрөнд багтаана
            >
                {item.contentTitle}
            </Text>
            {/* Шаардлагатай бол видеоны урт гэх мэт нэмэлт мэдээлэл */}
            {/* <Text className="text-sm text-gray-500 mt-1">Видео (12:34)</Text> */}
        </View>
    </View>
</TouchableOpacity>
      ));
    }

    return null;
  };

  const [user, setUser] = useState("");
  const [lessons, setLessons] = useState([]);
  const [lesson, setLesson] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTopTab, setActiveTopTab] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Текст хичээл");
  const [texts, setTexts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [paymentHeader, setPaymentHeader] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [anotherState, setAnotherState] = useState(null);
  let contentToRender;
  const selectedLesson = lessons.find((l) => l.lessonName === activeTopTab);
  const filteredTexts = useMemo(() => {
    if (!selectedLesson) return [];
    return texts.filter((text) => text.lessonId === selectedLesson._id);
}, [texts, selectedLesson]);
  const [LoadingLesson, setLoadingLesson] = useState(true);
  const route = useRoute();
  const { lessonId } = route.params;
  const baseUrl = "https://learningstyle-project-back-end.onrender.com/";
  const [textCount, setTextCount] = useState(0);
  const [audioCount, setAudioCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);
  const categories = useMemo(() => [
    { label: "Тайлбар", count: 1 }, // Assuming 'Тайлбар' always has 1 item (the description)
    { label: "Текст хичээл", count: textCount },
    { label: "Аудио хичээл", count: audioCount },
    { label: "Видео хичээл", count: videoCount },
], [textCount, audioCount, videoCount]);
  const [LessonPriceGet, setLessonPriceGet] = useState("");
  const [iconName, setIconName] = useState("document-lock");

  useEffect(() => {
    if (selectedLesson && filteredTexts.length > 0) {
      const match = filteredTexts.find(
        (text) => text.lessonId === selectedLesson._id
      );

      if (match?.status === 0) {
        setLessonPriceGet("Төлбөргүй хичээл");
        setIconName("eyeo");
      } else if (match?.status === 1) {
        setLessonPriceGet("Төлбөртэй хичээл");
      }
    }
  }, [selectedLesson, filteredTexts]);
  const handlePaymentSelection = async (method) => {
    try {
      setSelectedPayment(method);
      const response = await axios.get(`${baseUrl}api/payment-methods`);

      if (response.status === 200 && response.data) {
        const selectedMethod = response.data.find(
          (item) => item.method_name === method
        );

        if (selectedMethod && selectedMethod._id) {
          setPaymentMethod(selectedMethod._id);
          console.log(selectedMethod);
          const response = await axios.post(`${baseUrl}api/payment-details`, {
            payment_id: paymentHeader,
            payment_method_id: selectedMethod._id,
          });
        } else {
          Alert.alert("Анхаар", "Сонгосон төлбөрийн арга олдсонгүй.");
        }
      } else {
        Alert.alert("Алдаа", "Төлбөрийн аргуудыг авахад алдаа гарлаа.");
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      Alert.alert("Алдаа", "Төлбөрийн аргыг авахад алдаа гарлаа.");
    }
  };

  const handleSavePayment = async () => {
    try {
      const response = await axios.post(`${baseUrl}api/payment-details`, {
        payment_id: paymentHeader,
        payment_method_id: paymentMethod,
      });

      if (response.status === 201) {
        Alert.alert("Амжилттай", "Төлбөр амжилттай бүртгэгдлээ.");
        setModalVisible(false);
      } else {
        Alert.alert("Алдаа", "Төлбөрийг бүртгэж чадсангүй.");
      }
    } catch (error) {
      console.error("Error saving payment:", error);
      Alert.alert("Error", "Төлбөр илгээхэд алдаа гарлаа.");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("user_token");
        if (!token) {
          console.log("Токен олдсонгүй!");
          return;
        }

        const userResponse = await axios.get(`${baseUrl}api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setUser(userResponse.data);

        const lessonsResponse = await axios.get(`${baseUrl}get-all-lessons`, {
          headers: { "Content-Type": "application/json" },
        });

        if (lessonsResponse.status === 200) {
          const fetchedLessons = lessonsResponse.data.data;
          setLessons(fetchedLessons);
          setIsLoading(false);

          if (lessonId) {
            const matchedLesson = fetchedLessons.find(
              (l) => l._id === lessonId
            );
            if (matchedLesson) {
              setActiveTopTab(matchedLesson.lessonName);
            }
          }
        }
      } catch (error) {
        console.log("Алдаа гарлаа:", error.message);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchLessonAndTexts = async () => {
        if (!lessonId) return; // Don't fetch if no lessonId

        try {
            setLoadingLesson(true);
            // *** CHANGE: Fetch texts specifically for the lessonId ***
            const response = await axios.get(`${baseUrl}text/list`); // Assuming backend supports this query param

            if (response.status === 200 && response.data.success === true) {
                const lessonSpecificTexts = response.data.texts; // Now these are already filtered
                setTexts(lessonSpecificTexts); // Store only the relevant texts

                // Calculate counts based on the fetched (already filtered) texts
                // You might need to adjust how counts are calculated if the API returns different types
                const textOnly = lessonSpecificTexts.filter(t => t.type === 'text'); // Assuming a 'type' field exists
                const audioOnly = lessonSpecificTexts.filter(t => t.type === 'audio');
                const videoOnly = lessonSpecificTexts.filter(t => t.type === 'video');

                setTextCount(textOnly.length);
                setAudioCount(audioOnly.length);
                setVideoCount(videoOnly.length);

                // Find and set the specific lesson object (if needed, though 'lesson' state might be redundant now)
                const matchedLesson = lessons.find(l => l._id === lessonId);
                if (matchedLesson) {
                    setLesson(matchedLesson); // Keep if 'lesson' object is used elsewhere
                    setActiveTopTab(matchedLesson.lessonName); // This might already be set correctly via navigation param logic
                }
            } else {
                 // Handle cases where fetching fails or data is not successful
                 console.warn("Failed to fetch texts for lesson:", lessonId, response.data.message);
                 setTexts([]); // Clear texts on failure
                 setTextCount(0); setAudioCount(0); setVideoCount(0); // Reset counts
            }
        } catch (error) {
            console.error("Алдаа fetching texts:", error);
            // Optionally show an alert to the user
        } finally {
            setLoadingLesson(false);
        }
    };

    // Only run if we have a lessonId and the main lessons list is loaded
    if (lessonId && lessons.length > 0) {
         fetchLessonAndTexts();
    }
     // Dependency: Re-run if lessonId changes *or* if lessons array populates initially
     // Remove `lessons` if you don't strictly need the matchedLesson logic inside this effect
}, [lessonId, lessons, baseUrl]);

  return (
    <View className="bg-white flex-1">
      <SafeAreaView className=" bg-white">
        <View style={styles.backArrow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={30} color="black" />
          </TouchableOpacity>
        </View>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {isLoading ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="ml-5 mt-4"
          >
            <CustomLoader />
            <CustomLoader />
            <CustomLoader />
            <CustomLoader />
            <CustomLoader />
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row px-4 pt-4 pb-2 border-b border-gray-200"
          >
            {lessons.map((lesson) => (
              <TouchableOpacity
                key={lesson._id}
                onPress={() => setActiveTopTab(lesson.lessonName)}
                className="mr-4 pb-2 bg-gray-100 items-center justify-center px-2 rounded-md flex-wrap"
              >
                <Text
                  className={`text-lg ${
                    activeTopTab === lesson.lessonName
                      ? "font-bold text-black"
                      : "text-gray-400"
                  }`}
                >
                  {lesson.lessonName}
                </Text>
                {activeTopTab === lesson.lessonName && (
                  <View className="h-1 bg-orange-500 mt-1 rounded-full" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Категори filter button хэсэг */}
        <ScrollView
          horizontal
          className="mt-4 px-4 "
          showsHorizontalScrollIndicator={false}
        >
          {categories.map((cat, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedCategory(cat.label)}
              className={`flex-row h-10 items-center rounded-md mb-6 px-4 py-2 mr-2 border ${
                selectedCategory === cat.label
                  ? "bg-orange-500 border-orange-500"
                  : "border-gray-300 bg-white"
              }`}
            >
              <Text
                className={`text-sm ${
                  selectedCategory === cat.label
                    ? "text-white"
                    : "text-gray-800"
                }`}
              >
                {cat.label}
              </Text>
              <View
                className={`ml-2 rounded-full px-2 ${
                  selectedCategory === cat.label ? "bg-white" : "bg-gray-200"
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    selectedCategory === cat.label ? "text-black" : "text-black"
                  }`}
                >
                  {cat.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView className=" h-full">{renderContent()}</ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  paymentOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  paymentBox: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
  },
  paymentIcon: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  paymentText: {
    fontSize: 16,
    fontWeight: "500",
  },
  closeButton: {
    backgroundColor: "white",
    padding: 10,
    paddingHorizontal: 20,
    elevation: 2,
    marginTop: 10,
  },
  closeButtonText: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    padding: 10,
    paddingHorizontal: 20,
    elevation: 2,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  selectedPaymentBox: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "orange",
  },
  backArrow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomColor: "#ddd",
    marginLeft: 20,
  },
  backArrowTitle: { fontSize: 18, color: "black", marginLeft: 20 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    minHeight: height * 0.5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    position: "relative",
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: "#ddd",
    borderRadius: 3,
  },
  closeButton: {
    position: "absolute",
    right: 20,
    top: 15,
  },
  audioInfo: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  audioTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  playerControls: {
    paddingHorizontal: 20,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  timeText: {
    color: "#666",
    fontSize: 14,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  controlButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  controlButton: {
    padding: 10,
    marginHorizontal: 20,
  },
  playButton: {
    backgroundColor: "#ff5722",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
  },
  extraControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingHorizontal: 10,
  },
  extraButton: {
    alignItems: "center",
    padding: 10,
  },
  extraButtonText: {
    color: "#888",
    marginTop: 5,
    fontSize: 12,
  },
});

export default LessonLearningTypeScreen;
