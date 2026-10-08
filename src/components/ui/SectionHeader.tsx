import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../config/theme';

interface SectionHeaderProps {
  pretitle?: string;
  title: string;
  subtitle?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ pretitle, title, subtitle }) => {
  return (
    <View style={styles.container}>
      {pretitle ? <Text style={styles.pretitle}>{pretitle}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  pretitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.metadata,
    fontWeight: '700',
    color: colors.goldText,
    marginBottom: 4,
  },
  title: {
    fontFamily: typography.fontFamilyHeading,
    fontSize: typography.sizes.h2,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: typography.letterSpacing.tight,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
});
