import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, radii } from '../../config/theme';

interface CounterProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
}

export const Counter: React.FC<CounterProps> = ({
  label,
  value,
  min = 0,
  max = 20,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.valText}>{value}</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: typography.sizes.body,
    fontWeight: '500',
    color: colors.ink,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btn: {
    width: 44, // Minimum touch target 44
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  valText: {
    fontSize: typography.sizes.body,
    fontWeight: '700',
    color: colors.ink,
    minWidth: 24,
    textAlign: 'center',
  },
});
