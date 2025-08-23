import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSound } from '../context/SoundContext';

/**
 * Card component representing a single sound item. Shows an image, title and
 * a play/pause control. When pressed, triggers playback through the global
 * SoundContext. Only one sound can play at a time across the entire app.
 */
export default function SoundCard({ title, image, source }) {
  const { isPlaying, play, pause } = useSound();
  const handlePress = () => {
    if (isPlaying) {
      // If some sound is playing, pause; start this sound after pause
      pause().then(() => play(source));
    } else {
      play(source);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.card}>
      <Image source={image} style={styles.image} resizeMode="cover" />
      <View style={styles.overlay}>
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={28}
          color="#fff"
          style={{ opacity: 0.8 }}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}

const CARD_WIDTH = 120;
const CARD_HEIGHT = 140;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F7F8FB',
  },
  image: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT - 30,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CARD_WIDTH,
    height: CARD_HEIGHT - 30,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    marginTop: 4,
    paddingHorizontal: 4,
    color: '#333333',
  },
});