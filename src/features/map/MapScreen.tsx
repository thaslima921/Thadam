import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DESTINATIONS } from '../../data/destinations';
import { Destination } from '../../types/database';
import { colors, typography, spacing } from '../../config/theme';
import { useTripStore } from '../../store/useTripStore';
import { InteractiveMapView } from '../../components/map/InteractiveMapView';
import { PlaceDetailsModal } from '../../components/itinerary/PlaceDetailsModal';

export const MapScreen: React.FC = () => {
  const { currentTrip } = useTripStore();
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);

  const itineraryDestinations: Destination[] = [];
  if (currentTrip) {
    currentTrip.days.forEach((d) => {
      d.stops.forEach((s) => {
        if (!itineraryDestinations.some((existing) => existing.id === s.destination.id)) {
          itineraryDestinations.push(s.destination);
        }
      });
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.preTitle}>CORRIDOR INTELLIGENCE</Text>
        <Text style={styles.headerTitle}>Route & Facility Network</Text>
        <Text style={styles.headerSub}>
          Live corridor map with verified stops, medical access, and artisan guilds.
        </Text>
      </View>

      <View style={styles.mapContainer}>
        <InteractiveMapView
          stops={itineraryDestinations}
          allDestinations={DESTINATIONS}
          onSelectDestination={(dest) => setSelectedDest(dest)}
        />
      </View>

      <PlaceDetailsModal
        visible={selectedDest !== null}
        destination={selectedDest}
        onClose={() => setSelectedDest(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
  mapContainer: {
    flex: 1,
  },
});
