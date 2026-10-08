import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, radii } from '../../config/theme';
import { useTripStore } from '../../store/useTripStore';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenDemoControls?: () => void;
  onOpenLiveTrip?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDemoControls,
  onOpenLiveTrip,
}) => {
  const { activeTripSession } = useTripStore();

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        {/* Brand identity: Deep Indigo + Subtle Gold Path Dot */}
        <View style={styles.brandContainer}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkChar}>த</Text>
          </View>
          <View>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandName}>THADAM</Text>
              <Text style={styles.brandSuffix}>TN</Text>
              <View style={styles.pathAccentDot} />
            </View>
            <Text style={styles.tagline}>Beyond the Famous. Empower the Local.</Text>
          </View>
        </View>

        {/* Right Actions */}
        <View style={styles.actionRow}>
          {activeTripSession && onOpenLiveTrip && (
            <TouchableOpacity style={styles.liveTripPill} onPress={onOpenLiveTrip}>
              <View style={styles.livePulseDot} />
              <Text style={styles.liveTripPillText}>LIVE</Text>
            </TouchableOpacity>
          )}

          {onOpenDemoControls && (
            <TouchableOpacity
              style={styles.demoControlBtn}
              onPress={onOpenDemoControls}
              activeOpacity={0.85}
            >
              <Text style={styles.demoControlBtnText}>DEMO</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkChar: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.warmSand,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  brandSuffix: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.gold,
  },
  pathAccentDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gold,
    marginLeft: 2,
  },
  tagline: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  liveTripPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.forestGreenLight,
    borderWidth: 1,
    borderColor: colors.forestGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
    gap: 4,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.forestGreen,
  },
  liveTripPillText: {
    color: colors.forestGreen,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  demoControlBtn: {
    backgroundColor: colors.goldLight,
    borderWidth: 1,
    borderColor: colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  demoControlBtnText: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
