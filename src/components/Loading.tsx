import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

interface LoadingProps {
  label?: string;
  sublabel?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  label = 'Loading...',
  sublabel,
}) => (
  <View style={styles.wrap}>
    <ActivityIndicator size="large" color={colors.emerald} />
    {label ? <Text style={styles.label}>{label}</Text> : null}
    {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  label: {
    marginTop: 12,
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  sublabel: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
  },
});
