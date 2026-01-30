import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { CategoryData } from '../types';
import { Card } from '../../../shared/components';
import { fetchCategoryMonthlyDetails } from '../api';
import { handleApiError } from '../../../shared/utils/errorUtils';
import useDashboardStore from '../store/dashboardStore';
import { colors } from '../../../shared/styles/commonStyles';

interface CategoryItemProps {
  item: CategoryData;
  index: number;
}

export const CategoryItem: React.FC<CategoryItemProps> = ({ item, index }) => {
  const {
    selectedYear,
    selectedMonth,
    setShowCategoryModal,
    setCategoryModalData,
    setCategoryModalLoading
  } = useDashboardStore();

  const handleCardPress = async () => {
    const userCardId = '1'; // 데모용 임시 ID (토큰 기반 API에서는 서버가 사용자 식별)
    const yearMonth = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}`;

    try {
      // 모달 열기 및 로딩 상태 설정
      setShowCategoryModal(true);
      setCategoryModalLoading(true);
      setCategoryModalData(null);

      const categoryDetails = await fetchCategoryMonthlyDetails(
        userCardId,
        yearMonth,
        item.categoryId
      );

      // 데이터 설정 및 로딩 완료
      setCategoryModalData(categoryDetails);
      setCategoryModalLoading(false);

    } catch (error: unknown) {
      setCategoryModalLoading(false);

      const errorMessage = handleApiError(error, '카테고리 상세 데이터를 불러오는 중 오류가 발생했습니다.');
      const errorData = {
        userCardId,
        yearMonth,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        currency: 'KRW',
        totals: null,
        transactions: [],
        error: errorMessage
      };
      setCategoryModalData(errorData as any);
    }
  };

  return (
    <TouchableOpacity onPress={handleCardPress}>
      <Card variant="small">
        <View style={styles.categoryHeader}>
          <View style={styles.categoryLeft}>
            <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
            <Text style={styles.categoryName}>{item.categoryName}</Text>
            {index === 0 && (
              <View style={styles.topEmitterBadge}>
                <Text style={styles.topEmitterText}>최다 배출</Text>
              </View>
            )}
          </View>
          <View style={styles.categoryRight}>
            <Text style={styles.categoryAmount}>{item.carbonTotalKg}kg CO₂</Text>
            <Text style={styles.categoryPercentage}>
              {Math.round(item.ratioCarbon * 100)}%
            </Text>
          </View>
        </View>

        <View style={styles.categoryDetails}>
          <View style={styles.categoryDetailRow}>
            <Text style={styles.categoryDetailLabel}>결제금액</Text>
            <Text style={styles.categoryDetailValue}>
              ₩{item.amountTotal.toLocaleString()}
            </Text>
          </View>
          <View style={styles.categoryDetailRow}>
            <Text style={styles.categoryDetailLabel}>금액 비중</Text>
            <Text style={styles.categoryDetailValue}>
              {Math.round(item.ratioAmount * 100)}%
            </Text>
          </View>
        </View>

        {/* 탄소 배출량 비중 바 */}
        <View style={styles.emissionBar}>
          <View
            style={[
              styles.emissionFill,
              {
                width: `${item.ratioCarbon * 100}%`,
                backgroundColor: item.color
              }
            ]}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  topEmitterBadge: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  topEmitterText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#d97706',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#6b7280',
  },
  categoryDetails: {
    gap: 8,
    marginBottom: 12,
  },
  categoryDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryDetailLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  categoryDetailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  emissionBar: {
    height: 6,
    backgroundColor: colors.gray100,
    borderRadius: 3,
    overflow: 'hidden',
  },
  emissionFill: {
    height: '100%',
    borderRadius: 3,
  },
});