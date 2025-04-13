import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Dimensions, Alert, Button } from 'react-native';
import { Camera } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import * as facemesh from '@tensorflow-models/facemesh';
import * as DocumentPicker from 'expo-document-picker';
import Pdf from 'react-native-pdf'; 
import CryptoJS from "crypto-js";



const EyeTrackingApp = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [eyePosition, setEyePosition] = useState(null);
  const [pdfUri, setPdfUri] = useState(null);
  const cameraRef = useRef(null);
  const SHA1 = require("crypto-js/sha1");


  // Камераас зөвшөөрөл авах
  useEffect(() => {
    const getPermission = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getPermission();
  }, []);

  // Нүдний хөдөлгөөнийг илрүүлэх
  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      const model = await facemesh.load();

      const intervalId = setInterval(async () => {
        if (cameraRef.current) {
          const predictions = await model.estimateFaces(cameraRef.current);
          if (predictions.length > 0) {
            const leftEye = predictions[0].annotations.leftEyeUpper0;
            const rightEye = predictions[0].annotations.rightEyeUpper0;
            setEyePosition({ leftEye, rightEye });
            checkAttention({ leftEye, rightEye });
          }
        }
      }, 1000);

      return () => clearInterval(intervalId); 
    };

    loadModel();
  }, []);

  // Анхаарал шалгах
  const checkAttention = (eyePosition) => {
    if (!eyePosition) return;
    const { leftEye, rightEye } = eyePosition;
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;

    const isFocused =
      leftEye[0][0] > 50 &&
      leftEye[0][0] < screenWidth - 50 &&
      leftEye[0][1] > 100 &&
      leftEye[0][1] < screenHeight - 100;

    if (!isFocused) {
      Alert.alert('⚠️ Анхаарал!', 'Та анхаарлаа төвлөрүүлнэ үү!');
    }
  };

  // PDF сонгох
  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (result.type === 'success') {
      setPdfUri(result.uri);
    }
  };

  if (hasPermission === null) {
    return <Text>Loading...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Камераас видео дүрс үзүүлэх */}
      <Camera ref={cameraRef} style={{ flex: 1 }} type={Camera.Constants.Type.front} />

      {/* PDF харуулах */}
      {pdfUri && (
        <Pdf source={{ uri: pdfUri, cache: true }} style={{ flex: 1, width: Dimensions.get('window').width }} />
      )}

      <Button title="PDF сонгох" onPress={handlePickDocument} />
    </View>
  );
};

export default EyeTrackingApp;