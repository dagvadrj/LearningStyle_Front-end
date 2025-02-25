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
            <Text style={styles.modalTitle}>Ном нэмэх</Text>

            <ScrollView contentContainerStyle={styles.scrollView}>
              <TextInput
                placeholder="Зургийн URL"
                style={styles.input}
                value={newBook.logo}
                onChangeText={(text) => setNewBook({ ...newBook, logo: text })}
              />
              <TextInput
                placeholder="Номын URL"
                style={styles.input}
                value={newBook.url}
                onChangeText={(text) => setNewBook({ ...newBook, url: text })}
              />
              <TextInput
                placeholder="Номын нэр"
                style={styles.input}
                value={newBook.title}
                onChangeText={(text) => setNewBook({ ...newBook, title: text })}
              />
              <TextInput
                placeholder="Зохиогч"
                style={styles.input}
                value={newBook.author}
                onChangeText={(text) =>
                  setNewBook({ ...newBook, author: text })
                }
              />

              <Text style={styles.sectionTitle}>Ангилал сонгох</Text>
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

              <TextInput
                placeholder="Үнэ"
                style={styles.input}
                keyboardType="numeric"
                value={newBook.price}
                onChangeText={(text) => setNewBook({ ...newBook, price: text })}
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
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
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
    justifyContent: "space-between",
    marginTop: 15,
  },
  modalButton: {
    backgroundColor: "#075eec",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "gray",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ModalAddBook;
