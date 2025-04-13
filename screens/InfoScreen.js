import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import "../assets/global.css"
import { BottomTabBar } from "@react-navigation/bottom-tabs";
const ContactScreen = ({navigation}) => {
  const handleCall = () => Linking.openURL("tel:+97694889194");
  const handleEmail = () => Linking.openURL("mailto:dagvadorjge@gmail.com");
  const handleWebsite = () => Linking.openURL("fb://https://www.facebook.com/tenthousandonemillion/");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backArrow}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons
                  name="chevron-back-outline"
                  size={30}
                  color="black"
                />
              </TouchableOpacity>
              <Text style={styles.backArrow}>Бидний тухай</Text>
            </View>
      <View className="py-5 px-5">
        <Text className=" font-bold text-2xl color-black">Сурах арга барилын чиг хандлага, зорилго, байгууллагын үүрэг</Text>
     </View>
      <View className="py-5 px-5"><Text style={styles.headerText}>
Сурах арга барил нь хувь хүний мэдээлэл хүлээн авах, ойлгох, хэрэглэх онцлогийг тодорхойлдог. Орчин үед технологийн дэвшил, мэдээллийн хүртээмж сайжирснаар интерактив, дижитал болон өөрөө сурах арга барил түлхүү хөгжиж байна.{"\n \n"}
Энэхүү чиг хандлагын гол зорилго нь хүн бүрийн онцлогт тохирсон, үр дүнтэй, уян хатан суралцах боломжийг бүрдүүлэх явдал юм. Үүнд байгууллагууд чухал үүрэг гүйцэтгэж, боловсролын технологийг хөгжүүлэх, багш нарыг чадавхжуулах, сургалтын арга зүйг сайжруулах зэрэг ажлуудыг хийж байна.
{"\n \n"}
Мөн сургалтын платформ, онлайн контент хөгжүүлж, хувь хүний суралцах үйл явцыг дэмжих нь байгууллагуудын үүрэг юм. Ингэснээр боловсрол илүү хүртээмжтэй, хүртээмжтэй болж, хүн бүр өөрийн онцлогт тохируулан хөгжих боломжтой болно.</Text></View>
      <View style={styles.infoContainer}>
        <TouchableOpacity style={styles.row} onPress={handleCall}>
          <Ionicons name="call" size={24} color="#FF9A00" />
          <Text style={styles.text}>+976 94889194</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={handleEmail}>
          <MaterialCommunityIcons name="email-outline" size={24} color="#FF9A00" />
          <Text style={styles.text}>dagvadorjge@gmail.com</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={handleWebsite}>
          <MaterialCommunityIcons name="facebook" size={24} color="#FF9A00" />
          <Text style={styles.text}>Дагвадорж</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
  },
  headerText: {
    fontSize: 14,
    fontWeight: "400",
    color: "black",
  },
  backArrow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomColor: "#ddd",
    marginLeft: 20,
  },
  backArrowTitle: { fontSize: 18, color: "black", marginLeft: 20 },
  infoContainer: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  text: {
    fontSize: 16,
    marginLeft: 15,
    color: "#333",
  },
});

export default ContactScreen;
