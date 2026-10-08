import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, radii, spacing } from '../../config/theme';
import { DataStatus, PopularityType, PressureLevel } from '../../types/database';

export const DataFreshnessBadge: React.FC<{ status: DataStatus }> = ({ status }) => {
  let bg = colors.surfaceSubtle;
  let text = colors.textSecondary;
  let label: string = status;
  let hasPulse = false;

  if (status === 'LIVE') {
    bg = colors.forestGreenLight;
    text = colors.forestGreen;
    label = 'LIVE';
    hasPulse = true;
  } else if (status === 'RECENT') {
    bg = colors.surfaceSubtle;
    text = colors.secondaryIndigo;
    label = 'RECENT';
  } else if (status === 'PREDICTED') {
    bg = colors.goldLight;
    text = colors.gold;
    label = 'PREDICTED';
  } else if (status === 'ESTIMATED') {
    bg = colors.surfaceSubtle;
    text = colors.textSecondary;
    label = 'ESTIMATED';
  } else if (status === 'DEMO') {
    bg = colors.warmSandLight;
    text = colors.secondaryIndigo;
    label = 'DEMO';
  }

  return (
    <View style={[styles.badgeContainer, { backgroundColor: bg }]}>
      {hasPulse && <View style={styles.pulseDot} />}
      <Text style={[styles.badgeText, { color: text }]}>{label}</Text>
    </View>
  );
};

export const VerifiedBadge: React.FC = () => {
  return (
    <View style={[styles.badgeContainer, { backgroundColor: colors.forestGreenLight }]}>
      <Text style={[styles.badgeText, { color: colors.forestGreen }]}>✓ VERIFIED</Text>
    </View>
  );
};

export const PopularityBadge: React.FC<{ type: PopularityType }> = ({ type }) => {
  let bg = colors.surfaceSubtle;
  let text = colors.textSecondary;
  let label = type.toUpperCase();

  if (type === 'hidden') {
    bg = colors.forestGreenLight;
    text = colors.forestGreen;
    label = '✦ HIDDEN DISCOVERY';
  } else if (type === 'moderate') {
    bg = colors.warmSandLight;
    text = colors.secondaryIndigo;
    label = 'MODERATE';
  } else if (type === 'famous') {
    bg = colors.goldLight;
    text = colors.gold;
    label = 'FAMOUS';
  }

  return (
    <View style={[styles.badgeContainer, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{label}</Text>
    </View>
  );
};

export const PressureBadge: React.FC<{ level: PressureLevel }> = ({ level }) => {
  let bg = colors.forestGreenLight;
  let text = colors.forestGreen;
  let label = 'LOW PRESSURE';

  if (level === 'HIGH' || level === 'CRITICAL') {
    bg = colors.coralLight;
    text = colors.coral;
    label = 'HIGH PRESSURE';
  } else if (level === 'MODERATE') {
    bg = colors.goldLight;
    text = colors.gold;
    label = 'MODERATE PRESSURE';
  }

  return (
    <View style={[styles.badgeContainer, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{label}</Text>
    </View>
  );
};

export const FacilityCoverageBadge: React.FC<{ coverage: 'GREEN' | 'YELLOW' | 'RED' }> = ({ coverage }) => {
  const bg =
    coverage === 'GREEN'
      ? colors.forestGreenLight
      : coverage === 'YELLOW'
      ? colors.goldLight
      : colors.coralLight;
  const text =
    coverage === 'GREEN'
      ? colors.forestGreen
      : coverage === 'YELLOW'
      ? colors.gold
      : colors.coral;
  const label =
    coverage === 'GREEN'
      ? 'FACILITIES: GOOD'
      : coverage === 'YELLOW'
      ? 'FACILITIES: LIMITED'
      : 'FACILITIES: REMOTE';

  return (
    <View style={[styles.badgeContainer, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.forestGreen,
    marginRight: 4,
  },
  badgeText: {
    fontSize: typography.sizes.metadata,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.uppercaseTag,
  },
});
