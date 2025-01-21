import React, { useState } from 'react';
import { Button, Text, View, StyleSheet } from 'react-native';
const SERVER_IP = '192.168.1.45';
const SERVER_PORT = 6001;

export default function App() {
 
    return (
        <View style={styles.container}>
            <Button
                title="Start Streaming"
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
