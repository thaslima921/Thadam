import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { EXPERIENCES } from '../../data/experiences';
import { colors, typography, spacing, radii, shadows } from '../../config/theme';
import { useDemoStore } from '../../store/useDemoStore';
import { useTripStore } from '../../store/useTripStore';

export const PartnerPortal: React.FC = () => {
  const { experienceSlotsMap, adjustExperienceSlots } = useDemoStore();
  const { bookings } = useTripStore();
  const [scanResult, setScanResult] = useState<string | null>(null);

  const bronzeExp = EXPERIENCES[0];
  const currentAvailableSlots = experienceSlotsMap[bronzeExp.id] ?? bronzeExp.availableSlots;

  const handleSlotChange = (delta: number) => {
    adjustExperienceSlots(bronzeExp.id, currentAvailableSlots + delta);
  };

  const handleSimulateScan = () => {
    setScanResult('✅ QR Pass Verified: THD-BRONZE-8842 (Ananya Raman • 2 Guests • Status: CHECKED IN)');
    setTimeout(() => setScanResult(null), 5000);
  };

  return (
    <View style={styles.container}>
      {/* Editorial Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.verifiedPill}>
            <Text style={styles.verifiedText}>✓ VERIFIED GUILD</Text>
          </View>
          <View style={styles.livePill}>
            <Text style={styles.liveText}>● LIVE SYNC</Text>
          </View>
        </View>

        <Text style={styles.partnerName}>Master Craftsman Rajan</Text>
        <Text style={styles.guildName}>Swamimalai Chola Bronze Heritage Guild #GI-TN-03</Text>
      </View>

      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Capacity Control Card */}
        <View style={styles.card}>
          <Text style={styles.cardTag}>REALTIME CAPACITY CONTROL</Text>
          <Text style={styles.cardTitle}>Live Slot Availability</Text>
          <Text style={styles.cardDesc}>
            Adjusting available seats here immediately updates the tourist app and itinerary recommendations via Supabase Realtime without page refresh.
          </Text>

          <View style={styles.experienceBox}>
            <Text style={styles.expName}>{bronzeExp.name}</Text>
            <Text style={styles.expPrice}>₹{bronzeExp.price} / person • Capacity: {bronzeExp.capacity} seats</Text>

            <View style={styles.slotController}>
              <Text style={styles.slotLabel}>Current Available Slots:</Text>
              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => handleSlotChange(-1)}
                  disabled={currentAvailableSlots <= 0}
                  activeOpacity={0.8}
                >
                  <Text style={styles.counterBtnText}>−</Text>
                </TouchableOpacity>

                <View style={styles.slotValueBox}>
                  <Text style={styles.slotValueText}>{currentAvailableSlots}</Text>
                  <Text style={styles.slotSubText}>seats left</Text>
                </View>

                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => handleSlotChange(1)}
                  disabled={currentAvailableSlots >= bronzeExp.capacity}
                  activeOpacity={0.8}
                >
                  <Text style={styles.counterBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.syncNoteBox}>
              <Text style={styles.syncNoteText}>
                ⚡ Realtime broadcast: CAPACITY_CHANGED synchronized.
              </Text>
            </View>
          </View>
        </View>

        {/* QR Scanner Simulator */}
        <View style={styles.card}>
          <Text style={styles.cardTag}>PASS VERIFICATION</Text>
          <Text style={styles.cardTitle}>Visitor QR Check-In</Text>
          <Text style={styles.cardDesc}>
            Scan arriving tourist digital passes generated from THADAM TN bookings.
          </Text>

          <TouchableOpacity style={styles.scanBtn} onPress={handleSimulateScan} activeOpacity={0.85}>
            <Text style={styles.scanBtnText}>📷 Simulate QR Scan (Ananya Raman's Pass)</Text>
          </TouchableOpacity>

          {scanResult && (
            <View style={styles.scanSuccessBox}>
              <Text style={styles.scanSuccessText}>{scanResult}</Text>
            </View>
          )}
        </View>

        {/* Bookings List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upcoming Guild Bookings ({bookings.length})</Text>

          {bookings.map((b) => (
            <View key={b.id} style={styles.bookingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bookingRef}>{b.bookingReference}</Text>
                <Text style={styles.bookingTitle}>{b.experience.name}</Text>
                <Text style={styles.bookingMeta}>
                  {b.date} • {b.timeSlot} • {b.peopleCount} Participants
                </Text>
              </View>
              <View style={styles.bookingRight}>
                <Text style={styles.bookingPrice}>₹{b.totalPrice}</Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>{b.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Guild Economic Impact */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Local Guild Economic Impact</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricVal}>₹18,400</Text>
              <Text style={styles.metricLabel}>Total Payout</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricVal}>28</Text>
              <Text style={styles.metricLabel}>Visitors</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricVal}>4.9 ★</Text>
              <Text style={styles.metricLabel}>Rating</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Warm Ivory
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.xs,
  },
  verifiedPill: {
    backgroundColor: '#EEF4F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  livePill: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accentGold,
  },
  partnerName: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  guildName: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentGold,
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  experienceBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.smCard,
    padding: spacing.md,
  },
  expName: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  expPrice: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  slotController: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  slotLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  slotValueBox: {
    alignItems: 'center',
  },
  slotValueText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  slotSubText: {
    fontSize: 9,
    color: colors.textTertiary,
  },
  syncNoteBox: {
    marginTop: spacing.md,
    paddingTop: spacing.xs,
  },
  syncNoteText: {
    fontSize: 10,
    color: colors.forestGreen,
    fontWeight: '600',
  },
  scanBtn: {
    height: 48,
    borderRadius: radii.button,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.surface,
  },
  scanSuccessBox: {
    marginTop: spacing.md,
    backgroundColor: '#EEF4F0',
    padding: spacing.md,
    borderRadius: radii.smCard,
    borderWidth: 1,
    borderColor: colors.forestGreen,
  },
  scanSuccessText: {
    fontSize: typography.sizes.xs,
    color: colors.forestGreen,
    fontWeight: '700',
  },
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  bookingRef: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textTertiary,
  },
  bookingTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  bookingMeta: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bookingRight: {
    alignItems: 'flex-end',
  },
  bookingPrice: {
    fontSize: typography.sizes.sm,
    fontWeight: '800',
    color: colors.primary,
  },
  statusPill: {
    backgroundColor: '#EEF4F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
    marginTop: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.smCard,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  metricVal: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
    color: colors.primary,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
