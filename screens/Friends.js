import React, { useState, useEffect, useCallback, useRef } from "react"; // useRef нэмсэн
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator, // Нэмсэн
  Alert, // Нэмсэн
  Keyboard, // Нэмсэн
  Platform, // Нэмсэн
} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/FontAwesome"; // Эсвэл Feather ашиглах
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather"; // Feather нэмсэн
import debounce from "lodash.debounce";
import AsyncStorage from "@react-native-async-storage/async-storage"; // AsyncStorage нэмсэн

const Friends = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]); // Хайлтын үр дүн
  const [isLoading, setIsLoading] = useState(false); // Хайлт хийх үеийн loading
  const [searchError, setSearchError] = useState(null); // Хайлтын алдаа
  const [addingFriendId, setAddingFriendId] = useState(null); // Аль найзыг нэмж байхад loading харуулах ID
  const [initialLoad, setInitialLoad] = useState(true); // Анхны ачаалалт эсэхийг хянах

  const baseUrl = "https://learningstyle-project-back-end.onrender.com/";

  // Debounce хийгдсэн хайлтын функц
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) { // Хоосон зайг арилгаад шалгах
        setUsers([]);
        setIsLoading(false);
        setSearchError(null);
        setInitialLoad(false); // Хайлт хийсэн гэж үзнэ
        return;
      }

      setIsLoading(true);
      setSearchError(null);
      setInitialLoad(false); // Хайлт хийсэн гэж үзнэ
      console.log(`Searching for: ${query}`);

      try {
        // Authentication Token авах
        const token = await AsyncStorage.getItem("user_token");
        // Token байхгүй бол хайлт хийхгүй байж болно, эсвэл backend шаардахгүй байж болно
        if (!token && false) { // backend token шаарддаг бол энийг идэвхжүүлнэ: if (!token)
             throw new Error("Authentication token not found.");
        }

        const response = await axios.get(`${baseUrl}api/users?search=${query}`, {
           // GET хүсэлтэд Content-Type header шаардлагагүй
           headers: {
               // Шаардлагатай бол Authorization нэмэх
               // Authorization: `Bearer ${token}`,
           },
           timeout: 10000, // Timeout нэмэх
        });

        if (response.data && Array.isArray(response.data.users)) { // Үр дүн массив эсэхийг шалгах
           // TODO: Өөрийгөө хайлтын үр дүнгээс хасах
           // const myUserId = await AsyncStorage.getItem("user_id"); // Эсвэл user_data-с авах
           // const filteredUsers = response.data.users.filter(user => user._id !== myUserId);
           // setUsers(filteredUsers);
           setUsers(response.data.users);
        } else {
          console.log("No users found or invalid response format");
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        if (error.message === "Authentication token not found.") {
            setSearchError("Нэвтэрч орно уу.");
             // Login руу үсэргэх
             // setTimeout(() => navigation.replace('Login'), 1500);
        } else if (error.response) {
             setSearchError(`Хайлт хийхэд алдаа гарлаа (Server: ${error.response.status}).`);
        } else if (error.request) {
             setSearchError("Сүлжээний алдаа. Холболтоо шалгана уу.");
        } else {
            setSearchError("Хайлт хийхэд тодорхойгүй алдаа гарлаа.");
        }
        setUsers([]); // Алдаа гарсан үед үр дүнг хоослох
      } finally {
        setIsLoading(false);
      }
    }, 500), // Debounce хугацааг 500ms болгосон (тохируулах боломжтой)
    [] // debounce функцыг дахин үүсгэхгүй байх хамаарал
  );

  // Хайлтын query өөрчлөгдөхөд дуудах функц
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    // Хоосон query үед шууд loading эхлүүлэхгүй
    if(query.trim()){
        setIsLoading(true); // Бичиж эхлэхэд loading харуулах (сонголтоор)
        setSearchError(null); // Шинэ хайлт эхлэхэд алдааг арилгах
    } else {
        // Хоосон болбол үр дүнг шууд цэвэрлэх (debounce хүлээлгүй)
        debouncedSearch.cancel(); // Хүлээгдэж буй debounce-г цуцлах
        setUsers([]);
        setIsLoading(false);
        setSearchError(null);
        setInitialLoad(false); // Хоосон болгосон ч хайлт хийсэн гэж үзнэ
    }
    debouncedSearch(query);
  };

  // Найз нэмэх (эсвэл хүсэлт илгээх) функц
  const handleAddFriend = useCallback(async (userIdToAdd) => {
    // Энд бодит API дуудлага хийгдэнэ
    console.log(`Attempting to add friend with ID: ${userIdToAdd}`);
    setAddingFriendId(userIdToAdd); // Нэмж буй хэрэглэгчийн ID-г хадгалах (loading харуулахын тулд)
    Keyboard.dismiss(); // Keyboard-г нуух

    try {
        const token = await AsyncStorage.getItem("user_token");
        if (!token) {
            Alert.alert("Алдаа", "Найз нэмэхийн тулд нэвтэрсэн байх шаардлагатай.");
            setAddingFriendId(null);
            return;
        }

        // Жишээ API дуудлага (Backend endpoint-оосоо хамаарна)
        // const response = await axios.post(`${baseUrl}api/friends/request`,
        //     { recipientId: userIdToAdd }, // Backend-д ямар дата хэрэгтэйг тохируулах
        //     {
        //         headers: { Authorization: `Bearer ${token}` },
        //         timeout: 15000,
        //     }
        // );

        // === Түр Alert ===
        // TODO: Дээрх API дуудлагыг хийж, response-г боловсруулах
        await new Promise(resolve => setTimeout(resolve, 1000)); // Түр loading харуулахын тулд
        // === Төгсгөл ===

        // Амжилттай болсон тохиолдолд
        Alert.alert("Амжилттай", "Найзын хүсэлт илгээгдлээ!"); // Эсвэл "Найзаар нэмэгдлээ!"

        // TODO: Нэмэгдсэн хэрэглэгчийн төлөвийг UI дээр өөрчлөх
        // Жишээ нь: users state-г шинэчлэх эсвэл тусдаа state-д нэмэгдсэн ID-г хадгалах
        // setUsers(prevUsers => prevUsers.map(u => u._id === userIdToAdd ? {...u, friend_status: 'requested'} : u));

    } catch (error) {
        console.error("Error adding friend:", error);
        let errorMessage = "Найзын хүсэлт илгээхэд алдаа гарлаа.";
        if (error.response) {
            // Backend-с ирсэн алдааг харуулах (жишээ нь: "User already friend", "Request already sent")
            errorMessage = error.response.data?.message || `Серверийн алдаа (${error.response.status}).`;
        } else if (error.request) {
            errorMessage = "Сүлжээний алдаа. Холболтоо шалгана уу.";
        }
        Alert.alert("Алдаа", errorMessage);
    } finally {
        setAddingFriendId(null); // Loading state-г арилгах
    }
  }, []); // Хамаарал хоосон

  // Хайлтын талбарыг цэвэрлэх функц
  const clearSearch = () => {
     setSearchQuery('');
     setUsers([]);
     setIsLoading(false);
     setSearchError(null);
     setInitialLoad(true); // Дахин анхны төлөвт оруулах
     debouncedSearch.cancel(); // debounce цуцлах
   };


  // --- UI Rendering ---

  // Хэрэглэгчийн мөр компонентийг тусад нь гаргах (Memo ашиглавал performance сайжирна)
  const UserItem = React.memo(({ user, onAddFriend, isAdding }) => (
    <View style={styles.userContainer}>
      <View style={styles.userInfoContainer}>
         {/* TODO: Аватар зураг нэмэх */}
         {/* <Image source={user.avatar ? {uri: user.avatar} : require('../assets/default_avatar.png')} style={styles.avatar} /> */}
         <View style={styles.avatarPlaceholder}>
            <Ionicons name="person-outline" size={20} color="#aaa" />
         </View>
        <View style={styles.userNameEmail}>
           <Text style={styles.userNameText} numberOfLines={1}>
             {user.first_name} {user.last_name}
           </Text>
           {/* Имэйл эсвэл утас харуулах эсэхийг шийдэх */}
           {/* <Text style={styles.userSecondaryText} numberOfLines={1}>{user.email}</Text> */}
           <Text style={styles.userSecondaryText} numberOfLines={1}>{user.phone_number || user.email}</Text>
        </View>
      </View>
       <TouchableOpacity
            style={[styles.addButton, isAdding && styles.addButtonDisabled]}
            onPress={() => onAddFriend(user._id)}
            disabled={isAdding}
       >
            {isAdding ? (
                <ActivityIndicator size="small" color="#ffb22c" />
             ) : (
                // TODO: Найз болсон эсвэл хүсэлт явуулсан бол icon-г солих
                <Feather name="user-plus" size={18} color="#ffb22c" />
             )}
        </TouchableOpacity>
    </View>
  ));

  return (
    <SafeAreaView style={styles.safeArea}>
        {/* Сайжруулсан Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                <Ionicons name="chevron-back-outline" size={30} color="#333"/>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Найз Хайх</Text>
            <View style={styles.headerButton} /> {/* Title-г голлуулах */}
        </View>

      {/* Хайлтын хэсэг */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
           <Feather name="search" size={20} color="#aaa" style={styles.searchIcon} />
           <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder="Нэр, имэйл эсвэл утасны дугаар..."
              placeholderTextColor="#aaa"
              returnKeyType="search" // Keyboard дээр хайх товч гаргах
              onBlur={() => Keyboard.dismiss()} // Input-с гарах үед keyboard нуух
              autoCapitalize="none"
              autoCorrect={false}
            />
             {/* Хайлтыг цэвэрлэх товч */}
             {searchQuery.length > 0 && (
               <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                 <Feather name="x" size={18} color="#aaa" />
               </TouchableOpacity>
             )}
        </View>
          {/* Хайх товч (хэрэггүй болсон байж магадгүй) */}
          {/* <TouchableOpacity style={styles.searchButton} onPress={() => handleSearchChange(searchQuery)}>
                 <Feather name="search" size={18} color="#fff" />
             </TouchableOpacity> */}
      </View>

      {/* Үр дүнгийн хэсэг */}
      <ScrollView
         style={styles.resultsScrollView}
         contentContainerStyle={styles.resultsContentContainer}
         keyboardShouldPersistTaps="handled" // Scroll хийх үед keyboard нуугдахгүй
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#ffb22c" style={styles.loadingIndicator} />
        ) : searchError ? (
          <View style={styles.messageContainer}>
             <Feather name="alert-circle" size={24} color="#FF6347" />
             <Text style={styles.errorText}>{searchError}</Text>
          </View>
        ) : initialLoad ? (
             <View style={styles.messageContainer}>
                 <Feather name="users" size={24} color="#ccc" />
                 <Text style={styles.infoText}>Найзаа хайна уу.</Text>
             </View>
        ) : users.length > 0 ? (
          users.map((user) => (
            <UserItem
              key={user._id}
              user={user}
              onAddFriend={handleAddFriend}
              isAdding={addingFriendId === user._id} // Тухайн хэрэглэгчийг нэмж байвал true
            />
          ))
        ) : (
          // Хайлт хийсэн ч үр дүн гараагүй
          <View style={styles.messageContainer}>
            <Feather name="search" size={24} color="#ccc" />
            <Text style={styles.infoText}>"{searchQuery}"-д тохирох хэрэглэгч олдсонгүй.</Text>
           </View>
        )}
      </ScrollView>

        {/* selectedUserContainer устгагдсан */}

    </SafeAreaView>
  );
};

