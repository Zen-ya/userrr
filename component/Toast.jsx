import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Toast = ({ message, visible }) => {
  if (!visible) return null;

  return (
    <View style={styles.toast}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 150,
    left: '20%',
    transform: [{ translateX: -50 }],
    backgroundColor: '#c41010',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
    width: '100%', // You can adjust the width
  },
  toastText: {
    color: '#fff',
    textAlign: 'center',
  },
});

export default Toast;

