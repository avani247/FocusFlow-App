import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { loadSessions, computeMetrics } from '../utils/storage';
import { getLastNDates } from '../utils/date';
import StatsBarChart from '../components/StatsBarChart';

/**
 * ProfileScreen displays weekly statistics, streaks, badges and provides a
 * simple settings area to adjust timer durations and notification preferences.
 */
export default function ProfileScreen() {
  const [sessions, setSessions] = useState([]);
  const [metrics, setMetrics] = useState({ totalToday: 0, sessionsToday: 0, currentStreak: 0, longestStreak: 0 });
  const [settings, setSettings] = useState({ work: 25, shortBreak: 5, longBreak: 15, notifications: false });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Load sessions and compute metrics
    async function fetchSessions() {
      const s = await loadSessions();
      setSessions(s);
      setMetrics(computeMetrics(s));
    }
    fetchSessions();
  }, []);

  // Prepare chart data for last 7 days
  const dates = getLastNDates(7);
  const data = dates.map((d) => {
    const iso = d.toISOString().split('T')[0];
    const entry = sessions.find((s) => s.date === iso);
    return { date: d, value: entry ? entry.duration / 60 : 0 };
  });

  // Compute total sessions and total time (minutes)
  const totalSessions = sessions.reduce((sum, s) => sum + 1, 0);
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration / 60, 0);
  const averageMinutes = data.reduce((sum, d) => sum + d.value, 0) / data.length;

  // Badges conditions
  const hasFiveDayBadge = metrics.longestStreak >= 5;
  const hasHundredSessionsBadge = totalSessions >= 100;

  const handleSettingsToggle = () => setShowSettings((prev) => !prev);
  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.title}>Activity</Text>
      {/* Weekly bar chart */}
      <StatsBarChart data={data} />
      {/* Totals */}
      <View style={styles.metricRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{totalSessions}</Text>
          <Text style={styles.metricLabel}>Total Sessions</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{Math.round(totalMinutes)}</Text>
          <Text style={styles.metricLabel}>Total Minutes</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{Math.round(averageMinutes)}</Text>
          <Text style={styles.metricLabel}>Avg / Day (min)</Text>
        </View>
      </View>
      {/* Streak information */}
      <View style={styles.streakBox}>
        <Text style={styles.streakText}>Current Streak: {metrics.currentStreak} day{metrics.currentStreak !== 1 ? 's' : ''}</Text>
        <Text style={styles.streakText}>Longest Streak: {metrics.longestStreak} day{metrics.longestStreak !== 1 ? 's' : ''}</Text>
      </View>
      {/* Badges */}
      <View style={styles.badgesContainer}>
        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <View style={styles.badgeItem}>
            <Ionicons
              name="ribbon"
              size={32}
              color={hasFiveDayBadge ? '#6B8DD6' : '#E5EAF5'}
            />
            <Text style={styles.badgeLabel}>5‑Day Streak</Text>
          </View>
          <View style={styles.badgeItem}>
            <Ionicons
              name="trophy"
              size={32}
              color={hasHundredSessionsBadge ? '#6B8DD6' : '#E5EAF5'}
            />
            <Text style={styles.badgeLabel}>100 Sessions</Text>
          </View>
        </View>
      </View>
      {/* Settings */}
      <TouchableOpacity onPress={handleSettingsToggle} style={styles.settingsToggle}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <Ionicons name={showSettings ? 'chevron-up' : 'chevron-down'} size={20} color="#6B8DD6" />
      </TouchableOpacity>
      {showSettings && (
        <View style={styles.settingsContainer}>
          {/* Duration inputs */}
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Work (min)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(settings.work)}
              onChangeText={(text) => handleChange('work', Number(text))}
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Short Break (min)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(settings.shortBreak)}
              onChangeText={(text) => handleChange('shortBreak', Number(text))}
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Long Break (min)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(settings.longBreak)}
              onChangeText={(text) => handleChange('longBreak', Number(text))}
            />
          </View>
          <View style={[styles.inputRow, { alignItems: 'center' }]}> 
            <Text style={styles.inputLabel}>Notifications</Text>
            <Switch
              value={settings.notifications}
              onValueChange={(val) => handleChange('notifications', val)}
              trackColor={{ true: '#6B8DD6', false: '#ccc' }}
              thumbColor={settings.notifications ? '#6B8DD6' : '#f4f3f4'}
            />
          </View>
          <Text style={styles.settingsHint}>Settings are not persisted across restarts in this demo. Implement persistence as needed.</Text>
        </View>
      )}
    </ScrollView>
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
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#333333',
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
  },
  streakBox: {
    backgroundColor: '#F7F8FB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  streakText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#333333',
    marginBottom: 4,
  },
  badgesContainer: {
    backgroundColor: '#F7F8FB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#6B8DD6',
  },
  badgeItem: {
    alignItems: 'center',
    marginRight: 24,
  },
  badgeLabel: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
    color: '#333333',
  },
  settingsToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingsContainer: {
    backgroundColor: '#F7F8FB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#333333',
    flex: 1,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#E5EAF5',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 80,
    textAlign: 'center',
  },
  settingsHint: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#888888',
    marginTop: 8,
  },
});