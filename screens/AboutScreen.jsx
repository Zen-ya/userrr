import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions, ImageBackground, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import LottieView from 'lottie-react-native';
import Slider from '@react-native-community/slider';
import { Asset } from 'expo-asset';


export default function AboutScreen() {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.2);

  
  useEffect(() => {
    async function loadSound() {
      try {
        console.log('Préchargement du fichier audio...');
        const asset = Asset.fromModule(require('../assets/KaraokeLatino.mp3'));
        await asset.downloadAsync();
        console.log('Fichier audio préchargé.');

        // Créez une instance Audio avec l'URI locale
        const { sound: newSound } = await Audio.Sound.createAsync({ uri: asset.localUri });

        console.log('Son créé avec succès.');
        newSound.setOnPlaybackStatusUpdate((status) => {
          console.log('Mise à jour du statut audio :', status);
          if (status.didJustFinish) {
            console.log('La musique est terminée. Relecture en cours...');
            newSound.replayAsync(); // Rejoue automatiquement à la fin
          }
        });

        setSound(newSound);
        await newSound.setVolumeAsync(volume); // Définit le volume
        console.log(`Volume défini sur : ${volume}`);
        setIsPlaying(true); // Indique que le son est en lecture
      } catch (error) {
        console.error('Erreur lors du chargement ou de la lecture du son :', error);
      }
    }

    loadSound();

    return () => {
      if (sound) {
        console.log('Arrêt et déchargement du son.');
        sound.stopAsync();
        sound.unloadAsync();
      }
    };
  }, [volume]);

  const handlePlay = async () => {
    if (sound) {
      console.log('Lecture de la musique...');
      await sound.playAsync();
      setIsPlaying(true);
      console.log('La musique a commencé.');
    }
  };

  const handlePause = async () => {
    if (sound) {
      console.log('Mise en pause de la musique...');
      await sound.pauseAsync();
      setIsPlaying(false);
      console.log('La musique est en pause.');
    }
  };

  const handleStop = async () => {
    if (sound) {
      console.log('Arrêt de la musique...');
      await sound.stopAsync();
      setIsPlaying(false);
      console.log('La musique a été arrêtée.');
    }
  };

  const handleVolumeChange = async (value) => {
    console.log(`Changement du volume : ${value}`);
    setVolume(value);
    if (sound) {
      await sound.setVolumeAsync(value);
      console.log(`Volume appliqué : ${value}`);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://st2.depositphotos.com/36330938/49886/i/600/depositphotos_498866836-stock-photo-a-romantic-singing-beautiful-girl.jpg' }} // Replace with your background image URL
      style={[styles.background, { width: screenWidth, height: screenHeight }]}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <LottieView
            source={require('../assets/Animation - 1726664930247.json')} // Ensure this file exists in the correct path
            autoPlay
            loop
            style={styles.lottieBackground}
          />

          <Text style={styles.title}>About Us</Text>

          <Image
            source={require('../assets/lumier_musique.png')} // Replace with your image path
            style={styles.image}
          />

          <Text style={styles.description}>
            Welcome to our karaoke platform! This app is designed for karaoke lovers who want to share and watch performances from all over the world.
          </Text>

          <Image
            source={require('../assets/music_notes.jpg')} // Replace with your image path
            style={styles.image}
          />

          <Text style={styles.description}>
            Whether you're a professional singer or just love to sing for fun, our app allows you to record your performances, create playlists, and collaborate with others.
          </Text>

          <Image
            source={require('../assets/full-shot-country-musicians-indoors.jpg')} // Replace with your image path
            style={styles.image}
          />

          <Text style={styles.description}>
            Join a community of artists, make friends, and showcase your talent. Collaboration is at the heart of our platform. We bring people together through music.
          </Text>

          {/* Inline Images */}
          <View style={styles.inlineImagesContainer}>
            <Image
              source={require('../assets/WhatsApp Image 2024-09-05 at 18.12.41.jpeg')} // Replace with your image path
              style={styles.inlineImage}
            />
            <Image
              source={require('../assets/WhatsApp Image 2024-09-05 at 18.13.07.jpeg')} // Replace with your image path
              style={styles.inlineImage}
            />
          </View>

          <Text style={styles.footer}>
            This project has been a challenging yet rewarding journey for us, Yehuda Gabay and Elya Amram. Throughout the development of this karaoke platform, we faced numerous obstacles but also gained invaluable skills in programming, design, and problem-solving. We’ve poured our hearts into creating a space for music lovers to connect and express themselves. While the road wasn’t easy, the experience has been enriching and has made us more resilient developers. We hope that our passion shines through in this app and that you enjoy using it as much as we enjoyed building it!
          </Text>

          {/* Inline Images */}
          <View style={styles.inlineImagesContainer}>
            <Image
              source={require('../assets/WhatsApp Image 2024-04-17 at 15.18.38.jpeg')} // Replace with your image path
              style={styles.inlineImage}
            />
            <Image
              source={require('../assets/WhatsApp Image 2024-06-09 at 10.59.11.jpeg')} // Replace with your image path
              style={styles.inlineImage}
            />
          </View>

          {/* Audio Controls */}
          <View style={styles.audioControls}>
            <TouchableOpacity onPress={handlePlay} style={styles.controlButton}>
              <Text style={styles.controlButtonText}>Play</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePause} style={styles.controlButton}>
              <Text style={styles.controlButtonText}>Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleStop} style={styles.controlButton}>
              <Text style={styles.controlButtonText}>Stop</Text>
            </TouchableOpacity>
            <View style={styles.volumeControl}>
              <Text style={styles.volumeLabel}>Volume</Text>
              <Slider
                style={styles.volumeSlider}
                minimumValue={0}
                maximumValue={1}
                value={volume}
                onValueChange={handleVolumeChange}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#000000"
                thumbTintColor="#FFFFFF"
              />
            </View>
          </View>

        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover', // Ensure the background covers the entire screen
  },
  container: {
    flex: 1,
  },
  scrollViewContent: {
    alignItems: 'center',
    padding: 20,
  },
  lottieBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
    marginBottom: 20,
    padding: 10,
    lineHeight: 24,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
    borderRadius: 75, // Makes the image circular
  },
  inlineImagesContainer: {
    flexDirection: 'row', // Align items horizontally
    justifyContent: 'space-between', // Add space between the images
    marginBottom: 20, // Add some space below the image container
  },
  inlineImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginHorizontal: 10, // Space between images
  },
  footer: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 30,
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  audioControls: {
    marginTop: 20,
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  volumeControl: {
    marginTop: 20,
    alignItems: 'center',
  },
  volumeLabel: {
    color: '#fff',
    fontSize: 16,
  },
  volumeSlider: {
    width: 200,
    height: 40,
    marginTop: 10,
  },
});
