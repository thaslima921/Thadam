import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, shadows } from '../../config/theme';

export type TabKey = 'home' | 'explore' | 'plan' | 'trips' | 'profile';

interface BottomTabBarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

interface TabConfig {
  key: TabKey;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}

const TABS: TabConfig[] = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'explore', label: 'Explore', icon: 'compass' },
  { key: 'plan', label: 'Plan', icon: 'edit-3' },
  { key: 'trips', label: 'Trips', icon: 'map' },
  { key: 'profile', label: 'Profile', icon: 'user' },
];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onSelectTab }) => {
  return (
    <View style={styles.bottomNav}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const color = isActive ? colors.primary : colors.textTertiary;

        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.navItem, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.75}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Feather name={tab.icon} size={22} color={color} style={styles.icon} />
            <Text style={[styles.navText, isActive && styles.navTextActive]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    ...shadows.elevated,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
    minHeight: 44,
  },
  icon: {
    marginBottom: 2,
  },
  navText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textTertiary,
  },
  navTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  activeDot: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});
