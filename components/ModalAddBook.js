import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import MyButton from "./MyButton";
import { Ionicons } from "@expo/vector-icons";
import { color } from "./../node_modules/nativewind/src/tailwind/color";

const ModalAddBook = ({
  visible,
  onClose,
  onAddBook,
  newBook,
  setNewBook,
  userName,
  categories,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("");

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Modal visible={visible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Хичээл оруулах</Text>

            <ScrollView contentContainerStyle={styles.scrollView}>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  onPress={() => alert("Зураг оруулах")}
                  style={styles.modalButton}
                  value={newBook.logo}
                  onChangeText={(text) =>
                    setNewBook({ ...newBook, logo: text })
                  }
                >
                  <Ionicons
                    name="image-outline"
                    size={30}
                    color={"#fff"}
                  ></Ionicons>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => alert("Номын файл оруулах")}
                  style={styles.modalButton}
                  value={newBook.url}
                  onChangeText={(text) => setNewBook({ ...newBook, url: text })}
                >
                  <Ionicons
                    name="document-outline"
                    size={30}
                    color={"#fff"}
                  ></Ionicons>
                </TouchableOpacity>
              </View>
              <TextInput
                placeholder="Хичээлийн нэр"
                style={styles.input}
                value={newBook.title}
                onChangeText={(text) => setNewBook({ ...newBook, title: text })}
              />
              {/* <TextInput
                placeholder="Зохиогч"
                style={styles.input}
                value={newBook.author}
                onChangeText={(text) =>
                  setNewBook({ ...newBook, author: text })
                }
              /> */}

              <Text style={styles.sectionTitle}>Хичээлийн ангилал сонгох</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedCategory}
                  onValueChange={(itemValue) => {
                    setSelectedCategory(itemValue);
                    setNewBook({ ...newBook, category_id: itemValue });
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Ангилал сонгох" value="" />
                  {categories.map((category) => (
                    <Picker.Item
                      key={category._id}
                      label={category.category_name}
                      value={category._id}
                    />
                  ))}
                </Picker>
              </View>

              <TextInput
                placeholder="Дэлгэрэнгүй"
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={4}
                value={newBook.description}
                onChangeText={(text) =>
                  setNewBook({ ...newBook, description: text })
                }
              />

              <TextInput
                placeholder="Ном нэмсэн хүн"
                editable={false}
                style={styles.input}
                value={userName}
              />
            </ScrollView>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={onAddBook}>
                <Text style={styles.modalButtonText}>Нэмэх</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.modalButtonText}>Болих</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "70%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  scrollView: {
    paddingBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginVertical: 6,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginVertical: 6,
    backgroundColor: "#fff",
  },
  picker: {
    height: 200,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
  },
  modalButton: {
    backgroundColor: "tomato",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 14,
  },
});

export default ModalAddBook;
