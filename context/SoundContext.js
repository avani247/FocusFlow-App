import React, { createContext, useContext, useEffect, useState } from 'react';
import { Audio } from 'expo-av';

/**
 * SoundContext provides a central place to manage the single-sound policy.
 * Only one audio stream may play at any given time. When a new sound is
 * requested, any currently playing sound is stopped and unloaded.
 */
const SoundContext = createContext({
  isPlaying: false,
  play: async (_source) => {},
  pause: async () => {},
  resume: async () => {},
  stop: async () => {},
});

export const useSound = () => useContext(SoundContext);

export const SoundProvider = ({ children }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Configure audio mode once on mount
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
    });

    return () => {
      // Clean up any active sound on unmount
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  /**
   * Play a new sound from the given source. Unloads any existing sound.
   * The source should be a valid Expo asset (e.g. require('./path')) or
   * remote URI. Looping defaults to true for ambient audio.
   */
  const play = async (source, { loop = true } = {}) => {
    try {
      // Stop and unload any existing sound
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
      // Create and play new sound
      const { sound: newSound } = await Audio.Sound.createAsync(source, {
        shouldPlay: true,
        isLooping: loop,
      });
      newSound.setOnPlaybackStatusUpdate((status) => {
        setIsPlaying(status.isPlaying || false);
      });
      setSound(newSound);
    } catch (err) {
      console.warn('Error playing sound', err);
    }
  };

  // Pause the currently playing sound
  const pause = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  // Resume the paused sound
  const resume = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  // Stop and unload the current sound
  const stop = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  return (
    <SoundContext.Provider value={{ isPlaying, play, pause, resume, stop }}>
      {children}
    </SoundContext.Provider>
  );
};