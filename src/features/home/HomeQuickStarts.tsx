import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../config/theme';
import { useSavedTripsStore } from '../../store/useSavedTripsStore';
import { useProfileStore } from '../../store/useProfileStore';
import { useTripStore } from '../../store/useTripStore';

interface HomeQuickStartsProps {
  onSelectPreset: (presetKey: string) => void;
  onContinue: () => void;
  onOpenProfile: () => void;
}

export const HomeQuickStarts: React.FC<HomeQuickStartsProps> = ({
  onSelectPreset,
  onContinue,
  onOpenProfile,
}) => {
  const { getMostRecentTrip } = useSavedTripsStore();
  const { completeness, promptDismissedThisSession, dismissPrompt } = useProfileStore();
  const recentTrip = getMostRecentTrip();

  const presets = [
    { key: 'weekend', label: 'Weekend Getaway', sub: '2 Days • Relaxed' },
    { key: 'heritage', label: 'Heritage Trail', sub: '3 Days • Historical' },
    { key: 'hidden', label: 'Hidden Gems', sub: '3 Days • 60% Gems' },
    { key: 'family', label: 'Family Trip', sub: '3 Days • Safety First' },
  ];

  return (
    <View style={styles.container}>
      {/* Continue Card (If recent draft or saved trip exists) */}
      {recentTrip && (
        <View style={styles.continueCard}>
          <View style={styles.continueLeft}>
            <Text style={styles.continueTag}>Recent trip in progress</Text>
            <Text style={styles.continueTitle}>{recentTrip.title}</Text>
            <Text style={styles.continueMeta}>{recentTrip.progressLabel} • Tap to resume</Text>
          </View>
          <TouchableOpacity style={styles.resumeBtn} onPress={onContinue} activeOpacity={0.85}>
            <Text style={styles.resumeBtnText}>Resume ➔</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Start Presets (docs/INPUTS.md) */}
      <View style={styles.presetsSection}>
        <Text style={styles.sectionHeader}>Start with an idea</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsScroll}>
          {presets.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={styles.presetChip}
              onPress={() => onSelectPreset(p.key)}
              activeOpacity={0.8}
            >
              <Text style={styles.presetLabel}>{p.label}</Text>
              <Text style={styles.presetSub}>{p.sub}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Profile Prompt (if completeness < 100% and not dismissed) */}
      {completeness < 100 && !promptDismissedThisSession && (
        <View style={styles.promptCard}>
          <View style={styles.promptTextCol}>
            <Text style={styles.promptTitle}>Your profile is {completeness}% complete</Text>
            <Text style={styles.promptSub}>Add your interests to personalize Thadam recommendations.</Text>
          </View>
          <View style={styles.promptActions}>
            <TouchableOpacity style={styles.promptBtn} onPress={onOpenProfile}>
              <Text style={styles.promptBtnText}>Complete Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={dismissPrompt} style={styles.dismissBtn}>
              <Text style={styles.dismissText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: spacing.sm, paddingHorizontal: spacing.screenPadding },
  continueCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  continueLeft: { flex: 1, paddingRight: spacing.sm },
  continueTag: { fontSize: 10, fontWeight: '800', color: colors.goldText, letterSpacing: 1 },
  continueTitle: { fontSize: 14, fontWeight: '800', color: colors.ink, marginTop: 2 },
  continueMeta: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  resumeBtn: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: colors.primary, borderRadius: radii.pill },
  resumeBtnText: { color: colors.onPrimary, fontSize: 11, fontWeight: '700' },
  presetsSection: { marginBottom: spacing.md },
  sectionHeader: { fontSize: 11, fontWeight: '800', color: colors.goldText, letterSpacing: 1, marginBottom: 8 },
  presetsScroll: { gap: 8 },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetLabel: { fontSize: 13, fontWeight: '700', color: colors.ink },
  presetSub: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  promptCard: {
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  promptTextCol: { flex: 1, paddingRight: spacing.sm },
  promptTitle: { fontSize: 13, fontWeight: '700', color: colors.ink },
  promptSub: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  promptActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  promptBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: colors.primary, borderRadius: radii.sm },
  promptBtnText: { color: colors.onPrimary, fontSize: 11, fontWeight: '700' },
  dismissBtn: { padding: 4 },
  dismissText: { fontSize: 12, color: colors.textSecondary },
});
