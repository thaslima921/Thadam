import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../config/theme';
import { useTripStore } from '../../store/useTripStore';

interface DisruptionAlertBannerProps {
  onOpenAdaptiveModal: () => void;
}

export const DisruptionAlertBanner: React.FC<DisruptionAlertBannerProps> = ({ onOpenAdaptiveModal }) => {
  const { disruptionAlert, dismissDisruptionAlert } = useTripStore();

  if (!disruptionAlert) return null;

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.topRow}>
        <View style={styles.tagRow}>
          <View style={styles.coralDot} />
          <Text style={styles.alertTag}>ROUTE ADVISORY</Text>
        </View>
        <TouchableOpacity onPress={dismissDisruptionAlert} activeOpacity={0.7}>
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>
        Stop unavailable: {disruptionAlert.destinationName}
      </Text>
      <Text style={styles.desc}>
        {disruptionAlert.reason || 'Temporarily closed.'} THADAM has found 3 verified alternative stops.
      </Text>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.primaryBtn} onPress={onOpenAdaptiveModal} activeOpacity={0.9}>
          <Text style={styles.primaryBtnText}>REVIEW ALTERNATIVES</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#FDF6F0', // Soft warm coral-tinted ivory
    padding: spacing.md,
    borderRadius: radii.card,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: '#F2D0C6',
    ...shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coralDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.coral,
  },
  alertTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.coral,
    letterSpacing: 1,
  },
  dismissText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
    padding: 2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  desc: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: 2,
    lineHeight: 16,
  },
  actionRow: {
    marginTop: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.primary, // Deep Indigo
    height: 38,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: colors.surface,
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
