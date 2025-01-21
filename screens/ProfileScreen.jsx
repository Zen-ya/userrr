import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  Dimensions, Image, ScrollView, StyleSheet
} from 'react-native';
import LottieView from 'lottie-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AntDesign } from '@expo/vector-icons';
import { Snackbar } from 'react-native-paper';
import PropTypes from 'prop-types';



// Import all avatars statically
import avatar1 from '../assets/Avatar/avatar1.png';
import avatar2 from '../assets/Avatar/avatar2.png';
import avatar3 from '../assets/Avatar/avatar3.png';
import avatar4 from '../assets/Avatar/avatar4.png';
import avatar5 from '../assets/Avatar/avatar5.png';
import avatar6 from '../assets/Avatar/avatar6.png';
import avatar7 from '../assets/Avatar/avatar7.png';
import avatar8 from '../assets/Avatar/avatar8.png';
import avatar9 from '../assets/Avatar/avatar9.png';
import avatar10 from '../assets/Avatar/avatar10.png';
import avatar11 from '../assets/Avatar/avatar11.png';
import avatar12 from '../assets/Avatar/avatar12.png';

// Array of avatar objects with source information
const avatars = [
  { avatar: avatar1, source: '../assets/Avatar/avatar1.png' },
  { avatar: avatar2, source: '../assets/Avatar/avatar2.png' },
  { avatar: avatar3, source: '../assets/Avatar/avatar3.png' },
  { avatar: avatar4, source: '../assets/Avatar/avatar4.png' },
  { avatar: avatar5, source: '../assets/Avatar/avatar5.png' },
  { avatar: avatar6, source: '../assets/Avatar/avatar6.png' },
  { avatar: avatar7, source: '../assets/Avatar/avatar7.png' },
  { avatar: avatar8, source: '../assets/Avatar/avatar8.png' },
  { avatar: avatar9, source: '../assets/Avatar/avatar9.png' },
  { avatar: avatar10, source: '../assets/Avatar/avatar10.png' },
  { avatar: avatar11, source: '../assets/Avatar/avatar11.png' },
  { avatar: avatar12, source: '../assets/Avatar/avatar12.png' },
];

export default function ProfileScreen({ route, navigation }) {
  const { userId } = route.params;
  const [user, setUser] = useState({
    userName: '',
    email: '',
    phone: '',
    password: '',
    birthday: '',
    avatarUrl: '',
    playlistId:'',
    playlistIdPerformances:'',
    link:'',
    ipUser:''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const apiUrl = 'http://www.enchanterr.somee.com/api/UsersControllers';

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${apiUrl}/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        console.log( userData);

        // Ensure selectedAvatar is set as an object from avatars array
        const avatar = avatars.find(a => a.source === userData.avatarUrl) || avatars[0];
        setSelectedAvatar(avatar);
        console.log('selectedAvatar: ', avatar);
      } else {
        setErrorMessage('Failed to retrieve user data');
        showSnackbar('Failed to retrieve user data', 'error');
      }
    } catch (error) {
      setErrorMessage('Error fetching user data');
      showSnackbar('Error fetching user data', 'error');
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchUserData();
    handleAvatarSelect(user.avatarUrl)
    console.log('Avatar ' + selectedAvatar);
  }, [userId]);

  const handleUpdateProfile = async () => {
    console.log(user);
    setIsUpdating(true);
  
    try {
      // Préparer les données mises à jour de l'utilisateur
      const updatedUser = {
        ...user,
        avatarUrl: selectedAvatar.source || user.avatarUrl,
        link: user.link || null,         // Ajouter le champ `link` requis
        IpUser: user.ipUser || null, 
      };
  
      console.log('Updating user:', updatedUser);
      console.log('API URL:', `${apiUrl}/${userId}`);
  
      // Effectuer la requête PUT pour mettre à jour le profil
      const response = await fetch(`${apiUrl}/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });
  
      console.log('Response status:', updatedUser);
  
      if (response.ok) {
        // Si la mise à jour a réussi
        showSnackbar('Profile updated successfully', 'success');
      } else {
        // Si la mise à jour a échoué, afficher le message d'erreur
        const errorText = await response.text();
        console.log('Failed to update profile, response text:', errorText);
        showSnackbar(`Failed to update profile: ${errorText}`, 'error');
      }
    } catch (error) {
      // En cas d'erreur inattendue, afficher un message d'erreur
      console.error('Error updating profile:', error);
      showSnackbar(`Error updating profile: ${error.message}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };
  

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    console.log(`Selected avatar source: ${avatar.source}`);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    const currentDate = selectedDate || new Date(user.birthday);
    setUser({ ...user, birthday: currentDate.toISOString().split('T')[0] });
  };

  const showSnackbar = (message, type) => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/Animation - 1726665594889.json')}
        autoPlay
        loop
        style={[styles.lottieBackground, { width: screenWidth, height: screenHeight }]}
      />

      <Text style={styles.title}>Profile</Text>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}> Logout </Text>
        <AntDesign name="logout" size={24} color="rgb(255, 0, 0)" />
      </TouchableOpacity>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Loading...</Text>
        </View>
      ) : errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarContainer}>
            <Image source={selectedAvatar.avatar} style={styles.avatar} />
          </View>

          <TextInput
            style={styles.input}
            value={user.userName}
            onChangeText={(text) => setUser({ ...user, userName: text })}
            placeholder="Username"
            placeholderTextColor="#777"
          />
          <TextInput
            style={styles.input}
            value={user.email}
            onChangeText={(text) => setUser({ ...user, email: text })}
            placeholder="Email"
            keyboardType="email-address"
            placeholderTextColor="#777"
          />
          <TextInput
            style={styles.input}
            value={user.phone}
            onChangeText={(text) => setUser({ ...user, phone: text })}
            placeholder="Phone"
            keyboardType="phone-pad"
            placeholderTextColor="#777"
          />
          <TextInput
            style={styles.input}
            onChangeText={(text) => setUser({ ...user, password: text })}
            placeholder="Password"
            secureTextEntry
            placeholderTextColor="#777"
          />

          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
            <Text style={styles.dateText}>
              {user.birthday ? new Date(user.birthday).toLocaleDateString() : 'Select Birthday'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date(user.birthday || Date.now())}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <Text style={styles.avatarSelectionTitle}>Select Avatar</Text>
          <ScrollView horizontal contentContainerStyle={styles.avatarScroll} showsHorizontalScrollIndicator={false}>
            {avatars.map((avatar, index) => (
              <TouchableOpacity key={index} onPress={() => handleAvatarSelect(avatar)}>
                <Image source={avatar.avatar} style={styles.avatarOption} />
              </TouchableOpacity>
            ))}
          </ScrollView>


          <TouchableOpacity
            onPress={handleUpdateProfile}
            style={styles.updateButton}
            disabled={isUpdating}
          >
            <Text style={styles.updateButtonText}>
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={Snackbar.DURATION_SHORT}
        style={{ backgroundColor: snackbarType === 'success' ? 'green' : 'red' }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

// Prop types validation
ProfileScreen.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }).isRequired,
  }).isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  lottieBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 50,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  dateInput: {
    height: 50,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  dateText: {
    color: '#555',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderColor: '#ccc',
    borderWidth: 2,
  },
  avatarSelectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  avatarScroll: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 5,
  },
  updateButton: {
    height: 50,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  logoutButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'rgb(255, 0, 0)',
    fontWeight: 'bold',
    marginRight: 8,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
});
