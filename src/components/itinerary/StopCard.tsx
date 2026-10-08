import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { TripStop } from '../../types/database';
import { colors, typography, spacing, radii, shadows } from '../../config/theme';
import {
  DataFreshnessBadge,
  FacilityCoverageBadge,
  PopularityBadge,
  PressureBadge,
} from '../common/Badge';
import { DataBadge } from '../ui/DataBadge';

interface StopCardProps {
  stop: TripStop;
  dayNumber: number;
  isLast?: boolean;
  onOpenDetails: (stop: TripStop) => void;
  onReplace: (stop: TripStop, dayNumber: number) => void;
  onRemove: (stopId: string, dayNumber: number) => void;
  onBookExperience?: (stop: TripStop) => void;
}

export const StopCard: React.FC<StopCardProps> = ({
  stop,
  dayNumber,
  isLast = false,
  onOpenDetails,
  onReplace,
  onRemove,
  onBookExperience,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const dest = stop.destination;

  // Determine timeline node color based on status
  const isDisrupted = stop.crowdStatus === 'HIGH';
  const isCompleted = false; // Could be tracked via active state
  const isCurrent = stop.startTime <= '12:00' && stop.endTime >= '10:00';

  const nodeColor = isDisrupted
    ? colors.coral
    : isCompleted
    ? colors.forestGreen
    : isCurrent
    ? colors.primary
    : colors.textTertiary;

  return (
    <View style={styles.timelineRow}>
      {/* LEFT COLUMN: Vertical Path Timeline (Section 33 & 34) */}
      <View style={styles.timelineCol}>
        <Text style={styles.timelineTimeText}>{stop.startTime}</Text>

        <View
          style={[
            styles.timelineNode,
            { borderColor: nodeColor, backgroundColor: isCurrent ? colors.primary : colors.surface },
          ]}
        >
          {isCurrent && <View style={styles.innerNodeDot} />}
        </View>

        {!isLast && <View style={styles.timelineLine} />}
      </View>

      {/* RIGHT COLUMN: Editorial Destination Card (Section 18 & 19) */}
      <View style={styles.cardCol}>
        {/* Transition badge if driving from previous stop */}
        {stop.travelMinutesFromPrev && stop.travelMinutesFromPrev > 0 ? (
          <View style={styles.transitionPill}>
            <Text style={styles.transitionText}>
              ↓ {stop.distanceFromPrevKm} km • {stop.travelMinutesFromPrev} min scenic drive
            </Text>
          </View>
        ) : null}

        <View style={styles.card}>
          {/* Top category label & status badges */}
          <View style={styles.topMetaRow}>
            <Text style={styles.categoryLabel}>{dest.category}</Text>
            <View style={styles.badgesWrapper}>
              <PressureBadge level={stop.crowdStatus} />
              <DataBadge type="DEMO" />
              <PopularityBadge type={dest.popularityType} />
            </View>
          </View>

          {/* Destination image & core details */}
          <View style={styles.mainContentRow}>
            <Image source={{ uri: dest.image }} style={styles.thumbnail} />

            <View style={styles.textContainer}>
              <Text style={styles.destinationName}>{dest.name}</Text>
              <Text style={styles.locationSubtitle}>
                {dest.district} • {stop.durationMinutes} min visit
              </Text>

              {/* Match alignment pill */}
              <View style={styles.matchBadge}>
                <Text style={styles.matchText}>{stop.scoreMatch}% itinerary match</Text>
              </View>
            </View>
          </View>

          {/* Local Artisan Experience Callout (Section 43 & 44) */}
          {stop.experience && (
            <TouchableOpacity
              style={styles.experienceCard}
              activeOpacity={0.88}
              onPress={() => onBookExperience && onBookExperience(stop)}
            >
              <View style={styles.expHeader}>
                <Text style={styles.expTag}>MEET THE LOCALS</Text>
                <Text style={styles.expPrice}>₹{stop.experience.price} / person</Text>
              </View>
              <Text style={styles.expName}>{stop.experience.name}</Text>
              <Text style={styles.expHost}>Hosted by {stop.experience.providerName} • ✓ Verified</Text>
              <View style={styles.expCtaRow}>
                <Text style={styles.expCtaText}>
                  Reserve Slot ({stop.experience.availableSlots} available) →
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Explainability Accordion: "Why THADAM chose this place" (Section 63) */}
          <TouchableOpacity
            style={styles.explainToggle}
            onPress={() => setShowExplanation(!showExplanation)}
            activeOpacity={0.7}
          >
            <Text style={styles.explainToggleText}>
              {showExplanation ? '▲ Hide selection reasons' : '▼ Why this fits your journey'}
            </Text>
          </TouchableOpacity>

          {showExplanation && (
            <View style={styles.explainBox}>
              {stop.aiReasons.map((reason, idx) => (
                <View key={idx} style={styles.reasonRow}>
                  <Text style={styles.reasonBullet}>•</Text>
                  <Text style={styles.reasonText}>{reason}</Text>
                </View>
              ))}
              <Text style={styles.sourceLabel}>Verified registry source: {dest.source}</Text>
            </View>
          )}

          {/* Card Action Row */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.detailsBtn}
              onPress={() => onOpenDetails(stop)}
              activeOpacity={0.8}
            >
              <Text style={styles.detailsBtnText}>Explore Place</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.replaceBtn}
              onPress={() => onReplace(stop, dayNumber)}
              activeOpacity={0.8}
            >
              <Text style={styles.replaceBtnText}>🔄 Replace</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => onRemove(stop.id, dayNumber)}
              activeOpacity={0.8}
            >
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timelineRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  timelineCol: {
    width: 52,
    alignItems: 'center',
    paddingTop: 14,
  },
  timelineTimeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
  },
  timelineNode: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  innerNodeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginTop: 4,
  },
  cardCol: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  transitionPill: {
    backgroundColor: colors.sandLight,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  transitionText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondary,
  },
  card: {
    backgroundColor: colors.surface, // Soft White
    borderRadius: radii.card, // 18px
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  topMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1, // 1px letter spacing for uppercase tags
  },
  badgesWrapper: {
    flexDirection: 'row',
    gap: 6,
  },
  mainContentRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  thumbnail: {
    width: 84,
    height: 84,
    borderRadius: radii.smCard, // 14px
    backgroundColor: colors.surfaceSubtle,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  destinationName: {
    fontSize: typography.sizes.md, // 16-18px
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  locationSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 3,
  },
  matchBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  matchText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondary,
  },
  experienceCard: {
    marginTop: spacing.md,
    backgroundColor: colors.sandLight,
    borderRadius: radii.smCard,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: '#DFCBB1',
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  expTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentGold,
    letterSpacing: 1,
  },
  expPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  expName: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  expHost: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  expCtaRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#DEC39F',
  },
  expCtaText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  explainToggle: {
    marginTop: spacing.sm,
    paddingVertical: 4,
  },
  explainToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
  },
  explainBox: {
    marginTop: 4,
    padding: spacing.sm,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.sm,
  },
  reasonRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  reasonBullet: {
    fontSize: 12,
    color: colors.forestGreen,
    fontWeight: '700',
    marginRight: 6,
  },
  reasonText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  sourceLabel: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    alignItems: 'center',
  },
  detailsBtn: {
    flex: 1,
    height: 38,
    borderRadius: radii.button, // 12px
    backgroundColor: colors.primary, // Deep Indigo #18243F
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.surface,
  },
  replaceBtn: {
    paddingHorizontal: 12,
    height: 38,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replaceBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  removeBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.coral,
  },
});
