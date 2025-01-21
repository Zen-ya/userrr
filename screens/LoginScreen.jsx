// android 484173504020-34j0esk4sii7ihnnan58tprvt5ms3auu.apps.googleusercontent.com
// ios 484173504020-rueq1pt41djcioqh71nb5g3mvn9crdkt.apps.googleusercontent.com

import { PulsatingIcon } from '../component/logo';

import * as LocalAuthentication from 'expo-local-authentication';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Octicons } from '@expo/vector-icons';
import PropTypes from 'prop-types'; // Import PropTypes for validation
import Toast from '../component/Toast';
import * as WebBrowser from 'expo-web-browser';
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const apiUrl = 'http://www.ApiEnchanter.somee.com/api/UsersControllers';
  const [isFingerprintAvailable, setIsFingerprintAvailable] = useState(false);
  const [playlistId, setPlaylistId] = useState('');                                           
  const [playlistIdPerformances , setPlaylistIdPerformances] = useState('');
  const [userid, setUserid] = useState('');

 
  useEffect(() => {
    const checkFingerprintAvailability = async () => {
       username = await AsyncStorage.getItem('username');
       userid =  await AsyncStorage.getItem('userid');
       playlistId = await AsyncStorage.getItem('PlaylistId');
       playlistIdPerformances = await AsyncStorage.getItem('PlaylistIdPerformances');
       if (username && userid && playlistId && playlistIdPerformances) {
         setIsFingerprintAvailable(true);
        }
      };
      
      console.log(' getttt '+ userid , playlistId , playlistIdPerformances , username);

    checkFingerprintAvailability();
  }, []);

  // Connexion avec empreinte digitale
  const handleFingerprintAuth = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authentification avec empreinte digitale',
      fallbackLabel: 'Utiliser le mot de passe',
    });
    if (result.success) {
      console.log('result');
      // Rediriger vers la page d'accueil après l'authentification réussie
      navigation.navigate('TabNavigator', { userId: userid, userName: username, PlaylistId: playlistId, PlaylistIdPerformances: playlistIdPerformances });
    } else {
      alert('Authentification échouée');
    }
  };
  

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleLogin = async () => {
    setIsLoading(true);

    if (!username.trim() || !password) {
      showToast('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://www.ApiEnchanter.somee.com/api/UsersControllers/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ userName: username, password }),
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Playlist et username  ' + userData.playlistId);

        // Convertir en chaîne avant de stocker
        if (userData.id) await AsyncStorage.setItem('userid', userData.id.toString());
        if (username) await AsyncStorage.setItem('username', username.toString());
        if (userData.PlaylistId) await AsyncStorage.setItem('PlaylistId', userData.PlaylistId.toString());
        if (userData.PlaylistIdPerformances) await AsyncStorage.setItem('PlaylistIdPerformances', userData.PlaylistIdPerformances.toString());
        setUserid(userData.id);
        setPlaylistId(userData.playlistId);
        setPlaylistIdPerformances(userData.playlistIdPerformances);
    

        console.log('apres set item '+ userData.id)
        // Afficher le bouton d'empreinte digitale pour les connexions futures
        setIsFingerprintAvailable(true);
        console.log('apres sPlaylistId '+ userData.playlistIdPerformances);
        navigation.navigate('TabNavigator', { userId: userData.id, userName: userData.userName, PlaylistId: userData.playlistId, PlaylistIdPerformances: userData.playlistIdPerformances });
      } else {
        const errorText = await response.text();
        showToast(`Login failed: ${errorText || 'Incorrect username or password.'}`);
      }
    } catch (error) {
      console.error('Login Error:', error.message);
      showToast('Error during login: ' + error.message);
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
        <PulsatingIcon/>
        <View style={styles.formInputWrapper}>
          <Octicons name="person" size={20} color="black" />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
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
        {isFingerprintAvailable && (
          <TouchableOpacity onPress={handleFingerprintAuth} style={styles.googleLoginButton} >
            <Text>Connexion with Digitale finger</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleLogin} style={styles.loginButton} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
        </TouchableOpacity>
        <View style={styles.authQuestion}>
          <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')} style={styles.signupButton}>
            <Text style={styles.signupText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("ForgotPasswordScreen" )} style={styles.forgotPasswordButton}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        <Toast message={toastMessage} visible={toastVisible} />
      </View>
    </ImageBackground>
  );
}

// Add PropTypes validation for the component's props
LoginScreen.propTypes = {
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
    height: '100%',
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
  loginButton: {
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
  signupButton: {
    borderColor: '#17469f',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 10,
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
  },
  signupText: {
    color: '#17469f',
    fontSize: 16,
  },forgotPasswordButton: {
    marginTop: 10,
  },
  forgotPasswordText: {
    color: '#007BFF',
    fontSize: 14,
  },googleLoginButton: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: '#db4437',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 18,
  }
  
});
