// PlaylistScreen.js
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import PlaylistIdList from '../component/PlaylistIdList';
import PlaylistIdPerformancesScreen from '../component/PlaylistIdPerformances';
const PlaylistScreen = ({ route }) => {
  const { PlaylistId, PlaylistIdPerformances } = route.params || {};
  console.log(`PlaylistID: ${PlaylistId}, PlaylistIdPerformances: ${PlaylistIdPerformances}`);
  const [viewOption, setViewOption] = useState('PlaylistId'); // Default view is 'PlaylistId'

  const renderContent = () => {
    if (viewOption === 'PlaylistId') {
      return <PlaylistIdList playlistId={PlaylistId} />; // Pass PlaylistId as prop
    } else if (viewOption === 'PlaylistIdPerformances') {
      return <PlaylistIdPerformancesScreen playlistId={PlaylistIdPerformances} />; // Pass PlaylistIdPerformances as prop
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <Button
          title="By Playlist ID"
          onPress={() => setViewOption('PlaylistId')}
          color={viewOption === 'PlaylistId' ? '#007bff' : '#ccc'}
        />
        <Button
          title="By Performances"
          onPress={() => setViewOption('PlaylistIdPerformances')}
          color={viewOption === 'PlaylistIdPerformances' ? '#007bff' : '#ccc'}
        />
      </View>
      <Text style={styles.title}>Playlist Screen</Text>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default PlaylistScreen;
