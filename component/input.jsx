// Input Component (Reusable)
import React from 'react';
import { View, TextInput } from 'react-native';
import { Octicons } from '@expo/vector-icons';

const InputField = ({ icon, value, onChangeText, placeholder, secureTextEntry, keyboardType }) => (
  <View style={styles.formInputWrapper}>
    <Octicons name={icon} size={20} color="black" />
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize="none"
      autoCorrect={false}
    />
  </View>
);

export default InputField;