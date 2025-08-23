import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { getDayName } from '../utils/date';

/**
 * Renders a simple bar chart using react-native-svg. Expects an array of
 * objects with {date: Date, value: number}. The bar heights are scaled
 * relative to the maximum value in the dataset.
 */
export default function StatsBarChart({ data, barColor = '#6B8DD6' }) {
  if (!data || data.length === 0) {
    return null;
  }
  const maxValue = Math.max(...data.map((d) => d.value));
  const chartHeight = 120;
  const barWidth = 20;
  const spacing = 24;
  const chartWidth = data.length * spacing;
  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={chartHeight + 20}>
        {data.map((d, index) => {
          const barHeight = maxValue > 0 ? (d.value / maxValue) * chartHeight : 0;
          return (
            <React.Fragment key={index}>
              <Rect
                x={index * spacing + (spacing - barWidth) / 2}
                y={chartHeight - barHeight}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={barColor}
              />
              <SvgText
                x={index * spacing + spacing / 2}
                y={chartHeight + 14}
                fill="#333"
                fontSize="10"
                fontWeight="500"
                textAnchor="middle"
              >
                {getDayName(d.date)}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
});