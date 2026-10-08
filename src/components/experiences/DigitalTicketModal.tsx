import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Booking } from '../../types/database';
import { colors, typography, spacing, radii, shadows } from '../../config/theme';

interface DigitalTicketModalProps {
  visible: boolean;
  booking: Booking | null;
  onClose: () => void;
}

export const DigitalTicketModal: React.FC<DigitalTicketModalProps> = ({
  visible,
  booking,
  onClose,
}) => {
  if (!booking) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.sheetOverlay}>
        <View style={styles.sheetContainer}>
          {/* Bottom Sheet Handle */}
          <View style={styles.dragHandle} />

          {/* Booking Success Route Icon & Headline (Section 45 & 58) */}
          <View style={styles.successHeader}>
            <View style={styles.pathCheckSymbol}>
              <View style={styles.routeTraceLine} />
              <View style={styles.checkCircle}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
            </View>

            <Text style={styles.headline}>You're booked.</Text>
            <Text style={styles.subheadline}>
              Your artisan experience is verified & secured.
            </Text>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Pass / Ticket Surface */}
            <View style={styles.ticketCard}>
              <View style={styles.ticketTopRow}>
                <Text style={styles.refCode}>{booking.bookingReference}</Text>
                <View style={styles.verifiedTag}>
                  <Text style={styles.verifiedTagText}>✓ VERIFIED PASS</Text>
                </View>
              </View>

              <Text style={styles.experienceTitle}>{booking.experience.name}</Text>
              <Text style={styles.hostName}>Host: {booking.experience.providerName}</Text>

              {/* Minimal QR Representation */}
              <View style={styles.qrContainer}>
                <View style={styles.qrMatrix}>
                  <View style={styles.qrRow}>
                    <View style={styles.bDark} /><View style={styles.bDark} /><View style={styles.bLight} /><View style={styles.bDark} /><View style={styles.bDark} />
                  </View>
                  <View style={styles.qrRow}>
                    <View style={styles.bDark} /><View style={styles.bLight} /><View style={styles.bLight} /><View style={styles.bLight} /><View style={styles.bDark} />
                  </View>
                  <View style={styles.qrRow}>
                    <View style={styles.bLight} /><View style={styles.bDark} /><View style={styles.bDark} /><View style={styles.bLight} /><View style={styles.bDark} />
                  </View>
                  <View style={styles.qrRow}>
                    <View style={styles.bDark} /><View style={styles.bLight} /><View style={styles.bLight} /><View style={styles.bDark} /><View style={styles.bLight} />
                  </View>
                  <View style={styles.qrRow}>
                    <View style={styles.bDark} /><View style={styles.bDark} /><View style={styles.bLight} /><View style={styles.bDark} /><View style={styles.bDark} />
                  </View>
                </View>
                <Text style={styles.qrSubText}>{booking.qrToken}</Text>
              </View>

              {/* Booking Details Table (Section 45) */}
              <View style={styles.metaTable}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Date</Text>
                  <Text style={styles.metaValue}>{booking.date}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Time</Text>
                  <Text style={styles.metaValue}>{booking.timeSlot}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Host</Text>
                  <Text style={styles.metaValue}>{booking.experience.providerName}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Location</Text>
                  <Text style={styles.metaValue}>Kumbakonam Guild, TN</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Travelers</Text>
                  <Text style={styles.metaValue}>{booking.peopleCount} Participants</Text>
                </View>
                <View style={[styles.metaRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.metaLabel}>Amount Paid</Text>
                  <Text style={[styles.metaValue, { color: colors.forestGreen, fontWeight: '800' }]}>
                    ₹{booking.totalPrice}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Primary Action Button: VIEW TRIP (Section 45) */}
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.viewTripBtn} onPress={onClose} activeOpacity={0.9}>
              <Text style={styles.viewTripBtnText}>VIEW TRIP</Text>
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
  successHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pathCheckSymbol: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  routeTraceLine: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.sandLight,
    borderStyle: 'dashed',
  },
  checkCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.forestGreen,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.card,
  },
  checkIcon: {
    color: colors.surface,
    fontSize: 22,
    fontWeight: '800',
  },
  headline: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subheadline: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scrollArea: {
    marginBottom: 75,
  },
  ticketCard: {
    backgroundColor: colors.background, // Warm Ivory
    borderRadius: radii.card, // 18px
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ticketTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  refCode: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1,
  },
  verifiedTag: {
    backgroundColor: '#EEF4F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  experienceTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  hostName: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  qrMatrix: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  qrRow: {
    flexDirection: 'row',
    gap: 4,
  },
  bDark: {
    width: 14,
    height: 14,
    backgroundColor: colors.primary,
  },
  bLight: {
    width: 14,
    height: 14,
    backgroundColor: colors.surfaceSubtle,
  },
  qrSubText: {
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 1,
    marginTop: 8,
    fontFamily: typography.fontFamilyMono,
  },
  metaTable: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  metaLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  metaValue: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textPrimary,
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
  },
  viewTripBtn: {
    height: 48,
    borderRadius: radii.button, // 12px
    backgroundColor: colors.primary, // Deep Indigo #18243F
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewTripBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: 1,
  },
});
