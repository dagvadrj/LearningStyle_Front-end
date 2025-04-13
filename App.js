import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainContainer from "./screens/MainContainer";
import StartScreen from "./screens/StartScreen";
import ChatScreen from "./screens/AIScreen";
import ProfileScreen from "./screens/ProfileScreen";
import HomeScreen from "./screens/HomeScreen";
import SignUpScreen from "./screens/SignUpScreen";
import LoginScreen from "./screens/LoginScreen";
import ProfileScreenDetail from "./screens/ProfileScreenDetail";
import TestScreen from "./screens/TestScreen";
import AddLessonText from "./screens/AddLessonText";
import forgotPassword from "./screens/ForgotPassword";
import InfoScreen from "./screens/InfoScreen";
import AddLessonForm from "./screens/AddLesson";
import AddLessonMaterial from "./screens/AddLessonMaterial";
import AudioLessonScreen from "./screens/AudioLessonScreen";
import Friends from "./screens/Friends";
import LessonDetailScreen from "./screens/LessonDetailScreen";
import LessonLearningType from "./screens/LessonLearningType";
import ExamScreen from "./screens/ExamScreen";
import VideoScreen from "./screens/VideoScreen";
const Stack = createNativeStackNavigator();

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Start"
          option={{ headerShown: false }}
        >
          <Stack.Screen
            name="Start"
            component={StartScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Main"
            component={MainContainer}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProfileDetail"
            component={ProfileScreenDetail}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Test"
            component={TestScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={forgotPassword}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddLessonText"
            component={AddLessonText}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Info"
            component={InfoScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddLesson"
            component={AddLessonForm}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddLessonMaterial"
            component={AddLessonMaterial}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Friends"
            component={Friends}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AudioLesson"
            component={AudioLessonScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="LessonDetail"
            component={LessonDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="LessonLearningType"
            component={LessonLearningType}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ExamScreen"
            component={ExamScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="VideoScreen"
            component={VideoScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;
