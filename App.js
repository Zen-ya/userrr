import React, { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen.jsx';
import ProfileScreen from './screens/ProfileScreen.jsx';
import MusicScreen from './screens/MusicScreen.jsx';
import LoginScreen from './screens/LoginScreen.jsx';
import RegisterScreen from './screens/RegisterScreen.jsx';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';
import AboutScreen from './screens/AboutScreen.jsx';
import RoomScreen from './screens/RoomLive.jsx';
import PlaylistScreen from './screens/PlaylistScreen.jsx';
import ForgotPasswordScreen from './screens/ForgotPassword.jsx';
import RoomCall from './component/RoomCall.jsx';
import { UserProvider,useUser } from './UserContext.js';
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
require('dotenv').config();


function TabNavigator({ route, navigation }) {
  const { userId, userName, roomId, userIp, PlaylistId, PlaylistIdPerformances, accessToken, directToRoomScreen } = route.params || {};
  console.log(directToRoomScreen);
  console.log('TabNavigator Params:', { userId, PlaylistId, PlaylistIdPerformances, userIp });
  useEffect(() => {
    if (directToRoomScreen) {
      navigation.navigate('RoomScreen', { // Utilisation de navigation.push()
        userId: userId,
        roomId: roomId,
        userIp: userIp,
        userName: userName,
        PlaylistId:PlaylistId,
        PlaylistIdPerformances:PlaylistIdPerformances
      });
    }
  }, [directToRoomScreen, navigation, userId, roomId, userIp,userName,PlaylistId]);


  return (
   
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        initialParams={{ userId, userName, PlaylistId, PlaylistIdPerformances, accessToken, roomId }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={{ userId, userName }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={AboutScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Music"
        component={MusicScreen}
        initialParams={{ PlaylistId, userName, PlaylistIdPerformances, accessToken }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="musical-notes-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Playlist"
        component={PlaylistScreen}
        initialParams={{ PlaylistId, userName, PlaylistIdPerformances }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="headset-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>

  );
}

TabNavigator.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      userName: PropTypes.string,
      accessToken: PropTypes.string,
      roomId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      userIp: PropTypes.string,
    }),
  }).isRequired,
};

export default function App() {
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const response = await fetch('http://www.ApiEnchanter.somee.com/api/UsersControllers/token', {
          method: 'GET',
        });
        const data = await response.json();

        if (data && data.access_token) {
          setAccessToken(data.access_token);
        } else {
          throw new Error('Token non valide reçu de l’API');
        }
      } catch (error) {
        console.error('Erreur de récupération de l’access token:', error);
      }
    };

    fetchAccessToken();
  }, []);

  return (
    <UserProvider>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="RoomScreen" component={RoomScreen} />
        <Stack.Screen
          name="TabNavigator"
          component={TabNavigator}
          initialParams={{ accessToken }}
        />
        <Stack.Screen name="RoomCall" component={RoomCall} />
        <Stack.Screen name="PlaylistScreen" component={PlaylistScreen} />
        <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </UserProvider>
  );
}

