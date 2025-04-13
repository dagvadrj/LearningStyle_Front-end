// ExamScreen.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ExamScreen = ({ route, navigation }) => {
  const [answers, setAnswers] = useState([]);

  // Асуултад хариу өгөх үед
  const handleSelectAnswer = (questionId, selectedAnswer) => {
    setAnswers((prev) => {
      const updated = prev.filter((a) => a.questionId !== questionId);
      return [...updated, { questionId, userAnswer: selectedAnswer }];
    });
  };

  const handleSubmitExam = async () => {
    if (answers.length !== questions.length) {
      Alert.alert("Анхаар!", "Та бүх асуултанд хариулаагүй байна.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("user_token");

      const payload = {
        examId,
        lessonId,
        studentId,
        answers: answers.map((a) => ({
          questionId: a.questionId,
          selectedAnswer: a.userAnswer,
        })),
      };

      console.log("Payload:", JSON.stringify(payload, null, 2));

      await axios.post(`${baseUrl}submit-exam`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      Alert.alert("Амжилттай", "Шалгалт амжилттай илгээгдлээ");
      navigation.goBack();
    } catch (error) {
      console.error("Илгээхэд алдаа:", error);
      Alert.alert("Алдаа", "Шалгалт илгээхэд алдаа гарлаа.");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {questions.map((q, index) => (
        <View key={q._id} style={{ marginBottom: 24 }}>
          <Text style={{ fontWeight: "bold" }}>
            {index + 1}. {q.question}
          </Text>
          {q.options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleSelectAnswer(q._id, opt)}
              style={{
                padding: 10,
                marginTop: 6,
                backgroundColor: answers.find(
                  (a) => a.questionId === q._id && a.userAnswer === opt
                )
                  ? "#cce5ff"
                  : "#f2f2f2",
                borderRadius: 8,
              }}
            >
              <Text>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <Button title="Илгээх" onPress={handleSubmitExam} />
    </ScrollView>
  );
};

export default ExamScreen;
