import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { dashboardQueryKeys } from './useDashboardQueries';
import { useDashboard } from './useDashboard';
import { handleApiError } from '../../../shared/utils/errorUtils';
import type { MainTabParamList } from '../../../app/navigation/types';
import { redirectToAccountLinking, isAccountLinkingError } from '../../../shared/utils/accountLinkingUtils';

export const useDashboardScreen = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const mainTabNavigation = navigation as unknown as NavigationProp<MainTabParamList>;
  const [refreshing, setRefreshing] = useState(false);
  const [hasShownAccountError, setHasShownAccountError] = useState(false);

  const {
    activeTab,
    showDetailCard,
    selectedDay,
    selectedMonth,
    selectedYear,
    aiCardRefreshKey,
    cocoGif,
    handleTabChange,
    todayError,
    monthlyError,
  } = useDashboard();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.todayData() }),
        queryClient.invalidateQueries({
          queryKey: dashboardQueryKeys.monthlyReport(`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`)
        }),
        selectedDay && queryClient.invalidateQueries({
          queryKey: dashboardQueryKeys.dayDetail(`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`)
        })
      ].filter(Boolean));
    } catch (error) {
      const message = handleApiError(error, '대시보드 데이터를 불러오는데 실패했습니다.');

      if (isAccountLinkingError(error)) {
        redirectToAccountLinking(mainTabNavigation, '대시보드 데이터를 불러오는데 실패했습니다.\n\n계좌 연결 후 다시 시도해주세요.');
      } else {
        void message;
      }
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, selectedYear, selectedMonth, selectedDay, mainTabNavigation]);

  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, [])
  );

  useEffect(() => {
    if (hasShownAccountError) return;

    const firstError = todayError || monthlyError;

    if (firstError && isAccountLinkingError(firstError)) {
      setHasShownAccountError(true);
      redirectToAccountLinking(mainTabNavigation, '대시보드 데이터를 불러오는데 실패했습니다.\n\n계좌 연결 후 다시 시도해주세요.');
    }
  }, [todayError, monthlyError, mainTabNavigation, hasShownAccountError]);

  return {
    scrollViewRef,
    refreshing,
    onRefresh,
    activeTab,
    showDetailCard,
    selectedDay,
    aiCardRefreshKey,
    cocoGif,
    handleTabChange,
  };
};
