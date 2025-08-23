import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDate } from './date';

// Key used to store all session data
const SESSIONS_KEY = 'focusflow.sessions';

/**
 * Load stored sessions from AsyncStorage. Sessions are persisted as an array of
 * objects: { date: 'YYYY-MM-DD', duration: number }. Returns an empty array
 * if none are stored.
 */
export async function loadSessions() {
  try {
    const value = await AsyncStorage.getItem(SESSIONS_KEY);
    return value ? JSON.parse(value) : [];
  } catch (err) {
    console.warn('Error loading sessions', err);
    return [];
  }
}

/**
 * Save the provided sessions array to storage. Overwrites existing data.
 * @param {Array<{date: string, duration: number}>} sessions
 */
export async function saveSessions(sessions) {
  try {
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.warn('Error saving sessions', err);
  }
}

/**
 * Append a new session to storage for the given date and duration. If a session
 * already exists for the date, the durations are aggregated. Returns the
 * updated list.
 * @param {Date} date
 * @param {number} duration (seconds)
 */
export async function appendSession(date, duration) {
  const sessions = await loadSessions();
  const iso = formatDate(date);
  const existingIndex = sessions.findIndex((s) => s.date === iso);
  if (existingIndex >= 0) {
    sessions[existingIndex].duration += duration;
  } else {
    sessions.push({ date: iso, duration });
  }
  await saveSessions(sessions);
  return sessions;
}

/**
 * Compute metrics for the provided sessions array: total focus time today,
 * number of sessions today, current streak and longest streak. A streak is
 * defined as consecutive days with any non-zero duration.
 */
export function computeMetrics(sessions) {
  const today = new Date();
  const todayIso = formatDate(today);
  let totalToday = 0;
  let sessionsToday = 0;
  const sorted = [...sessions].sort((a, b) => (a.date < b.date ? -1 : 1));
  // Count today's sessions
  sorted.forEach((s) => {
    if (s.date === todayIso) {
      totalToday += s.duration;
      sessionsToday += 1;
    }
  });
  // Calculate streaks
  let longest = 0;
  let current = 0;
  let prevDate = null;
  sorted.forEach((s) => {
    const d = new Date(s.date);
    if (!prevDate) {
      current = 1;
    } else {
      const diffDays = Math.round((d - prevDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        current += 1;
      } else if (diffDays > 1) {
        current = 1;
      }
    }
    if (current > longest) longest = current;
    prevDate = d;
  });
  // Determine current streak (ending today)
  let currentStreak = 0;
  if (sessions.some((s) => s.date === todayIso)) {
    // starting from today, count back until gap
    const days = getReverseSortedDates(sorted.map((s) => new Date(s.date)));
    currentStreak = 1;
    for (let i = 1; i < days.length; i++) {
      const diff = Math.round((days[i] - days[i - 1]) / (1000 * 60 * 60 * 24));
      if (diff === -1) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  }
  return { totalToday, sessionsToday, currentStreak, longestStreak: longest };
}

// Helper to sort an array of dates descending
function getReverseSortedDates(dates) {
  return dates.sort((a, b) => b - a);
}