import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { DESTINATIONS } from '../../data/destinations';
import { colors, typography, spacing, radii, shadows } from '../../config/theme';
import { useDemoStore } from '../../store/useDemoStore';

export const AdminPortal: React.FC = () => {
  const {
    destinationStatusMap,
    destinationPressureMap,
    closeDestination,
    openDestination,
    publishAdminAlert,
  } = useDemoStore();

  const [alertTitle, setAlertTitle] = useState('Heavy Rain Alert: Lower Cauvery Basin');
  const [alertMessage, setAlertMessage] = useState('Tourists advised to prioritize indoor craft guild visits.');
  const [alertSuccess, setAlertSuccess] = useState(false);

  const handleBroadcastAlert = () => {
    publishAdminAlert(alertTitle, alertMessage, 'HIGH');
    setAlertSuccess(true);
    setTimeout(() => setAlertSuccess(false), 4000);
  };

  return (
    <View style={styles.container}>
      {/* Editorial Header */}
      <View style={styles.header}>
        <Text style={styles.preTitle}>TOURISM DISCOVERY GRID</Text>
        <Text style={styles.headerTitle}>State Command & Flow Management</Text>
        <Text style={styles.headerSub}>
          Pilot Corridor: Thanjavur – Kumbakonam Regional Grid
        </Text>
      </View>

      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Destination Closure & Adaptive Rerouting Simulator */}
        <View style={styles.card}>
          <Text style={styles.cardTag}>REALTIME ADAPTATION ENGINE</Text>
          <Text style={styles.cardTitle}>Destination Status & Reroute Simulation</Text>
          <Text style={styles.cardDesc}>
            Simulate a temporary closure to verify that tourist devices immediately trigger adaptive rerouting without breaking feasibility.
          </Text>

          {DESTINATIONS.slice(0, 4).map((dest) => {
            const currentStatus = destinationStatusMap[dest.id] || dest.status;
            const currentPressure = destinationPressureMap[dest.id] || dest.pressureLevel;
            const isClosed = currentStatus === 'CLOSED';

            return (
              <View key={dest.id} style={styles.destRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.destName}>{dest.name}</Text>
                  <Text style={styles.destMeta}>
                    {dest.popularityType.toUpperCase()} • Live Pressure: {currentPressure}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.statusBtn, isClosed ? styles.statusBtnOpen : styles.statusBtnClose]}
                  onPress={() => {
                    if (isClosed) {
                      openDestination(dest.id);
                    } else {
                      closeDestination(dest.id, 'Temporary conservation maintenance by State Archeology');
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.statusBtnText, isClosed ? styles.statusTextOpen : styles.statusTextClose]}>
                    {isClosed ? 'Reopen Stop' : 'Simulate Closure'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Tourism Demand Balancing Analytics */}
        <View style={styles.card}>
          <Text style={styles.cardTag}>DEMAND REDIRECTION IMPACT</Text>
          <Text style={styles.cardTitle}>Corridor Congestion & Diversion Index</Text>
          <Text style={styles.cardDesc}>
            Measuring how THADAM TN diverts tourist congestion from over-crowded hubs toward authentic rural crafts.
          </Text>

          <View style={styles.statGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>38.4%</Text>
              <Text style={styles.statLabel}>Flow to Hidden Gems</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>-42%</Text>
              <Text style={styles.statLabel}>Peak Bottlenecks</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>₹4.8L</Text>
              <Text style={styles.statLabel}>Guild Revenue Payout</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>94.8%</Text>
              <Text style={styles.statLabel}>Reroute Acceptance</Text>
            </View>
          </View>
        </View>

        {/* Realtime Advisory Dispatcher */}
        <View style={styles.card}>
          <Text style={styles.cardTag}>SAFETY BROADCAST</Text>
          <Text style={styles.cardTitle}>Broadcast Corridor Advisory</Text>
          <Text style={styles.cardDesc}>
            Pushes instant advisory to all active travelers in the corridor.
          </Text>

          <TextInput
            style={styles.textInput}
            value={alertTitle}
            onChangeText={setAlertTitle}
            placeholder="Advisory Title"
            placeholderTextColor={colors.textTertiary}
          />
          <TextInput
            style={[styles.textInput, { height: 60, marginTop: spacing.sm }]}
            value={alertMessage}
            onChangeText={setAlertMessage}
            placeholder="Advisory Message"
            placeholderTextColor={colors.textTertiary}
            multiline
          />

          <TouchableOpacity style={styles.broadcastBtn} onPress={handleBroadcastAlert} activeOpacity={0.9}>
            <Text style={styles.broadcastBtnText}>📢 Broadcast Advisory via Realtime</Text>
          </TouchableOpacity>

          {alertSuccess && (
            <View style={styles.broadcastSuccess}>
              <Text style={styles.broadcastSuccessText}>✓ Alert published to all tourist devices.</Text>
            </View>
          )}
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
  preTitle: {
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
  headerSub: {
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
  destRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  destName: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  destMeta: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBtn: {
    paddingHorizontal: 12,
    height: 34,
    borderRadius: radii.button,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBtnClose: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusBtnOpen: {
    backgroundColor: colors.primary,
  },
  statusBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextClose: {
    color: colors.coral,
  },
  statusTextOpen: {
    color: colors.surface,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statBox: {
    width: '48%',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.smCard,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statVal: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  textInput: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    fontSize: typography.sizes.xs,
    color: colors.textPrimary,
  },
  broadcastBtn: {
    marginTop: spacing.md,
    height: 48,
    borderRadius: radii.button,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  broadcastBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: 0.5,
  },
  broadcastSuccess: {
    marginTop: spacing.sm,
    backgroundColor: '#EEF4F0',
    padding: spacing.sm,
    borderRadius: radii.sm,
  },
  broadcastSuccessText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.forestGreen,
    textAlign: 'center',
  },
});
