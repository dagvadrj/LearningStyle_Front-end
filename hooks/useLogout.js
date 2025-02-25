import { useAuthContext } from "../context/authContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useLogout = () => {
  const { dispatch } = useAuthContext();
  const logout = () => {
    AsyncStorage.removeItem("user");
    AsyncStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
  };
  return { logout };
};
