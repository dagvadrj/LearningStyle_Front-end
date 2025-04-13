import React, { useState, useEffect, useCallback } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Screens
import HomeScreen from "./HomeScreen";
import ProfileScreen from "./ProfileScreen";
import ChatScreen from './AIScreen';

// Screen names
const homeName = "Home";
const profileName = "Profile";
const chatBotName = "ChatScreen"

const Tab = createBottomTabNavigator();

function MainContainer({ navigation }) {
  return (
    <Tab.Navigator
      initialRouteName={homeName}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let rn = route.name;

          if (rn === homeName) {
            iconName = focused ? "folder" : "folder-outline";
          }else if (rn === chatBotName) {
            iconName = focused ? "chatbox-ellipses" : "chatbox-ellipses-outline";
          } else if (rn === profileName) {
            iconName = focused ? "person" : "person-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: {
          fontWeight: 700,
        },
        tabBarActiveTintColor: "#FFB22C",
        tabBarInactiveTintColor: "grey",
        tabBarStyle: {
          paddingTop: 10,
          height: 90,
          backgroundColor: "#fff",
        },
      })}
    >
      <Tab.Screen
        name={homeName}
        component={HomeScreen}
        options={{ title: "Хичээл " }}
      />
      <Tab.Screen
      name={chatBotName}
      component={ChatScreen}
      options={{ title: "Чат бот" }}
    />
      <Tab.Screen
        name={profileName}
        component={ProfileScreen}
        options={{ title: "Профайл" }}
      />
    </Tab.Navigator>
  );
}

export default MainContainer;
