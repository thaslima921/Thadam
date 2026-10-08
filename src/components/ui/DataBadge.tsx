import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, radii } from '../../config/theme';

export type DataBadgeType = 'LIVE' | 'RECENT' | 'PREDICTED' | 'ESTIMATED' | 'DEMO';

interface DataBadgeProps {
  type?: DataBadgeType;
  status?: DataBadgeType;
}

export const DataBadge: React.FC<DataBadgeProps> = ({ type, status }) => {
  const badgeType = type || status || 'DEMO';
  const getBadgeStyle = () => {
    switch (badgeType) {
      case 'LIVE':
        return { bg: '#EBF4ED', text: colors.pressureComfortable, dot: colors.pressureComfortable };
      case 'RECENT':
        return { bg: colors.surfaceSubtle, text: colors.goldText, dot: colors.gold };
      case 'PREDICTED':
        return { bg: colors.surfaceSubtle, text: colors.ink, dot: colors.ink };
      case 'ESTIMATED':
        return { bg: colors.surfaceSubtle, text: colors.goldText, dot: colors.goldText };
      case 'DEMO':
      default:
        return { bg: '#F4E6C8', text: colors.goldText, dot: colors.gold };
    }
  };

  const style = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <View style={[styles.dot, { backgroundColor: style.dot }]} />
      <Text style={[styles.text, { color: style.text }]}>{type}</Text>
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
    gap: 4,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  text: {
    fontSize: typography.sizes.metadata,
    fontWeight: '700',
    letterSpacing: typography.letterSpacing.uppercaseTag,
  },
});
