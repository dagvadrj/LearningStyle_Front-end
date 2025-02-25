import React from "react";
import { View, TextInput, StyleSheet } from "react-native";

export default function MyInput(props) {
  return (
    <TextInput
      {...props}
      autoCapitalize="none"
      autoCorrect={false}
      style={props.style}
    />
  );
}
