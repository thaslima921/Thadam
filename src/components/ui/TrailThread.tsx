import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';
import { colors } from '../../config/theme';
import { PressureLevel } from '../../types/database';

interface TrailThreadProps {
  stopsCount: number;
  currentStopIndex?: number;
  stopPressures?: PressureLevel[];
  height?: number;
}

export const TrailThread: React.FC<TrailThreadProps> = ({
  stopsCount,
  currentStopIndex = 0,
  stopPressures = [],
  height = 320,
}) => {
  const getPressureColor = (pressure?: PressureLevel) => {
    switch (pressure) {
      case 'LOW':
        return colors.pressureComfortable; // #17702F
      case 'MODERATE':
        return colors.pressureModerate;    // #8A6508
      case 'HIGH':
        return colors.pressureHigh;        // #B45309
      case 'CRITICAL':
        return colors.pressureVeryHigh;    // #B3261E
      default:
        return colors.gold;
    }
  };

  const nodePositions = Array.from({ length: stopsCount }).map((_, idx) => {
    if (stopsCount === 1) return height / 2;
    const padding = 24;
    const step = (height - padding * 2) / (stopsCount - 1);
    return padding + idx * step;
  });

  return (
    <View style={[styles.container, { height }]}>
      <Svg width="36" height={height} viewBox={`0 0 36 ${height}`}>
        {/* Connecting line segments */}
        {nodePositions.map((y, idx) => {
          if (idx === nodePositions.length - 1) return null;
          const nextY = nodePositions[idx + 1];
          const segmentColor = getPressureColor(stopPressures[idx]);

          return (
            <Line
              key={`line-${idx}`}
              x1="18"
              y1={y}
              x2="18"
              y2={nextY}
              stroke={segmentColor}
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
          );
        })}

        {/* Node circles */}
        {nodePositions.map((y, idx) => {
          const isCurrent = idx === currentStopIndex;
          const nodeColor = getPressureColor(stopPressures[idx]);

          return (
            <React.Fragment key={`node-${idx}`}>
              {/* Outer ring */}
              <Circle
                cx="18"
                cy={y}
                r={isCurrent ? '10' : '7'}
                fill={colors.surface}
                stroke={colors.gold}
                strokeWidth="2"
              />
              {/* Inner pressure dot */}
              <Circle
                cx="18"
                cy={y}
                r={isCurrent ? '5' : '3.5'}
                fill={nodeColor}
              />
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
