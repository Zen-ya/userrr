import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const toggleCamera = () => {
    setCameraOn((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      {hasPermission ? (
        cameraOn && (
          <Camera style={styles.camera} type={'front'} ref={cameraRef} />
        )
      ) : (
        <Text>No access to camera</Text>
      )}
      <TouchableOpacity onPress={toggleCamera} style={styles.button}>
        <Ionicons name={cameraOn ? "camera-off" : "camera"} size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  button: { backgroundColor: 'black', padding: 10 },
});
