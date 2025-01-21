import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const PulsatingIcon = () => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(withTiming(1.5, { duration: 800 }), -1, true);
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.iconContainer, animatedStyle]}>
      <Ionicons 
        name="musical-notes" 
        size={60} 
        color="#003a6a" 
        style={styles.iconWithBorder} 
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWithBorder: {
    borderWidth: 5,
    borderColor: 'black',
    borderRadius: 25, // Adjust as needed for a rounded effect
    padding: 5, // Adds spacing between the icon and the border
  },
});


