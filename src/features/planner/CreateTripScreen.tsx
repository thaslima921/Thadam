import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../config/theme';
import { useTripStore } from '../../store/useTripStore';
import { useProfileStore } from '../../store/useProfileStore';
import { useSavedTripsStore } from '../../store/useSavedTripsStore';
import {
  AccommodationType,
  CrowdPreference,
  GroupStyle,
  InterestCategory,
  TransportMode,
} from '../../types/preferences';
import { LinkedSliders } from '../../components/ui/LinkedSliders';

const ALL_INTERESTS: InterestCategory[] = [
  'Historical',
  'Traditional',
  'Cultural',
  'Food',
  'Nature',
  'Beach',
  'Rural',
  'Spiritual',
  'Adventure',
  'Photography',
  'Shopping',
  'Art & Craft',
];

const BUDGET_PRESETS = [5000, 10000, 20000, 50000];

interface CreateTripScreenProps {
  onBuildTrip: () => void;
}

export const CreateTripScreen: React.FC<CreateTripScreenProps> = ({ onBuildTrip }) => {
  const { preferences, setPreferences } = useTripStore();

  const [startLoc, setStartLoc] = useState(preferences.startLocation);
  const [destRegion, setDestRegion] = useState(preferences.destination);
  const [daysCount, setDaysCount] = useState(preferences.daysCount);
  const [adults, setAdults] = useState(preferences.travelers.adults);
  const [children, setChildren] = useState(preferences.travelers.children);
  const [seniors, setSeniors] = useState(preferences.travelers.seniors);
  const [groupStyle, setGroupStyle] = useState<GroupStyle>(preferences.travelers.groupStyle);
  const [budget, setBudget] = useState(preferences.budget);
  const [interests, setInterests] = useState<InterestCategory[]>(preferences.interests);

  // Destination mix
  const [famousMix, setFamousMix] = useState(preferences.destinationMix.famous);
  const [moderateMix, setModerateMix] = useState(preferences.destinationMix.moderate);
  const [hiddenMix, setHiddenMix] = useState(preferences.destinationMix.hidden);

  const [crowdPref, setCrowdPref] = useState<CrowdPreference>(preferences.crowdPreference);
  const [transport, setTransport] = useState<TransportMode>(preferences.transport);
  const [maxTravelTime, setMaxTravelTime] = useState(preferences.maxTravelTime);
  const [accommodation, setAccommodation] = useState<AccommodationType>(preferences.accommodation);
  const [foodPrefs, setFoodPrefs] = useState<string[]>(preferences.foodPreferences);
  const [notes, setNotes] = useState(preferences.notes || '');

  // Facility requirements
  const [hospitalReq, setHospitalReq] = useState(preferences.facilityRequirements.hospitalNearby);
  const [hotelReq, setHotelReq] = useState(preferences.facilityRequirements.hotelNearby);
  const [pharmacyReq, setPharmacyReq] = useState(preferences.facilityRequirements.pharmacyNearby);
  const [fuelReq, setFuelReq] = useState(preferences.facilityRequirements.fuelNearby);

  const toggleInterest = (item: InterestCategory) => {
    if (interests.includes(item)) {
      setInterests(interests.filter((i) => i !== item));
    } else {
      setInterests([...interests, item]);
    }
  };

  const setMixPreset = (f: number, m: number, h: number) => {
    setFamousMix(f);
    setModerateMix(m);
    setHiddenMix(h);
  };

  const handleUseDemoTrip = () => {
    setStartLoc('Coimbatore');
    setDestRegion('Thanjavur');
    setDaysCount(4);
    setBudget(10000);
    setAdults(2);
    setGroupStyle('Couple');
    setInterests(['Historical', 'Traditional', 'Cultural']);
    setFamousMix(20);
    setModerateMix(40);
    setHiddenMix(40);
    setCrowdPref('Low');
    setHospitalReq(true);
    setHotelReq(true);
  };

  const { profile } = useProfileStore();
  const { autosaveDraft } = useSavedTripsStore();

  const handleResetToProfile = () => {
    setStartLoc(profile.homeCity || 'Coimbatore');
    setInterests(profile.interests as InterestCategory[]);
    setCrowdPref(profile.crowd === 'low' ? 'Low' : profile.crowd === 'moderate' ? 'Moderate' : 'Any');
    setBudget(profile.defaultBudget || 10000);
    setFamousMix(profile.destinationMix.famous);
    setModerateMix(profile.destinationMix.moderate);
    setHiddenMix(profile.destinationMix.hidden);
  };

  const handleBuildMyTrip = () => {
    autosaveDraft(5, {
      startLocation: startLoc,
      destination: destRegion,
      daysCount,
      budget,
      interests,
    });
    setPreferences({
      startLocation: startLoc,
      destination: destRegion,
      daysCount,
      travelers: {
        adults,
        children,
        seniors,
        groupStyle,
      },
      budget,
      interests,
      destinationMix: {
        famous: famousMix,
        moderate: moderateMix,
        hidden: hiddenMix,
      },
      crowdPreference: crowdPref,
      transport,
      maxTravelTime,
      accommodation,
      foodPreferences: foodPrefs,
      facilityRequirements: {
        ...preferences.facilityRequirements,
        hospitalNearby: hospitalReq,
        hotelNearby: hotelReq,
        pharmacyNearby: pharmacyReq,
        fuelNearby: fuelReq,
      },
      notes,
    });

    onBuildTrip();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Editorial Screen Header */}
        <View style={styles.headerBlock}>
          <Text style={styles.headerPreTitle}>JOURNEY DESIGNER</Text>
          <Text style={styles.headerTitle}>Tell Thadam your preferences. We'll build the journey.</Text>
          <Text style={styles.headerSubtitle}>
            Selection-first adaptive multi-day planning with facility intelligence and verified lesser-known destinations.
          </Text>

          {/* Quick Scenario & Profile Reset Buttons */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={[styles.useDemoBtn, { flex: 2 }]}
              onPress={handleUseDemoTrip}
              activeOpacity={0.85}
            >
              <Text style={styles.useDemoBtnText}>⚡ Use Demo Scenario (4D • ₹10K)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.useDemoBtn, { flex: 1, backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}
              onPress={handleResetToProfile}
              activeOpacity={0.85}
            >
              <Text style={[styles.useDemoBtnText, { color: colors.ink }]}>↺ From Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* STEP 1: Starting Point */}
        <View style={styles.cardSection}>
          <Text style={styles.stepNum}>STEP 01</Text>
          <Text style={styles.stepTitle}>Where are you starting?</Text>

          {/* Separate 'Use my location' button */}
          <TouchableOpacity
            style={[
              styles.useLocationBtn,
              startLoc === 'Current Location' && styles.useLocationBtnActive,
            ]}
            onPress={() => setStartLoc('Current Location')}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.useLocationText,
                startLoc === 'Current Location' && styles.useLocationTextActive,
              ]}
            >
              📍 Use my location
            </Text>
          </TouchableOpacity>

          {/* Single select city choice cards */}
          <View style={styles.pillsRow}>
            {['Coimbatore', 'Chennai', 'Madurai', 'Trichy'].map((city) => {
              const active = startLoc === city;
              return (
                <TouchableOpacity
                  key={city}
                  style={[styles.pillChip, active && styles.pillChipActive]}
                  onPress={() => setStartLoc(city)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {city}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* STEP 2: Destination Belt */}
        <View style={styles.cardSection}>
          <Text style={styles.stepNum}>STEP 02</Text>
          <Text style={styles.stepTitle}>Which region calls you?</Text>
          <View style={styles.regionsGrid}>
            {[
              {
                id: 'Thanjavur-Kumbakonam',
                title: 'Thanjavur & Kumbakonam',
                desc: 'Chola bronze craft, living temples, rural silk weavers',
              },
              {
                id: 'Madurai',
                title: 'Madurai Cultural Hub',
                desc: 'Ancient temple arts, heritage food alleys, Chettinad edges',
              },
              {
                id: 'Coimbatore',
                title: 'Coimbatore & Nilgiris',
                desc: 'Western Ghats trails, tea estates, textile sanctuaries',
              },
            ].map((reg) => {
              const active = destRegion === reg.id;
              return (
                <TouchableOpacity
                  key={reg.id}
                  style={[styles.selectionCard, active && styles.selectionCardActive]}
                  onPress={() => setDestRegion(reg.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.selectionCardHeader}>
                    <Text style={[styles.selectionCardTitle, active && styles.selectionCardTitleActive]}>
                      {reg.title}
                    </Text>
                    {active && <Text style={styles.cardCheckmark}>✓</Text>}
                  </View>
                  <Text style={styles.selectionCardDesc}>{reg.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* STEP 3: Duration */}
        <View style={styles.cardSection}>
          <Text style={styles.stepNum}>STEP 03</Text>
          <Text style={styles.stepTitle}>When are you travelling?</Text>
          <View style={styles.pillsRow}>
            {[2, 3, 4, 5, 7].map((d) => {
              const active = daysCount === d;
              return (
                <TouchableOpacity
                  key={d}
                  style={[styles.durationPill, active && styles.durationPillActive]}
                  onPress={() => setDaysCount(d)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.durationNum, active && styles.durationNumActive]}>{d}</Text>
                  <Text style={[styles.durationLabel, active && styles.durationLabelActive]}>Days</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* STEP 4: Travelers */}
        <View style={styles.cardSection}>
          <Text style={styles.stepNum}>STEP 04</Text>
          <Text style={styles.stepTitle}>Who is travelling with you?</Text>

          <View style={styles.counterRow}>
            <Text style={styles.counterLabel}>Adult Travelers</Text>
            <View style={styles.counterControls}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setAdults(Math.max(1, adults - 1))}
              >
                <Text style={styles.counterBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{adults}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setAdults(adults + 1)}
              >
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.pillsRow, { marginTop: spacing.md }]}>
            {(['Solo', 'Couple', 'Family', 'Friends'] as GroupStyle[]).map((g) => {
              const active = groupStyle === g;
              return (
                <TouchableOpacity
                  key={g}
                  style={[styles.pillChip, active && styles.pillChipActive]}
                  onPress={() => setGroupStyle(g)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{g}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* STEP 5: Visual Budget UI (Section 30) */}
        <View style={styles.cardSection}>
          <Text style={styles.stepNum}>STEP 05</Text>
          <Text style={styles.stepTitle}>What is your total budget?</Text>

          <View style={styles.budgetDisplay}>
            <Text style={styles.budgetAmount}>₹{budget.toLocaleString()}</Text>
            <Text style={styles.budgetHelper}>
              Comfortable for your selected {daysCount}-day journey style.
            </Text>
          </View>

          <View style={styles.pillsRow}>
            {BUDGET_PRESETS.map((b) => {
              const active = budget === b;
              return (
                <TouchableOpacity
                  key={b}
                  style={[styles.budgetPill, active && styles.budgetPillActive]}
                  onPress={() => setBudget(b)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.budgetPillText, active && styles.budgetPillTextActive]}>
                    ₹{b.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* STEP 6: Experiences & Interests */}
        <View style={styles.cardSection}>
          <Text style={styles.stepNum}>STEP 06</Text>
          <Text style={styles.stepTitle}>What do you want to experience?</Text>
          <View style={styles.interestsGrid}>
            {ALL_INTERESTS.map((item) => {
              const active = interests.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.interestChip, active && styles.interestChipActive]}
                  onPress={() => toggleInterest(item)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.interestChipText, active && styles.interestChipTextActive]}>
                    {active ? `✓ ${item}` : item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* STEP 7: Discovery Mix (LinkedSliders totalling 100 per docs/DESIGN.md) */}
        <View style={styles.cardSection}>
          <Text style={styles.stepNum}>STEP 07 • DISCOVERY MIX</Text>
          <Text style={styles.stepTitle}>What kind of places? (Totals 100%)</Text>
          <Text style={styles.mixSubtitle}>
            Balance famous landmarks with authentic lesser-known heritage and artisan hamlets.
          </Text>

          <LinkedSliders
            famous={famousMix}
            moderate={moderateMix}
            hidden={hiddenMix}
            onChange={setMixPreset}
          />
        </View>

        {/* STEP 8: Crowd Tolerance & Pace */}
        <View style={styles.cardSection}>
          <Text style={styles.stepNum}>STEP 08</Text>
          <Text style={styles.stepTitle}>How should the trip feel?</Text>
          <View style={styles.pillsRow}>
            {(['Low', 'Moderate', 'Any'] as CrowdPreference[]).map((c) => {
              const active = crowdPref === c;
              return (
                <TouchableOpacity
                  key={c}
                  style={[styles.pillChip, active && styles.pillChipActive]}
                  onPress={() => setCrowdPref(c)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {c === 'Low' ? '🍃 Relaxed & Calm' : c === 'Moderate' ? '⚖️ Balanced Pace' : '⚡ Dynamic & Packed'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* STEP 9: Essential Facilities (Safety & Feasibility) */}
        <View style={styles.cardSection}>
          <Text style={styles.stepNum}>STEP 09</Text>
          <Text style={styles.stepTitle}>Facility requirements</Text>
          <View style={styles.facilitiesRow}>
            <TouchableOpacity
              style={[styles.facilityToggle, hospitalReq && styles.facilityToggleActive]}
              onPress={() => setHospitalReq(!hospitalReq)}
              activeOpacity={0.8}
            >
              <Text style={[styles.facilityToggleText, hospitalReq && styles.facilityToggleTextActive]}>
                🏥 Hospital nearby
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.facilityToggle, hotelReq && styles.facilityToggleActive]}
              onPress={() => setHotelReq(!hotelReq)}
              activeOpacity={0.8}
            >
              <Text style={[styles.facilityToggleText, hotelReq && styles.facilityToggleTextActive]}>
                🏨 Verified stays
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.facilityToggle, pharmacyReq && styles.facilityToggleActive]}
              onPress={() => setPharmacyReq(!pharmacyReq)}
              activeOpacity={0.8}
            >
              <Text style={[styles.facilityToggleText, pharmacyReq && styles.facilityToggleTextActive]}>
                💊 Pharmacy nearby
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.facilityToggle, fuelReq && styles.facilityToggleActive]}
              onPress={() => setFuelReq(!fuelReq)}
              activeOpacity={0.8}
            >
              <Text style={[styles.facilityToggleText, fuelReq && styles.facilityToggleTextActive]}>
                ⛽ Fuel along corridor
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* STEP 10: Special Notes */}
        <View style={[styles.cardSection, { marginBottom: spacing.xl }]}>
          <Text style={styles.stepNum}>STEP 10</Text>
          <Text style={styles.stepTitle}>Special requests</Text>
          <TextInput
            style={styles.textInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. Quiet temple visits, traditional bronze workshops, filter coffee stops."
            placeholderTextColor={colors.textTertiary}
            multiline
          />
        </View>
      </ScrollView>

      {/* Sticky Primary CTA (docs/SPEC.md: Build my smart trip) */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity style={styles.buildBtn} onPress={handleBuildMyTrip} activeOpacity={0.9}>
          <Text style={styles.buildBtnText}>BUILD MY SMART TRIP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Warm Ivory #FBF8F1
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 110,
  },
  headerBlock: {
    marginBottom: spacing.xl,
  },
  headerPreTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentGold,
    letterSpacing: 1,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  useDemoBtn: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderRadius: radii.pill,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  useDemoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  mixSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  cardSection: {
    backgroundColor: colors.surface,
    borderRadius: radii.card, // 18px
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  stepNum: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: typography.sizes.md, // 16-18px
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
  },
  useLocationBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  useLocationBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  useLocationText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
  },
  useLocationTextActive: {
    color: colors.onPrimary,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pillChip: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillChipActive: {
    backgroundColor: colors.primary, // Deep Indigo
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  pillTextActive: {
    color: colors.surface,
  },
  regionsGrid: {
    gap: spacing.sm,
  },
  selectionCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.smCard, // 14px
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  selectionCardActive: {
    backgroundColor: '#F3F5FA',
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  selectionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionCardTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  selectionCardTitleActive: {
    color: colors.primary,
  },
  cardCheckmark: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  selectionCardDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  durationPill: {
    flex: 1,
    minWidth: 54,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationNum: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  durationNumActive: {
    color: colors.surface,
  },
  durationLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textTertiary,
    marginTop: 1,
  },
  durationLabelActive: {
    color: colors.sandLight,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  counterLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  counterValue: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
  budgetDisplay: {
    marginBottom: spacing.md,
  },
  budgetAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -1,
  },
  budgetHelper: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 4,
  },
  budgetPill: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  budgetPillActive: {
    backgroundColor: colors.sandLight,
    borderColor: colors.accentGold,
  },
  budgetPillText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  budgetPillTextActive: {
    color: colors.primary,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  interestChip: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  interestChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  interestChipText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  interestChipTextActive: {
    color: colors.surface,
  },
  mixCardsCol: {
    gap: spacing.sm,
  },
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  facilityToggle: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  facilityToggleActive: {
    backgroundColor: '#EEF4F0',
    borderColor: colors.forestGreen,
  },
  facilityToggleText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  facilityToggleTextActive: {
    color: colors.forestGreen,
    fontWeight: '700',
  },
  textInput: {
    minHeight: 70,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.input, // 14px
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    fontSize: typography.sizes.xs,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.elevated,
  },
  buildBtn: {
    height: 50, // 48-52px
    borderRadius: radii.button, // 12px
    backgroundColor: colors.primary, // Deep Indigo #18243F
    justifyContent: 'center',
    alignItems: 'center',
  },
  buildBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: 1,
  },
});
