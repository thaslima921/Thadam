import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../config/theme';
import { useTripStore } from '../../store/useTripStore';
import { useProfileStore } from '../../store/useProfileStore';
import { Destination, Experience } from '../../types/database';
import { DESTINATIONS } from '../../data/destinations';
import { EXPERIENCES } from '../../data/experiences';
import { HomeTopBar } from './HomeTopBar';
import { HomeQuickStarts } from './HomeQuickStarts';
import {
  recommendForYou,
  lowCrowdNow,
  hiddenDiscoveries,
  localExperiences,
  CURATED_TRAILS,
  trailToRequest,
} from '../../engine/home';
import { DataBadge } from '../../components/ui/DataBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TrailThread } from '../../components/ui/TrailThread';

interface HomeScreenProps {
  onPlanTrip: () => void;
  onExplore: () => void;
  onSelectDestination: (dest: Destination) => void;
  onSelectExperience: (exp: Experience) => void;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  onResumeLiveTrip?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onPlanTrip,
  onExplore,
  onSelectDestination,
  onSelectExperience,
  onOpenProfile,
  onOpenNotifications,
  onResumeLiveTrip,
}) => {
  const { activeTripSession, setPreferences, generateTrip } = useTripStore();
  const { profile } = useProfileStore();

  const dataSet = { destinations: DESTINATIONS, experiences: EXPERIENCES };
  const forYouList = recommendForYou(profile, dataSet, 5);
  const lowCrowdList = lowCrowdNow(dataSet, profile.homeCity, 4);
  const hiddenGems = hiddenDiscoveries(profile, dataSet, 5);
  const experiencesList = localExperiences(profile, dataSet, 5);

  const handleSelectPreset = (key: string) => {
    if (key === 'weekend') {
      setPreferences({ daysCount: 2, travelStyle: 'Relaxed', crowdPreference: 'Low' });
    } else if (key === 'heritage') {
      setPreferences({ daysCount: 3, travelStyle: 'Balanced', interests: ['Historical', 'Spiritual'] as any });
    } else if (key === 'hidden') {
      setPreferences({ daysCount: 3, destinationMix: { famous: 10, moderate: 30, hidden: 60 }, crowdPreference: 'Low' });
    } else if (key === 'family') {
      setPreferences({ daysCount: 3, travelStyle: 'Relaxed', crowdPreference: 'Low' });
    }
    onPlanTrip();
  };

  const handleStartTrail = (trailId: string) => {
    const req = trailToRequest(trailId, profile);
    setPreferences(req);
    generateTrip();
    onPlanTrip();
  };

  return (
    <View style={styles.container}>
      {/* 1. Top Bar */}
      <HomeTopBar onOpenProfile={onOpenProfile} onOpenNotifications={onOpenNotifications} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 2. Live Trip Pill (if trip active) */}
        {activeTripSession && activeTripSession.isActive && (
          <TouchableOpacity style={styles.liveTripPill} onPress={onResumeLiveTrip} activeOpacity={0.9}>
            <View style={styles.liveDot} />
            <Text style={styles.livePillText}>Your journey is live • Next stop ahead</Text>
            <Text style={styles.liveResumeBtn}>Resume ➔</Text>
          </TouchableOpacity>
        )}

        {/* 3. Arch Hero */}
        <View style={styles.archHero}>
          <View style={styles.archTrailThread}>
            <TrailThread stopsCount={3} currentStopIndex={1} height={44} />
          </View>
          <Text style={styles.heroPre}>Heritage & discovery</Text>
          <Text style={styles.heroTitle}>What do you want to experience?</Text>
          <View style={styles.heroBtnRow}>
            <TouchableOpacity style={styles.heroPrimaryBtn} onPress={onPlanTrip} activeOpacity={0.85}>
              <Text style={styles.heroPrimaryBtnText}>Plan My Trip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroSecondaryBtn} onPress={onExplore} activeOpacity={0.85}>
              <Text style={styles.heroSecondaryBtnText}>Near Me</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Quick Starts & Continue */}
        <HomeQuickStarts
          onSelectPreset={handleSelectPreset}
          onContinue={onPlanTrip}
          onOpenProfile={onOpenProfile}
        />

        {/* 5. Based On You Carousel */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>
              {profile.personalisation ? 'Picked for you' : 'Popular & verified'}
            </Text>
            <DataBadge status="DEMO" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {forYouList.map((item) => (
              <TouchableOpacity
                key={item.destination.id}
                style={styles.card}
                onPress={() => onSelectDestination(item.destination)}
                activeOpacity={0.85}
              >
                <Image source={{ uri: item.destination.image }} style={styles.cardImg} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardName} numberOfLines={1}>{item.destination.name}</Text>
                  <Text style={styles.cardArea}>{item.destination.district} • {item.matchScore}% Match</Text>
                  <View style={styles.reasonPill}>
                    <Text style={styles.reasonText} numberOfLines={1}>{item.reason}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 6. Low Crowd Right Now */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeading}>Quieter right now</Text>
          {lowCrowdList.map((dest) => (
            <TouchableOpacity
              key={dest.id}
              style={styles.listRow}
              onPress={() => onSelectDestination(dest)}
              activeOpacity={0.85}
            >
              <View style={styles.listRowInfo}>
                <Text style={styles.listRowName}>{dest.name}</Text>
                <Text style={styles.listRowMeta}>{dest.district} • Pressure: Comfortable</Text>
              </View>
              <StatusBadge status="comfortable" text="Low footfall" />
            </TouchableOpacity>
          ))}
        </View>

        {/* 7. Hidden Discoveries */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeading}>Beyond the usual route</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {hiddenGems.map((dest) => (
              <TouchableOpacity
                key={dest.id}
                style={styles.card}
                onPress={() => onSelectDestination(dest)}
                activeOpacity={0.85}
              >
                <Image source={{ uri: dest.image }} style={styles.cardImg} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardName} numberOfLines={1}>{dest.name}</Text>
                  <Text style={styles.cardArea}>{dest.district}</Text>
                  <View style={styles.hiddenPill}>
                    <Text style={styles.hiddenPillText}>★ Verified Hidden Gem</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 8. Curated Trails */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeading}>Follow a trail</Text>
          {CURATED_TRAILS.map((trail) => (
            <View key={trail.id} style={styles.trailCard}>
              <View style={styles.trailLeft}>
                <Text style={styles.trailTitle}>{trail.title}</Text>
                <Text style={styles.trailDesc}>{trail.description}</Text>
                <Text style={styles.trailMeta}>{trail.estimatedDays} Days • {trail.theme}</Text>
              </View>
              <TouchableOpacity style={styles.trailBtn} onPress={() => handleStartTrail(trail.id)}>
                <Text style={styles.trailBtnText}>Start Trail ➔</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* 9. Local Experiences */}
        <View style={[styles.sectionWrap, { marginBottom: 40 }]}>
          <Text style={styles.sectionHeading}>Meet the people behind the place</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {experiencesList.map((exp) => (
              <TouchableOpacity
                key={exp.id}
                style={styles.expCard}
                onPress={() => onSelectExperience(exp)}
                activeOpacity={0.85}
              >
                <Text style={styles.expTitle} numberOfLines={2}>{exp.title || exp.name}</Text>
                <Text style={styles.expProvider}>{exp.providerName}</Text>
                <View style={styles.expFooter}>
                  <Text style={styles.expPrice}>₹{exp.price}</Text>
                  <Text style={styles.expSeats}>{exp.availableSlots} seats left</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 80 },
  liveTripPill: {
    marginHorizontal: spacing.screenPadding,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold, marginRight: 8 },
  livePillText: { flex: 1, color: colors.onPrimary, fontSize: 12, fontWeight: '700' },
  liveResumeBtn: { color: colors.gold, fontSize: 11, fontWeight: '800' },
  archHero: {
    marginHorizontal: spacing.screenPadding,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 160,
    borderTopRightRadius: 160,
    borderRadius: radii.card,
    borderWidth: 2,
    borderColor: colors.gold,
    padding: spacing.xl,
    paddingTop: 36,
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  archTrailThread: {
    opacity: 0.65,
    marginBottom: 6,
  },
  heroPre: { fontSize: 10, fontWeight: '800', color: colors.goldText, letterSpacing: 1.5, marginBottom: 6 },
  heroTitle: {
    fontFamily: typography.fontFamilyHeading,
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  heroBtnRow: { flexDirection: 'row', gap: 10 },
  heroPrimaryBtn: { paddingVertical: 10, paddingHorizontal: 20, backgroundColor: colors.primary, borderRadius: radii.pill },
  heroPrimaryBtnText: { color: colors.onPrimary, fontSize: 12, fontWeight: '700' },
  heroSecondaryBtn: { paddingVertical: 10, paddingHorizontal: 18, backgroundColor: colors.surfaceSubtle, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border },
  heroSecondaryBtnText: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  sectionWrap: { marginTop: spacing.lg, paddingHorizontal: spacing.screenPadding },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionHeading: { fontSize: 11, fontWeight: '800', color: colors.goldText, letterSpacing: 1, marginBottom: 8 },
  hScroll: { gap: 12 },
  card: { width: 170, backgroundColor: colors.surface, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  cardImg: { width: '100%', height: 100 },
  cardContent: { padding: spacing.sm },
  cardName: { fontSize: 13, fontWeight: '700', color: colors.ink },
  cardArea: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  reasonPill: { marginTop: 6, backgroundColor: colors.surfaceSubtle, paddingHorizontal: 6, paddingVertical: 3, borderRadius: radii.sm },
  reasonText: { fontSize: 10, color: colors.goldText, fontWeight: '600' },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, marginBottom: 6 },
  listRowInfo: { flex: 1 },
  listRowName: { fontSize: 13, fontWeight: '700', color: colors.ink },
  listRowMeta: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  hiddenPill: { marginTop: 6, backgroundColor: 'rgba(184, 134, 43, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.sm },
  hiddenPillText: { fontSize: 10, color: colors.goldText, fontWeight: '700' },
  trailCard: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trailLeft: { flex: 1, paddingRight: spacing.sm },
  trailTitle: { fontSize: 14, fontWeight: '800', color: colors.ink },
  trailDesc: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  trailMeta: { fontSize: 10, color: colors.goldText, fontWeight: '700', marginTop: 4 },
  trailBtn: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.primary, borderRadius: radii.sm },
  trailBtnText: { color: colors.onPrimary, fontSize: 11, fontWeight: '700' },
  expCard: { width: 160, backgroundColor: colors.surface, padding: spacing.md, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, justifyContent: 'space-between' },
  expTitle: { fontSize: 12, fontWeight: '700', color: colors.ink },
  expProvider: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  expFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  expPrice: { fontSize: 13, fontWeight: '800', color: colors.primary },
  expSeats: { fontSize: 10, color: colors.forestGreen, fontWeight: '700' },
});
