import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

const RegisterInput = ({ onRegisterChange }) => {
  const [registerData, setRegisterData] = useState({
    letter1: "Р",
    letter2: "Д",
    number: "",
  });

  const [visiblePopup, setVisiblePopup] = useState(null); // "letter1", "letter2" эсвэл null

  const mongolianLetters = [
    "А",
    "Б",
    "В",
    "Г",
    "Д",
    "Е",
    "Ё",
    "Ж",
    "З",
    "И",
    "Й",
    "К",
    "Л",
    "М",
    "Н",
    "О",
    "Ө",
    "П",
    "Р",
    "С",
    "Т",
    "У",
    "Ү",
    "Ф",
    "Х",
    "Ц",
    "Ч",
    "Ш",
    "Щ",
    "Ъ",
    "Ы",
    "Ь",
    "Э",
    "Ю",
    "Я",
  ];

  const handleSelectLetter = (letter, type) => {
    const updatedData = { ...registerData, [type]: letter };
    setRegisterData(updatedData);
    setVisiblePopup(null); // Popup хаах
    updateRegisterString(updatedData);
  };

  const handleNumberChange = (text) => {
    if (/^\d*$/.test(text) && text.length <= 8) {
      const updatedData = { ...registerData, number: text };
      setRegisterData(updatedData);
      updateRegisterString(updatedData);
    }
  };

  // Бүртгэлийн утга шинэчлэх функц
  const updateRegisterString = (data) => {
    const registerString = `${data.letter1}${data.letter2}${data.number}`;
    if (data.number.length === 8) {
      console.log("Бүртгэлийн дугаар:", registerString);
    } // 🔹 Console дээр шууд хэвлэнэ
    const isValid = data.number.length === 8; // Дугаар 8 оронтой үед зөв гэж тооцох
    onRegisterChange(isValid, registerString);
    if (isValid) {
      Keyboard.dismiss();
    }
  };

  // Дэлгэцийн гадна дарахад popup хаах
  const dismissPopup = () => {
    setVisiblePopup(null);
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissPopup}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.letterBox}
          onPress={() => setVisiblePopup("letter1")}
        >
          <Text style={styles.letterText}>{registerData.letter1}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.letterBox}
          onPress={() => setVisiblePopup("letter2")}
        >
          <Text style={styles.letterText}>{registerData.letter2}</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.inputBox}
          placeholder="Дугаар"
          value={registerData.number}
          onChangeText={handleNumberChange}
          keyboardType="numeric"
        />

        {/* Popup Modal */}
        <Modal visible={!!visiblePopup} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={dismissPopup}>
            <View style={styles.modalContainer}>
              <View style={styles.popup}>
                <Text style={styles.popupTitle}>Үсэг сонгох</Text>
                <FlatList
                  data={mongolianLetters}
                  keyExtractor={(item) => item}
                  numColumns={5}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.popupItem}
                      onPress={() => handleSelectLetter(item, visiblePopup)}
                    >
                      <Text style={styles.popupText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};
// энэнгүэр дуудаж ажиллуулах
/* const isValidRegister = (register) => /^[А-Я]{2}[0-9]{8}$/.test(register);
if (!isValidRegister(register)) {
      setError("Регистрийн дугаар буруу байна!");
      setIsLoading(false);
      return;
    }
<RegisterInput
            onRegisterChange={(isValid, registerString) =>
              setRegister(registerString)
            }
          />
*/
const styles = StyleSheet.create({
  container: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 20,
  },
  letterBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginRight: 10,
  },
  letterText: {
    fontSize: 18,
  },
  inputBox: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  // Popup Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    backgroundColor: "#fff",
    width: 250,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  popupItem: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  popupText: {
    fontSize: 16,
  },
});

export default RegisterInput;
