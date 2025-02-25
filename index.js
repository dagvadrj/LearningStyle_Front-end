import "react-native-gesture-handler"; // Must be at the top
import { registerRootComponent } from "expo";
import React from "react";
import { AppRegistry } from "react-native";
import App from "./App";
import { AuthContextProvider } from "./context/authContext";
import { name as appName } from "./app.json";
import { RegisterContextProvider } from "./hooks/useRegisterContext";
import { BookProvider } from "./context/bookContext";

const RootComponent = () => (
  <AuthContextProvider>
    <RegisterContextProvider>
      <BookProvider />
      <App />
    </RegisterContextProvider>
  </AuthContextProvider>
);

AppRegistry.registerComponent(appName, () => RootComponent);
registerRootComponent(RootComponent);
