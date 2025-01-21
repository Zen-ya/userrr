import { WebView } from 'react-native-webview';
import React from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';

const RoomCall = () => {
  const roomUrl = 'http://192.168.1.45:3000'; // Updated to use HTTP
  const [loading, setLoading] = React.useState(true);

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: roomUrl }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        onLoad={() => setLoading(false)}
        onError={({ nativeEvent }) => {
          console.error('WebView Error:', nativeEvent);
        }}
      />
      {loading && <ActivityIndicator size="large" color="#FF4081" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default RoomCall;
