import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";

const QuestionPopup = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  // Асуулт болон хариултууд
  const question = "Чи шинэ мэдээлэл сурахдаа ямар аргыг ашигладаг вэ?";
  const answers = [
    { id: 1, text: "📊 График, зураг харж ойлгодог", type: "visual" },
    { id: 2, text: "🎧 Сонсож ойлгодог", type: "auditory" },
    { id: 3, text: "🖐 Туршиж, хийж үзэж сурах", type: "kinesthetic" },
    { id: 4, text: "📖 Уншиж, бичиж тэмдэглэх", type: "reading" },
  ];

  // Хариулт сонгох функц
  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    setModalVisible(false);
    alert(`Та ${answer.text} сонголоо!`);
  };

  return (
    <View style={styles.container}>
      {/* Тест эхлүүлэх товч */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Тест Эхлүүлэх</Text>
      </TouchableOpacity>

      {/* Modal (Popup) */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.questionText}>{question}</Text>

            {answers.map((answer) => (
              <TouchableOpacity
                key={answer.id}
                style={styles.answerButton}
                onPress={() => handleAnswer(answer)}
              >
                <Text style={styles.answerText}>{answer.text}</Text>
              </TouchableOpacity>
            ))}

            {/* Хаах товч */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Хаах</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Стилийн хэсэг
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  questionText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  answerButton: {
    backgroundColor: "#28A745",
    padding: 12,
    marginVertical: 5,
    width: "100%",
    borderRadius: 8,
  },
  answerText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#DC3545",
    padding: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default QuestionPopup;
