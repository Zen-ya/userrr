import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
  } from 'react-native-reanimated';
  import React, { useEffect } from 'react';
  import { StyleSheet } from 'react-native';
  import { MaterialIcons } from '@expo/vector-icons';
  
  export const SpinningColorIcon = () => {
    const rotation = useSharedValue(0);
    const scale = useSharedValue(1);
  
    useEffect(() => {
      rotation.value = withRepeat(withTiming(360, { duration: 3000 }), -1, true);
      scale.value = withRepeat(withTiming(1.5, { duration: 1500 }), -1, true);
    }, [rotation, scale]);
  
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
      backgroundColor: `rgba(${Math.floor(255 * Math.abs(Math.sin(rotation.value)))}, 50, ${Math.floor(255 * Math.abs(Math.cos(rotation.value)))}, 1)`,
      padding: 10,
      borderWidth: 5,
      borderColor: 'black',
      borderRadius: 50,
    }));
  
    return (
      <Animated.View style={[styles.iconContainer, animatedStyle]}>
        <MaterialIcons name="star" size={60} color="#fff" />
      </Animated.View>
    );
  };
  
  const styles = StyleSheet.create({
    iconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
  