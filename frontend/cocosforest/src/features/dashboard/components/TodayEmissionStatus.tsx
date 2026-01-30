import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTodayData } from '../hooks/useDashboardQueries';
import { DashboardStateCard } from './DashboardStateCard';
import { Card } from '../../../shared/components';
import { colors } from '../../../shared/styles/commonStyles';

export const TodayEmissionStatus: React.FC = () => {
  const { data: todayData, isLoading, error } = useTodayData();

  const todayEmission = todayData?.totals?.carbonTotalKg;
  const averageEmission = 26.02;

  // 배출량에 따른 색상 결정
  const getEmissionColor = (value: number) => {
    if (value < 13.01) {
      return colors.primary; // 녹색 - 좋음
    } else if (value > averageEmission) {
      return '#ef4444'; // 빨간색 - 나쁨
    } else {
      return '#eab308'; // 노란색 - 보통
    }
  };

  if (isLoading) {
    return (
      <DashboardStateCard
        title="오늘 탄소 배출 현황"
        message="데이터를 불러오는 중..."
        tone="loading"
      />
    );
  }

  if (error) {
    return (
      <DashboardStateCard
        title="오늘 탄소 배출 현황"
        message="데이터를 불러올 수 없습니다."
        tone="error"
      />
    );
  }

  if (todayEmission == null) {
    return (
      <DashboardStateCard
        title="오늘 탄소 배출 현황"
        message="표시할 데이터가 없습니다."
        tone="empty"
      />
    );
  }

  return (
    <Card style={styles.compactCard}>
      <Text style={styles.cardTitle}>오늘 탄소 배출 현황</Text>

      {/* 현재 배출량 표시 */}
      <View style={styles.emissionStatus}>
        <View style={styles.emissionValueContainer}>
          <Text style={[styles.emissionValue, { color: getEmissionColor(todayEmission) }]}>{todayEmission.toFixed(2)}kg</Text>
        </View>
        <View style={styles.emissionAverageContainer}>
          <Text style={styles.emissionAverage}>{(averageEmission - todayEmission).toFixed(2)}kg</Text>
        </View>
      </View>
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
  emissionStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  emissionValueContainer: {
    alignItems: 'center',
  },
  emissionValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  emissionAverageContainer: {
    alignItems: 'center',
  },
  emissionAverage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9ca3af',
  },
});

