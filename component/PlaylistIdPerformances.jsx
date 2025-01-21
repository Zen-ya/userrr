import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Image, TouchableOpacity, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import PropTypes from 'prop-types';

const PlaylistIdList = ({ playlistId }) => {
  const [playlistItems, setPlaylistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // URL de l'API YouTube pour récupérer l'access token
  const TOKEN_URL = 'http://www.ApiEnchanter.somee.com/api/UsersControllers/token';

  // URL de base pour les items de la playlist YouTube
  const BASE_URL = 'https://youtube.googleapis.com/youtube/v3/playlistItems';

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const response = await fetch(TOKEN_URL, {
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
        setError("Impossible de récupérer l'access token.");
      }
    };

    fetchAccessToken();
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    const fetchPlaylistItems = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${BASE_URL}?part=snippet&playlistId=${playlistId}&maxResults=10`,
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        console.log(response);
        if (!response.ok) {
          throw new Error(`Erreur de requête: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        if (data.items) {
          setPlaylistItems(data.items);
        } else {
          throw new Error('Aucun élément trouvé dans cette playlist.');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des éléments de la playlist:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylistItems();
  }, [playlistId, accessToken]);

  const openVideo = (videoId) => {
    setVideoUrl(`https://www.youtube.com/embed/${videoId}`);
    setIsModalVisible(true);
  };

 
    const renderPlaylistItem = ({ item }) => {
      const hasThumbnail = item.snippet.thumbnails && item.snippet.thumbnails.medium;
      return (
        <TouchableOpacity onPress={() => openVideo(item.snippet.resourceId.videoId)}>
          <View style={styles.itemContainer}>
            {hasThumbnail ? (
              <Image
                source={{ uri: item.snippet.thumbnails.medium.url }}
                style={styles.thumbnail}
              />
            ) : (
              <View style={styles.noThumbnail}>
                <Text style={styles.noThumbnailText}>Aucune image</Text>
              </View>
            )}
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>{item.snippet.title}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    };
    

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Performance Playlist</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={playlistItems}
          renderItem={renderPlaylistItem}
          keyExtractor={(item) => item.id}
        />
      )}

      {/* Modal avec WebView pour afficher la vidéo YouTube */}
      <Modal visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
        <View style={{ flex: 1 }}>
          <WebView source={{ uri: videoUrl }} style={{ flex: 1 }} />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

PlaylistIdList.propTypes = {
  playlistId: PropTypes.string.isRequired,
};

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

export default PlaylistIdList;
