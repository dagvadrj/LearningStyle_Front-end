import React, { useState, useRef, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  SafeAreaView,
  Modal,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Feather";
import axios from "axios";

const ChatScreen = ({ navigation }) => {
  // Chat state
  const [messages, setMessages] = useState([
    { id: "1", text: "Сайн байна уу! Би ChatGPT", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const flatListRef = useRef(null);
  const apiUrl = "https://learningstyle-project-back-end.onrender.com/question";

  // Authentication state
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("user_token");
      if (!token) {
        setShowAuthModal(true);
      } else {
        setShowAuthModal(false);
      }
      setIsLoading(false);
    };

    checkToken();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const checkTokenOnFocus = async () => {
        const token = await AsyncStorage.getItem("user_token");
        if (!token) {
          setShowAuthModal(true);
        } else {
          setShowAuthModal(false);
        }
      };

      checkTokenOnFocus();
    }, [])
  );

  // Handle login redirection
  const handleLoginRedirect = () => {
    navigation.replace("Login");
  };

  // Navigate back to home screen
  const handleBackToHome = () => {
    navigation.navigate("Home");
    setShowAuthModal(false); // Replace with your home screen route name
  };

  // Typing animation
  const simulateTyping = (text, callback) => {
    let index = 0;
    let typedText = "";
    const interval = setInterval(() => {
      if (index < text.length) {
        typedText += text[index];
        index++;
        callback(typedText);
      } else {
        clearInterval(interval);
      }
    }, 1);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Мэссэж илгээх
  const sendMessage = async () => {
    if (!input.trim()) return;
    Keyboard.dismiss();
    const userMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      console.log("📤 Хүсэлт илгээж байна:", { message: input });
      const response = await axios.post(
        apiUrl,
        { message: input },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("✅ Серверийн хариу:", response.data);

      if (response.data?.botResponse) {
        simulateTyping(response.data.botResponse, (typedText) => {
          setMessages((prev) => {
            const updatedMessages = [...prev];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage?.sender === "bot") {
              lastMessage.text = typedText;
            } else {
              updatedMessages.push({
                id: Date.now().toString(),
                sender: "bot",
                text: typedText,
              });
            }
            return [...updatedMessages];
          });
        });
      } else {
        throw new Error("API-с хоосон хариу ирлээ.");
      }
    } catch (error) {
      console.error("API алдаа:", error.response?.data || error.message);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          sender: "bot",
          text: "Алдаа гарлаа. Дахин оролдоно уу!",
        },
      ]);
    }
  };

  // Initial loading screen
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Ачааллаж байна...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        style={{ marginBottom: 10 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.sender === "user" ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                item.sender === "bot" && styles.botText,
              ]}
            >
              {item.text}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="..."
            value={input}
            placeholderTextColor="black"
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Icon name="send" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Persistent Authentication Modal */}
      <Modal
        visible={showAuthModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {}}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Нэвтрэх шаардлагатай</Text>
            <Text style={styles.modalDescription}>
              Чат үйлчилгээг ашиглахын тулд нэвтрэх шаардлагатай. Эсвэл нүүр
              хуудас руу буцах.
            </Text>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.primaryButton]}
                onPress={handleLoginRedirect}
              >
                <Text style={styles.primaryButtonText}>Нэвтрэх</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={handleBackToHome}
              >
                <Text style={styles.secondaryButtonText}>Буцах</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  messagesContainer: {
    padding: 16,
  },
  message: {
    maxWidth: "100%",
    padding: 12,
    marginVertical: 6,
    color: "black",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "gray",
    borderRadius: 10,
  },
  botMessage: {
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#fff",
  },
  botText: {
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderStartStartRadius: 20,
    borderStartEndRadius: 20,
    backgroundColor: "#fff",
    elevation: 5,
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 2.3,
    shadowRadius: 10,
  },
  input: {
    flex: 1,
    padding: 8,
    fontSize: 16,
    color: "black",
  },
  sendButton: {
    padding: 10,
    borderRadius: 50,
    marginLeft: 8,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 22,
  },
  modalButtonContainer: {
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "#f0f0f0",
  },
  secondaryButtonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default ChatScreen;
