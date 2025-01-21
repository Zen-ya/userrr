import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { useUser } from '../UserContext.js';

const NotificationsScreen = () => {
  const [currentNotification, setCurrentNotification] = useState(null); // Notification trouvée
  const [fetching, setFetching] = useState(true); // Contrôle si le fetch doit continuer
  const { userId } = useUser(); // Récupération de l'utilisateur depuis le contexte

  useEffect(() => {
    let interval;

    if (fetching && userId) {
      // Démarrer un intervalle pour chercher des notifications toutes les X secondes
      interval = setInterval(() => {
        fetchNotification();
      }, 3000); // 3 secondes
    }

    return () => clearInterval(interval); // Nettoyer l'intervalle si le composant est démonté ou si on arrête de fetch
  }, [fetching, userId]);

  // Fonction pour récupérer les notifications
  const fetchNotification = async () => {
    if (!userId) return;
  
    try {
      const response = await fetch(`http://Enchanter.somee.com/api/Notifications/user/${userId}`);
      const data = await response.json();
  
      if (response.ok && data.length > 0) {
        const pendingNotification = data[0].status === 'Pending';
        console.log(pendingNotification);
        if (pendingNotification) {
          setCurrentNotification(pendingNotification); // Prendre la première notification "Pending"
          setFetching(false); // Arrêter les fetchs
        } else {
          setCurrentNotification(null); // Aucune notification en attente
        }
      }
    } catch (error) {
      console.error('Error fetching notification:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du chargement des notifications');
    }
  };
  
  const handleResponse = async (status) => {
    if (!currentNotification) return;
  
    try {
      const response = await fetch(
        `http://Enchanter.somee.com/api/Notifications/user/response/${userId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        }
      );
  
      if (response.ok) {
        Alert.alert('Réponse envoyée', `Vous avez répondu: ${status}`);
        setCurrentNotification(null); // Réinitialiser la notification actuelle
        setTimeout(() => setFetching(true), 1000); // Pause avant de reprendre les fetchs
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue lors de l\'envoi de la réponse');
      }
    } catch (error) {
      console.log('Error sending response:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'envoi de la réponse');
    }
  };
  

  if (!currentNotification) {
    return null; // Ne rien afficher si aucune notification
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>

      <View style={styles.notification}>
        <Text style={styles.message}>{currentNotification.Message}</Text>
        <View style={styles.buttonContainer}>
          <Button title="Yes" onPress={() => handleResponse('Accepted')} />
          <Button title="No" onPress={() => handleResponse('Rejected')} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  notification: {
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  message: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default NotificationsScreen;
