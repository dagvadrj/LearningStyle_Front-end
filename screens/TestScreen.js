import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Modal,
  Alert, // Added Alert
  Platform,
  SafeAreaView, // Added SafeAreaView
} from "react-native";
import Checkbox from "expo-checkbox"; // Assuming expo-checkbox is used
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios"; // Use axios consistently
import { Ionicons } from "@expo/vector-icons";

const BASE_URL = "https://learningstyle-project-back-end.onrender.com/";

// Helper function to get a user-friendly description of learning style
const getLearningStyleDescription = (style) => {
    const descriptions = {
        visual: "Та мэдээллийг харах замаар илүү сайн ойлгодог. Зураг, видео, диаграм, график зэрэг нь танд илүү тохиромжтой.",
        auditory: "Та сонсох, ярилцах замаар илүү сайн суралцдаг. Аудио хичээл, хэлэлцүүлэг, ярилцлага танд илүү тохиромжтой.",
        reading_writing: "Та унших, бичих замаар илүү сайн ойлгодог. Ном, гарын авлага, тэмдэглэл хөтлөх нь танд тохиромжтой.", // 'reading' -> 'reading_writing' for consistency if backend uses that
        kinesthetic: "Та практик туршлага, хийж сурах замаар илүү сайн суралцдаг. Туршилт, дадлага ажил, бодит жишээн дээр суралцах танд тохиромжтой."
    };
    // Handle potential variations like 'reading' vs 'reading_writing'
    const key = style?.toLowerCase().replace(/ /g, '_');
    return descriptions[key] || "Таны суралцах хэв маяг тодорхойлогдлоо. Илүү дэлгэрэнгүй мэдээлэл авах боломжтой.";
};


