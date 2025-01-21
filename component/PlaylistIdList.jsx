import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PlaylistIdList = ({ playlistId }) => {
  const [playlistItems, setPlaylistItems] = useState([]);
  const [totalResults, setTotalResults] = useState(0); // Total number of videos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [playlist, setPlaylist] = useState('');

  const TOKEN_URL = 'http://www.ApiEnchanter.somee.com/api/UsersControllers/token';
  const API_KEY = 'AIzaSyA2j9t3b5lBhCNHkeH3ceDcrEII47dU2Rc'; // Replace with an environment variable
  const BASE_URL = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&pageInfo&playlistId=${playlistId}&maxResults=50&key=${API_KEY}`;

  // Fetch access token on component mount
  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const response = await fetch(TOKEN_URL, { method: 'GET' });
        const data = await response.json();

        if (data && data.access_token) {
          setAccessToken(data.access_token);
        } else {
          throw new Error('Invalid access token received from API');
        }
      } catch (err) {
        console.error('Error fetching access token:', err);
        setError("Unable to fetch access token.");
      }
    };

    fetchAccessToken();
  }, []);

  // Fetch playlist ID from AsyncStorage
  useEffect(() => {
    const fetchPlaylistId = async () => {
      try {
        const storedPlaylist = await AsyncStorage.getItem('PlaylistId');
        if (storedPlaylist) {
          setPlaylist(storedPlaylist);
        } else {
          console.warn('No PlaylistId found in AsyncStorage.');
        }
      } catch (err) {
        console.error('Error fetching PlaylistId from AsyncStorage:', err);
      }
    };

    fetchPlaylistId();
  }, []);

  // Fetch playlist items once access token and playlist ID are available
  useEffect(() => {
    if (!accessToken || !playlistId) return;

    const fetchPlaylistItems = async () => {
      setLoading(true);
      try {
        const response = await fetch(BASE_URL, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Request error: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);

        if (data.items) {
          setPlaylistItems(data.items);
          setTotalResults(data.pageInfo.totalResults || 0);
        } else {
          throw new Error('No videos found in this playlist.');
        }
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylistItems();
  }, [accessToken, playlistId]);

  const openVideo = (videoId) => {
    setVideoUrl(`https://www.youtube.com/embed/${videoId}`);
    setIsModalVisible(true);
  };

  const renderPlaylistItem = ({ item }) => {
    if (!item.snippet) return null; // Avoid crashes if data is missing
    return (
      <TouchableOpacity onPress={() => openVideo(item.snippet.resourceId.videoId)}>
        <View style={styles.itemContainer}>
          <Image
            source={{ uri: item.snippet.thumbnails?.medium?.url }}
            style={styles.thumbnail}
          />
          <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>{item.snippet.title}</Text>
            <Text style={styles.itemDescription} numberOfLines={2}>
              {item.snippet.description}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Playlist Videos</Text>

      {/* Display total number of videos */}
      {totalResults > 0 && (
        <Text style={styles.totalResultsText}>
          Total Videos: {totalResults}
        </Text>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : playlistItems.length > 0 ? (
        <FlatList
          data={playlistItems}
          renderItem={renderPlaylistItem}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <Text style={styles.noItemsText}>No videos available in this playlist.</Text>
      )}

      {/* Modal to display YouTube video */}
      <Modal visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
        <View style={{ flex: 1 }}>
          <WebView source={{ uri: videoUrl }} style={{ flex: 1 }} />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

PlaylistIdList.propTypes = {
  playlistId: PropTypes.string.isRequired,
};


export default PlaylistIdList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  totalResultsText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  thumbnail: {
    width: 120,
    height: 90,
    borderRadius: 4,
  },
  textContainer: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
  },
  noItemsText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
