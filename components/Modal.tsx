import React, { useMemo } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";

const CustomModal = ({ bottomSheetRef, closeModal }) => {
  const snapPoints = useMemo(() => ["25%", "50%", "70%"], []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
    >
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Awesome Bottom Sheet 🎉</Text>
        <Button title="Close" onPress={closeModal} />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default CustomModal;
