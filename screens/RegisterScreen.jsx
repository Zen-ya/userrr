import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { Octicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import Toast from '../component/Toast';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [birthday, setBirthday] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const apiUrl = 'http://www.ApiEnchanter.somee.com/api/UsersControllers/create';

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const validateInputs = () => {
    const usernameRegex = /^[a-zA-Z0-9]{3,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!usernameRegex.test(username)) {
      showToast('The username must contain at least 3 alphanumeric characters.');
      return false;
    }
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address.');
      return false;
    }
    if (!phoneRegex.test(phone)) {
      showToast('The phone number must contain exactly 10 digits.');
      return false;
    }
    if (!passwordRegex.test(password)) {
      showToast('The password must be at least 8 characters long, with an uppercase letter, a lowercase letter, a number, and a special character.');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          userName: username,
          email,
          phone,
          password,
          birthday: birthday.toISOString().split('T')[0],
          IpUser:'',
          link:''
        }),
      });
    
      const responseData = await response.json(); // Lisez la réponse une seule fois
    
      if (response.ok) {
        console.log('User registered:', responseData);
        showToast('Register sucessful !');
        navigation.navigate('Login');
      } else {
        // Utilisez la réponse JSON déjà lue pour afficher le message d'erreur
        console.log(responseData);
        showToast(`Error : ${responseData.message || 'Erreur inconnue.'}`);
      }
    } catch (error) {
      console.error('Registration Error:', error.message);
      showToast('Erreur Registration: ' + error.message);
    }
    finally {
      setIsLoading(false);
    }
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const handleConfirm = (event, selectedDate) => {
    setDatePickerVisibility(false);
    if (selectedDate) {
      setBirthday(selectedDate);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/pexels-screenpost-4526396 (1).jpg')}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.formInputWrapper}>
          <Octicons name="person" size={20} color="black" />
          <TextInput
            style={styles.input}
            placeholder="User name"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <View style={styles.formInputWrapper}>
          <Octicons name="mail" size={20} color="black" />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
        </View>
        <View style={styles.formInputWrapper}>
          <Octicons name="device-mobile" size={20} color="black" />
          <TextInput
            style={styles.input}
            placeholder="Phone"
            value={phone}
            onChangeText={setPhone}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.formInputWrapper}>
          <Octicons name="shield-lock" size={20} color="black" />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity onPress={showDatePicker} style={styles.datePickerButton}>
          <Text style={styles.datePickerText}>Birthday: {birthday.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {isDatePickerVisible && (
          <DateTimePicker
            value={birthday}
            mode="date"
            display="default"
            onChange={handleConfirm}
          />
        )}

        <TouchableOpacity onPress={handleRegister} style={styles.registerButton} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
        </TouchableOpacity>

        <View style={styles.authQuestion}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginButton}>
            <Text style={styles.loginText}>Already have an acount ? Login</Text>
          </TouchableOpacity>
        </View>

        <Toast message={toastMessage} visible={toastVisible} />
      </View>
    </ImageBackground>
  );
}

RegisterScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  formInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 6,
    paddingLeft: 8,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    marginLeft: 10,
  },
  datePickerButton: {
    width: '100%',
    height: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  datePickerText: {
    color: 'black',
  },
  registerButton: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 255, 0.8)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  authQuestion: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  loginButton: {
    borderColor: '#17469f',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 10,
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
  },
  loginText: {
    color: '#17469f',
    fontSize: 16,
  },
});
