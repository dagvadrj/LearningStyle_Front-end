import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  ImageBackground,
  TextInput,
  Alert
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import axios from "axios";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RouteParams = {
  lessonId: string;
  contentTitle: string;
};

const LessonDetail = ({ navigation }) => {
  const route = useRoute<RouteProp<{ params: RouteParams }, "params">>();
  const { lessonId, contentTitle } = route.params;

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hicheelName, setHicheelName] = useState("");

  const [showQuiz, setShowQuiz] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState([]);
  const [score, setScore] = useState(0);
  const [user, setUser] = useState("");
  const [userId, setUserId] = useState("");
  const [textId, setTextId] = useState("");
  const [generatedExamId, setGeneratedExamId] = useState(null);
  const baseUrl = "https://learningstyle-project-back-end.onrender.com/";

  useEffect(() => {
    const fetchHicheel = async () => {
      try {
        const response = await axios.get(`${baseUrl}get-all-lessons`);
        if (response.status === 200) {
          const lessons = response.data.data;
          const foundLesson = lessons.find((h) => h._id === lessonId);
          setHicheelName(
            foundLesson ? foundLesson.lessonName : "Хичээл олдсонгүй"
          );
        }
      } catch (error) {
        console.log("Алдаа гарлаа:", error.message);
      }
    };
    fetchHicheel();
  }, [lessonId]);
  console.log(questions[currentQuestionIndex])
  useEffect( () => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseUrl}text/list`);
        if (response.status === 200 && response.data.success) {
          const matchedLesson = response.data.texts.find(
            (text) =>
              String(text.lessonId) === String(lessonId) &&
              text.contentTitle === contentTitle
          );
          setLesson(matchedLesson);
          setTextId(response.data.texts._id);
        }
      } catch (error) {
        console.error("Алдаа:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  const handleStartQuiz = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}quiz/${lesson._id}`);
      if (response.status === 200 && response.data.success) {
        setQuestions(response.data.questions);
        setShowQuiz(true);
        setGeneratedExamId(response.data.newlyCreatedExamId);

      }
    } catch (error) {
      console.error("Шалгалтын асуулт авахад алдаа:", error);
    } finally {
      setLoading(false);
    }
  };
  // Асуултад хариулах үед
  const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex]; 
    
 setResults((prev) => [
   ...prev,
   {
     // Use the actual question's ID
     questionId: generatedExamId,
     userAnswer: answer,
     // No need for isCorrect here
   },
 ]);
    console.log(results)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswer("");
    } else {
      handleSubmitExam();
    }
  };

  const handleSubmitExam = async () => {
    try {
      if (!generatedExamId) {
        console.log(generatedExamId)
        Alert.alert("Алдаа", "Шалгалтын ID олдсонгүй. Дахин оролдоно уу.");
        return;
      }
  
      const payload = {
        examId: generatedExamId, // Assuming lesson._id is the exam ID, might need clarification
        studentId: userId,
        lessonId: lessonId, // This comes from route params, seems correct
        answers: results.map((r) => ({ // Remove the filter
          questionId: r.questionId,
          userAnswer: r.userAnswer, // Change key name
        })),
        // Remove score: 0, unless required
      };
  console.log("userID",userId)
      console.log("Payload:", payload);
  
      const token = await AsyncStorage.getItem("user_token");
      console.log(token)
      await axios.post(`${baseUrl}submit-exam`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      console.log("Шалгалт амжилттай илгээгдлээ!");
    } catch (error) {
      console.error("Шалгалт илгээхэд алдаа:", error);
    }
  };
  

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
      setUserId(userResponse.data._id);
      setUser(userResponse.data);
    } catch (error) {
      console.log("Алдаа гарлаа:", error.message);
    }
  };
  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Хичээл олдсонгүй</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={{ uri: "https://source.unsplash.com/featured/?education" }}
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        {!showQuiz ? (
          <>
            <View style={styles.backArrow}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back-outline" size={30} color="black" />
              </TouchableOpacity>
              <Text style={styles.backArrowTitle}>{hicheelName}</Text>
              <View className="flex-row absolute right-0 mr-4">
                <TouchableOpacity
                  className="flex-row rounded-md items-center justify-center bg-[#f97316] pl-2 p-1"
                  onPress={() => {
                    {
                      handleStartQuiz();
                    }
                  }}
                >
                  <Text
                    style={styles.buttonText}
                    className="text-white font-bold,"
                  >
                    Шалгалт өгөх
                  </Text>
                  <View className="flex-row">
                    <Ionicons name="chevron-forward" size={20} color="white" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <View className="mb-4 ">
                <Text className="mr-6" style={styles.backArrowTitle}>
                  Гарчиг: {lesson?.contentTitle}
                </Text>
              </View>
              <Text style={styles.text}>{lesson?.content}</Text>
            </ScrollView>
          </>
        ) : (
          <>
            <View style={styles.backArrow}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back-outline" size={30} color="black" />
              </TouchableOpacity>
              <Text style={styles.backArrowTitle}>{hicheelName}</Text>
              <View className="flex-row absolute right-0 mr-4"></View>
            </View>
            <View style={styles.quizCard}>
              <Text style={styles.questionNumber}>
                Асуулт {currentQuestionIndex + 1} / {questions.length}
              </Text>
              <Text style={styles.questionText}>
                {questions[currentQuestionIndex]?.question}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Хариултаа бичнэ үү..."
                value={answer}
                onChangeText={setAnswer}
                multiline
              />

              <TouchableOpacity
                style={styles.button}
                onPress={handleNextQuestion}
              >
                <Text style={styles.buttonText}>
                  {currentQuestionIndex === questions.length - 1
                    ? "Дуусгах"
                    : "Үргэлжлүүлэх"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  scrollContainer: {
    paddingBottom: 20,
    margin: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 15,
    borderRadius: 10,
  },
  startQuizButton: {
    backgroundColor: "#f97316",
    alignItems: "center",
    marginVertical: 0,
  },
  button: {
    backgroundColor: "#ffb22c",
    padding: 15,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
  quizCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 6,
    padding: 20,
    margin: 20,
    marginTop: 20,
  },
  questionNumber: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 10,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1f2937",
  },
  input: {
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 6,
    minHeight: 80,
    textAlignVertical: "top",
    fontSize: 16,
  },
});

export default LessonDetail;
