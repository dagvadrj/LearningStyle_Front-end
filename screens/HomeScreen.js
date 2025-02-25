import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
  RefreshControl,
} from "react-native";
import axios from "axios";
import ModalAddBook from "../components/ModalAddBook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = ({ navigation }) => {
  const [books, setBooks] = useState([]);

  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [user, setUser] = useState(null);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    category_id: "",
    description: "",
    price: "",
    logo: "",
    url: "",
  });
  const baseUrl = "https://learningstyle-project-back-end.onrender.com/";

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBooks();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchBooks();
    fetchCategories();
    setTimeout(3000);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("user_token");
        if (token) {
          const response = await axios.get(`${baseUrl}api/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          if (response.data) {
            setUser(response.data);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const fetchBooks = useCallback(async () => {
    try {
      const response = await axios.get(`${baseUrl}api/books`);
      setBooks(response.data);
      console.log(response.data._id);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${baseUrl}categories`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  const addBook = useCallback(async () => {
    try {
      const response = await axios.post(`${baseUrl}api/books`, {
        title: newBook.title,
        author: newBook.author,
        category_id: newBook.category_id,
        description: newBook.description,
        price: newBook.price,
        userId: user._id,
      });
      const addedBook = response.data;
      console.log("Шинэ ном:", addedBook);

      setBooks((prevBooks) => [...prevBooks, addedBook]);
      setShowModal(false);
    } catch (error) {
      console.error(
        "Error adding book:",
        error.response?.data || error.message
      );
    }
  }, [newBook, user, books]);

  const renderBookItem = ({ item }) => (
    <View style={styles.bookItem}>
      <Image
        source={{ uri: `${baseUrl}public/${item.logo}` }}
        style={styles.bookImage}
      />
      <Text style={styles.bookTitle}>{item.title}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#075eec" />

      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Text style={styles.header}>Хичээл</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.subHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ScrollView
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={styles.subHeaderContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.subHeaderBtn}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.subHeaderBtnText}>Бүх хичээл</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.subHeaderBtn}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.subHeaderBtnText}>Видео хичээл</Text>
          </TouchableOpacity>
        </ScrollView>

        <ScrollView style={styles.container}>
          <View>
            <Text style={styles.sectionTitle}>Уран зохиол</Text>
            <FlatList
              data={books}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(book) => book._id}
              renderItem={renderBookItem}
              initialNumToRender={5}
              maxToRenderPerBatch={10}
              windowSize={10}
            />
          </View>
        </ScrollView>
      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <ModalAddBook
        visible={showModal}
        onClose={() => setShowModal(false)}
        onAddBook={addBook}
        newBook={newBook}
        setNewBook={setNewBook}
        userName={user ? `${user.first_name} ${user.last_name}` : ""}
        categories={categories}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 100,
    margin: 10,
    justifyContent: "center",
    alignSelf: "baseline",
    backgroundColor: "#f2f2f2",
    paddingBottom: 10,
  },
  headerContent: {
    alignItems: "center",
  },
  header: {
    fontSize: 22,
    paddingLeft: 10,
    paddingBottom: 20,
    color: "black",
  },
  subHeader: {
    backgroundColor: "#f2f2f2",
    paddingVertical: 10,
  },
  subHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  subHeaderBtn: {
    backgroundColor: "tomato",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  subHeaderBtnText: {
    color: "#fff",
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginTop: 10,
  },
  bookImage: {
    width: 100,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: "baseline",
    alignItems: "baseline",
  },
  bookTitle: {
    fontFamily: "FiraCode",
    fontSize: 12,
    textAlign: "center",
  },
  bookItem: {
    flexDirection: "column",
    alignItems: "center",
    padding: 15,
    justifyContent: "baseline",
    width: 100,
    height: 250,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginHorizontal: 10,
  },
  fab: {
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
  fabText: {
    fontSize: 30,
    color: "#fff",
  },
});

export default HomeScreen;
