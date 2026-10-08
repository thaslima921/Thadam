import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Booking, Destination, Experience, TripStop } from '../../types/database';
import { colors, typography, spacing, radii, shadows } from '../../config/theme';
import { useTripStore } from '../../store/useTripStore';
import { StopCard } from '../../components/itinerary/StopCard';
import { ReplaceModal } from '../../components/itinerary/ReplaceModal';
import { PlaceDetailsModal } from '../../components/itinerary/PlaceDetailsModal';
import { BookingModal } from '../../components/experiences/BookingModal';
import { DigitalTicketModal } from '../../components/experiences/DigitalTicketModal';
import { TrailThread } from '../../components/ui/TrailThread';

interface ItineraryScreenProps {
  onOpenMap: () => void;
  onStartLiveTrip: () => void;
  onModifyPreferences: () => void;
}

export const ItineraryScreen: React.FC<ItineraryScreenProps> = ({
  onOpenMap,
  onStartLiveTrip,
  onModifyPreferences,
}) => {
  const { currentTrip, replaceStop, removeStop } = useTripStore();
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);

  // Modals state
  const [replacingStop, setReplacingStop] = useState<{ stop: TripStop; dayNumber: number } | null>(null);
  const [inspectingDestination, setInspectingDestination] = useState<Destination | null>(null);
  const [bookingExperience, setBookingExperience] = useState<Experience | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [savedOffline, setSavedOffline] = useState(false);

  if (!currentTrip) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No journey planned yet</Text>
        <Text style={styles.emptySubtitle}>Your next journey is waiting.</Text>
        <TouchableOpacity style={styles.planBtn} onPress={onModifyPreferences}>
          <Text style={styles.planBtnText}>PLAN A TRIP</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activeDay = currentTrip.days.find((d) => d.dayNumber === selectedDayNumber) || currentTrip.days[0];

  const handleOpenReplace = (stop: TripStop, dayNum: number) => {
    setReplacingStop({ stop, dayNumber: dayNum });
  };

  const handleConfirmReplace = (newDest: Destination, newExp?: Experience) => {
    if (replacingStop) {
      replaceStop(replacingStop.dayNumber, replacingStop.stop.id, newDest, newExp);
      setReplacingStop(null);
    }
  };

  const handleOpenDetails = (stop: TripStop) => {
    setInspectingDestination(stop.destination);
  };

  const handleBookExpFromStop = (stop: TripStop) => {
    if (stop.experience) {
      setBookingExperience(stop.experience);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Editorial Trip Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View style={styles.summaryTitleCol}>
              <Text style={styles.summaryTag}>ADAPTIVE ITINERARY</Text>
              <Text style={styles.summaryTitle}>{currentTrip.title}</Text>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={onModifyPreferences} activeOpacity={0.8}>
              <Text style={styles.editBtnText}>Edit DNA</Text>
            </TouchableOpacity>
          </View>

          {/* Key Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{currentTrip.daysCount} Days</Text>
              <Text style={styles.metricLbl}>DURATION</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>₹{currentTrip.estimatedSpend.toLocaleString()}</Text>
              <Text style={styles.metricLbl}>EST. SPEND</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: colors.forestGreen }]}>
                {currentTrip.hiddenDiscoveriesCount}
              </Text>
              <Text style={styles.metricLbl}>HIDDEN GEMS</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: colors.accentGold }]}>
                {currentTrip.localExperiencesCount}
              </Text>
              <Text style={styles.metricLbl}>LOCAL CRAFTS</Text>
            </View>
          </View>

          {/* Quick Action Navigation */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton} onPress={onOpenMap} activeOpacity={0.8}>
              <Text style={styles.actionButtonText}>🗺️ View Route & Facilities</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, savedOffline && styles.actionButtonActive]}
              onPress={() => setSavedOffline(!savedOffline)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>
                {savedOffline ? '✓ Saved Offline' : '📥 Save Offline'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Day Selector Pills */}
        <View style={styles.dayTabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayTabsContent}>
            {currentTrip.days.map((day) => {
              const isSelected = day.dayNumber === selectedDayNumber;
              return (
                <TouchableOpacity
                  key={day.dayNumber}
                  style={[styles.dayTabPill, isSelected && styles.dayTabPillActive]}
                  onPress={() => setSelectedDayNumber(day.dayNumber)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.dayTabTitle, isSelected && styles.dayTabTitleActive]}>
                    DAY 0{day.dayNumber}
                  </Text>
                  <Text style={[styles.dayTabDate, isSelected && styles.dayTabDateActive]}>
                    {day.date.slice(5)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Editorial Day Header (Section 35) */}
        <View style={styles.dayHeader}>
          <View style={styles.dayHeaderLeft}>
            <Text style={styles.dayHeaderNumber}>DAY 0{activeDay.dayNumber}</Text>
            <Text style={styles.dayHeaderTitle}>{activeDay.title}</Text>
            <Text style={styles.dayHeaderMeta}>
              {activeDay.stops.length} destinations • Est. Spend: ₹{activeDay.totalEstimatedCost} • {activeDay.totalTravelMinutes} min drive
            </Text>
          </View>
          <View style={styles.threadBadgeWrap}>
            <TrailThread
              stopsCount={activeDay.stops.length}
              currentStopIndex={0}
              stopPressures={activeDay.stops.map((s) => s.crowdStatus)}
              height={56}
            />
          </View>
        </View>

        {/* Signature Vertical Path Timeline Stops */}
        <View style={styles.timelineList}>
          {activeDay.stops.map((stop, idx) => (
            <StopCard
              key={stop.id}
              stop={stop}
              dayNumber={activeDay.dayNumber}
              isLast={idx === activeDay.stops.length - 1}
              onOpenDetails={handleOpenDetails}
              onReplace={handleOpenReplace}
              onRemove={(stopId, dayNum) => removeStop(dayNum, stopId)}
              onBookExperience={handleBookExpFromStop}
            />
          ))}
        </View>
      </ScrollView>

      {/* Floating Bottom Bar: START LIVE TRIP (Section 16 & 39) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.startLiveBtn} onPress={onStartLiveTrip} activeOpacity={0.9}>
          <View style={styles.livePulseDot} />
          <Text style={styles.startLiveBtnText}>START LIVE TRIP</Text>
        </TouchableOpacity>
      </View>

      {/* Modals & Bottom Sheets */}
      <ReplaceModal
        visible={replacingStop !== null}
        stop={replacingStop?.stop || null}
        dayNumber={replacingStop?.dayNumber || 1}
        onClose={() => setReplacingStop(null)}
        onSelectReplacement={handleConfirmReplace}
      />

      <PlaceDetailsModal
        visible={inspectingDestination !== null}
        destination={inspectingDestination}
        onClose={() => setInspectingDestination(null)}
        onBookExperience={(exp) => {
          setInspectingDestination(null);
          setBookingExperience(exp);
        }}
      />

      <BookingModal
        visible={bookingExperience !== null}
        experience={bookingExperience}
        onClose={() => setBookingExperience(null)}
        onBookingSuccess={(booking) => {
          setBookingExperience(null);
          setConfirmedBooking(booking);
        }}
      />

      <DigitalTicketModal
        visible={confirmedBooking !== null}
        booking={confirmedBooking}
        onClose={() => setConfirmedBooking(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Warm Ivory #FBF8F1
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.xl,
  },
  planBtn: {
    height: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.button,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: 0.5,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card, // 18px
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  summaryTitleCol: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  summaryTag: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accentGold,
    letterSpacing: 1,
    marginBottom: 2,
  },
  summaryTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  editBtn: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metricLbl: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    height: 38,
    borderRadius: radii.button,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: colors.sandLight,
    borderColor: '#DEC39F',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dayTabsWrapper: {
    marginBottom: spacing.lg,
  },
  dayTabsContent: {
    gap: spacing.sm,
  },
  dayTabPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  dayTabPillActive: {
    backgroundColor: colors.primary, // Deep Indigo
    borderColor: colors.primary,
  },
  dayTabTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  dayTabTitleActive: {
    color: colors.surface,
  },
  dayTabDate: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 1,
  },
  dayTabDateActive: {
    color: colors.sandLight,
  },
  dayHeader: {
    marginBottom: spacing.md,
    paddingLeft: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayHeaderLeft: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  threadBadgeWrap: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayHeaderNumber: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accentGold,
    letterSpacing: 1,
  },
  dayHeaderTitle: {
    fontSize: typography.sizes.xl, // 20-22px
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginTop: 2,
  },
  dayHeaderMeta: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 4,
  },
  timelineList: {
    marginTop: spacing.xs,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.elevated,
  },
  startLiveBtn: {
    height: 50,
    borderRadius: radii.button, // 12px
    backgroundColor: colors.primary, // Deep Indigo #18243F
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.forestGreen,
  },
  startLiveBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: 1,
  },
});
