import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TimerCircle from '../components/TimerCircle';
import { appendSession, loadSessions, computeMetrics } from '../utils/storage';
import { useSound } from '../context/SoundContext';
import { Audio } from 'expo-av';

/**
 * HomeScreen renders the core Pomodoro timer and basic statistics.
 * It cycles through four periods: Work (25m), Short Break (5m), Work (25m), Long Break (15m).
 * When a work period completes, a short chime is played and the session is recorded.
 */
export default function HomeScreen() {
  // Define the durations (seconds) for the four periods
  const sessionDurations = [25 * 60, 5 * 60, 25 * 60, 15 * 60];
  const [periodIndex, setPeriodIndex] = useState(0);
  const [remaining, setRemaining] = useState(sessionDurations[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState({ totalToday: 0, sessionsToday: 0, currentStreak: 0, longestStreak: 0 });
  const { stop } = useSound();

  // Load metrics on mount and whenever a session is recorded
  useEffect(() => {
    loadSessions().then((sessions) => {
      setMetrics(computeMetrics(sessions));
    });
  }, []);

  // Update timer every second when running
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 0) return 0;
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Respond to timer reaching zero
  useEffect(() => {
    if (remaining === 0 && isRunning) {
      handlePeriodEnd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  // When the periodIndex changes, update the remaining time to new session duration
  useEffect(() => {
    setRemaining(sessionDurations[periodIndex]);
  }, [periodIndex]);

  const handleStartPause = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setPeriodIndex(0);
    setRemaining(sessionDurations[0]);
  };

  /**
   * Called when the current period finishes.
   * Plays a chime, records focus sessions for work periods, advances to the next period.
   */
  const handlePeriodEnd = async () => {
    setIsRunning(false);
    // Play the chime without looping, use a local file
    try {
      const { sound } = await Audio.Sound.createAsync(require('../assets/chime.wav'), {
        shouldPlay: true,
        isLooping: false,
      });
      // Unload after playback finishes to free resources
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (err) {
      console.warn('Failed to play chime', err);
    }
    // If current period is a work period (even index), record session
    if (periodIndex % 2 === 0) {
      await appendSession(new Date(), sessionDurations[periodIndex]);
      const sessions = await loadSessions();
      setMetrics(computeMetrics(sessions));
    }
    // Stop any ambient sound (optional) so chime is heard
    await stop();
    // Advance to next period
    const nextIndex = (periodIndex + 1) % sessionDurations.length;
    setPeriodIndex(nextIndex);
    setIsRunning(true);
  };

  // Format total focus time for today as h m
  const formatTotal = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h > 0 ? `${h}h ` : ''}${m}m`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pomodoro Timer</Text>
      <View style={{ marginVertical: 24 }}>
        <TimerCircle totalSeconds={sessionDurations[periodIndex]} remainingSeconds={remaining} />
      </View>
      {/* Session indicator */}
      <View style={styles.dotsContainer}>
        {sessionDurations.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              {
                backgroundColor: idx === periodIndex ? '#6B8DD6' : '#E5EAF5',
              },
            ]}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 16 }}>
        <TouchableOpacity onPress={handleStartPause} style={styles.playButton}>
          <Ionicons
            name={isRunning ? 'pause' : 'play'}
            size={36}
            color="#fff"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleReset} style={[styles.playButton, { backgroundColor: '#B19CD9', marginLeft: 24 }]}> 
          <Ionicons name="reload" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* Today stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Today</Text>
        <View style={styles.statsRow}>
          <View style={styles.statsBox}>
            <Text style={styles.statsValue}>{formatTotal(metrics.totalToday)}</Text>
            <Text style={styles.statsLabel}>Focus Time</Text>
          </View>
          <View style={styles.statsBox}>
            <Text style={styles.statsValue}>{metrics.sessionsToday}</Text>
            <Text style={styles.statsLabel}>Sessions</Text>
          </View>
          <View style={styles.statsBox}>
            <Text style={styles.statsValue}>{metrics.currentStreak}</Text>
            <Text style={styles.statsLabel}>Streak</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#6B8DD6',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6B8DD6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    marginTop: 24,
    width: '90%',
    backgroundColor: '#F7F8FB',
    borderRadius: 16,
    padding: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#6B8DD6',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsBox: {
    alignItems: 'center',
    flex: 1,
  },
  statsValue: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#333333',
  },
  statsLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    marginTop: 4,
  },
});