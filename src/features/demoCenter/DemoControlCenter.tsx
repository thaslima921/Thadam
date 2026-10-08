import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../config/theme';
import { useDemoStore } from '../../store/useDemoStore';
import { DESTINATIONS } from '../../data/destinations';
import { realtimeService } from '../../services/realtimeService';

interface DemoControlCenterProps {
  visible: boolean;
  onClose: () => void;
}

export const DemoControlCenter: React.FC<DemoControlCenterProps> = ({ visible, onClose }) => {
  const {
    closeDestination,
    openDestination,
    adjustExperienceSlots,
    resetDemoOverrides,
    experienceSlotsMap,
  } = useDemoStore();

  const handleTriggerClosure = () => {
    closeDestination('p1', 'Emergency conservation maintenance by State Archeology');
    onClose();
  };

  const handleReopen = () => {
    openDestination('p1');
    onClose();
  };

  const handleCapacityDrop = () => {
    const cur = experienceSlotsMap['e3'] ?? 5;
    adjustExperienceSlots('e3', Math.max(0, cur - 1));
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>⚡ Demo Control Center</Text>
              <Text style={styles.sub}>Simulate Realtime Events & Hackathon Scenarios</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea}>
            {/* Scenario 1: Destination Closure & Adaptive Rerouting */}
            <View style={styles.actionCard}>
              <Text style={styles.actionTag}>SCENARIO 1 • ADAPTIVE REROUTING</Text>
              <Text style={styles.actionTitle}>Close Brihadisvara Temple</Text>
              <Text style={styles.actionDesc}>
                Simulates state government closing the Big Temple. Triggers instant advisory on tourist devices with 3 AI alternatives.
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.dangerBtn} onPress={handleTriggerClosure} activeOpacity={0.85}>
                  <Text style={styles.dangerBtnText}>Trigger Closure Now ⚠️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.neutralBtn} onPress={handleReopen} activeOpacity={0.85}>
                  <Text style={styles.neutralBtnText}>Re-open Temple</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Scenario 2: Realtime Capacity Loop */}
            <View style={styles.actionCard}>
              <Text style={styles.actionTag}>SCENARIO 2 • ARTISAN CAPACITY</Text>
              <Text style={styles.actionTitle}>Deduct Swamimalai Bronze Slot</Text>
              <Text style={styles.actionDesc}>
                Current seats: {experienceSlotsMap['e3'] ?? 5}. Deducts 1 seat and broadcasts CAPACITY_CHANGED to all active screens.
              </Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleCapacityDrop} activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>
                  Simulate Booking: Deduct 1 Seat ({experienceSlotsMap['e3'] ?? 5} ➔ {(experienceSlotsMap['e3'] ?? 5) - 1})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Scenario 3: Verify New Place (Preference Notification) */}
            <View style={styles.actionCard}>
              <Text style={styles.actionTag}>SCENARIO 3 • PREFERENCE NOTIFICATION</Text>
              <Text style={styles.actionTitle}>Verify New Place: Kallanai (Grand Anicut)</Text>
              <Text style={styles.actionDesc}>
                Simulates registry verification of Kallanai (p11). Triggers match evaluation and sends preference notification to user.
              </Text>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.gold }]}
                onPress={() => {
                  const p11 = DESTINATIONS.find((d) => d.id === 'p11');
                  if (p11) {
                    p11.verificationStatus = 'verified';
                  }
                  realtimeService.publish({
                    type: 'NEW_PLACE_VERIFIED',
                    destinationId: 'p11',
                    destinationName: 'Kallanai (Grand Anicut)',
                    timestamp: new Date().toISOString(),
                  });
                  onClose();
                }}
                activeOpacity={0.85}
              >
                <Text style={[styles.primaryBtnText, { color: colors.ink }]}>
                  Verify New Place (Kallanai) ➔
                </Text>
              </TouchableOpacity>
            </View>

            {/* Reset All */}
            <TouchableOpacity style={styles.resetBtn} onPress={resetDemoOverrides} activeOpacity={0.8}>
              <Text style={styles.resetBtnText}>↺ Reset All Demo Overrides to Clean State</Text>
            </TouchableOpacity>

            <View style={styles.honestNote}>
              <Text style={styles.honestText}>
                * DATA HONESTY: Operating in DEMO mode. Realtime channels propagate state across all connected subscribers.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(24, 36, 63, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    ...shadows.elevated,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  scrollArea: {
    marginTop: spacing.md,
  },
  actionCard: {
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.md,
    borderRadius: radii.card,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  actionTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentGold,
    letterSpacing: 1,
  },
  actionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  actionDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dangerBtn: {
    flex: 2,
    backgroundColor: colors.coral, // Muted coral per Section 16
    paddingVertical: 10,
    borderRadius: radii.button,
    alignItems: 'center',
  },
  dangerBtnText: {
    color: colors.surface,
    fontSize: typography.sizes.xs,
    fontWeight: '700',
  },
  neutralBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 10,
    borderRadius: radii.button,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  neutralBtnText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: colors.primary, // Deep Indigo
    paddingVertical: 10,
    borderRadius: radii.button,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.surface,
    fontSize: typography.sizes.xs,
    fontWeight: '700',
  },
  resetBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  resetBtnText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  honestNote: {
    backgroundColor: colors.sandLight,
    padding: spacing.sm,
    borderRadius: radii.sm,
    marginTop: spacing.sm,
  },
  honestText: {
    fontSize: 11,
    color: colors.secondary,
    lineHeight: 15,
  },
});
