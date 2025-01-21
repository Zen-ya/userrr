import React, { useState, useEffect } from 'react';
import { View, Button, Text, Alert } from 'react-native';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    // Récupérer les informations de l'utilisateur stockées lors de l'authentification
    getUserData();
  }, []);

  const initializeFingerprint = async () => {
    try {
      // Initialiser l'authentification par empreinte digitale
      await FingerprintScanner.authenticate({
        description: 'Placez votre doigt sur le capteur pour enregistrer votre empreinte.',
      });

      // Simuler l'enregistrement de l'ID et du nom d'utilisateur
      const id = 'user123'; // Remplacez ceci par votre logique d'ID utilisateur
      const name = 'John Doe'; // Remplacez ceci par votre logique de nom d'utilisateur

      // Enregistrement de l'ID et du nom d'utilisateur dans AsyncStorage
      await AsyncStorage.setItem('userId', id);
      await AsyncStorage.setItem('username', name);

      Alert.alert('Empreinte enregistrée', `Votre empreinte est enregistrée, ${name}.`);
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  const getUserData = async () => {
    const id = await AsyncStorage.getItem('userId');
    const name = await AsyncStorage.getItem('username');
    if (id && name) {
      setUserId(id);
      setUsername(name);
    }
  };

  const handleLoginWithFingerprint = async () => {
    try {
      // Authentifier l'utilisateur avec son empreinte digitale
      await FingerprintScanner.authenticate({
        description: 'Authentifiez-vous avec votre empreinte digitale',
      });

      // Récupérer les informations de l'utilisateur
      const id = await AsyncStorage.getItem('userId');
      const name = await AsyncStorage.getItem('username');

      // Redirection vers la page suivante avec l'ID de l'utilisateur
      Alert.alert('Connexion réussie', `Bienvenue, ${name}. (ID : ${id})`);
      // Ici vous pouvez naviguer vers la prochaine page de votre application
      // navigation.navigate('NextPage', { userId: id });
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>Profil de l'utilisateur</Text>
      <Button title="Configurer l'empreinte digitale" onPress={initializeFingerprint} />
      <Button title="Se connecter avec l'empreinte digitale" onPress={handleLoginWithFingerprint} />
    </View>
  );
};

export default ProfileScreen;
