import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from "react-native";
import axios from "axios";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AntDesign from "@expo/vector-icons/AntDesign";

const baseUrl = "https://learningstyle-project-back-end.onrender.com/";

const LessonSelector = ({ navigation }) => {
  const [lessons, setLessons] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [inputText, setInputText] = useState("");
  const [lessonName, setLessonName] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchHicheel = async () => {
      try {
        const token = await AsyncStorage.getItem("user_token");
        if (token) {
          await axios.get(`${baseUrl}api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        const response = await axios.get(`${baseUrl}`, {
          headers: { "Content-type": "application/json" },
        });

        if (response.data && response.data.success) {
          setLessons(response.data.data);
        }
      } catch (error) {
        console.error("Алдаа:", error);
      }
    };

    fetchHicheel();
  }, []);

  const handleFileUpload = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      setFile(res);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log("User cancelled the upload");
      } else {
        console.error("File upload error:", err);
      }
    }
  };

  const handleSaveFile = async () => {
    if (file && file.uri) {
      const fileName = file.name;
      const filePath = file.uri;

      try {
        const fileContent = await RNFS.readFile(filePath, "base64");

        const token = await AsyncStorage.getItem("user_token");
        await axios.post(
          `${baseUrl}api/lessons/upload`,
          {
            lessonName,
            file: {
              name: fileName,
              content: fileContent,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("File uploaded successfully");
      } catch (error) {
        console.error("File upload failed:", error);
      }
    } else {
      console.log("No file selected");
    }
  };

  return (
    <SafeAreaView className="bg-white flex-1">
      <View style={styles.backArrow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.backArrowTitle}>Хичээлд файл нэмэх</Text>
      </View>
      <View className="p-6">
        <TextInput
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          value={lessonName}
          onChangeText={(text) => setLessonName(text)}
          placeholder="Lesson Name"
          placeholderTextColor="#888"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {lessons.map((lesson) => (
            <TouchableOpacity
              key={lesson._id}
              className="bg-white border mt-2 border-gray-300 rounded-lg px-3 py-1 mr-2 mb-2"
              onPress={() => setLessonName(lesson.lessonName)}
            >
              <Text className="text-gray-800">{lesson.lessonName}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TextInput
          className="bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3 mt-4 mb-4"
          placeholder="Текстээ оруулна уу"
          value={inputText}
          onChangeText={setInputText}
          placeholderTextColor="#888"
        />
        <TouchableOpacity
          className="bg-white border border-gray-600 rounded-lg p-3 mb-4"
          onPress={() => console.log(inputText)}
        >
          <Text className="text-black text-center">Хэвлэх</Text>
        </TouchableOpacity>
        <View className="flex-row justify-between mb-4">
          {["PDF", "Word", "Excel"].map((type) => (
            <TouchableOpacity
              key={type}
              className={`flex-1 p-3 mx-1 rounded-lg ${
                selectedType === type
                  ? "bg-gray-500"
                  : "bg-white border border-gray-600"
              }`}
              onPress={() => setSelectedType(type)}
            >
              <Text
                className={`text-center ${
                  selectedType === type ? "text-white" : "text-gray-800"
                }`}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {selectedType && (
          <TouchableOpacity className="bg-white border border-gray-600 rounded-lg p-3 mb-4">
            <Text className="text-black text-center">{selectedType} Нэмэх</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="bg-white border border-gray-600 rounded-lg p-3 mb-4"
          onPress={handleFileUpload}
        >
          <Text className="text-black text-center">Файл сонгох</Text>
        </TouchableOpacity>
        {file && <Text className="text-center mb-4">{file.name}</Text>}
        <TouchableOpacity
          className="bg-white border flex-row items-center justify-center border-gray-600 rounded-lg p-3"
          onPress={handleSaveFile}
        >
          <Feather name="upload-cloud" size={24} color="black" />
          <Text className="text-black text-center"> </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
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
});
export default LessonSelector;
