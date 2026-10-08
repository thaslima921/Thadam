import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../config/theme';
import { useTripStore } from '../../store/useTripStore';

interface AIGenerationScreenProps {
  onComplete: () => void;
}

const STEPS = [
  'Understanding your travel style',
  'Looking beyond the usual',
  'Matching places to your interests',
  'Checking the route',
  'Finding local experiences',
  'Balancing your journey',
  'Your journey is ready',
];

export const AIGenerationScreen: React.FC<AIGenerationScreenProps> = ({ onComplete }) => {
  const { generateTripWithAI } = useTripStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          // Call the real THADAM AI backend (falls back to local engine if offline)
          generateTripWithAI().finally(() => {
            setTimeout(() => {
              onComplete();
            }, 500);
          });
          return prev;
        }
      });
    }, 550);

    return () => clearInterval(interval);
  }, [generateTripWithAI, onComplete]);

  return (
    <View style={styles.container}>
      {/* Decorative top aura */}
      <View style={styles.ambientGlow} />

      <View style={styles.centerCard}>
        {/* Subtle Brand Emblem */}
        <View style={styles.brandIconCircle}>
          <Text style={styles.brandLetter}>த</Text>
        </View>

        <Text style={styles.headline}>Building your journey</Text>
        <Text style={styles.subheadline}>A journey drawn by intelligence</Text>

        {/* Animated Connected Path Timeline (Section 31) */}
        <View style={styles.pathCanvas}>
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isUpcoming = idx > currentStepIndex;

            return (
              <View key={idx} style={styles.pathNodeRow}>
                {/* Vertical Path Column */}
                <View style={styles.pathColumn}>
                  {/* Indicator Dot */}
                  <View
                    style={[
                      styles.pathDot,
                      isCompleted && styles.pathDotCompleted,
                      isCurrent && styles.pathDotCurrent,
                      isUpcoming && styles.pathDotUpcoming,
                    ]}
                  >
                    {isCompleted ? (
                      <Text style={styles.dotCheck}>✓</Text>
                    ) : isCurrent ? (
                      <View style={styles.dotPulseCore} />
                    ) : null}
                  </View>

                  {/* Connecting Line (unless last item) */}
                  {idx < STEPS.length - 1 && (
                    <View
                      style={[
                        styles.pathConnector,
                        isCompleted ? styles.pathConnectorCompleted : styles.pathConnectorUpcoming,
                      ]}
                    />
                  )}
                </View>

                {/* Step Copy */}
                <View style={styles.labelWrapper}>
                  <Text
                    style={[
                      styles.stepLabel,
                      isCompleted && styles.stepLabelCompleted,
                      isCurrent && styles.stepLabelCurrent,
                      isUpcoming && styles.stepLabelUpcoming,
                    ]}
                  >
                    {step}
                  </Text>
                  {isCurrent && (
                    <Text style={styles.statusLivePill}>In progress</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Editorial Subtext / Freshness note */}
        <View style={styles.footnoteRow}>
          <View style={styles.dotGold} />
          <Text style={styles.footnoteText}>
            Verified heritage registry • Route-balanced corridors
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Warm Ivory #FBF8F1
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  ambientGlow: {
    position: 'absolute',
    top: 60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.sandLight,
    opacity: 0.4,
  },
  centerCard: {
    backgroundColor: colors.surface, // Soft White
    borderRadius: radii.xl, // 24px
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    ...shadows.elevated,
  },
  brandIconCircle: {
    width: 52,
    height: 52,
    borderRadius: radii.full,
    backgroundColor: colors.primary, // Deep Indigo #18243F
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  brandLetter: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.surface,
  },
  headline: {
    fontSize: typography.sizes['2xl'], // 24-26px
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subheadline: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  pathCanvas: {
    width: '100%',
    paddingVertical: spacing.xs,
  },
  pathNodeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 44,
  },
  pathColumn: {
    alignItems: 'center',
    width: 24,
    marginRight: spacing.md,
  },
  pathDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: colors.surface,
    zIndex: 2,
  },
  pathDotCompleted: {
    borderColor: colors.forestGreen,
    backgroundColor: colors.forestGreen,
  },
  pathDotCurrent: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  pathDotUpcoming: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dotCheck: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 12,
  },
  dotPulseCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentGold,
  },
  pathConnector: {
    width: 2,
    flex: 1,
    minHeight: 24,
  },
  pathConnectorCompleted: {
    backgroundColor: colors.forestGreen,
  },
  pathConnectorUpcoming: {
    backgroundColor: colors.border,
  },
  labelWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 1,
  },
  stepLabel: {
    fontSize: typography.sizes.sm,
    letterSpacing: -0.2,
  },
  stepLabelCompleted: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  stepLabelCurrent: {
    color: colors.primary,
    fontWeight: '700',
  },
  stepLabelUpcoming: {
    color: colors.textTertiary,
    fontWeight: '400',
  },
  statusLivePill: {
    fontSize: typography.sizes.xs - 1,
    fontWeight: '700',
    color: colors.accentGold,
    backgroundColor: '#FAF5EA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  footnoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 6,
  },
  dotGold: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentGold,
  },
  footnoteText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
