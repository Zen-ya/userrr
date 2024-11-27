import React, { useState } from 'react';
import { Button, Text, View, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import dgram from 'react-native-udp';
import { Buffer } from 'buffer';

// Define server configuration
const SERVER_IP = '192.168.1.45'; // Update with your server IP
const SERVER_PORT = 6001; // Server port

export default function App() {
    const [recording, setRecording] = useState(null);
    const [isStreaming, setIsStreaming] = useState(false);

    // Start Streaming
    const startStreaming = async () => {
        try {
            const { granted } = await Audio.requestPermissionsAsync();
            if (!granted) {
                alert('Permission to access microphone is required!');
                return;
            }

            const socket = dgram.createSocket('udp4');

            const newRecording = await Audio.Recording.createAsync(
                Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
            );
            setRecording(newRecording);
            setIsStreaming(true);

            console.log('Recording started...');

            const interval = setInterval(async () => {
                if (!isStreaming || !recording) {
                    clearInterval(interval);
                    return;
                }

                try {
                    const audioBuffer = await newRecording.getNewStatusAsync();
                    if (audioBuffer.isDoneRecording) {
                        const data = newRecording._lastAudioData; // raw PCM data
                        const buffer = Buffer.from(data);
                        socket.send(buffer, 0, buffer.length, SERVER_PORT, SERVER_IP, (err) => {
                            if (err) console.error('UDP send error:', err.message);
                        });
                    }
                } catch (error) {
                    console.error('Error during streaming:', error.message);
                }
            }, 100); // Send data every 100ms
        } catch (error) {
            console.error('Error starting recording:', error.message);
        }
    };

    // Stop Streaming
    const stopStreaming = async () => {
        setIsStreaming(false);
        if (recording) {
            await recording.stopAndUnloadAsync();
            setRecording(null);
        }
        console.log('Recording stopped.');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.status}>
                {isStreaming ? 'Status: Streaming...' : 'Status: Idle'}
            </Text>
            <Button
                title="Start Streaming"
                onPress={startStreaming}
                disabled={isStreaming}
            />
            <Button
                title="Stop Streaming"
                onPress={stopStreaming}
                disabled={!isStreaming}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    status: {
        fontSize: 16,
        marginBottom: 20,
    },
});
