import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, radii } from '../../config/theme';
import { PressureLevel } from '../../types/database';

interface StatusBadgeProps {
  level?: PressureLevel;
  status?: string;
  text?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ level, status, text }) => {
  const effectiveLevel: PressureLevel =
    level ||
    (status === 'comfortable' ? 'LOW' : status === 'moderate' ? 'MODERATE' : status === 'high' ? 'HIGH' : 'LOW');

  const getLevelInfo = () => {
    switch (effectiveLevel) {
      case 'LOW':
        return { label: text || 'Comfortable', color: colors.pressureComfortable, bg: '#EBF4ED' };
      case 'MODERATE':
        return { label: text || 'Moderate', color: colors.pressureModerate, bg: '#F9F5EC' };
      case 'HIGH':
        return { label: text || 'High pressure', color: colors.pressureHigh, bg: '#FDF4EB' };
      case 'CRITICAL':
        return { label: text || 'Peak congestion', color: colors.pressureVeryHigh, bg: '#FDECEC' };
    }
  };

  const info = getLevelInfo();

  return (
    <View style={[styles.badge, { backgroundColor: info.bg }]}>
      <View style={[styles.dot, { backgroundColor: info.color }]} />
      <Text style={[styles.text, { color: info.color }]}>{info.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    gap: 5,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: typography.sizes.metadata,
    fontWeight: '600',
  },
});
