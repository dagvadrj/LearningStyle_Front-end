import React, { useRef, useEffect } from "react";
import { Animated, View, StyleSheet } from "react-native";

const CustomLoader = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View className="w-[100] h-10 mr-1 overflow-hidden bg-gray-100 rounded-md justify-center items-center">
      <Animated.View
        style={[
          styles.bar,
          {
            opacity,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    width: "200%",
    height: "200%",
    backgroundColor: "gray",
  },
});

export default CustomLoader;