const QuizScreen = ({ navigation }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true); // Combined loading state
  const [error, setError] = useState(null); // Error state
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: [choiceId1, choiceId2] }
  const [user, setUser] = useState(null);
  const [resultsModal, setResultsModal] = useState(false);
  const [determinedLearningStyle, setDeterminedLearningStyle] = useState(""); // Result state
  const [submitting, setSubmitting] = useState(false); // Submission loading state

  // Fetch initial data (User and Questions)
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    let token = null;

    try {
      // 1. Get Token first
      token = await AsyncStorage.getItem("user_token");
      if (!token) {
        // Handle not logged in state - show login prompt instead of error?
        // For now, set user to null and proceed to fetch public questions
        setUser(null);
        console.log("Token not found, user not logged in.");
        // Optionally throw an error if login is strictly required BEFORE showing questions
        // throw new Error("AUTH_TOKEN_MISSING");
      }

      // 2. Fetch User and Questions in parallel
      const [userResponse, questionsResponse] = await Promise.all([
        // Fetch user data only if token exists
        token
          ? axios.get(`${BASE_URL}api/users/me`, {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000,
            })
          : Promise.resolve(null), // Resolve with null if no token

        // Fetch questions (assuming public endpoint)
        axios.get(`${BASE_URL}api/learningStyle`, { timeout: 10000 }),
      ]);

      // 3. Process User Response
      if (userResponse?.data) {
        setUser(userResponse.data);
      } else if (token) {
        // Token existed but user fetch failed (e.g., expired token)
        console.warn("User data fetch failed despite token existing.");
        setUser(null); // Treat as logged out
        // Optionally clear token and navigate to login
        // await AsyncStorage.removeItem('user_token');
        // throw new Error("INVALID_TOKEN");
      }

      // 4. Process Questions Response
      // Adjust based on actual API response structure
      let fetchedQuestions = [];
      if (questionsResponse?.data && Array.isArray(questionsResponse.data)) {
         // Case 1: API returns array directly, possibly nested like [ { questions: [...] } ]
         if (questionsResponse.data.length > 0 && Array.isArray(questionsResponse.data[0]?.questions)) {
             fetchedQuestions = questionsResponse.data[0].questions;
         }
         // Case 2: API returns array of questions directly
         else if (questionsResponse.data.length > 0 && questionsResponse.data[0]?.questionText) {
             fetchedQuestions = questionsResponse.data;
         }
      } else if (questionsResponse?.data?.questions && Array.isArray(questionsResponse.data.questions)) {
         // Case 3: API returns an object { questions: [...] }
         fetchedQuestions = questionsResponse.data.questions;
      }

      if (fetchedQuestions.length > 0) {
        setQuestions(fetchedQuestions);
      } else {
        console.error("API response format error or no questions found:", questionsResponse?.data);
        throw new Error("Асуулт татахад алдаа гарлаа эсвэл асуулт олдсонгүй.");
      }

    } catch (err) {
      console.error("Error fetching initial data:", err);
      setError(
        err.message === "AUTH_TOKEN_MISSING" || err.message === "INVALID_TOKEN"
          ? "Нэвтэрч орно уу."
          : err.response?.data?.message || err.message || "Мэдээлэл татахад алдаа гарлаа."
      );
      // Clear states on error
      setUser(null);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array, runs once on mount

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Handle checkbox changes (allows multiple selections per question)
  const handleCheckboxChange = useCallback((questionId, choiceId) => {
    setSelectedAnswers((prev) => {
      const currentQuestionAnswers = prev[questionId] || [];
      let newQuestionAnswers;

      if (currentQuestionAnswers.includes(choiceId)) {
        // Remove choice if already selected
        newQuestionAnswers = currentQuestionAnswers.filter((id) => id !== choiceId);
      } else {
        // Add choice if not selected
        newQuestionAnswers = [...currentQuestionAnswers, choiceId];
      }

      // If the array for the question becomes empty, remove the question key
      if (newQuestionAnswers.length === 0) {
        const { [questionId]: _, ...rest } = prev; // Remove questionId key
        return rest;
      } else {
         return {
             ...prev,
             [questionId]: newQuestionAnswers,
          };
      }
    });
  }, []);


  // Handle Quiz Submission
  const handleSubmit = useCallback(async () => {
    const answeredQuestionsCount = Object.keys(selectedAnswers).length;

    // Check if user is logged in
    if (!user || !user._id) {
      Alert.alert("Нэвтрэлт Шаардлагатай", "Тест илгээхийн тулд нэвтэрч орно уу.", [
         { text: "Болих" },
         { text: "Нэвтрэх", onPress: () => navigation.navigate("Login") } // Assuming a 'Login' route exists
      ]);
      return;
    }

    // Check if any answer is selected
    if (answeredQuestionsCount === 0) {
      Alert.alert("Анхааруулга", "Та дор хаяж нэг асуултад хариулна уу.");
      return;
    }

    // Optional: Check if all questions are answered
    // if (answeredQuestionsCount < questions.length) {
    //   Alert.alert("Анхааруулга", "Та бүх асуултад хариулна уу.");
    //   return;
    // }

    setSubmitting(true);
    setError(null); // Clear previous submission errors
    let styleResult = "";

    try {
      const token = await AsyncStorage.getItem("user_token");
      if (!token) throw new Error("Authentication token not found");

      // Format answers for the API
      const formattedAnswers = Object.entries(selectedAnswers)
        .map(([questionId, choiceIds]) => {
          const question = questions.find((q) => q._id === questionId);
          if (!question || !choiceIds || choiceIds.length === 0) return null;

          const selectedChoices = choiceIds
            .map((choiceId) => {
              const choice = question.choices.find((c) => c._id === choiceId);
              // Ensure backend gets what it needs (adjust based on backend requirements)
              return choice ? {
                  _id: choice._id, // Usually backend only needs the ID
                  // text: choice.text, // Probably unnecessary
                  learningStyleType: choice.learningStyleType // Crucial for calculation
              } : null;
            })
            .filter(Boolean); // Remove nulls if a choice wasn't found (shouldn't happen)

          return selectedChoices.length > 0 ? { questionId, selectedChoices } : null;
        })
        .filter(Boolean); // Remove nulls if a question had no valid choices selected

      if (formattedAnswers.length === 0) {
        throw new Error("Хүчинтэй хариулт сонгогдоогүй байна.");
      }

      const payload = {
        studentId: user._id,
        answers: formattedAnswers,
      };

      console.log("Submitting Payload:", JSON.stringify(payload, null, 2));

      // Make the POST request using axios
      const response = await axios.post(`${BASE_URL}api/learningExams`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 15000, // Add timeout
      });

      console.log("Submission Response Data:", response.data);

      // Process response - Adjust based on your actual API response structure
      // Option A: Backend directly returns the calculated learning style array/string
      if (response.data?.learningStyle) {
          styleResult = Array.isArray(response.data.learningStyle)
            ? response.data.learningStyle[0] // Take the first one if array
            : response.data.learningStyle;
      }
      // Option B: Backend returns the updated user object containing the style
      else if (response.data?.user?.learningStyle) {
           styleResult = Array.isArray(response.data.user.learningStyle)
            ? response.data.user.learningStyle[0]
            : response.data.user.learningStyle;
           // Update local user state if backend sends back the full user object
           setUser(response.data.user);
           // Also update AsyncStorage if needed
           await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
      }
      // Option C: Need to re-fetch user data (Less ideal)
      else {
        console.log("Re-fetching user data to get learning style...");
        const updatedUserData = await axios.get(`${BASE_URL}api/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (updatedUserData.data?.learningStyle) {
            styleResult = Array.isArray(updatedUserData.data.learningStyle)
                ? updatedUserData.data.learningStyle[0]
                : updatedUserData.data.learningStyle;
            setUser(updatedUserData.data); // Update user state
            await AsyncStorage.setItem('user_data', JSON.stringify(updatedUserData.data));
        } else {
            throw new Error("Суралцах хэв маяг тодорхойлсны дараа хэрэглэгчийн мэдээллээс олдсонгүй.");
        }
      }


      // Show results modal if style determined
      if (styleResult) {
        setDeterminedLearningStyle(styleResult);
        setResultsModal(true);
      } else {
         throw new Error("Суралцах хэв маягийг тодорхойлж чадсангүй.");
      }

    } catch (err) {
      console.error("Error during handleSubmit:", err);
      const message = err.response?.data?.message || err.message || "Шалгалт илгээхэд тодорхойгүй алдаа гарлаа.";
      Alert.alert("Алдаа", message);
      setError(message); // Set error state to potentially display in UI
    } finally {
      setSubmitting(false);
    }
  }, [selectedAnswers, questions, user, navigation]); // Dependencies for useCallback

  const handleCloseResults = useCallback(() => {
    setResultsModal(false);
    navigation.navigate('Main'); // Navigate to main screen after closing modal
  }, [navigation]);

  // --- Render Functions ---

  const renderHeader = () => (
    <View style={styles.listHeader}>
        <Text style={styles.mainTitle}>Суралцах Арга Барилын Тест</Text>
        <Text style={styles.subTitle}>Өөрт тохирох хариултуудыг сонгоно уу.</Text>
    </View>
  );

  const renderFooter = () => (
     // Show login button only if loading is finished and user is not logged in
     !loading && !user ? (
         <View style={styles.footerContainer}>
             <Text style={styles.loginPromptText}>Тестийн хариуг хадгалахын тулд нэвтэрнэ үү.</Text>
             <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate("Login")}
             >
                 <Text style={styles.buttonText}>Нэвтрэх</Text>
             </TouchableOpacity>
         </View>
     ) : (
         // Show submit button if user is logged in
         <View style={styles.footerContainer}>
             <TouchableOpacity
                style={[styles.button, submitting && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={submitting || Object.keys(selectedAnswers).length === 0} // Disable if submitting or no answers
             >
                {submitting ? (
                    <ActivityIndicator size="small" color="white" />
                ) : (
                    <Text style={styles.buttonText}>Илгээх</Text> // Text changed
                )}
             </TouchableOpacity>
         </View>
     )
  );


  const renderItem = useCallback(({ item: question }) => (
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>{question.questionText}</Text>
      {question.choices.map((choice) => (
        <TouchableOpacity // Make the whole row touchable
          key={choice._id}
          style={styles.answerRowTouchable}
          onPress={() => handleCheckboxChange(question._id, choice._id)}
          activeOpacity={0.7}
        >
          <Checkbox
            style={styles.checkbox} // Added style
            value={selectedAnswers[question._id]?.includes(choice._id) || false}
            onValueChange={() => handleCheckboxChange(question._id, choice._id)}
            color={selectedAnswers[question._id]?.includes(choice._id) ? '#ff7f50' : undefined} // Use 'coral' color when checked
          />
          {/* Allow text to wrap */}
          <Text style={styles.answerText}>{choice.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  ), [selectedAnswers, handleCheckboxChange]); // Include dependencies


  // --- Main Render Logic ---

  if (loading) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#ff7f50" />
      </SafeAreaView>
    );
  }

  if (error && !questions.length) { // Show error prominently if questions failed to load
    return (
      <SafeAreaView style={styles.centeredContainer}>
         {/* Optional Header for Error Screen */}
         <View style={styles.header}>
             <TouchableOpacity onPress={() => navigation.goBack()}>
                 <Ionicons name="chevron-back-outline" size={30} color="black" />
             </TouchableOpacity>
             <Text style={styles.headerTitle}>Алдаа</Text>
             <View style={{width: 30}}/>{/* For spacing */}
         </View>
        <View style={styles.errorContent}>
             <Ionicons name="cloud-offline-outline" size={60} color="#FF6347"/>
             <Text style={styles.errorTextDisplay}>{error}</Text>
             <TouchableOpacity style={styles.retryButton} onPress={fetchInitialData}>
                 <Text style={styles.retryButtonText}>Дахин оролдох</Text>
             </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
       {/* Custom Header */}
       <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back-outline" size={30} color="black" />
            </TouchableOpacity>
            {/* Title can be added here if needed */}
            {/* <Text style={styles.headerTitle}>Тест</Text> */}
            <View style={{width: 30}}/>{/* Placeholder for centering if title added */}
       </View>

      <FlatList
        data={questions}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader} // Add Header
        ListFooterComponent={renderFooter} // Add Footer with button/login prompt
        contentContainerStyle={styles.listContentContainer} // Padding for list content
        showsVerticalScrollIndicator={false} // Hide scrollbar
      />

      {/* Results Modal */}
      <Modal
        visible={resultsModal}
        transparent={true}
        animationType="fade" // Changed animation
        onRequestClose={() => setResultsModal(false)} // Allow closing modal with back button on Android
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 Баяр Хүргэе! 🎉</Text>
            <Text style={styles.modalSubtitle}>Таны суралцах хэв маяг:</Text>

            <View style={styles.resultBox}>
               <Text style={styles.learningStyleResultText}>
                  {determinedLearningStyle && determinedLearningStyle.charAt(0).toUpperCase() + determinedLearningStyle.slice(1)}
               </Text>
            </View>

            <Text style={styles.learningStyleDescription}>
              {getLearningStyleDescription(determinedLearningStyle)}
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCloseResults}
            >
              <Text style={styles.buttonText}>Үндсэн Цэс рүү Буцах</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  centeredContainer: { // Used for loading/error states
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5", // Match main background
    padding: 20,
  },
  errorContent: { // Content within the error state view
     alignItems: 'center',
  },
  errorTextDisplay: { // Error text style
     fontSize: 16,
     color: "#D32F2F",
     textAlign: 'center',
     marginVertical: 15,
  },
  retryButton: { // Retry button style
     backgroundColor: '#ff7f50', // Coral color
     paddingVertical: 10,
     paddingHorizontal: 25,
     borderRadius: 8,
  },
  retryButtonText: { // Retry button text style
     color: 'white',
     fontSize: 16,
     fontWeight: 'bold',
  },
  container: { // Main container after loading/error
    flex: 1,
    backgroundColor: "#f5f5f5", // Light gray background
  },
  header: { // Custom header style
    flexDirection: "row",
    justifyContent: "space-between", // Adjust if title is added
    alignItems: "center",
    paddingVertical: 10, // Reduced padding
    paddingHorizontal: 15, // Horizontal padding
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0", // Lighter border
    backgroundColor: '#f5f5f5', // Match background
  },
  headerTitle: { // Optional header title
     fontSize: 18,
     fontWeight: "600",
     color: "#333",
   },
  listContentContainer: { // Padding for FlatList content
     paddingHorizontal: 15,
     paddingBottom: 20, // Space for the footer button
  },
  listHeader: { // Header within the list
     marginVertical: 20,
     alignItems: 'center',
     borderBottomWidth: 1,
     borderBottomColor: '#eee',
     paddingBottom: 20,
  },
  mainTitle: {
     fontSize: 22,
     fontWeight: 'bold',
     color: '#333',
     textAlign: 'center',
  },
  subTitle: {
     fontSize: 14,
     color: '#666',
     textAlign: 'center',
     marginTop: 5,
  },
  questionContainer: {
    backgroundColor: "#ffffff", // White background for questions
    padding: 18, // Increased padding
    marginBottom: 15, // Increased margin
    borderRadius: 12, // More rounded corners
    borderWidth: 1,
    borderColor: "#e0e0e0", // Subtle border
    shadowColor: "#000", // Added shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  questionText: {
    fontSize: 17, // Slightly larger question text
    fontWeight: "600", // Medium weight
    color: "#333",
    marginBottom: 15, // Increased margin
    lineHeight: 24, // Improved line spacing
  },
  answerRowTouchable: { // Make the row touchable
     flexDirection: "row",
     alignItems: "center",
     marginBottom: 12, // Increased spacing
     paddingVertical: 4, // Add vertical padding for touch area
  },
  checkbox: { // Style for the checkbox itself
     marginRight: 12, // Space between checkbox and text
     // Adjust size if needed (platform specific)
     width: 22,
     height: 22,
  },
  answerText: {
    fontSize: 15, // Slightly larger answer text
    color: "#444", // Darker gray
    flex: 1, // Allow text to wrap
    lineHeight: 21,
  },
  footerContainer: { // Container for the submit button or login prompt
     paddingVertical: 20,
     paddingHorizontal: 15, // Match list padding
     alignItems: 'center', // Center button/prompt
  },
  button: { // Submit button style
    backgroundColor: "#ff7f50", // Coral color
    paddingVertical: 14, // Slightly taller
    paddingHorizontal: 20,
    borderRadius: 10, // More rounded
    alignItems: "center",
    justifyContent: "center",
    minWidth: '60%', // Minimum width
    elevation: 2, // Add elevation
     shadowColor: "#000",
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 3,
  },
  buttonDisabled: { // Disabled button style
    backgroundColor: "#cccccc", // Gray out
    elevation: 0,
  },
  buttonText: { // Text for all buttons
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginPromptText: { // Text prompting login
     fontSize: 14,
     color: '#555',
     textAlign: 'center',
     marginBottom: 15,
  },
  loginButton: { // Login button style in footer
     backgroundColor: "#ffb22c", // Use consistent color
     paddingVertical: 12,
     paddingHorizontal: 30,
     borderRadius: 8,
  },

  // --- Modal Styles ---
  modalOverlay: { // Semi-transparent background
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay
  },
  modalContent: { // Modal content container
    width: '85%', // Slightly wider
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20, // More rounded
    padding: 25, // More padding
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: { // Modal title style
    fontSize: 22, // Larger title
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
   modalSubtitle: { // Subtitle for result section
      fontSize: 16,
      color: '#555',
      marginBottom: 20,
   },
   resultBox: { // Box around the learning style name
      backgroundColor: '#FFF3E0', // Light orange background
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 10,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#FFE0B2', // Lighter orange border
   },
  learningStyleResultText: { // Learning style name (the result)
    fontSize: 22, // Larger result text
    fontWeight: 'bold',
    color: '#ff7f50', // Coral color
    textAlign: 'center',
  },
  learningStyleDescription: { // Description text
    fontSize: 15, // Slightly smaller
    textAlign: 'center',
    lineHeight: 22, // Improved spacing
    color: '#444',
    marginBottom: 25, // More space before button
  },
  modalButton: { // Modal close button
    backgroundColor: '#ff7f50', // Coral color
    paddingVertical: 12,
    paddingHorizontal: 35, // Wider button
    borderRadius: 10,
    marginTop: 10,
  },
});

export default QuizScreen;