import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Destination } from '../../types/database';
import { FACILITIES } from '../../data/facilities';
import { EXPERIENCES } from '../../data/experiences';
import { colors, typography, spacing, radii, shadows } from '../../config/theme';

interface InteractiveMapViewProps {
  stops: Destination[];
  allDestinations: Destination[];
  onSelectDestination?: (dest: Destination) => void;
}

type LayerType = 'all' | 'hidden' | 'experiences' | 'hospitals' | 'fuel';

export const InteractiveMapView: React.FC<InteractiveMapViewProps> = ({
  stops,
  allDestinations,
  onSelectDestination,
}) => {
  const [activeLayer, setActiveLayer] = useState<LayerType>('all');
  const [selectedPin, setSelectedPin] = useState<{
    type: 'destination' | 'facility' | 'experience';
    data: any;
  } | null>(stops.length > 0 ? { type: 'destination', data: stops[0] } : null);

  const minLat = 10.70;
  const maxLat = 11.25;
  const minLng = 79.05;
  const maxLng = 79.55;

  const projectCoord = (lat: number, lng: number) => {
    const xPct = Math.min(90, Math.max(10, ((lng - minLng) / (maxLng - minLng)) * 100));
    const yPct = Math.min(86, Math.max(12, ((maxLat - lat) / (maxLat - minLat)) * 100));
    return { left: `${xPct}%`, top: `${yPct}%` };
  };

  return (
    <View style={styles.container}>
      {/* Top Filter Chips */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {[
            { id: 'all', label: `Itinerary Route (${stops.length})` },
            { id: 'hidden', label: '✦ Hidden Discoveries' },
            { id: 'experiences', label: 'Artisan Guilds' },
            { id: 'hospitals', label: '🏥 Hospitals' },
            { id: 'fuel', label: '⛽ Fuel Corridor' },
          ].map((layer) => {
            const active = activeLayer === layer.id;
            return (
              <TouchableOpacity
                key={layer.id}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setActiveLayer(layer.id as LayerType)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {layer.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Muted Neutral Map Canvas (Section 37) */}
      <View style={styles.mapCanvas}>
        {/* River Basin Line */}
        <View style={styles.cauveryWaterway}>
          <Text style={styles.waterwayLabel}>Cauvery River Basin Corridor</Text>
        </View>

        {/* Route Connection Track */}
        <View style={styles.routeTrack}>
          <View style={styles.dashedPath} />
        </View>

        {/* Floating Circular Controls (Section 38: Radius 22-24px, subtle shadow) */}
        <View style={styles.floatingControlsCol}>
          <TouchableOpacity
            style={styles.circleControlBtn}
            onPress={() => setSelectedPin(stops[0] ? { type: 'destination', data: stops[0] } : null)}
            activeOpacity={0.8}
          >
            <Text style={styles.controlIcon}>📍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.circleControlBtn}
            onPress={() => setActiveLayer(activeLayer === 'all' ? 'hidden' : 'all')}
            activeOpacity={0.8}
          >
            <Text style={styles.controlIcon}>🗺️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.circleControlBtn}
            onPress={() => setActiveLayer('hospitals')}
            activeOpacity={0.8}
          >
            <Text style={styles.controlIcon}>🏥</Text>
          </TouchableOpacity>
        </View>

        {/* Markers */}
        {(activeLayer === 'all' || activeLayer === 'hidden') &&
          allDestinations.map((dest, idx) => {
            const isItinerary = stops.some((s) => s.id === dest.id);
            const isHidden = dest.popularityType === 'hidden';
            if (activeLayer === 'hidden' && !isHidden) return null;

            const pos = projectCoord(dest.lat, dest.lng);
            const isSelected = selectedPin?.data?.id === dest.id;

            // Marker colors (Section 37: Indigo, Green, Gold, Coral)
            const markerBg = isSelected
              ? colors.primary // Deep Indigo
              : isHidden
              ? colors.accentGold // Gold
              : isItinerary
              ? colors.forestGreen // Forest Green
              : colors.secondary;

            return (
              <TouchableOpacity
                key={dest.id}
                style={[
                  styles.markerCircle,
                  {
                    left: pos.left as any,
                    top: pos.top as any,
                    backgroundColor: markerBg,
                  },
                  isSelected && styles.markerSelectedRing,
                ]}
                onPress={() => setSelectedPin({ type: 'destination', data: dest })}
                activeOpacity={0.85}
              >
                <Text style={styles.markerText}>
                  {isHidden ? '✦' : isItinerary ? `${idx + 1}` : '•'}
                </Text>
              </TouchableOpacity>
            );
          })}

        {/* Artisan Guild Markers */}
        {activeLayer === 'experiences' &&
          EXPERIENCES.map((exp) => {
            const relatedDest = allDestinations.find((d) => d.id === exp.destinationId);
            if (!relatedDest) return null;
            const pos = projectCoord(relatedDest.lat, relatedDest.lng);
            return (
              <TouchableOpacity
                key={exp.id}
                style={[styles.markerCircle, { left: pos.left as any, top: pos.top as any, backgroundColor: colors.accentGold }]}
                onPress={() => setSelectedPin({ type: 'experience', data: exp })}
                activeOpacity={0.85}
              >
                <Text style={styles.markerText}>🔨</Text>
              </TouchableOpacity>
            );
          })}

        {/* Facility Markers */}
        {(activeLayer === 'hospitals' || activeLayer === 'fuel') &&
          FACILITIES.filter((f) => (activeLayer === 'hospitals' ? f.type === 'HOSPITAL' : f.type === 'FUEL')).map((f) => {
            const pos = projectCoord(f.lat, f.lng);
            return (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.markerCircle,
                  {
                    left: pos.left as any,
                    top: pos.top as any,
                    backgroundColor: f.type === 'HOSPITAL' ? colors.coral : colors.forestGreen,
                  },
                ]}
                onPress={() => setSelectedPin({ type: 'facility', data: f })}
                activeOpacity={0.85}
              >
                <Text style={styles.markerText}>{f.type === 'HOSPITAL' ? '🏥' : '⛽'}</Text>
              </TouchableOpacity>
            );
          })}
      </View>

      {/* Selected Node Card (Bottom Sheet style) */}
      {selectedPin && (
        <View style={styles.pinSheet}>
          <View style={styles.pinSheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.pinTag}>
                {selectedPin.type === 'destination'
                  ? selectedPin.data.popularityType === 'hidden'
                    ? '✦ HIDDEN DISCOVERY'
                    : 'ITINERARY DESTINATION'
                  : selectedPin.type === 'experience'
                  ? 'LOCAL ARTISAN GUILD'
                  : 'SAFETY FACILITY'}
              </Text>
              <Text style={styles.pinTitle}>{selectedPin.data.name}</Text>
              <Text style={styles.pinSub}>
                {selectedPin.data.district || selectedPin.data.address || 'Kumbakonam Corridor'}
              </Text>
            </View>

            {selectedPin.type === 'destination' && onSelectDestination && (
              <TouchableOpacity
                style={styles.pinActionBtn}
                onPress={() => onSelectDestination(selectedPin.data)}
                activeOpacity={0.8}
              >
                <Text style={styles.pinActionText}>Details</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Warm Ivory
  },
  filterBar: {
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs + 2,
  },
  filterChip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  filterChipTextActive: {
    color: colors.surface,
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#F5EFE6', // Muted neutral warm land color (Section 37)
    position: 'relative',
    overflow: 'hidden',
  },
  cauveryWaterway: {
    position: 'absolute',
    top: '38%',
    left: '-10%',
    right: '-10%',
    height: 28,
    backgroundColor: '#DCE8E1', // Subtle river basin green/blue
    transform: [{ rotate: '-8deg' }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterwayLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#709482',
    letterSpacing: 1,
  },
  routeTrack: {
    position: 'absolute',
    top: 60,
    bottom: 80,
    left: '25%',
    right: '25%',
    justifyContent: 'center',
  },
  dashedPath: {
    borderLeftWidth: 2,
    borderLeftColor: colors.sand,
    borderStyle: 'dashed',
    height: '100%',
    width: 2,
    alignSelf: 'center',
  },
  floatingControlsCol: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    gap: spacing.sm,
    zIndex: 10,
  },
  circleControlBtn: {
    width: 44, // Radius 22-24px (Section 38)
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  controlIcon: {
    fontSize: 16,
  },
  markerCircle: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
    ...shadows.card,
  },
  markerSelectedRing: {
    borderColor: colors.accentGold,
    transform: [{ scale: 1.15 }],
  },
  markerText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.surface,
  },
  pinSheet: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.elevated,
  },
  pinSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pinTag: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.accentGold,
    letterSpacing: 1,
    marginBottom: 2,
  },
  pinTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  pinSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  pinActionBtn: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radii.button,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.surface,
  },
});
