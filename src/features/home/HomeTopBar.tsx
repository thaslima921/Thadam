import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radii } from '../../config/theme';
import { useProfileStore } from '../../store/useProfileStore';
import { useNotificationStore } from '../../store/useNotificationStore';

interface HomeTopBarProps {
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
}

export const HomeTopBar: React.FC<HomeTopBarProps> = ({ onOpenProfile, onOpenNotifications }) => {
  const { profile, updateProfile } = useProfileStore();
  const { unreadCount } = useNotificationStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (profile.language === 'ta') {
      return `வணக்கம், ${profile.name}`;
    }
    if (hour < 12) return `Good morning, ${profile.name}`;
    if (hour < 17) return `Good afternoon, ${profile.name}`;
    return `Good evening, ${profile.name}`;
  };

  const toggleLanguage = () => {
    updateProfile({ language: profile.language === 'en' ? 'ta' : 'en' });
  };

  return (
    <View style={styles.topBar}>
      <View style={styles.greetingCol}>
        <Text style={styles.greetingText}>{getGreeting()}</Text>
      </View>

      <View style={styles.actionsRow}>
        {/* Language Toggle */}
        <TouchableOpacity style={styles.langPill} onPress={toggleLanguage} activeOpacity={0.8}>
          <Text style={styles.langText}>{profile.language === 'en' ? 'EN | தமிழ்' : 'தமிழ் | EN'}</Text>
        </TouchableOpacity>

        {/* Bell with Badge */}
        <TouchableOpacity style={styles.bellBtn} onPress={onOpenNotifications} activeOpacity={0.8}>
          <Text style={styles.bellIcon}>🔔</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Avatar */}
        <TouchableOpacity style={styles.avatarBtn} onPress={onOpenProfile} activeOpacity={0.8}>
          <Text style={styles.avatarText}>{profile.name.charAt(0)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  greetingCol: { flex: 1 },
  tagline: { fontSize: 10, fontWeight: '800', color: colors.goldText, letterSpacing: 1.2 },
  greetingText: { fontSize: 18, fontWeight: '800', color: colors.ink, marginTop: 1 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  langPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langText: { fontSize: 11, fontWeight: '700', color: colors.ink },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellIcon: { fontSize: 15 },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: colors.onPrimary, fontSize: 9, fontWeight: '800' },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: colors.onPrimary, fontSize: 14, fontWeight: '700' },
});
