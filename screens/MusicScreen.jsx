import React, { useState, useCallback, useEffect } from 'react';
import { View, TextInput, FlatList, Text, Image, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import LottieView from 'lottie-react-native';

const MusicSearch = ({ route }) => {
  const { PlaylistId, accessToken } = route.params || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Search Error', 'Please enter a search term!');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://youtube.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(searchQuery)}&maxResults=10&key=AIzaSyA2j9t3b5lBhCNHkeH3ceDcrEII47dU2Rc`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch search results.');
      }

      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  const addVideoToPlaylist = async (videoId) => {
    try {
      const url = 'https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet';
      const body = JSON.stringify({
        snippet: {
          playlistId: PlaylistId,
          resourceId: {
            kind: 'youtube#video',
            videoId,
          },
        },
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body,
      });

      if (!response.ok) {
        throw new Error('Failed to add video to playlist.');
      }

      Alert.alert('Success', 'Video added successfully!');
    } catch (err) {
      Alert.alert('Error', 'Failed to add video to playlist. Please try again.');
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Animation Lottie en arrière-plan */}
      <LottieView
        source={require('../assets/Animation - 1732708022242.json')}
        autoPlay
        loop
        style={styles.backgroundAnimation}
      />

      {/* Input de recherche */}
      <TextInput
        style={styles.input}
        placeholder="Search for music..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <TouchableOpacity
        onPress={handleSearch}
        style={[styles.searchButton, isLoading && styles.disabledButton]}
        disabled={isLoading}
      >
        <Text style={styles.searchButtonText}>{isLoading ? 'Searching...' : 'Search'}</Text>
      </TouchableOpacity>

      {/* Indicateur de chargement */}
      {isLoading && <ActivityIndicator size="large" color="#007BFF" style={styles.loadingIndicator} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Liste des résultats */}
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id.videoId}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Image source={{ uri: item.snippet?.thumbnails?.default?.url }} style={styles.thumbnail} />
            <View style={styles.infoContainer}>
              <Text style={styles.itemTitle}>{item.snippet?.title}</Text>
              <Text style={styles.itemDescription} numberOfLines={2}>
                {item.snippet?.description}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addVideoToPlaylist(item.id.videoId)}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={!isLoading && !error ? <Text style={styles.emptyText}>No results found.</Text> : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'transparent',
  },
  backgroundAnimation: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: -1, // Place l'animation derrière tout
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  searchButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#cce5ff',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 2,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 5,
  },
  infoContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: 'gray',
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default MusicSearch;
