import React, { createContext, useContext, useReducer } from "react";

const RegisterContext = createContext();

const registerReducer = (state, action) => {
  switch (action.type) {
    case "REGISTER_SUCCESS":
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

export const RegisterContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(registerReducer, { user: null });

  return (
    <RegisterContext.Provider value={{ state, dispatch }}>
      {children}
    </RegisterContext.Provider>
  );
};

export const useRegisterContext = () => useContext(RegisterContext);
