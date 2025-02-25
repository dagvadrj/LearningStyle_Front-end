import React from "react";
import { TouchableOpacity, Text, View } from "react-native";

const MyButton = (props) => {
  return (
    <TouchableOpacity
      {...props}
      style={[styles.btn, props.style]}
    ></TouchableOpacity>
  );
};

const styles = {
  formAction: {
    marginTop: 4,
  },
  btn: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    width: "70%",
    paddingVertical: 5,
    backgroundColor: "tomato",
  },
  btnText: {
    fontSize: 14,
    lineHeight: 26,
    fontWeight: "600",
    color: "#fff",
  },
};

export default MyButton;
