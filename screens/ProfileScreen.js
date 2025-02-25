import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import MyButton from "../components/MyButton";
MyButton;
import * as ImagePicker from "expo-image-picker";

const ProfileScreen = ({ navigation }) => {
  const baseUrl = "https://learningstyle-project-back-end.onrender.com/";
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [register, setRegister] = useState("");
  const [learningStyle, setLearningStyle] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [user_photo, setUserphoto] = useState("");
  const [angi, setAngi] = useState("");
  const [description, setDescription] = useState("");



  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("user_token");
        if (token) {
          const response = await axios.get(`${baseUrl}api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data) {
            setUser(response.data);
            setFirstName(response.data.first_name);
            setLastName(response.data.last_name);
            setEmail(response.data.email);
            setRegister(response.data.register);
            setPhoneNumber(response.data.phone_number);
            setLearningStyle(response.data.learningStyle);
            setAngi(response.data.class);
            setDescription(response.data.description);
            setUserphoto(response.data.user_photo);
            setLearningStyle(response.data.learningStyle);
            setAngi(response.data.class);
            setDescription(response.data.description);
            console.log(response.data.description);
          }
        }
        
      } catch (error) {
        console.error("Алдаа:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } =
        await Camera.requestCameraPermissionsAsync();
      const { status: mediaStatus } =
        await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(cameraStatus === "granted");
      setHasMediaLibraryPermission(mediaStatus === "granted");
    })();
  }, []);

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setUserphoto(result.assets[0].uri);
    }
  };
  const takePicture = async () => {
    if (cameraRef.current) {
      let photo = await cameraRef.current.takePictureAsync({
        base64: true,
      });
      setUserphoto(photo.uri);
    }
  };

  const handleSave = async () => {
    try {
      if (!user || !user._id) {
        Alert.alert("Алдаа", "Хэрэглэгчийн мэдээлэл олдсонгүй.");
        return;
      }

      const token = await AsyncStorage.getItem("user_token");
      if (!token) {
        Alert.alert("Алдаа", "Токен олдсонгүй. Та дахин нэвтэрнэ үү.");
        return;
      }

      const formData = new FormData();

      // Өөрчлөгдсөн мэдээллүүдийг нэмэх
      if (firstName !== user.first_name)
        formData.append("first_name", firstName);
      if (lastName !== user.last_name) formData.append("last_name", lastName);
      if (email !== user.email) formData.append("email", email);
      if (phoneNumber !== user.phone_number)
        formData.append("phone_number", phoneNumber);

      // Зураг оруулсан эсэхийг шалгах
      if (user_photo) {
        let filename = user_photo.split("/").pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;

        formData.append("user_photo", {
          uri: user_photo,
          name: filename,
          type,
        });
      }

      if (formData._parts.length === 0) {
        Alert.alert("Анхаар!", "Та ямар нэг мэдээлэл өөрчлөх хэрэгтэй.");
        return;
      }

      // Сервер рүү илгээх
      const response = await axios.patch(
        `${baseUrl}api/users/${user._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedUser = response.data.user;
      await AsyncStorage.setItem("user_data", JSON.stringify(updatedUser));

      setUser(updatedUser);
      Alert.alert("Амжилттай", "Мэдээлэл шинэчлэгдлээ!");
    } catch (error) {
      console.error("Алдаа:", error);

      if (error.response) {
        if (error.response.status === 400) {
          Alert.alert("Алдаа", "Буруу хүсэлт. Дахин оролдоно уу.");
        } else if (error.response.status === 404) {
          Alert.alert("Алдаа", "Хэрэглэгч олдсонгүй.");
        } else if (error.response.status === 500) {
          Alert.alert("Серверийн алдаа", "Дотоод серверийн алдаа гарлаа.");
        } else {
          Alert.alert("Алдаа", `Тодорхойгүй алдаа: ${error.response.status}`);
        }
      } else if (error.request) {
        Alert.alert("Алдаа", "Сервертэй холбогдож чадсангүй.");
      } else {
        Alert.alert("Алдаа", "Шинэчлэх явцад алдаа гарлаа!");
      }
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user_token");
    await AsyncStorage.removeItem("user_data");
    setUser(null);
    navigation.navigate("Main");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="tomato" />
        <Text>Ачааллаж байна...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {user ? (
        <>
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: user_photo || `${baseUrl}public/${user.user_photo}`,
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity
              style={styles.imageButton}
              onPress={handleImagePick}
            >
              <Icon name="plus" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row" }}>
            <Text style={styles.rowLabel}>Овог</Text>
            <Text style={{ ...styles.rowLabel, paddingLeft: "40%" }}>Нэр</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
            }}
          >
            <TextInput
              style={styles.rowInput}
              value={lastName}
              onChangeText={setLastName}
            />

            <TextInput
              style={styles.rowInput}
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>
          <Text style={styles.label}>И-мэйл</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Text style={styles.label}>Утасны дугаар</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <Text style={styles.label}>Регистрийн дугаар</Text>
          <TextInput
            style={styles.input}
            value={register}
            onChangeText={setRegister}
            keyboardType="phone-pad"
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              justifyContent: "baseline",
            }}
          >
            <Text style={styles.label}>Таны сурах чиглэл</Text>

            <TouchableOpacity
              style={styles.testBtn}
              value={learningStyle}
              onPress={() => {
                navigation.navigate("Test");
              }}
            >
              <Text style={{ color: "#fff" }}>Тест өгөх</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Анги</Text>
          <TextInput
            style={styles.input}
            value={angi}
            onChangeText={setAngi}
            keyboardType="phone-pad"
          />
          <Text style={styles.label}>Миний дэлгэрэнгүй</Text>
          <TextInput
            style={styles.description}
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity style={styles.buttonSave} onPress={handleSave}>
            <Text style={styles.btnSaveText}>Хадгалах</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="log-out" size={24} color="white" />
          </TouchableOpacity>
        </>
      ) : (
          <SafeAreaView style={{ alignItems: "center", marginTop: 20 }}>
            <Text style={styles.info}>Хэрэглэгчийн мэдээлэл олдсонгүй.</Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Icon name="log-out" size={24} color="white" />
            </TouchableOpacity>
          </SafeAreaView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "tomato",
  },
  imageContainer: {
    position: "relative",
    alignItems: "baseline",
    justifyContent: "center",
  },
  imageButton: {
    position: "absolute",
    bottom: 5,
    right: 270,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "tomato",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
  },
  description: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    width: "100%",
    height: "15%",
    marginBottom: 10,
  },
  testBtn: {
    width: "30%",
    backgroundColor: "#FF6348",
    height: 30,
    justifyContent: "center",
    borderRadius: 10,
    marginLeft: "30%",
    alignItems: "center",
    marginTop: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    width: "100%",
    marginBottom: 10,
  },
  rowInput: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    width: "50%",
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  logoutButton: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "tomato",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonSave: {
    width: "100%",
    backgroundColor: "#FF6348",
    height: 40,
    justifyContent: "center",
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  btnSaveText: {
    color: "white",
    fontSize: 16,
  },
  info: {
    fontSize: 18,
    color: "#333",
  },
});

export default ProfileScreen;
