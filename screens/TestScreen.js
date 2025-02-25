import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";

const questions = [
  {
    id: 1,
    question: "Та аливаа шинэ мэдээллийг хэрхэн хамгийн сайн ойлгодог вэ?",
    options: ["Унших", "Сонсох", "Дүрслэх", "Практик туршилт"],
  },
  {
    id: 2,
    question: "Хичээлээ давтахдаа ямар арга илүү үр дүнтэй байдаг вэ?",
    options: [
      "Тэмдэглэл хөтлөх",
      "Багшийн ярьсныг дахин сонсох",
      "Зураг, диаграмм харах",
      "Гардан хийх, дасгал ажиллах",
    ],
  },
];

const LearningStyleTest = () => {
  const [answers, setAnswers] = useState({});

  const handleSelect = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmit = () => {
    console.log("User Answers:", answers);
    alert("Тест амжилттай бөглөгдлөө!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {questions.map((q) => (
          <View key={q.id} style={styles.questionBlock}>
            <Text style={styles.questionText}>{q.question}</Text>
            {q.options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  answers[q.id] === option && styles.selectedOption,
                ]}
                onPress={() => handleSelect(q.id, option)}
              >
                <Text>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Хариулт илгээх</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
    backgroundColor: "#fff",
  },
  questionBlock: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  optionButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 5,
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#66ff66",
  },
  submitButton: {
    backgroundColor: "#ff6347",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LearningStyleTest;