// Сайжруулсан стильүүд
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9", // Background өнгийг бага зэрэг өөрчилсөн
  },
  header: { // Өмнөх ProfileScreen-тэй ижил загвар
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  headerButton: {
     width: 40,
     alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  searchContainer: { // Хайлтын талбар, товч багтаах хэсэг
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f9f9f9', // Header-тэй ижил
  },
  searchWrapper: { // Input болон icon-уудыг багтаана
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: '#fff',
     borderRadius: 10,
     borderColor: '#e0e0e0',
     borderWidth: 1,
     paddingHorizontal: 10,
  },
  searchIcon: {
     marginRight: 8,
  },
  searchInput: { // Хайлтын input
    flex: 1, // Боломжит зайг эзэлнэ
    height: 44, // Өндөр
    fontSize: 15,
    color: '#333',
  },
   clearButton: { // Цэвэрлэх товч
      padding: 5, // Дарах зайг нэмэх
   },
  // Хуучин searchButton (хэрэггүй болсон байж магадгүй)
  // searchButton: { ... },
  resultsScrollView: { // Үр дүн харуулах ScrollView
    flex: 1,
  },
  resultsContentContainer: { // ScrollView доторх контентийн padding
    paddingVertical: 10,
  },
  loadingIndicator: {
    marginTop: 30,
  },
   messageContainer: { // Info/Error мэдээлэл харуулах container
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      marginTop: 30,
   },
   infoText: { // Энгийн мэдээлэл (хайлт хийгээгүй, үр дүн байхгүй)
      marginTop: 10,
      fontSize: 15,
      color: '#aaa',
      textAlign: 'center',
   },
   errorText: { // Алдааны мэдээлэл
      marginTop: 10,
      fontSize: 15,
      color: '#FF6347',
      textAlign: 'center',
   },
  userContainer: { // Хэрэглэгчийн мөрийг харуулах container
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 15, // Хажуугийн зай
    marginBottom: 10, // Доороос авах зай
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 1, // Бага зэрэг сүүдэр
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
   userInfoContainer: { // Зураг, нэр, имэйл хэсэг
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1, // Баруун талын товчны зайг үлдээнэ
      paddingRight: 10, // Товчноос зай авах
   },
   avatarPlaceholder: { // Аватар зурагны оронд
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
   },
   userNameEmail: { // Нэр, имэйл багтах хэсэг
      flex: 1, // Урт нэр байвал эзлэх зай
   },
  userNameText: { // Хэрэглэгчийн нэр
    fontSize: 15, // Фонт томруулсан
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  userSecondaryText: { // Имэйл эсвэл утас
    fontSize: 13, // Фонт томруулсан
    color: "#777",
  },
   addButton: { // Найз нэмэх товч
      padding: 8, // Дарах талбайг томсгох
      borderRadius: 20, // Дугуй хэлбэртэй болгох (сонголтоор)
      // backgroundColor: '#E8F5E9', // Бага зэрэг дэвсгэр өнгө (сонголтоор)
      marginLeft: 10, // Зүүн талын текстнээс авах зай
   },
   addButtonDisabled: { // Нэмж байх үеийн стиль
      opacity: 0.5,
   },
});

export default Friends;