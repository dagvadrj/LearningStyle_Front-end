import React, { useState, useEffect, useCallback } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

// Screens
import HomeScreen from "./HomeScreen";
import LoginScreen from "./LoginScreen";
import ProfileScreen from "./ProfileScreen";
import SearchScreen from "./SearchScreen";
import TestScreen from "./TestScreen";

// Screen names
const homeName = "Home";
const loginName = "Login";
const profileName = "Profile";
const searchName = "Search";

const Tab = createBottomTabNavigator();

function MainContainer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("user_token");
      console.log("Token:", token);
      setIsLoggedIn(!!token);
    };
  
    checkLoginStatus();
  }, [isLoggedIn]); // ✅ Токен өөрчлөгдөх бүрт энэ useEffect ажиллана
  

  return (
    <Tab.Navigator
      initialRouteName={homeName}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let rn = route.name;

          if (rn === homeName) {
            iconName = focused ? "home" : "home-outline";
          } else if (rn === searchName) {
            iconName = focused ? "search" : "search-outline";
          } else if (rn === loginName) {
            iconName = focused ? "log-in" : "log-in-outline";
          } else if (rn === profileName) {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabel: () => null, // 🔹 Tab label-ийг нуух
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "grey",
        tabBarStyle: {
          paddingTop: 10,
          height: 90,
          backgroundColor: "#fff",
        },
      })}
    >
      <Tab.Screen name={homeName} component={HomeScreen} />
      <Tab.Screen name={searchName} component={SearchScreen} />

      {isLoggedIn ? (
        <Tab.Screen name={profileName} component={ProfileScreen} />
      ) : (
        <Tab.Screen name={loginName} component={LoginScreen} />
      )}
    </Tab.Navigator>
  );
}

export default MainContainer;
