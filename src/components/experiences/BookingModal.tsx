import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Booking, Experience } from '../../types/database';
import { colors, typography, spacing, radii, shadows } from '../../config/theme';
import { useTripStore } from '../../store/useTripStore';

interface BookingModalProps {
  visible: boolean;
  experience: Experience | null;
  onClose: () => void;
  onBookingSuccess?: (booking: Booking) => void;
  onBookingConfirmed?: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  visible,
  experience,
  onClose,
  onBookingSuccess,
  onBookingConfirmed,
}) => {
  const { bookExperience } = useTripStore();
  const [selectedDate, setSelectedDate] = useState('2026-10-16');
  const [selectedTime, setSelectedTime] = useState('11:00 AM');
  const [peopleCount, setPeopleCount] = useState(2);

  if (!experience) return null;

  const dates = ['2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18'];
  const timeSlots = ['09:30 AM', '11:00 AM', '02:30 PM', '04:30 PM'];

  const totalPrice = experience.price * peopleCount;

  const handleConfirm = () => {
    const booking = bookExperience(experience, selectedDate, selectedTime, peopleCount);
    if (onBookingSuccess) {
      onBookingSuccess(booking);
    } else if (onBookingConfirmed) {
      onBookingConfirmed(booking);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.sheetOverlay}>
        <View style={styles.sheetContainer}>
          {/* Bottom Sheet Handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerPreTitle}>LOCAL LIVING</Text>
              <Text style={styles.headerTitle}>Reserve artisan experience</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Experience Overview Card */}
            <View style={styles.expCard}>
              <View style={styles.expHeader}>
                <Text style={styles.expCategory}>{experience.category}</Text>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Verified Host</Text>
                </View>
              </View>
              <Text style={styles.expTitle}>{experience.name}</Text>
              <Text style={styles.expProvider}>Hosted by {experience.providerName}</Text>
              <Text style={styles.expMeta}>
                ₹{experience.price} per person • {experience.durationMinutes} min workshop • {experience.availableSlots} seats available
              </Text>
            </View>

            {/* Date Selection */}
            <Text style={styles.sectionHeading}>SELECT DATE</Text>
            <View style={styles.chipsRow}>
              {dates.map((d) => {
                const active = selectedDate === d;
                return (
                  <TouchableOpacity
                    key={d}
                    style={[styles.choiceChip, active && styles.choiceChipActive]}
                    onPress={() => setSelectedDate(d)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Time Slot Selection */}
            <Text style={styles.sectionHeading}>SELECT TIME SLOT</Text>
            <View style={styles.chipsRow}>
              {timeSlots.map((t) => {
                const active = selectedTime === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[styles.choiceChip, active && styles.choiceChipActive]}
                    onPress={() => setSelectedTime(t)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Participants Counter */}
            <Text style={styles.sectionHeading}>PARTICIPANTS</Text>
            <View style={styles.counterRow}>
              <Text style={styles.counterLabel}>Travelers attending</Text>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setPeopleCount(Math.max(1, peopleCount - 1))}
                  activeOpacity={0.8}
                >
                  <Text style={styles.counterBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterVal}>{peopleCount}</Text>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setPeopleCount(peopleCount + 1)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.counterBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Sticky Total & Reserve Action */}
          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
              <Text style={styles.totalValue}>₹{totalPrice}</Text>
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.9}>
              <Text style={styles.confirmBtnText}>CONFIRM & RESERVE</Text>
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
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.sheet, // 24px
    borderTopRightRadius: radii.sheet, // 24px
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    maxHeight: '85%',
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
  headerPreTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentGold,
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
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
    marginBottom: 75,
  },
  expCard: {
    backgroundColor: colors.sandLight,
    borderRadius: radii.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#DEC39F',
    marginBottom: spacing.lg,
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  expCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentGold,
    letterSpacing: 1,
  },
  verifiedBadge: {
    backgroundColor: colors.forestGreen,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.surface,
  },
  expTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  expProvider: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  expMeta: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 6,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  choiceChip: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  choiceChipText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  choiceChipTextActive: {
    color: colors.surface,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  counterLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  counterBtn: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  counterVal: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
    minWidth: 18,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.elevated,
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.primary,
  },
  confirmBtn: {
    height: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.button, // 12px
    backgroundColor: colors.primary, // Deep Indigo #18243F
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: 1,
  },
});
