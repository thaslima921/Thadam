import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii } from '../../config/theme';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <View style={styles.centerBox}>
        {/* Emblem: Deep Indigo with subtle Warm Sand letter */}
        <View style={styles.emblem}>
          <Text style={styles.emblemText}>த</Text>
        </View>

        <Text style={styles.brandTitle}>THADAM TN</Text>
        <Text style={styles.tagline}>Explore Beyond the Famous. Empower the Local.</Text>

        {/* Visual Metaphor: "A Journey Drawn By Intelligence" - Path line connecting stops */}
        <View style={styles.pathLine}>
          <View style={[styles.pathDot, { backgroundColor: colors.primary }]} />
          <View style={styles.pathSegment} />
          <View style={[styles.pathDot, { backgroundColor: colors.forestGreen }]} />
          <View style={styles.pathSegment} />
          <View style={[styles.pathDot, { backgroundColor: colors.gold }]} />
        </View>

        <Text style={styles.conceptCaption}>A JOURNEY DRAWN BY INTELLIGENCE</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  centerBox: {
    alignItems: 'center',
  },
  emblem: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emblemText: {
    fontSize: 38,
    fontWeight: '800',
    color: colors.warmSand,
  },
  brandTitle: {
    fontSize: typography.sizes.display,
    fontWeight: typography.weights.extraBold,
    color: colors.primary,
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: typography.sizes.supporting,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  pathLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
  },
  pathDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  pathSegment: {
    width: 28,
    height: 1.5,
    backgroundColor: colors.timelinePath,
  },
  conceptCaption: {
    fontSize: typography.sizes.metadata,
    color: colors.textTertiary,
    letterSpacing: 1.5,
    fontWeight: typography.weights.semibold,
  },
});
