import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../config/theme';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onLogin }) => {
  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <Text style={styles.brandTitle}>தடம் THADAM TN</Text>
        </View>
        <TouchableOpacity onPress={onLogin} activeOpacity={0.8}>
          <Text style={styles.loginLink}>Demo Login</Text>
        </TouchableOpacity>
      </View>

      {/* Signature Element 1: Arch Hero (top corner radius 160 with gold border) */}
      <View style={styles.archHeroContainer}>
        <View style={styles.archHero}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=85',
            }}
            style={styles.heroImage}
          />
          <View style={styles.archBadge}>
            <Text style={styles.archBadgeText}>தஞ்சாவூர் • THANJAVUR REGION</Text>
          </View>
        </View>
      </View>

      {/* Editorial Content */}
      <View style={styles.textContent}>
        <Text style={styles.tagline}>EXPLORE BEYOND THE FAMOUS. EMPOWER THE LOCAL.</Text>
        <Text style={styles.headline}>Plan the Tamil Nadu trip that fits you.</Text>
        <Text style={styles.subheadline}>
          Selection-first adaptive multi-day planning with facility intelligence, verified artisan guilds, and real-time rerouting.
        </Text>
      </View>

      {/* Primary Action Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={onGetStarted} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>START PLANNING</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={onLogin} activeOpacity={0.85}>
          <Text style={styles.secondaryBtnText}>TOURIST DEMO LOGIN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // #FBF3E4
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: typography.sizes.body,
    fontWeight: '700',
    color: colors.primary, // #7A1426
    letterSpacing: 1.5,
  },
  loginLink: {
    fontSize: typography.sizes.small,
    fontWeight: '600',
    color: colors.goldText,
  },
  archHeroContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  archHero: {
    width: '100%',
    maxWidth: 340,
    height: 300,
    borderTopLeftRadius: radii.archHero, // 160
    borderTopRightRadius: radii.archHero, // 160
    borderBottomLeftRadius: radii.card,
    borderBottomRightRadius: radii.card,
    borderWidth: 2,
    borderColor: colors.gold, // #B8862B
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  archBadge: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(251, 243, 228, 0.94)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
  },
  archBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1,
  },
  textContent: {
    paddingHorizontal: spacing.xs,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.goldText,
    letterSpacing: typography.letterSpacing.uppercaseTag,
    marginBottom: 6,
  },
  headline: {
    fontFamily: typography.fontFamilyHeading,
    fontSize: typography.sizes.h1,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: typography.letterSpacing.tight,
    lineHeight: 38,
  },
  subheadline: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 22,
  },
  buttonContainer: {
    gap: spacing.sm,
  },
  primaryBtn: {
    height: 48,
    borderRadius: radii.button,
    backgroundColor: colors.primary, // #7A1426
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.card,
  },
  primaryBtnText: {
    color: colors.onPrimary, // #FBF3E4
    fontSize: typography.sizes.body,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    height: 48,
    borderRadius: radii.button,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: colors.primary,
    fontSize: typography.sizes.body,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
