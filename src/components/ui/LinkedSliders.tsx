import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, radii, spacing } from '../../config/theme';

interface LinkedSlidersProps {
  famous: number;
  moderate: number;
  hidden: number;
  onChange: (famous: number, moderate: number, hidden: number) => void;
}

export const LinkedSliders: React.FC<LinkedSlidersProps> = ({
  famous,
  moderate,
  hidden,
  onChange,
}) => {
  const PRESETS = [
    { label: 'THADAM Balanced', f: 20, m: 40, h: 40 },
    { label: 'Famous First', f: 50, m: 30, h: 20 },
    { label: '100% Off-Beaten', f: 0, m: 30, h: 70 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <View style={[styles.segment, { flex: famous, backgroundColor: colors.gold }]} />
        <View style={[styles.segment, { flex: moderate, backgroundColor: colors.line }]} />
        <View style={[styles.segment, { flex: hidden, backgroundColor: colors.primary }]} />
      </View>

      {/* Percentage Readout */}
      <View style={styles.readoutRow}>
        <View style={styles.indicator}>
          <View style={[styles.dot, { backgroundColor: colors.gold }]} />
          <Text style={styles.indicatorText}>{famous}% Famous</Text>
        </View>
        <View style={styles.indicator}>
          <View style={[styles.dot, { backgroundColor: colors.line }]} />
          <Text style={styles.indicatorText}>{moderate}% Moderate</Text>
        </View>
        <View style={styles.indicator}>
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          <Text style={styles.indicatorText}>{hidden}% Hidden Gems</Text>
        </View>
      </View>

      {/* Presets */}
      <View style={styles.presetsRow}>
        {PRESETS.map((p) => {
          const isActive = famous === p.f && moderate === p.m && hidden === p.h;
          return (
            <TouchableOpacity
              key={p.label}
              style={[styles.presetBtn, isActive && styles.presetBtnActive]}
              onPress={() => onChange(p.f, p.m, p.h)}
              activeOpacity={0.8}
            >
              <Text style={[styles.presetText, isActive && styles.presetTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  bar: {
    height: 10,
    flexDirection: 'row',
    borderRadius: radii.pill,
    overflow: 'hidden',
    backgroundColor: colors.surfaceSubtle,
    marginBottom: spacing.sm,
  },
  segment: {
    height: '100%',
  },
  readoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  indicatorText: {
    fontSize: typography.sizes.small,
    fontWeight: '600',
    color: colors.ink,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  presetBtn: {
    flex: 1,
    height: 38,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink,
  },
  presetTextActive: {
    color: colors.onPrimary,
  },
});
