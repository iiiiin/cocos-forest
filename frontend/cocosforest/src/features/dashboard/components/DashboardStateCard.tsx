import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Card } from '../../../shared/components';

export type DashboardStateTone = 'loading' | 'error' | 'empty';

interface DashboardStateCardProps {
  title: string;
  message: string;
  tone: DashboardStateTone;
}

export const DashboardStateCard: React.FC<DashboardStateCardProps> = ({ title, message, tone }) => {
  return (
    <Card style={styles.compactCard}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={[styles.message, toneStyles[tone]]}>{message}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  compactCard: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

const toneStyles = StyleSheet.create({
  loading: {
    color: '#6b7280',
  },
  error: {
    color: '#ef4444',
  },
  empty: {
    color: '#6b7280',
  },
});
