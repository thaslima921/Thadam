import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../config/theme';
import { useTripStore } from '../../store/useTripStore';
import {
  CrowdPreference,
  InterestCategory,
  TransportMode,
  TravelStyle,
} from '../../types/preferences';

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

const TRAVEL_STYLES: TravelStyle[] = ['Relaxed', 'Balanced', 'Packed'];
const CROWD_PREFS: CrowdPreference[] = ['Low', 'Moderate', 'Any'];
const TRANSPORTS: TransportMode[] = ['Car', 'Two-wheeler', 'Bus', 'Train', 'Cab', 'Walking'];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { preferences, setPreferences } = useTripStore();

  const [lang, setLang] = useState<'English' | 'Tamil'>(preferences.language);
  const [selectedInterests, setSelectedInterests] = useState<InterestCategory[]>(preferences.interests);
  const [travelStyle, setTravelStyle] = useState<TravelStyle>(preferences.travelStyle);
  const [crowdPref, setCrowdPref] = useState<CrowdPreference>(preferences.crowdPreference);
  const [transport, setTransport] = useState<TransportMode>(preferences.transport);
  const [hospitalReq, setHospitalReq] = useState(preferences.facilityRequirements.hospitalNearby);
  const [hotelReq, setHotelReq] = useState(preferences.facilityRequirements.hotelNearby);
  const [pharmacyReq, setPharmacyReq] = useState(preferences.facilityRequirements.pharmacyNearby);

  const toggleInterest = (interest: InterestCategory) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSave = () => {
    setPreferences({
      language: lang,
      interests: selectedInterests,
      travelStyle,
      crowdPreference: crowdPref,
      transport,
      facilityRequirements: {
        ...preferences.facilityRequirements,
        hospitalNearby: hospitalReq,
        hotelNearby: hotelReq,
        pharmacyNearby: pharmacyReq,
      },
    });
    onComplete();
  };

  return (
    <View style={styles.container}>
      {/* Editorial Header */}
      <View style={styles.header}>
        {/* Progress Indicator matching Section 27: ● ● ● ○ ○ */}
        <View style={styles.progressRow}>
          <View style={[styles.progressDot, styles.dotActive]} />
          <View style={[styles.progressDot, styles.dotActive]} />
          <View style={[styles.progressDot, styles.dotActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>

        <Text style={styles.screenTitle}>What do you love?</Text>
        <Text style={styles.screenSub}>
          Select your preferences. THADAM designs an adaptive itinerary tailored to your way of travelling.
        </Text>
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Language Selection */}
        <Text style={styles.sectionHeading}>Language / மொழி</Text>
        <View style={styles.chipsRow}>
          {(['English', 'Tamil'] as const).map((l) => {
            const isSelected = lang === l;
            return (
              <TouchableOpacity
                key={l}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setLang(l)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {l === 'Tamil' ? 'தமிழ் (Tamil)' : 'English'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Interests Selection */}
        <Text style={styles.sectionHeading}>Travel Interests</Text>
        <View style={styles.chipsRow}>
          {ALL_INTERESTS.map((item) => {
            const isSelected = selectedInterests.includes(item);
            return (
              <TouchableOpacity
                key={item}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => toggleInterest(item)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {isSelected ? `✓ ${item}` : item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Travel Pace */}
        <Text style={styles.sectionHeading}>Travel Pace</Text>
        <View style={styles.chipsRow}>
          {TRAVEL_STYLES.map((style) => {
            const isSelected = travelStyle === style;
            return (
              <TouchableOpacity
                key={style}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setTravelStyle(style)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {style}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Crowd Sensitivity */}
        <Text style={styles.sectionHeading}>Crowd Preference</Text>
        <View style={styles.chipsRow}>
          {CROWD_PREFS.map((c) => {
            const isSelected = crowdPref === c;
            return (
              <TouchableOpacity
                key={c}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setCrowdPref(c)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {c === 'Low' ? 'Low Crowd' : c === 'Moderate' ? 'Moderate' : 'Any Density'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Preferred Transport */}
        <Text style={styles.sectionHeading}>Preferred Transport</Text>
        <View style={styles.chipsRow}>
          {TRANSPORTS.map((t) => {
            const isSelected = transport === t;
            return (
              <TouchableOpacity
                key={t}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setTransport(t)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Essential Safety & Facilities (Section 26 Selection Cards) */}
        <Text style={styles.sectionHeading}>Facility Readiness</Text>
        <View style={styles.cardsColumn}>
          <TouchableOpacity
            style={[styles.selectionCard, hospitalReq && styles.selectionCardSelected]}
            onPress={() => setHospitalReq(!hospitalReq)}
          >
            <View style={styles.selectionCardRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectionCardTitle}>Hospital Proximity</Text>
                <Text style={styles.selectionCardSub}>Flag destinations where nearest hospital exceeds 6 km</Text>
              </View>
              {hospitalReq && <Text style={styles.cardCheckmark}>✓</Text>}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.selectionCard, hotelReq && styles.selectionCardSelected]}
            onPress={() => setHotelReq(!hotelReq)}
          >
            <View style={styles.selectionCardRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectionCardTitle}>Verified Lodging Nearby</Text>
                <Text style={styles.selectionCardSub}>Ensure certified hotel or heritage homestay access</Text>
              </View>
              {hotelReq && <Text style={styles.cardCheckmark}>✓</Text>}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.selectionCard, pharmacyReq && styles.selectionCardSelected]}
            onPress={() => setPharmacyReq(!pharmacyReq)}
          >
            <View style={styles.selectionCardRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectionCardTitle}>24x7 Pharmacy Access</Text>
                <Text style={styles.selectionCardSub}>Prioritize corridors with emergency medicine supply</Text>
              </View>
              {pharmacyReq && <Text style={styles.cardCheckmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Primary Action Button (Section 16: Deep Indigo, 48-52px, 12px radius) */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleSave}>
          <Text style={styles.continueBtnText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.xs,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  screenTitle: {
    fontSize: typography.sizes.screenHeading,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  screenSub: {
    fontSize: typography.sizes.supporting,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  scrollArea: {
    flex: 1,
    padding: spacing.lg,
  },
  sectionHeading: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  chip: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.sizes.supporting,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  chipTextSelected: {
    color: colors.textWhite,
    fontWeight: typography.weights.semibold,
  },
  cardsColumn: {
    gap: spacing.xs,
  },
  selectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.cardSmall,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceSubtle,
  },
  selectionCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectionCardTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  selectionCardSub: {
    fontSize: typography.sizes.supporting,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardCheckmark: {
    fontSize: 16,
    color: colors.forestGreen,
    fontWeight: '800',
    marginLeft: spacing.sm,
  },
  footer: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.subtle,
  },
  continueBtn: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.subtle,
  },
  continueBtnText: {
    color: colors.textWhite,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
  },
});
