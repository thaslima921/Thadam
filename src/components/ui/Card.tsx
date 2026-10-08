import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, shadows } from '../../config/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, // #FFF8EA
    borderRadius: radii.card,        // 14
    borderWidth: 1,
    borderColor: colors.line,        // #DDC48F
    padding: 16,
    ...shadows.card,
  },
});
