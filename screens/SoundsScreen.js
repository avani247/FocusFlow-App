import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import SoundCard from '../components/SoundCard';

/**
 * Defines the available sound categories and their items. Each item references
 * a local image and audio source. You can expand this list with additional
 * audio loops by adding files to the assets folder and updating the array.
 */
const soundCategories = [
  {
    id: 'nature',
    title: 'Nature',
    items: [
      {
        id: 'forest',
        title: 'Forest',
        image: require('../assets/nature.png'),
        source: require('../assets/chime.wav'),
      },
    ],
  },
  {
    id: 'noise',
    title: 'Noise',
    items: [
      {
        id: 'static',
        title: 'White Noise',
        image: require('../assets/noise.png'),
        source: require('../assets/chime.wav'),
      },
    ],
  },
  {
    id: 'music',
    title: 'Music',
    items: [
      {
        id: 'waves',
        title: 'Ambient',
        image: require('../assets/music.png'),
        source: require('../assets/chime.wav'),
      },
    ],
  },
];

export default function SoundsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Sound</Text>
      <ScrollView>
        {soundCategories.map((category) => (
          <View key={category.id} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
              {category.items.map((item) => (
                <SoundCard key={item.id} title={item.title} image={item.image} source={item.source} />
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#6B8DD6',
    marginBottom: 16,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
});