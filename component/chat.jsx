import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';

// Example RoomScreen Component
const ChatScreen = ({ userId, ownerId }) => {
  const [chatMessages, setChatMessages] = useState([]); // Messages for current chat
  const [newMessage, setNewMessage] = useState(''); // Input for sending a new message
  const [loading, setLoading] = useState(false);

  // Fetch messages between user and leader
  const fetchChatMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://www.enchanterr.somee.com/api/Chat/user/${userId}/${ownerId}`);
      const data = await response.json();
      setChatMessages(data); // Assumes data is an array of chat messages
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`http://www.enchanterr.somee.com/api/Chat/send/user/${ownerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage,
          senderId: userId,
        }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchChatMessages(); // Refresh the chat
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Delete all messages for the user
  const deleteMessages = async () => {
    try {
      const response = await fetch(`http://www.enchanterr.somee.com/api/Chat/all/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChatMessages([]); // Clear messages locally
      }
    } catch (error) {
      console.error('Error deleting messages:', error);
    }
  };

  // Fetch messages when the component loads
  useEffect(() => {
    fetchChatMessages();
  }, []);

  return (
    <LinearGradient colors={['rgba(100,100,200,0.8)', 'transparent']} style={styles.container}>
      {/* Existing RoomScreen Layout */}
      {/* Add a chat container */}
      <View style={styles.chatContainer}>
        <Text style={styles.chatHeader}>Chat with Leader</Text>
        {loading ? (
          <Text>Loading messages...</Text>
        ) : (
          <FlatList
            data={chatMessages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.messageBubble}>
                <Text style={styles.messageText}>
                  <Text style={styles.senderName}>{item.senderName || 'User'}: </Text>
                  {item.message}
                </Text>
              </View>
            )}
          />
        )}
        <View style={styles.messageInputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type your message..."
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
      </View>
    </LinearGradient>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  chatContainer: {
    flex: 1,
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
  },
  chatHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  messageBubble: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  messageText: {
    fontSize: 16,
    color: 'white',
  },
  senderName: {
    fontWeight: 'bold',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  messageInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#6A5ACD',
    padding: 10,
    borderRadius: 5,
  },
  deleteButton: {
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
