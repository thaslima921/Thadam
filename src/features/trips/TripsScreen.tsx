import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../config/theme';
import { useSavedTripsStore } from '../../store/useSavedTripsStore';
import { SavedTrip, DetectedTripChange } from '../../engine/types';
import { detectTripChanges } from '../../engine/detect';
import { DESTINATIONS } from '../../data/destinations';
import { EXPERIENCES } from '../../data/experiences';

interface TripsScreenProps {
  onContinueTrip: (trip: SavedTrip) => void;
  onPlanNew: () => void;
}

export const TripsScreen: React.FC<TripsScreenProps> = ({ onContinueTrip, onPlanNew }) => {
  const { savedTrips, activeDraft, deleteTrip, undoDelete, deletedBackup, renameTrip, duplicateTrip } = useSavedTripsStore();
  const [filter, setFilter] = useState<'drafts' | 'saved' | 'upcoming' | 'past'>('drafts');
  const [renamingTripId, setRenamingTripId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [activeMenuTripId, setActiveMenuTripId] = useState<string | null>(null);
  const [activeChangesBanner, setActiveChangesBanner] = useState<{ trip: SavedTrip; changes: DetectedTripChange[] } | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const allTrips = activeDraft ? [activeDraft, ...savedTrips] : savedTrips;

  const filtered = allTrips.filter((t) => {
    if (filter === 'drafts') return t.status === 'draft';
    if (filter === 'saved') return t.status === 'saved';
    if (filter === 'upcoming') return t.status === 'saved' && (!t.trip || t.trip.startDate >= todayStr);
    if (filter === 'past') return t.trip ? t.trip.startDate < todayStr : false;
    return true;
  });

  const handleOpenTrip = (trip: SavedTrip) => {
    const changes = detectTripChanges(trip, { destinations: DESTINATIONS, experiences: EXPERIENCES });
    if (changes.length > 0) setActiveChangesBanner({ trip, changes });
    else onContinueTrip(trip);
  };

  const handleConfirmDelete = (tripId: string) => {
    Alert.alert('Delete Trip', 'Are you sure you want to delete this trip?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteTrip(tripId); setActiveMenuTripId(null); } },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Tamil Nadu Trips</Text>
          <Text style={styles.headerSub}>Manage your drafts, saved itineraries, and adaptive journeys.</Text>
        </View>

        {/* Four Filters: Drafts, Saved, Upcoming, Past */}
        <View style={styles.filterRow}>
          {(['drafts', 'saved', 'upcoming', 'past'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterPill, filter === f && styles.filterPillActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeChangesBanner && (
          <View style={styles.changesBanner}>
            <Text style={styles.changesBannerTitle}>
              ⚠️ {activeChangesBanner.changes.length} thing(s) changed since your last visit
            </Text>
            {activeChangesBanner.changes.map((c, idx) => (
              <Text key={idx} style={styles.changesDesc}>• {c.description}</Text>
            ))}
            <TouchableOpacity
              style={styles.reviewBtn}
              onPress={() => {
                const t = activeChangesBanner.trip;
                setActiveChangesBanner(null);
                onContinueTrip(t);
              }}
            >
              <Text style={styles.reviewBtnText}>Continue to Trip →</Text>
            </TouchableOpacity>
          </View>
        )}

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No journeys in this category</Text>
            <Text style={styles.emptySub}>Start planning a customized itinerary using our smart engine.</Text>
            <TouchableOpacity style={styles.planBtn} onPress={onPlanNew}>
              <Text style={styles.planBtnText}>Plan new trip</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((trip) => (
            <View key={trip.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.badgeWrap}>
                  <Text style={[styles.statusBadge, trip.status === 'draft' ? styles.draftBadge : styles.savedBadge]}>
                    {trip.status.toUpperCase()}
                  </Text>
                  <Text style={styles.progressText}>{trip.progressLabel}</Text>
                </View>
                {/* 3-dot kebab menu */}
                <TouchableOpacity
                  style={styles.kebabBtn}
                  onPress={() => setActiveMenuTripId(activeMenuTripId === trip.id ? null : trip.id)}
                >
                  <Text style={styles.kebabText}>⋮</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.tripTitle}>{trip.title}</Text>
              <Text style={styles.tripMeta}>
                {trip.request.daysCount} days • ₹{trip.request.budget.toLocaleString()} • {trip.request.destination}
              </Text>

              {/* Continue is the ONLY visible action button */}
              <TouchableOpacity style={styles.continueBtn} onPress={() => handleOpenTrip(trip)}>
                <Text style={styles.continueBtnText}>Continue ➔</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Undo Snackbar */}
      {deletedBackup && (
        <View style={styles.snackbar}>
          <Text style={styles.snackbarText}>Trip deleted</Text>
          <TouchableOpacity onPress={undoDelete}>
            <Text style={styles.undoText}>UNDO (8s)</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Options Menu Modal */}
      <Modal visible={activeMenuTripId !== null} transparent animationType="fade">
        <TouchableOpacity style={styles.menuOverlay} onPress={() => setActiveMenuTripId(null)} activeOpacity={1}>
          <View style={styles.menuBox}>
            <Text style={styles.menuHeader}>Trip options</Text>
            <TouchableOpacity style={styles.menuItem} onPress={() => {
              const target = allTrips.find((t) => t.id === activeMenuTripId);
              if (target) { setRenamingTripId(target.id); setNewTitle(target.title); }
              setActiveMenuTripId(null);
            }}>
              <Text style={styles.menuItemText}>Rename trip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => {
              if (activeMenuTripId) duplicateTrip(activeMenuTripId);
              setActiveMenuTripId(null);
            }}>
              <Text style={styles.menuItemText}>Duplicate trip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => {
              if (activeMenuTripId) handleConfirmDelete(activeMenuTripId);
            }}>
              <Text style={[styles.menuItemText, { color: colors.danger }]}>Delete trip</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Rename Modal */}
      <Modal visible={renamingTripId !== null} transparent animationType="fade">
        <View style={styles.menuOverlay}>
          <View style={styles.renameBox}>
            <Text style={styles.menuHeader}>Rename trip</Text>
            <TextInput style={styles.modalInput} value={newTitle} onChangeText={setNewTitle} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setRenamingTripId(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={() => {
                if (renamingTripId && newTitle) {
                  renameTrip(renamingTripId, newTitle);
                  setRenamingTripId(null);
                }
              }}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.screenPadding, paddingBottom: 100 },
  header: { marginBottom: spacing.md },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.ink },
  headerSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: 6, marginBottom: spacing.md },
  filterPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.pill, backgroundColor: colors.surfaceSubtle, borderWidth: 1, borderColor: colors.border },
  filterPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 12, fontWeight: '700', color: colors.ink },
  filterTextActive: { color: colors.onPrimary },
  changesBanner: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.warning, padding: spacing.md, borderRadius: radii.md, marginBottom: spacing.md },
  changesBannerTitle: { fontSize: 13, fontWeight: '800', color: colors.warning, marginBottom: 4 },
  changesDesc: { fontSize: 12, color: colors.ink, marginBottom: 2 },
  reviewBtn: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.primary, borderRadius: radii.sm, alignSelf: 'flex-start', marginTop: 8 },
  reviewBtnText: { fontSize: 11, fontWeight: '700', color: colors.onPrimary },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, ...shadows.card },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  badgeWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusBadge: { fontSize: 9, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.pill },
  draftBadge: { backgroundColor: colors.sandLight, color: colors.goldText },
  savedBadge: { backgroundColor: 'rgba(23, 112, 47, 0.12)', color: colors.forestGreen },
  progressText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  kebabBtn: { padding: 4, width: 28, height: 28, justifyContent: 'center', alignItems: 'center' },
  kebabText: { fontSize: 18, color: colors.ink, fontWeight: '700' },
  tripTitle: { fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: 2 },
  tripMeta: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.md },
  continueBtn: { paddingVertical: 10, backgroundColor: colors.primary, borderRadius: radii.sm, alignItems: 'center' },
  continueBtnText: { fontSize: 12, fontWeight: '700', color: colors.onPrimary },
  snackbar: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: colors.ink, padding: spacing.md, borderRadius: radii.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  snackbarText: { color: colors.onPrimary, fontSize: 13, fontWeight: '600' },
  undoText: { color: colors.gold, fontSize: 13, fontWeight: '800' },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  emptySub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: spacing.lg },
  planBtn: { paddingHorizontal: spacing.lg, paddingVertical: 10, backgroundColor: colors.primary, borderRadius: radii.button },
  planBtnText: { color: colors.onPrimary, fontSize: 12, fontWeight: '700' },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  menuBox: { width: 240, backgroundColor: colors.surface, borderRadius: radii.card, padding: spacing.md, ...shadows.elevated },
  renameBox: { width: '85%', backgroundColor: colors.surface, borderRadius: radii.card, padding: spacing.lg, ...shadows.elevated },
  menuHeader: { fontSize: 13, fontWeight: '800', color: colors.goldText, letterSpacing: 0.5, marginBottom: 8 },
  menuItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  menuItemText: { fontSize: 13, fontWeight: '600', color: colors.ink },
  modalInput: { borderWidth: 1, borderColor: colors.border, padding: spacing.sm, borderRadius: radii.sm, marginVertical: spacing.md, fontSize: 14, color: colors.ink },
  cancelBtn: { padding: spacing.sm },
  cancelBtnText: { fontSize: 12, fontWeight: '600', color: colors.ink },
  saveBtn: { padding: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.primary, borderRadius: radii.sm },
  saveBtnText: { fontSize: 12, fontWeight: '700', color: colors.onPrimary },
});
