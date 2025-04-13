import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import "../assets/global.css";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ScrollView } from "react-native-gesture-handler";
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
const isAndroid = Platform.OS === "android";

function AddLessonForm({ navigation }) {
  const [formData, setFormData] = useState({
    code: "",
    lessonName: "",
    lessonDescription: "",
    studentClass: "",
    lessonCredit: "",
    LearningStyleType: "",
  });
  const [type, setType] = useState([]);
  const [typeName, setTypeName] = useState([]);
  const [role, setRole] = useState([]);
  const baseUrl = "https://learningstyle-project-back-end.onrender.com/";

  const [showAndroidPicker, setShowAndroidPicker] = useState(false);

  const creditOptions = [
    { id: 1, number: 1 },
    { id: 2, number: 2 },
    { id: 3, number: 3 },
  ];

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    console.log("formData", formData);
  };
  useEffect(()=>{
    fetchUserType();
  },[])
  const fetchUserType = async () => {
    try {
      const response = await axios.get(`${baseUrl}api/learningType`);
      const userTypes = response.data;
      const translatedTypes = userTypes.map((type) => {
        let translatedName;
        switch (type.name) {
          case "visual":
            translatedName = "Харааны ой";
            break;
          case "auditory":
            translatedName = "Сонсох ой";
            break;
          case "reading_writing":
            translatedName = "Бичиж, уншиж, тэмдэглэл хийж суралцах";
            break;
          case "kinesthetic":
            translatedName = "Дадлагаар суралцах арга";
            break;
          default:
            translatedName = type.name; // Хэрэв тодорхойгүй утга байвал анхны утгаа авна
        }
  
        return { ...type, translatedName };
      });
  
      setType(translatedTypes);
    } catch (error) {
      console.error("Error fetching learning types:", error);
    }
  };
     
  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("user_token");
        if (!token) {
          console.log("Токен олдсонгүй!");
          return;
        }      
        console.log(token)
        const userResponse = await axios.get(`${baseUrl}api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
       
          const response = await axios.post(
            `${baseUrl}add-lesson`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            })
          
          if (response.data && response.data.success) {
            Alert.alert("Амжилттай", "Хичээл амжилттай нэмэгдлээ!");
            setFormData({
              code: "",
              lessonName: "",
              lessonDescription: "",
              studentClass: "",
              lessonCredit: "",
              LearningStyleType: "",
              LessonPrice: "", // энэ бас default-дээ нэм
            });
          } else {
            Alert.alert("Алдаа", "Хичээл нэмэхэд алдаа гарлаа. Дахин оролдоно уу.");
          }
    } catch (error) {
      Alert.alert("Алдаа", "Сүлжээний алдаа гарлаа. Дахин оролдоно уу.");
      console.log(error, "Сүлжээний алдаа гарлаа. Дахин оролдоно уу.");
    }
  };
  
  return (
    <SafeAreaView className="grid  md:grid-cols-2 bg-white flex-1">
      <View style={styles.backArrow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.backArrowTitle}>Хичээл нэмэх</Text>
      </View>
      <KeyboardAvoidingView 
behavior={Platform.OS === "ios" ? "padding" : "height"}
>
      <ScrollView>
        <View className="p-6 rounded-lg">
          <Text className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Хичээлийн код
          </Text>
          <TextInput
            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={formData.code}
            onChangeText={(text) => handleChange("code", text)}
          />

          <Text className="block mb-2 mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Хичээлийн нэр
          </Text>
          <TextInput
            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={formData.lessonName}
            onChangeText={(text) => handleChange("lessonName", text)}
          />

          <Text className="block mb-2 mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Хичээлийн тайлбар
          </Text>
          <TextInput
            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full h-24 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            multiline
            value={formData.lessonDescription}
            onChangeText={(text) => handleChange("lessonDescription", text)}
          />

          <Text className="block mb-2 mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Хэддүгээр анги
          </Text>
          <TextInput
            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={formData.studentClass}
            onChangeText={(text) => handleChange("studentClass", text)}
          />

          <Text className="block mb-2 mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Кредит
          </Text>
          <View>
            <TextInput
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              keyboardType="numeric"
              value={formData.lessonCredit.toString()}
              onChangeText={(text) => handleChange("lessonCredit", text)}
              editable={false}
              placeholder="Кредит сонгох"
            />

            <ScrollView className="flex-row mt-2 mb-4" horizontal>
              {creditOptions.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className={`items-center border focus:outline-none font-medium rounded-md px-12 py-1 text-xs me-2 ${
                    formData.lessonCredit === item.number.toString()
                      ? "bg-[#ffb22c] text-white border-[#ffb22c] "
                      : "bg-white text-gray-900 border-gray-300 hover:bg-gray-100"
                  }`}
                  onPress={() =>
                    handleChange("lessonCredit", item.number.toString())
                  }
                >
                  <Text
                    className={
                      formData.lessonCredit === item.number.toString()
                        ? "text-white"
                        : "text-gray-900"
                    }
                  >
                    {item.number}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <Text className="block mb-2 mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Төрөл
          </Text>

          {isAndroid ? (
            <View>
              <TouchableOpacity
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                onPress={() => setShowAndroidPicker(true)}
              >
                <Text className="text-gray-500">
                  {formData.LearningStyleType
                    ? learningStyleOptions.find(
                        (opt) => opt.value === formData.LearningStyleType
                      )?.label
                    : "Сонгох"}
                </Text>
              </TouchableOpacity>

              <Modal
                visible={showAndroidPicker}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.modalContainer}>
                  <View style={styles.pickerContainer}>
                    
              <Picker
  selectedValue={formData.LearningStyleType}
  onValueChange={(value) => handleChange("LearningStyleType", value)}
>
  {type.map((item) => (
    <Picker.Item key={item._id} label={item.translatedName} value={item._id} />
  ))}
</Picker>

                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setShowAndroidPicker(false)}
                    >
                      <Text style={styles.closeButtonText}>Хаах</Text>
                    </TouchableOpacity>
                    
                  </View>
                </View>
              </Modal>
            </View>
          ) : (
            
            <View className="bg-gray-50 border border-gray-300 rounded-lg">
              <Picker
  selectedValue={formData.LearningStyleType}
  onValueChange={(value) => handleChange("LearningStyleType", value)}
>
  {type.map((item) => (
    <Picker.Item key={item._id} label={item.translatedName} value={item._id} />
  ))}
</Picker>


              <Text>{type.name}</Text>
            </View>
          )}

           <Text className="block mb-2 mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Үнэ
          </Text>
          <TextInput
            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={formData.LessonPrice}
            onChangeText={(number) => handleChange("LessonPrice", number)}
            keyboardType="numeric"
          />
          <View className="items-center">
            <TouchableOpacity
              className="text-white bg-white border-hairline border-gray-600 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 w-64 py-2.5 mt-6 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              onPress={handleSubmit}
            >
              <Text className="text-black text-center">Хичээл нэмэх</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView></KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backArrow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomColor: "#ddd",
    marginLeft: 20,
  },
  backArrowTitle: {
    fontSize: 14,
    color: "black",
    marginLeft: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  pickerContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  closeButton: {
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
});

export default AddLessonForm;
