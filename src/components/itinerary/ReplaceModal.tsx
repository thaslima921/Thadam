import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Destination, Experience, TripStop } from '../../types/database';
import { colors, typography, spacing, radii, shadows } from '../../config/theme';
import { useTripStore } from '../../store/useTripStore';
import { findAlternatives } from '../../services/aiPlannerService';
import { PressureBadge } from '../common/Badge';

interface ReplaceModalProps {
  visible: boolean;
  stop: TripStop | null;
  dayNumber: number;
  onClose: () => void;
  onSelectReplacement: (newDest: Destination, newExp?: Experience) => void;
}

const REPLACEMENT_CHIPS = [
  'Too crowded',
  'Too far',
  'Too expensive',
  'Not my style',
  'Want something more local',
];

export const ReplaceModal: React.FC<ReplaceModalProps> = ({
  visible,
  stop,
  dayNumber,
  onClose,
  onSelectReplacement,
}) => {
  const { preferences, currentTrip } = useTripStore();
  const [selectedReason, setSelectedReason] = useState<string>('Too crowded');
  const [candidates, setCandidates] = useState<
    Array<{
      destination: Destination;
      scoreMatch: number;
      distanceKm: number;
      estimatedCost: number;
      reasons: string[];
      experience?: Experience;
    }>
  >([]);

  React.useEffect(() => {
    if (stop && currentTrip) {
      const results = findAlternatives(stop, selectedReason, preferences, currentTrip);
      setCandidates(results);
    }
  }, [stop, selectedReason, currentTrip, preferences]);

  if (!stop) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.sheetOverlay}>
        <View style={styles.sheetContainer}>
          {/* Bottom Sheet Handle (Section 51) */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.sheetHeading}>Let's find a better fit.</Text>
              <Text style={styles.sheetSub}>Replacing: {stop.destination.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Why change? Chips (Section 36) */}
            <Text style={styles.sectionLabel}>WHY CHANGE?</Text>
            <View style={styles.chipsRow}>
              {REPLACEMENT_CHIPS.map((reason) => {
                const active = selectedReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    style={[styles.reasonPill, active && styles.reasonPillActive]}
                    onPress={() => setSelectedReason(reason)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.reasonPillText, active && styles.reasonPillTextActive]}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Better matches header */}
            <View style={styles.matchesHeader}>
              <Text style={styles.matchesHeading}>Better matches</Text>
              <Text style={styles.matchesMeta}>Route optimized for Day 0{dayNumber}</Text>
            </View>

            {/* 3 Image Cards */}
            <View style={styles.cardsContainer}>
              {candidates.map((cand) => (
                <View key={cand.destination.id} style={styles.matchCard}>
                  <Image source={{ uri: cand.destination.image }} style={styles.cardImage} />

                  <View style={styles.cardBody}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.cardTitle}>{cand.destination.name}</Text>
                      <PressureBadge level={cand.destination.pressureLevel} />
                    </View>

                    <Text style={styles.cardMeta}>
                      {cand.scoreMatch}% match • {cand.distanceKm} km drive • ~₹{cand.estimatedCost}
                    </Text>

                    {/* Why it fits callout */}
                    <View style={styles.whyFitsBox}>
                      <Text style={styles.whyFitsText}>
                        ✦ {cand.reasons[0] || 'Fits current travel pace & interests'}
                      </Text>
                    </View>

                    {/* Primary Button: USE THIS */}
                    <TouchableOpacity
                      style={styles.useThisBtn}
                      onPress={() => onSelectReplacement(cand.destination, cand.experience)}
                      activeOpacity={0.9}
                    >
                      <Text style={styles.useThisBtnText}>USE THIS</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(24, 36, 63, 0.45)', // Deep indigo muted veil
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.surface, // Soft White
    borderTopLeftRadius: radii.sheet, // 24px
    borderTopRightRadius: radii.sheet, // 24px
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    maxHeight: '88%',
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  sheetHeading: {
    fontSize: typography.sizes.xl, // 20-22px
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  sheetSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  scrollArea: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
    marginBottom: spacing.lg,
  },
  reasonPill: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reasonPillActive: {
    backgroundColor: colors.primary, // Deep Indigo
    borderColor: colors.primary,
  },
  reasonPillText: {
    fontSize: typography.sizes.xs,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  reasonPillTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  matchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  matchesHeading: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  matchesMeta: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  cardsContainer: {
    gap: spacing.md,
  },
  matchCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card, // 18px
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  cardImage: {
    width: '100%',
    height: 140, // 4:3-inspired editorial header
    backgroundColor: colors.surfaceSubtle,
  },
  cardBody: {
    padding: spacing.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardMeta: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  whyFitsBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.sm,
    padding: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  whyFitsText: {
    fontSize: 11,
    color: colors.forestGreen,
    fontWeight: '600',
  },
  useThisBtn: {
    height: 44,
    borderRadius: radii.button, // 12px
    backgroundColor: colors.primary, // Deep Indigo #18243F
    justifyContent: 'center',
    alignItems: 'center',
  },
  useThisBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: 1,
  },
});
