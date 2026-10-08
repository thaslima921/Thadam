import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../config/theme';
import { useTripStore } from '../../store/useTripStore';
import { PressureBadge } from '../../components/common/Badge';

interface LiveTripScreenProps {
  onBackToItinerary: () => void;
  onOpenMap: () => void;
}

export const LiveTripScreen: React.FC<LiveTripScreenProps> = ({
  onBackToItinerary,
  onOpenMap,
}) => {
  const { currentTrip, activeTripSession, nextLiveStop, endLiveTrip } = useTripStore();
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  if (!currentTrip || !activeTripSession) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No active trip session</Text>
        <Text style={styles.emptySub}>Start live trip from your planned itinerary.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={onBackToItinerary} activeOpacity={0.8}>
          <Text style={styles.backBtnText}>Return to Itinerary</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentDay =
    currentTrip.days.find((d) => d.dayNumber === activeTripSession.currentDayNumber) ||
    currentTrip.days[0];
  const currentStop = currentDay.stops[activeTripSession.currentStopIndex] || currentDay.stops[0];
  const nextStop = currentDay.stops[activeTripSession.currentStopIndex + 1];

  const dest = currentStop.destination;
  const fac = dest.facilities;

  return (
    <View style={styles.container}>
      {/* Top Header Row (Section 39 & 40) */}
      <View style={styles.topHeader}>
        <View style={styles.liveTagRow}>
          <View style={styles.livePulseDot} />
          <Text style={styles.liveTagText}>LIVE TRIP</Text>
        </View>

        <TouchableOpacity style={styles.endPill} onPress={endLiveTrip} activeOpacity={0.8}>
          <Text style={styles.endPillText}>End Journey</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Next Destination Arrival Hero (Section 39) */}
        <View style={styles.arrivalHero}>
          <Text style={styles.arrivalLabel}>NEXT DESTINATION</Text>
          <Text style={styles.destMainHeading}>{dest.name}</Text>

          <View style={styles.metricsBanner}>
            <View style={styles.metricBlock}>
              <Text style={styles.metricBig}>18 min</Text>
              <Text style={styles.metricSub}>ESTIMATED ARRIVAL</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricBlock}>
              <Text style={styles.metricBig}>5.4 km</Text>
              <Text style={styles.metricSub}>DISTANCE REMAINING</Text>
            </View>
          </View>
        </View>

        {/* Destination Editorial Sheet Card */}
        <View style={styles.destSheetCard}>
          <Image source={{ uri: dest.image }} style={styles.destImage} />

          <View style={styles.sheetBody}>
            {/* Pressure Status (Section 41) */}
            <View style={styles.statusRow}>
              <PressureBadge level={currentStop.crowdStatus} />
              <View style={styles.verifiedChip}>
                <Text style={styles.verifiedChipText}>✓ Verified Registry</Text>
              </View>
            </View>

            <Text style={styles.districtText}>
              {dest.district} • {dest.category} • Scheduled until {currentStop.endTime}
            </Text>

            {/* Corridor Facilities */}
            <View style={styles.facilitiesBox}>
              <Text style={styles.facilityHeadline}>SAFETY & CORRIDOR FACILITIES</Text>
              <Text style={styles.facilityNote}>
                🏥 Hospital: {fac.hospitalKm} km • ⛽ Fuel: {fac.fuelKm} km • 🏨 Stays: {fac.hotelKm < 5 ? 'Nearby' : 'En route'}
              </Text>
            </View>

            {/* Local Experience if attached (Section 43) */}
            {currentStop.experience && (
              <View style={styles.experienceCallout}>
                <Text style={styles.expTag}>LOCAL HOST SCHEDULED</Text>
                <Text style={styles.expTitle}>{currentStop.experience.name}</Text>
                <Text style={styles.expHost}>
                  Hosted by {currentStop.experience.providerName} • {currentStop.experience.durationMinutes} min
                </Text>
              </View>
            )}

            {/* Action Buttons: NAVIGATE + Next Stop */}
            <View style={styles.actionCol}>
              <TouchableOpacity style={styles.navigateBtn} onPress={onOpenMap} activeOpacity={0.9}>
                <Text style={styles.navigateBtnText}>NAVIGATE</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.nextStopBtn} onPress={nextLiveStop} activeOpacity={0.8}>
                <Text style={styles.nextStopBtnText}>
                  {nextStop ? 'Arrived • Proceed to Next Stop →' : 'Complete Day →'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Up Next Preview */}
        {nextStop && (
          <View style={styles.nextCard}>
            <Text style={styles.nextTag}>UP NEXT • {nextStop.startTime}</Text>
            <Text style={styles.nextTitle}>{nextStop.destination.name}</Text>
            <Text style={styles.nextSub}>
              {nextStop.destination.district} • {nextStop.durationMinutes} min planned
            </Text>
          </View>
        )}

        {/* Emergency Assistance Card */}
        <TouchableOpacity
          style={styles.emergencyCard}
          onPress={() => setShowEmergencyModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.emergencyIcon}>🛡️</Text>
          <View style={styles.emergencyTextWrap}>
            <Text style={styles.emergencyTitle}>Corridor Safety & Emergency</Text>
            <Text style={styles.emergencySub}>Nearest Tamil Nadu Highway Patrol & Medical Care</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Emergency Bottom Modal */}
      {showEmergencyModal && (
        <View style={styles.emergencyOverlay}>
          <View style={styles.emergencySheet}>
            <View style={styles.dragHandle} />
            <Text style={styles.emergencySheetTitle}>Emergency Corridor Contacts</Text>
            <Text style={styles.emergencySheetSub}>Thanjavur – Kumbakonam District Patrol</Text>

            <View style={styles.emergencyContactList}>
              <View style={styles.contactItem}>
                <Text style={styles.contactName}>National Emergency Helpline</Text>
                <Text style={styles.contactNumber}>112</Text>
              </View>
              <View style={styles.contactItem}>
                <Text style={styles.contactName}>Tamil Nadu Tourist Police</Text>
                <Text style={styles.contactNumber}>044-2538-4444</Text>
              </View>
              <View style={styles.contactItem}>
                <Text style={styles.contactName}>Nearest Hospital Ambulance</Text>
                <Text style={styles.contactNumber}>108</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeEmergencyBtn}
              onPress={() => setShowEmergencyModal(false)}
            >
              <Text style={styles.closeEmergencyText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Warm Ivory #FBF8F1
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  liveTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.forestGreen,
  },
  liveTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1.5,
  },
  endPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  endPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
  arrivalHero: {
    backgroundColor: colors.surface,
    borderRadius: radii.card, // 18px
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.md,
    ...shadows.card,
  },
  arrivalLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentGold,
    letterSpacing: 1,
    marginBottom: 4,
  },
  destMainHeading: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  metricsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  metricBlock: {
    flex: 1,
    alignItems: 'center',
  },
  metricBig: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  metricSub: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
  destSheetCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  destImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.surfaceSubtle,
  },
  sheetBody: {
    padding: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  verifiedChip: {
    backgroundColor: '#EEF4F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  verifiedChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  districtText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  facilitiesBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.smCard,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  facilityHeadline: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  facilityNote: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  experienceCallout: {
    backgroundColor: colors.sandLight,
    borderRadius: radii.smCard,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#DEC39F',
    marginBottom: spacing.md,
  },
  expTag: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.accentGold,
    letterSpacing: 1,
    marginBottom: 2,
  },
  expTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  expHost: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionCol: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  navigateBtn: {
    height: 50,
    borderRadius: radii.button, // 12px
    backgroundColor: colors.primary, // Deep Indigo #18243F
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigateBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: 1,
  },
  nextStopBtn: {
    height: 44,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextStopBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  nextCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  nextTag: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  nextTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  nextSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.sm,
  },
  emergencyIcon: {
    fontSize: 20,
  },
  emergencyTextWrap: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emergencySub: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  backBtn: {
    height: 44,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.button,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    color: colors.surface,
    fontSize: typography.sizes.xs,
    fontWeight: '700',
  },
  emergencyOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(24, 36, 63, 0.45)',
    justifyContent: 'flex-end',
  },
  emergencySheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    padding: spacing.xl,
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
  emergencySheetTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  emergencySheetSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  emergencyContactList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  contactName: {
    fontSize: typography.sizes.xs,
    color: colors.textPrimary,
  },
  contactNumber: {
    fontSize: typography.sizes.sm,
    fontWeight: '800',
    color: colors.coral,
  },
  closeEmergencyBtn: {
    height: 44,
    borderRadius: radii.button,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeEmergencyText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
