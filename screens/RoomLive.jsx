import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Button,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeModules } from 'react-native';


import MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import NotificationsScreen from '../component/micro';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Dimensions } from 'react-native';
import { useUser } from '../UserContext.js';

const { RecordingModule } = NativeModules;

const RoomScreen = () => {
  const { userId, roomId, userIp, userName, PlaylistIdPerformances, PlaylistId } = useRoute().params || {};
  console.log('RoomScreen playlist est = > ' + PlaylistIdPerformances);
  const [videoTitle, setVideoTitle] = useState('');
  const [video, setVideo] = useState(null);
  const [link, setLink] = useState('');
  const [ownerId, setOwnerid] = useState(null);
  const [ipRoom, setIpRoom] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [cameraOn, setCameraOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentScore, setCurrentScore] = useState(579);
  const [lyrics, setLyrics] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [facing, setFacing] = useState('front');
  const [cameraPermission, setCameraPermission] = useState(false);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const { setUserId } = useUser();
  const [chatMessages, setChatMessages] = useState([]); // Messages for current chat
  const [newMessage, setNewMessage] = useState(''); // Input for sending a new message
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false); // State to toggle chat visibility
  const cameraRef = useRef(null);
  const navigation = useNavigation();
  const apiUrl = process.env.API_URL;

  const toggleChatVisibility = () => {
    fetchChatMessages();
    setShowChat((prev) => !prev);
  };

  const API_URLS = {
    TOKEN: 'http://www.ApiEnchanter.somee.com/api/UsersControllers/token',
    USERS: `http://www.ApiEnchanter.somee.com/api/KaraokeRooms/all/users/${roomId}`,
    EXIT: `http://www.ApiEnchanter.somee.com/api/KaraokeRooms/user/${userId}`,
    CREATE_QUEUE: apiUrl+ 'queue/create',
    LYRICS: 'http://www.enchanterr.somee.com/lyrics/', // Replace with actual lyrics API
  };


  useEffect(() => {
    fetchRooms();
    fetchAccessToken();

    (async () => {
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      const { status: cameraStatus } = await CameraView.requestCameraPermissionsAsync();
      const { status: microphoneStatus } = await CameraView.requestMicrophonePermissionsAsync();

      const cameraGranted = cameraStatus === 'granted';
      const microphoneGranted = microphoneStatus === 'granted';

      setCameraPermission(cameraGranted && microphoneGranted);

      if (!cameraGranted || !microphoneGranted) {
        Alert.alert(
          'Permissions required',
          'Camera and Microphone permissions are required to record videos.'
        );
      }
    })();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      console.log('Fetching room with ID: ' + roomId); // Log roomId before fetching
      const response = await fetch(`http://www.enchanterr.somee.com/api/KaraokeRooms/${roomId}`);
      const data = await response.json();
      console.log('Room data:', JSON.stringify(data, null, 2)); // Log the response object

      console.log(data.ipRoom)

      if (data.ipRoom != null) {
        setIpRoom(data.ipRoom); // Met à jour l'état `ipRoom`
        RecordingModule.setServerIp(data.ipRoom); // Utilise directement `data.ipRoom`
        console.log('Server IP set to:', data.ipRoom);
      } else {
        console.error('No IP Room found in the data.');
      }

      if (data?.ownerID) {
        setOwnerid(data.ownerID); // Stocke `OwnerID` dans l'état
      } else {
        console.log('No OwnerID found in the data.');
      }
    } catch (error) {
      console.error('Error fetching room:', error); // Log error if the fetch fails
    } finally {
      setLoading(false); // Stop the loading state
    }
  };

  useEffect(() => {
    let isMounted = true;
  
    const fetchUsers = async () => {
      try {
        const response = await fetch(API_URLS.USERS);
  
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
  
        const rawText = await response.text();
        if (!rawText.trim()) {
          console.warn('Empty response received.');
          if (isMounted) setUsers([]);
          return;
        }
  
        const data = JSON.parse(rawText);
        if (isMounted) setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error.message);
        if (isMounted) setUsers([]);
      }
    };
  
    fetchUsers();
  
    const intervalId = setInterval(fetchUsers, 3000);
  
    return () => {
      clearInterval(intervalId);
      isMounted = false;
    };
  }, [API_URLS.USERS]);
  

  const fetchAccessToken = async () => {
    try {
      const response = await fetch(API_URLS.TOKEN);
      const data = await response.json();
      if (!data?.access_token) throw new Error('Invalid access token received.');
      setAccessToken(data.access_token);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch access token.');
      console.error('Error fetching access token:', error.message);
    }
  };

  const startRecording = async () => {
    // Check permissions dynamically before starting recording
    const { status: cameraStatus } = await CameraView.requestCameraPermissionsAsync();
    const { status: microphoneStatus } = await CameraView.requestMicrophonePermissionsAsync();

    const cameraGranted = cameraStatus === 'granted';
    const microphoneGranted = microphoneStatus === 'granted';

    // If permissions are still denied, alert the user
    if (!cameraGranted || !microphoneGranted) {
      Alert.alert(
        'Permissions Required',
        'Camera and Microphone permissions are required to record videos.',
        [
          {
            text: 'Grant Permissions',
            onPress: async () => {
              const cameraReRequest = await CameraView.requestCameraPermissionsAsync();
              const microphoneReRequest = await CameraView.requestMicrophonePermissionsAsync();

              if (cameraReRequest.granted && microphoneReRequest.granted) {
                setCameraPermission(true);
                startRecording(); // Retry recording if permissions are granted
              } else {
                Alert.alert('Permission Denied', 'You cannot record without granting permissions.');
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    // If permissions are granted, proceed with recording
    if (!cameraRef.current) return;

    try {
      setIsRecording(true);
      Alert.alert('Recording Started', 'Your video is now being recorded.');

      const videoData = await cameraRef.current.recordAsync({
        quality: '1080p',
        maxDuration: 180, // 3 minutes
      });

      setVideo(videoData);
      Alert.alert('Recording Stopped', 'Video has been recorded successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording.');
      console.error('Error starting recording:', error.message);
    } finally {
      setIsRecording(false);
    }
  };

  // Fetch messages between user and leader
  const fetchChatMessages = async () => {
    if (!userId || !ownerId) {
      console.error('Missing userId or ownerId. Cannot fetch messages.');
      return;
    }
  
    console.log(`Fetching chat messages between User: ${userId} and Owner: ${ownerId}`);
    setLoading(true);
  
    try {
      const response = await fetch(
        `http://www.enchanterr.somee.com/api/Chat/user/${userId}/${ownerId}`
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }
  
      const rawText = await response.text(); // Read raw response text
      console.log('Raw response:', rawText);
  
      if (!rawText.trim()) {
        console.warn('Empty response received from server.');
        setChatMessages([]); // Set to empty array to handle no messages case
        return;
      }
  
      // Attempt to parse the JSON
      const data = JSON.parse(rawText);
      console.log('Chat messages fetched:', data);
  
      setChatMessages(data); // Assuming `data` is the correct array of messages
    } catch (error) {
      if (error.message.includes('Unexpected end of input')) {
        console.error('Error parsing JSON: The server response is empty or invalid.');
      } else if (error.message.includes('Network request failed')) {
        console.error('Network error: Failed to reach the server. Please check your internet connection.');
      } else {
        console.error('Error fetching messages:', error.message);
      }
  
      Alert.alert('Error', 'Failed to fetch chat messages.');
    } finally {
      setLoading(false);
    }
  };
  
  


  const sendMessage = async () => {
    if (!newMessage.trim()) {
      console.log('Message is empty. Aborting send.');
      Alert.alert('Error', 'Message cannot be empty.');
      return;
    }

    if (!userId || !ownerId || !roomId) {
      console.error('Missing userId, ownerId, or roomId. Cannot send message.');
      return;
    }

    const payload = {
      messageId: 0, // Default message ID
      senderId: userId,
      roomId: roomId,
      userId: ownerId, // Ensure this matches the server schema
      message: newMessage.trim(),
      sentAt: new Date().toISOString(), // Ensure date formatting matches server expectations
    };

    console.log('Sending message with payload:', payload);
    try {
      const response = await fetch(
        `http://www.enchanterr.somee.com/api/Chat/send/user/${ownerId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }

      console.log('Message sent successfully.');
      setNewMessage('');
      fetchChatMessages(); // Refresh the chat after sending the message
    } catch (error) {
      console.error('Error sending message:', error.message);
      Alert.alert('Error', 'Failed to send the message. Please try again.');
    }
  };


  // Delete all messages for the user
  const deleteMessages = async () => {
    if (!userId) {
      console.error('Missing userId. Cannot delete messages.');
      return;
    }

    try {
      const response = await fetch(
        `http://www.enchanterr.somee.com/api/Chat/all/${userId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }

      console.log('All messages deleted successfully.');
      setChatMessages([]); // Clear messages locally
      Alert.alert('Success', 'All messages have been deleted.');
    } catch (error) {
      console.error('Error deleting messages:', error.message);
      Alert.alert('Error', 'Failed to delete messages. Please try again.');
    }
  };

  // Fetch messages when the component loads


  const stopRecording = () => {
    if (isRecording && cameraRef.current) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
      Alert.alert('Recording Stopped', 'The recording has been stopped.');
    }
  };


  const saveVideo = async () => {
    if (!video) return;

    try {
      await MediaLibrary.saveToLibraryAsync(video.uri);
      Alert.alert('Success', 'Video saved to media library.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save video.');
      console.error('Error saving video:', error.message);
    }
  };


  const fetchYouTubeVideoDetails = async (videoId) => {
    const API_KEY = 'AIzaSyA2j9t3b5lBhCNHkeH3ceDcrEII47dU2Rc'; // Replace with your API key
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${API_KEY}`;
  
    try {
      const response = await fetch(apiUrl);
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`YouTube Data API responded with ${response.status}: ${errorText}`);
      }
  
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const { title } = data.items[0].snippet;
        return title; // Return the video title
      } else {
        throw new Error('Video not found or restricted.');
      }
    } catch (error) {
      console.error('Error fetching video details:', error.message);
      throw error;
    }
  };
  
  const handleYouTubeSelection = async (url) => {
    try {
      const videoId = extractSongId(url);
      if (!videoId) {
        Alert.alert('Error', 'Invalid YouTube URL.');
        return;
      }
  
      const videoTitle = await fetchYouTubeVideoDetails(videoId);
      setVideoTitle(videoTitle); // Set the video title
      await createQueue(userName, videoTitle, url, roomId);
      Alert.alert('Success', `The video "${videoTitle}" has been added to the queue!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to handle YouTube video. Please try again.');
    }
  };
  




  const fetchLyrics = async (url) => {
    setLoadingLyrics(true);
    const songId = extractSongId(url); // Write an extractor function
    try {
      const response = await fetch(`${API_URLS.LYRICS}${songId}`);
      const data = await response.json();
      setLyrics(data.lyrics || []);
    } catch (error) {
      console.error('Error fetching lyrics:', error.message);
    } finally {
      setLoadingLyrics(false);
    }
  };



  const extractSongId = (url) => {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    return match ? match[1] : null;
  };



  const createQueue = async (userName, videoTitle, url, roomId) => {
    const payload = { UserName: userName, SongName: videoTitle, LinkSong: url, RoomID: roomId };
    console.log(payload);
    try {
      const response = await fetch(API_URLS.CREATE_QUEUE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create queue.');
    } catch (error) {
      Alert.alert('Error', 'Failed to create queue.');
      console.error('Error creating queue:', error.message);
    }
  };

  const toggleCamera = () => setCameraOn(!cameraOn);


  const exitRoom = async () => {
    try {
      await fetch(API_URLS.EXIT, { method: 'DELETE' });
      Alert.alert('Success', 'You have left the room.');
      console.log('You have left the room');
      console.log('RoomScreen to Tab Params:', { userId, PlaylistId, PlaylistIdPerformances, userName });
      navigation.navigate('TabNavigator', { userId: userId, userName: userName, PlaylistId: PlaylistId, PlaylistIdPerformances: PlaylistIdPerformances });
    } catch (error) {
      Alert.alert('Error', 'Failed to exit room.');
      console.error('Error exiting room:', error.message);
    }
  };

  
  const handleStartStreaming = () => {

    console.log(RecordingModule?.setServerIp);
    console.log(ipRoom)
    // if (RecordingModule?.setServerIp && RecordingModule?.startStreaming) {
    //   if (!ipRoom) {
    //     console.log('Error', 'IP Room is not available.');
    //     console.error('IP Room is not set. Cannot start streaming.');
    //     return;
    //   }
    console.log('Setting server IP and starting streaming with IP:', ipRoom);
    RecordingModule.setServerIp(ipRoom); // Envoi de l'adresse IP au module natif
    RecordingModule.startStreaming();   // Démarrage du streaming
    // } else {
    //   console.error('RecordingModule is not available.');
    // }
  };


  return (
    <LinearGradient colors={['rgba(100,100,200,0.8)', 'transparent']} style={styles.container}>

      <View style={styles.participantCounter}>
        <Ionicons name="person" size={24} color="white" />
        <Text style={styles.participantCount}>{users.length}   </Text>
        <Text style={styles.scoreText}> OwnerID: {ownerId} {'\n'} Score: {currentScore} points</Text>
      </View>

      <View style={styles.overlay}>
        <Text style={styles.songTitle}>Now Playing : {`\n`}{videoTitle || 'No song selected'}</Text>
        {cameraOn && <CameraView style={styles.camera} facing={facing} ref={cameraRef} />}
        <ScrollView contentContainerStyle={styles.lyricsScrollContainer}>
          {loadingLyrics ? (
            <Text style={styles.lyricsText}>Loading lyrics...</Text>
          ) : (
            lyrics.map((line, index) => (
              <Text
                key={index}
                style={[
                  styles.lyricsText,
                  line.highlight ? styles.highlightedText : styles.nonHighlightedText,
                ]}
              >
                {line.text}

              </Text>

            ))
          )}
          <NotificationsScreen />
        </ScrollView>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <WebView
          source={{ uri: 'https://www.youtube.com/results?search_query=karaoke' }}
          onNavigationStateChange={(navState) => {
            if (navState.url.includes('youtube.com/watch')) {
              setModalVisible(false); // Close the modal after selection
              handleYouTubeSelection(navState.url); // Process the selected video URL
            }
          }}
        />
      </Modal>


      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={toggleCamera} style={styles.controlButton}>
          <Feather name={cameraOn ? 'video-off' : 'video'} size={30} color="white" />
          <Text>{cameraOn ? 'Camera-off' : 'Camera'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={isRecording ? stopRecording : startRecording} style={styles.controlButton}>
          <Feather name={isRecording ? 'pause' : 'play'} size={30} color="white" />
          <Text>{isRecording ? `Record-off ` : `Record `}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleStartStreaming}
          style={styles.controlButton}
        >
          <Feather name={isRecording ? 'mic-off' : 'mic'} size={30} color="white" />
          <Text>Start</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => RecordingModule.stopStreaming()}
          style={styles.controlButton}
        >
          <Feather name="mic-off" size={30} color="white" />
          <Text>Stop</Text>
        </TouchableOpacity>


      </View>
      <View style={styles.usersContainer}>
        {users.map((user, index) => (
          <View key={index} style={styles.userBox}>
            <Text style={styles.userText}>{user.userName || 'User'}</Text>
          </View>
        ))}
      </View>
      {video && (
        <TouchableOpacity onPress={saveVideo} style={styles.saveButton}>
          <Feather name="save" size={30} color="white" />
          <Text>Save Video</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={exitRoom} style={styles.eButton}>
        <Ionicons name="exit" size={30} color="white" />
        <Text>Exit</Text>
      </TouchableOpacity>

      
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.controlButtonPick}>
          <Ionicons name="musical-notes" size={30} color="white" />
          <Text>Pick Song</Text>
        </TouchableOpacity>

      {/* Toggle Chat */}
      <TouchableOpacity onPress={toggleChatVisibility} style={styles.toggleChatButton}>
        <Ionicons name={showChat ? 'close' : 'chatbubble-ellipses'} size={30} color="white" />
        <Text>{showChat ? 'Close Chat' : 'Open Chat'}</Text>
      </TouchableOpacity>
      {/* Toggle Chat Button */}

      {showChat && (
        <LinearGradient colors={['#2a2a72', '#009ffd']} style={styles.chatContainer}>
          <View style={styles.chatHeaderContainer}>
            <Text style={styles.chatHeader}>Chat with Leader</Text>
          </View>
          {loading ? (
            <Text style={styles.loadingText}>Loading messages...</Text>
          ) : (
            <FlatList
              data={chatMessages}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.messageBubble,
                    item.senderName === 'You' ? styles.outgoingMessage : styles.incomingMessage,
                  ]}
                >
                  <Text style={styles.messageText}>
                    <Text style={styles.senderName}>{item.senderName}: </Text>
                    {item.message}
                  </Text>
                </View>
              )}
              ListEmptyComponent={() => (
                <Text style={styles.noMessagesText}>No messages</Text> // Affiche "No messages" si la liste est vide
              )}
            />
          )}
          <View style={styles.messageInputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Type your message..."
              placeholderTextColor="#aaa"
              value={newMessage}
              onChangeText={setNewMessage}
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <Ionicons name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={deleteMessages} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete All Messages</Text>
          </TouchableOpacity>
        </LinearGradient>
      )}

    </LinearGradient>
  );
};
export default RoomScreen;

const windowHeight = Dimensions.get('window').height;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    borderWidth: 5, // Épaisseur de la bordure
    borderColor: '#2a2a72', // Couleur de la bordure
  },
  noMessagesText: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 16,
    marginTop: 10,
  },
  scoreText: {
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#9c1515',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  participantCounter: {
    top: 3,
    right: 3,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9c1515',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
  },

  songTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginVertical: 10,
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: '9.5%',
    width: '90%',
    height: windowHeight * 0.6 - 50, // 60% of the screen height
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },  
  eButton: {
    position: 'absolute',
    right: 10,
    bottom: 20,
    backgroundColor: '#960404',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  camera: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  lyricsScrollContainer: {
    paddingTop: 20,
    alignItems: 'center',
  },
  lyricsText: {
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 5,
    paddingHorizontal: 15,
  },
  highlightedText: {
    color: '#FF4081',
    fontWeight: 'bold',
    fontSize: 24,
  },
  nonHighlightedText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    alignItems: 'center',
    width: '100%',
    position: 'absolute',
    bottom: '1%',
    height: '35%',
  },
  controlButton: {
    backgroundColor: '#FF4081',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    width: '22%',
    borderRadius: 10,
    height: 60,
  },
  gradeText: {
    fontSize: 18,
    color: '#FFD700',
  },

  toggleChatButton: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6A5ACD',
    padding: 10,
    borderRadius: 10,
  },
  toggleChatButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 0,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: ' #2a20ea9e',
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 30,

  }, saveButton: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#FF4081',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },

  usersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    position: 'absolute',
    bottom: '10%',
    width: '100%',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  userBox: {
    backgroundColor: '#333',
    padding: 5,
    margin: 2,
    borderRadius: 10,
    flex: 1,
    minWidth: '20%',
    maxWidth: '25%',
    alignItems: 'center',
  },
  userText: {
    color: 'white',
    fontSize: 14,
  },

  participantCount: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
    textAlign: 'center',
  },

  controlButtonPick :{
    position: 'absolute',
    right: 110,
    bottom: 20,
    backgroundColor: '#FF4081',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  containerC: {
    flex: 1,
    padding: 20,
  },
  chatContainer: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    height: '50%', // Adjust height for visibility
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // Slightly transparent for elegance
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  chatHeaderContainer: {
    width: '100%',
    padding: 10,
    backgroundColor: '#2a2a72',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingText: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 16,
    marginVertical: 10,
  },
  messageBubble: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  incomingMessage: {
    backgroundColor: '#f1f1f1',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  outgoingMessage: {
    backgroundColor: '#4a90e2',
    alignSelf: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  senderName: {
    fontWeight: 'bold',
    color: '#555',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: '#333',
    paddingTop: 10,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: 20,
    padding: 10,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#555',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#4a90e2',
    padding: 10,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  deleteButton: {
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: '#ff6347',
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 3,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

});








