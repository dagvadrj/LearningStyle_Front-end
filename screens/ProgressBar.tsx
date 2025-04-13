"use client"

import { useEffect, useRef } from "react"
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

interface ProgressBarProps {
  progress: number // 0 to 100
  height?: number
  backgroundColor?: string
  gradientColors?: string[]
  textColor?: string
  animated?: boolean
  showPercentage?: boolean
  style?: object
}

export default function BeautifulProgressBar({
  progress,
  height = 12,
  backgroundColor = "#f0f0f0",
  gradientColors = ["#00c6ff", "#0072ff"],
  textColor = "#333",
  animated = true,
  showPercentage = true,
  style = {},
}: ProgressBarProps) {
  // Clamp progress between 0-100
  const clampedProgress = Math.min(Math.max(progress, 0), 100)

  // Animation value
  const animatedWidth = useRef(new Animated.Value(0)).current
  const screenWidth = Dimensions.get("window").width

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: clampedProgress,
        duration: 20, // Энд тохируулаад 500ms болголоо
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(clampedProgress);
    }
  }, [clampedProgress, animated]);
  

  // Interpolate width based on progress
  const width = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  })

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.progressBackground, { height, backgroundColor }]}>
        <Animated.View style={{ width, height: "100%", overflow: "hidden" }}>
          <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient} />
        </Animated.View>

        {/* Animated dots for extra visual appeal */}
        <View style={styles.dotsContainer}>
          {[...Array(8)].map((_, i) => (
            <View key={i} style={styles.dot} />
          ))}
        </View>
      </View>

      {showPercentage && (
        <Text style={[styles.progressText, { color: textColor }]}>{Math.round(clampedProgress)}%</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 10,
  },
  progressBackground: {
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  gradient: {
    height: "100%",
    width: "100%",
  },
  progressText: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
  },
  dotsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
})
