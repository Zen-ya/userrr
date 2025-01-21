import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, ImageBackground } from 'react-native';
import Toast from '../component/Toast';


export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [userid, setUserid] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [stage, setStage] = useState('enterEmail'); // stages: enterEmail, enterCode, resetPassword

  // Show toast for quick feedback
  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  // Step 1: Send verification code via SendGrid
  const handleSendCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://ApiEnchanter.somee.com/api/UsersControllers/email/${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
     
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUserid(userData.id);
        console.log(userData.id);
        if (userData) {
          const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
          setGeneratedCode(generatedCode);
        console.log(generatedCode);
                 
          const response = await fetch(`http://ApiEnchanter.somee.com/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({ userName:email , password:generatedCode }),
          });

          console.log('response');
  
          if (response.status === 200) {
            showToast('Verification code sent to your email.');
            setStage('enterCode');
          } else {
            showToast('Error sending verification code. Try again.');
          }
        } else {
          showToast('Email not found.');
        }
      } else {
        showToast('Email not found.');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error fetching data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Step 2: Validate the verification code
  const validateVerificationCode = () => {
    if (verificationCode === generatedCode) {
      Alert.alert('Success', 'The verification code is valid!');
      setStage('resetPassword'); // Move to the reset password stage
    } else {
      Alert.alert('Error', 'The verification code is incorrect.');
    }
  };

  // Step 3: Reset the password
  const handleResetPassword = async () => {
    setIsLoading(true);
    console.log(userid)
    try {
      const response = await fetch(`http://ApiEnchanter.somee.com/api/UsersControllers/password/${userid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });
      console.log(response);
      if (response.ok) {
        showToast('Password reset successfully. Please log in.');
        navigation.navigate('Login');
      } else {
        showToast('Error resetting password.');
      }
    } catch (error) {
      console.error('Error:', error.message);
      showToast('Error resetting password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/pexels-screenpost-4526396 (1).jpg')}
      style={styles.background}
    >
      <View style={styles.container}>
        {stage === 'enterEmail' && (
          <>
            <Text style={styles.label}>Enter your email to receive a verification code</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TouchableOpacity onPress={handleSendCode} style={styles.button} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Code</Text>}
            </TouchableOpacity>
          </>
        )}

        {stage === 'enterCode' && (
          <>
            <Text style={styles.label}>Enter the verification code sent to your email</Text>
            <TextInput
              style={styles.input}
              placeholder="Verification Code"
              value={verificationCode}
              onChangeText={setVerificationCode}
              autoCapitalize="none"
              keyboardType="numeric"
            />
            <TouchableOpacity onPress={validateVerificationCode} style={styles.button} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify Code</Text>}
            </TouchableOpacity>
          </>
        )}

        {stage === 'resetPassword' && (
          <>
            <Text style={styles.label}>Enter your new password</Text>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={handleResetPassword} style={styles.button} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
            </TouchableOpacity>
          </>
        )}

        <Toast message={toastMessage} visible={toastVisible} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    margin: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
