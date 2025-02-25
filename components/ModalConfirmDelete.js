import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import React from "react";
import { text } from "@fortawesome/fontawesome-svg-core";
import { SafeAreaProvider } from "react-native-safe-area-context";

const ModalConfirmDelete = ({ props, visible, cancel, deleteItem, item }) => {
  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <SafeAreaView style={styles.centerView}>
        <View style={styles.centerView}>
          <View style={styles.modalView}>
            <Text style={styles.text}>Устгахад итгэлтэй байна уу?</Text>
            <View
              style={{
                flexDirection: "row",
                marginTop: 20,
                width: "60%",
                justifyContent: "space-around",
              }}
            >
              <TouchableOpacity
                style={styles.addBtn}
                {...props}
                onPress={cancel}
              >
                <Text style={styles.addBtnText}>Хаах</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addBtn}
                {...props}
                onPress={deleteItem}
              >
                <Text style={styles.addBtnText}>Устгах</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default ModalConfirmDelete;

const styles = StyleSheet.create({
  centerView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCss: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "gray",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    fontSize: 18,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    marginVertical: 10,
    width: "40%",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  addBtnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
  },
});
