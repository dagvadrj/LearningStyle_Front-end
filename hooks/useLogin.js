import { useState } from "react";
import axios from "axios";
import { useAuthContext } from "../context/authContext";
import { useNavigation } from "@react-navigation/core";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuthContext();
  const navigate = useNavigation();

  const loginUser = async (userData) => {
    setIsLoading(true);
    if (setIsLoading == true) {
      setTimeout(2000);
    }
    setError(null);

    try {
      console.log("Sending login data:", userData);

      const response = await fetch("http://192.168.1.235:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uname: userData.uname,
          password: userData.password,
        }),
      });

      console.log("Login response:", response.data);

      if (response.status === 200) {
        AsyncStorage.setItem("user", JSON.stringify(response.data.user));
        dispatch({
          type: "LOGIN",
          payload: response.data.user,
          token: response.data.token,
        });
        setIsLoading(false);
        navigate("Home");
      }
    } catch (error) {
      setIsLoading(false);
      if (error.response) {
        const errorMessage =
          error.response.data.message || error.response.data.error;
        console.error("Login error details:", errorMessage);
        setError(errorMessage);
      } else if (error.message) {
        console.error("Error message:", error.message);
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  return { loginUser, isLoading, error };
};
