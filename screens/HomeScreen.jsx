import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TextInput,Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withRepeat } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import NetInfo from '@react-native-community/netinfo';
import { FontAwesome } from '@expo/vector-icons';
import PropTypes from 'prop-types';

export const RotatingLogo = () => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withSpring(360, { damping: 1, stiffness: 100 }),
      -1,
      false
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.logoContainer, animatedStyle]}>
      <FontAwesome name="music" size={60} color="#fff" />
    </Animated.View>
  );
};

const MenuButton = ({ title, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.menuButton}>
    <Text style={styles.menuButtonText}>{title}</Text>
  </TouchableOpacity>
);

const GridItem = ({ title, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.gridButton}>
    <Text style={styles.gridTitle}>{title}</Text>
  </TouchableOpacity>
);

GridItem.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
};

export default function HomeScreen({ route }) {
  const navigation = useNavigation();
  const { userId = 'Unknown', userName = 'User' , PlaylistId = 'Unknown', PlaylistIdPerformances= 'Unknown' } = route.params || {};
  console.log('dans home ' +userId, userName, PlaylistIdPerformances);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState(0);
  const [user, setUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [userIp, setUserIp] = useState('');

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://www.ApiEnchanter.somee.com/api/KaraokeRooms/all');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserIp = async () => {
    const state = await NetInfo.fetch();
    setUserIp(state.details.ipAddress || 'Unknown');
  };

  useEffect(() => {
    fetchRooms();
    fetchUserIp();
  }, []);

  const handleRoomPress = (room) => {
    setRoomId(room.roomID);
    setSelectedRoom(room);
    setShowPasswordModal(true);
    console.log("HomeScreen room pressed " + room.roomID);
  };

  const handlePasswordSubmit = async () => {

    if (inputPassword === selectedRoom?.roomPassword?.toString()) {
      setShowPasswordModal(false);
      setInputPassword('');
      Alert.alert('Success', `Welcome to ${selectedRoom.roomName}!`);
      const updated = await updateIpUser();
      if (updated) {
       
        navigation.navigate("TabNavigator", {
          userId: userId,
          userName: userName,
          roomId: selectedRoom.roomID,
          userIp: userIp,
          PlaylistId : PlaylistId,
          PlaylistIdPerformances:PlaylistIdPerformances,
          directToRoomScreen: true,
        });
        console.log("HomeScreen params to room " + PlaylistIdPerformances, selectedRoom.roomID, userIp);
        addParticipant();
      }
    } else {
      console.log("Erreur", "Le mot de passe est incorrect.");
      }
  };

  const updateIpUser = async () => {
    const user = {
      id:userId,
      userName: "",
      email: "",
      phone: "",
      password: "",
      birthday: "2000-10-10",
      avatarUrl: "",
      playlistId: "",
      playlistIdPerformances: "",
      link: "",
      ipUser: userIp,
    };
    console.log("Updating user IP:", userIp);
    try {
      const response = await fetch(`http://www.ApiEnchanter.somee.com/api/KaraokeRooms/user/${userId}/ip`, {
        method: 'PUT',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      console.log(user);
      console.log("Response status:", response.status);
      if (!response.ok) {
        const responseText = await response.text();
        console.log('Response text:', responseText);
        throw new Error('Failed to update user IP');
      }
      console.log('User IP updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating user IP:', error);
      return false;
    }
  };

  const addParticipant = async () => {
    const participantData = {
      roomID: selectedRoom.roomID,
      userID: userId,
      joinedAt: new Date().toISOString(),
      ownerId: selectedRoom.ownerID,
      roomIdOwner: selectedRoom.roomID,
      ipUser: userIp,
      link: ""
    };
  
    console.log('Attempting to add participant with the following data:', JSON.stringify(participantData, null, 2));
  
    try {
      const response = await fetch(`http://www.ApiEnchanter.somee.com/api/KaraokeRooms/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(participantData),
      });
  
      console.log('Add participant response status:', response.status);
  
      if (!response.ok) {
        const responseText = await response.text();
        console.error('Add participant failed with status:', response.status);
        console.error('Response body:', responseText);
        throw new Error(`Failed to add participant: ${response.statusText}`);
      }
  
      console.log('Participant added successfully. Response:', await response.json());
    } catch (error) {
      console.error('Error adding participant:', error);
      Alert.alert('Error', `Failed to add participant: ${error.message}`);
    }
  };
  

  return ( <View style={styles.container}>
    {/* Lottie animation for background */}
    <LottieView
      source={require('../assets/Animation63.json')}
      autoPlay
      loop
      style={[styles.lottieBackground, { width: screenWidth, height: screenHeight }]}
    />

    <View style={styles.menuContent}>
      <ScrollView horizontal contentContainerStyle={styles.menuContainer}>
        <MenuButton title="Profile" onPress={() => navigation.navigate('Profile', { userId })} />
        <MenuButton title="Performances" onPress={() => navigation.navigate('Performances', { userId })} />
        <MenuButton title="About" onPress={() => navigation.navigate('Settings')} />
      </ScrollView>
    </View>

    <Text style={styles.welcomeText}>
      Welcome, {userName}! {'\n'}Your ID is: {userId}
    </Text>
    <Text style={styles.welcomeText}>Available Karaoke Rooms</Text>

    {/* Display room grid */}
    <ScrollView style={styles.gridContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        rooms.map((room) => (
          <GridItem
            key={room.roomID.toString()}
            title={`Room: ${room.roomName}`}
            onPress={() => handleRoomPress(room)}
          />
        ))
      )}
    </ScrollView>

    {/* Modal for entering room password */}
    <Modal
      visible={showPasswordModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowPasswordModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Enter password for {selectedRoom?.roomName || 'this room'}
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="default"
            placeholder="Password"
            secureTextEntry
            value={inputPassword}
            onChangeText={setInputPassword}
          />
          <TouchableOpacity onPress={handlePasswordSubmit} style={styles.modalButton}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setShowPasswordModal(false);
              setInputPassword('');
            }}
            style={[styles.modalButton, { backgroundColor: '#d9534f' }]}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  </View>
);
}

HomeScreen.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      userName: PropTypes.string,
    }),
  }).isRequired,
};


// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    width: '100%',
  },
  lottieBackground: {
    position: 'absolute',
    width: '100%',
    top: 0,
    left: 0,
  },
  menuContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  menuContainer: {
    alignItems: 'center',
  },
  menuButton: {
    backgroundColor: '#ffffffaa',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  menuButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  welcomeText: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: '#fff',
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 20,
    padding: 10,
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  gridItem: {
    flex: 1,
    marginBottom: 20,
  },
  gridButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
  },
  gridTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: '#444',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  modalButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
});
