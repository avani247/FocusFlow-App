import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

/**
 * Renders a circular progress indicator with a countdown timer in the center.
 * @param {number} totalSeconds - the total duration of the timer in seconds
 * @param {number} remainingSeconds - the remaining time in seconds
 */
export default function TimerCircle({ totalSeconds, remainingSeconds }) {
  const radius = 100;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = remainingSeconds / totalSeconds;
  const strokeDashoffset = circumference - progress * circumference;
  // Format time as MM:SS
  const minutes = Math.floor(remainingSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (remainingSeconds % 60).toString().padStart(2, '0');
  return (
    <View style={styles.container}>
      <Svg height={radius * 2} width={radius * 2}>
        <Circle
          stroke="#E5EAF5"
          fill="none"
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          strokeWidth={stroke}
        />
        <Circle
          stroke="#6B8DD6"
          fill="none"
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${radius}, ${radius}`}
        />
      </Svg>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{`${minutes}:${seconds}`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6B8DD6',
  },
});