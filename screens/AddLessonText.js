import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import "../assets/global.css";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from '@expo/vector-icons/Feather';

const AudioPlayerScreen = ({ navigation }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isSent, setIsSent] = useState(false);
  const [hicheelName, setHicheelName] = useState("");
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState("");
  const [textInput, setTextInput] = useState("");
  const [title,setTitle] = useState("")
  const [lessonText, setLessonText] = useState("");
  const [Status, setStatus] = useState("")
  const [statusNameByID, setStatusNameByID] = useState("")
  const [topic, setTopic] = useState("")
  const [formData, setFormData] = useState({
    lessonId: selectedLesson,
    contentTitle: title,
     content: textInput,
     status: Status,
    topic: topic})

  const baseUrl = "https://learningstyle-project-back-end.onrender.com/";

  const isPaymentRequired = [
    { id: 1, text: "Тийм" },
    { id: 2, text: "Үгүй" },
  ];

  useEffect(() => {
    const fetchHicheel = async () => {
      try {
        const response = await axios.get(`${baseUrl}get-all-lessons`, {
          headers: { "Content-type": "application/json" },
        });

        if (response.data && response.data.success) {
          setLessons(response.data.data)
        }
      } catch (error) {
        console.error("Алдаа:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHicheel();
  }, []);
  const handleChange = (value) => {
    setStatus(value);
  };
  
  const handleSubmit = async () => {
    try {
      // Input Validation (keep this)
      if (!selectedLesson) {
        alert("Хичээл сонгоно уу!");
        return;
      }
      if (!title.trim()) {
        alert("Гарчиг оруулна уу!");
        return;
      }
      if (!textInput.trim()) {
        alert("Текст оруулна уу!");
        return;
      }
      // *** FIX: Determine the correct status value based on backend needs ***
      // Assuming backend needs a number 0 or 1:
      let statusValue;
      if (Status === "Тийм") {
        statusValue = 1;
      } else if (Status === "Үгүй") {
        statusValue = 0;
      } else {
        // Handle case where status is not selected or invalid, if necessary
        alert("Худалдах эсэхийг сонгоно уу!");
        return;
      }
      // Alternatively, if backend needs string "0" or "1":
      // let statusValue = Status === "Тийм" ? "1" : (Status === "Үгүй" ? "0" : "");
      // if (statusValue === "") {
      //    alert("Худалдах эсэхийг сонгоно уу!");
      //    return;
      // }
  
      // *** FIX: Construct the data object correctly ***
      const dataToSend = {
        lessonId: selectedLesson,
        contentTitle: title.trim(),
        content: textInput.trim(),
        status: statusValue, // "0" or "1" as string
        topic: topic.trim(),
      };
      
  
      console.log("Sending Data:", JSON.stringify(dataToSend, null, 2)); // Log the data being sent
  
      setLoading(true); // Indicate loading state
  
      // *** FIX: Send the dataToSend object directly ***
      const response = await axios.post(`${baseUrl}text/add`, dataToSend); // <-- Send dataToSend
  
      console.log("Server Response:", response.data);
  
      if (response.data && response.data.success) {
        alert("Амжилттай илгээлээ!");
        // Optionally clear fields or navigate away
        // setTitle("");
        // setTextInput("");
        // setTopic("");
        // setSelectedLesson("");
        // setLessonText("");
        // setStatus("");
      } else {
        // Handle potential API error messages if success is false
        alert(`Алдаа гарлаа: ${response.data.message || 'Тодорхойгүй алдаа'}`);
      }
    } catch (error) {
      console.error("Алдаа:", error);
      // Log more detailed error info if available
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error Data:", error.response.data);
        console.error("Error Status:", error.response.status);
        console.error("Error Headers:", error.response.headers);
        alert(`Серверийн алдаа: ${error.response.status} - ${error.response.data.message || 'Server error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error Request:", error.request);
        alert("Серверээс хариу ирсэнгүй. Интернэт холболтоо шалгана уу.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error Message:', error.message);
        alert(`Алдаа гарлаа: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backArrow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="chevron-back-outline"
            size={30}
            color="black"
          ></Ionicons>
        </TouchableOpacity>
        <Text style={styles.backArrow}>Текст хөрвүүлэх</Text>
      </View>
      {isSent ? (
        <View style={styles.audioPlayerContainer}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={isPlaying ? stopSound : playSound}
          >
            <Ionicons
              name={isPlaying ? "pause-circle" : "play-circle"}
              size={32}
              color="#ffb22c"
            />
            <Text style={styles.timeText}>{formatTime(position)}</Text>

            <Text style={styles.timeText}> </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="grid gap-2 m-6 md:grid-cols-2">
          <Text className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Хичээлийн нэр
          </Text>
          <TextInput
            className="bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={lessonText}
            onChangeText={(text) => setLessonText(text)}
          />
          {loading ? (
            <ActivityIndicator size="small" color="#ffb22c" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {lessons.map((lesson) => (
                <TouchableOpacity
                key={lesson._id}
                className="text-gray-900 items-center bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-md px-3 py-1 text-xs me-2 mb-1 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                onPress={() => {
                  setLessonText(lesson.lessonName); // TextInput-д хичээлийн нэрийг оноох
                  setSelectedLesson(lesson._id); // _id-г хадгалах
                }}
              >
                <Text>{lesson.lessonName}</Text>
              </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <Text className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Гарчиг
          </Text>
          <TextInput
            className="bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChangeText={(text) => setTitle(text)}
          />
          <Text className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Түлхүүр үг
          </Text>
          <TextInput
            className="bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChangeText={(text) => setTopic(text)}
          />
          <Text className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Текст
          </Text>
          <TextInput
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#ffb22c] focus:border-[#ffb22c] h-20 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-[#ffb22c] dark:focus:color-[#ffb22c]"
            multiline={true}
            textAlignVertical="top"
            onChangeText={(text) => setTextInput(text)}
          ></TextInput>
          <Text> *Та хичээлийн Текст ээ кирилээр оруулна уу</Text>
          <Text className="block mb-2 mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      Худалдах эсэх
                    </Text>
                    <View>
                      <TextInput
                        className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        keyboardType="numeric"
                        onChangeText={(text) => setStatus(text)}
                        editable={false}
                        value={Status}
                      />
                                  <ScrollView className="flex-row mt-2 mb-4" horizontal>
              {isPaymentRequired.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className={`items-center border focus:outline-none font-medium rounded-md px-12 py-1 text-xs me-2 ${
                    setStatus === item.text
                      ? "bg-[#ffb22c] text-white border-[#ffb22c] "
                      : "bg-white text-gray-900 border-gray-300 hover:bg-gray-100"
                  }`}
                  onPress={() => handleChange(item.text)}

                >
                  <Text
                    className={
                      Status === item.text
                        ? "text-gray-800"
                        : "text-gray-800"
                    }
                  >
                    {item.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
        </View>
          <View className="items-center ">
            <TouchableOpacity className="flex-row text-gray-900 items-center bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-md w-64 justify-center  py-2 text-xs me-2 mb-1 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
            onPress={handleSubmit}>
              <Feather name="upload" size={24} color="black" />
              <Text>Оруулах</Text>
            </TouchableOpacity>
          </View>
           
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
  },
  textInput: {
    height: 100,
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    textAlignVertical: "top",
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  timeText: {
    fontSize: 18,
    color: "#ffb22c",
    alignItems: "flex-end",
    fontFamily: "monospace",
    paddingHorizontal: 10,
  },
  progress: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
    width: 140,
  },
  audioPlayerContainer: {
    height: 60,
    width: "100%",

    paddingHorizontal: 20,
    flexDirection: "row",
  },
  playButton: {
    backgroundColor: "#fff",
    borderRadius: 7,
    alignItems: "center",
    flexDirection: "row",
    padding: 10,
    width: "100%",
    elevation: 5,
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
});

export default AudioPlayerScreen;
