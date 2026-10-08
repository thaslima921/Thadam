import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Destination, Experience } from '../../types/database';
import { colors, typography, spacing, radii, shadows } from '../../config/theme';
import { useTripStore } from '../../store/useTripStore';
import { PressureBadge } from '../common/Badge';

interface AdaptiveRerouteModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AdaptiveRerouteModal: React.FC<AdaptiveRerouteModalProps> = ({ visible, onClose }) => {
  const { disruptionAlert, resolveDisruption, dismissDisruptionAlert } = useTripStore();

  if (!disruptionAlert) return null;

  const handleSelectAlternative = (dest: Destination, exp?: Experience) => {
    resolveDisruption(dest, exp);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.sheetOverlay}>
        <View style={styles.sheetContainer}>
          {/* Bottom Sheet Handle */}
          <View style={styles.dragHandle} />

          {/* Top Label & Header (Section 42) */}
          <View style={styles.headerBlock}>
            <View style={styles.badgeRow}>
              <Text style={styles.alertTag}>TRIP UPDATE</Text>
              <View style={styles.coralDot} />
            </View>
            <Text style={styles.heading}>Your next stop changed.</Text>
            <Text style={styles.explanation}>
              We found another destination that fits your route and interests. Planned stop '{disruptionAlert.destinationName}' has a live advisory ({disruptionAlert.reason}).
            </Text>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {disruptionAlert.alternatives.map((cand) => (
              <View key={cand.destination.id} style={styles.alternativeCard}>
                <Image source={{ uri: cand.destination.image }} style={styles.cardImage} />

                <View style={styles.cardBody}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.cardTitle}>{cand.destination.name}</Text>
                    <PressureBadge level={cand.destination.pressureLevel} />
                  </View>

                  <Text style={styles.cardDistrict}>
                    {cand.destination.district} • {cand.distanceKm} km from route corridor
                  </Text>

                  {/* Why it fits */}
                  <View style={styles.reasonsBox}>
                    <Text style={styles.reasonsText}>
                      ✦ {cand.reasons[0] || 'Matches your travel pace, safety, and cultural DNA'}
                    </Text>
                  </View>

                  {/* Action button */}
                  <TouchableOpacity
                    style={styles.switchBtn}
                    onPress={() => handleSelectAlternative(cand.destination, cand.experience)}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.switchBtnText}>SWITCH DESTINATION</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Secondary CTA: Keep current plan */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.keepPlanBtn}
              onPress={() => {
                dismissDisruptionAlert();
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.keepPlanBtnText}>Keep current plan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(24, 36, 63, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.surface, // Soft White
    borderTopLeftRadius: radii.sheet, // 24px
    borderTopRightRadius: radii.sheet, // 24px
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    maxHeight: '90%',
    ...shadows.elevated,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  headerBlock: {
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  alertTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.coral,
    letterSpacing: 1,
  },
  coralDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.coral,
  },
  heading: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  explanation: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  scrollArea: {
    marginBottom: spacing.md,
  },
  alternativeCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card, // 18px
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardImage: {
    width: '100%',
    height: 135,
    backgroundColor: colors.surfaceSubtle,
  },
  cardBody: {
    padding: spacing.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardDistrict: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  reasonsBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.sm,
    padding: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  reasonsText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.forestGreen,
  },
  switchBtn: {
    height: 46,
    borderRadius: radii.button, // 12px
    backgroundColor: colors.primary, // Deep Indigo #18243F
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: 1,
  },
  footerRow: {
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  keepPlanBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  keepPlanBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
