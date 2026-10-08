import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { DESTINATIONS } from '../../data/destinations';
import { EXPERIENCES } from '../../data/experiences';
import { Destination, Experience } from '../../types/database';
import { colors, typography, spacing, radii, shadows } from '../../config/theme';
import { PopularityBadge, PressureBadge } from '../../components/common/Badge';
import { DataBadge } from '../../components/ui/DataBadge';

interface ExploreScreenProps {
  onSelectDestination: (dest: Destination) => void;
  onSelectExperience: (exp: Experience) => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  onSelectDestination,
  onSelectExperience,
}) => {
  const [selectedType, setSelectedType] = useState<'All' | 'famous' | 'moderate' | 'hidden'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Hidden Heritage', 'Living Craft & Artisan Guild', 'Heritage & Architecture', 'Nature & Spiritual'];

  const filteredDestinations = DESTINATIONS.filter((d) => {
    if (selectedType !== 'All' && d.popularityType !== selectedType) return false;
    if (selectedCategory !== 'All' && d.category !== selectedCategory) return false;
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Editorial Header */}
      <View style={styles.header}>
        <Text style={styles.preTitle}>BEYOND THE FAMOUS</Text>
        <Text style={styles.headerTitle}>Discover Tamil Nadu</Text>
        <Text style={styles.headerSub}>
          Curated destinations, craft guilds, and living traditions.
        </Text>

        {/* Discovery Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {(['All', 'hidden', 'moderate', 'famous'] as const).map((t) => {
            const active = selectedType === t;
            return (
              <TouchableOpacity
                key={t}
                style={[styles.filterPill, active && styles.filterPillActive]}
                onPress={() => setSelectedType(t)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                  {t === 'All' ? 'All Places' : t === 'hidden' ? '✦ Hidden Discoveries' : t === 'moderate' ? 'Balanced Stops' : 'Famous Landmarks'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {categories.map((c) => {
            const active = selectedCategory === c;
            return (
              <TouchableOpacity
                key={c}
                style={[styles.catPill, active && styles.catPillActive]}
                onPress={() => setSelectedCategory(c)}
                activeOpacity={0.8}
              >
                <Text style={[styles.catPillText, active && styles.catPillTextActive]}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Count Label */}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            Showing {filteredDestinations.length} verified destinations
          </Text>
        </View>

        {/* Destination Cards (Section 19: 4:3 Image, Category, Title, Location, Status, Explore) */}
        <View style={styles.cardsGrid}>
          {filteredDestinations.map((dest) => (
            <TouchableOpacity
              key={dest.id}
              style={styles.destCard}
              onPress={() => onSelectDestination(dest)}
              activeOpacity={0.9}
            >
              <Image source={{ uri: dest.image }} style={styles.cardImage} />

              <View style={styles.cardBody}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardCategory}>{dest.category}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <PressureBadge level={dest.pressureLevel} />
                    <DataBadge type="DEMO" />
                  </View>
                </View>

                <Text style={styles.cardTitle}>{dest.name}</Text>
                <Text style={styles.cardLocation}>
                  {dest.district} • {dest.facilities.hospitalKm} km hospital access
                </Text>

                <Text style={styles.cardSnippet} numberOfLines={2}>
                  {dest.description}
                </Text>

                <View style={styles.cardFooter}>
                  <PopularityBadge type={dest.popularityType} />
                  <Text style={styles.exploreCta}>Explore Place →</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section: Meet the Locals (Section 43 & 44) */}
        <View style={styles.localsSectionHeader}>
          <Text style={styles.localsPreTitle}>Craft guilds</Text>
          <Text style={styles.localsTitle}>Meet the locals</Text>
          <Text style={styles.localsSub}>
            Experience Tamil Nadu through the people who live it.
          </Text>
        </View>

        <View style={styles.experiencesGrid}>
          {EXPERIENCES.map((exp) => (
            <TouchableOpacity
              key={exp.id}
              style={styles.expCard}
              onPress={() => onSelectExperience(exp)}
              activeOpacity={0.9}
            >
              <Image source={{ uri: exp.photos[0] }} style={styles.expImage} />

              <View style={styles.expBody}>
                <View style={styles.expTopRow}>
                  <Text style={styles.expCategory}>{exp.category}</Text>
                  <Text style={styles.expPrice}>₹{exp.price} / person</Text>
                </View>

                <Text style={styles.expTitle}>{exp.name}</Text>
                <Text style={styles.expHost}>Hosted by {exp.providerName}</Text>

                <View style={styles.expFooter}>
                  <View style={styles.verifiedTag}>
                    <Text style={styles.verifiedTagText}>✓ Verified Host</Text>
                  </View>
                  <Text style={styles.bookCtaText}>Book Experience →</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Warm Ivory #FBF8F1
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
    fontSize: typography.sizes['2xl'],
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  filterRow: {
    gap: spacing.xs + 2,
    paddingBottom: spacing.xs,
  },
  filterPill: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPillActive: {
    backgroundColor: colors.primary, // Deep Indigo #18243F
    borderColor: colors.primary,
  },
  filterPillText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  filterPillTextActive: {
    color: colors.surface,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
  categoryRow: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  catPillActive: {
    backgroundColor: colors.sandLight,
    borderColor: '#DEC39F',
  },
  catPillText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  catPillTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  metaRow: {
    marginVertical: spacing.xs,
  },
  metaText: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  cardsGrid: {
    gap: spacing.lg,
    marginTop: spacing.xs,
  },
  destCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card, // 18px
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  cardImage: {
    width: '100%',
    height: 180, // 4:3 proportion feel
    backgroundColor: colors.surfaceSubtle,
  },
  cardBody: {
    padding: spacing.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  cardLocation: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 6,
  },
  cardSnippet: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  exploreCta: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  localsSectionHeader: {
    marginTop: spacing['2xl'],
    marginBottom: spacing.md,
  },
  localsPreTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentGold,
    letterSpacing: 1,
    marginBottom: 2,
  },
  localsTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  localsSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  experiencesGrid: {
    gap: spacing.md,
  },
  expCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  expImage: {
    width: '100%',
    height: 160,
    backgroundColor: colors.surfaceSubtle,
  },
  expBody: {
    padding: spacing.md,
  },
  expTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  expCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentGold,
    letterSpacing: 1,
  },
  expPrice: {
    fontSize: typography.sizes.sm,
    fontWeight: '800',
    color: colors.primary,
  },
  expTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  expHost: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  expFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  verifiedTag: {
    backgroundColor: '#EEF4F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  bookCtaText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.forestGreen,
  },
});
