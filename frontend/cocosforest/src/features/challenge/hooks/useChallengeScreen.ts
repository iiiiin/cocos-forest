import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import type { Transaction } from '../../dashboard/types';
import type { MainTabParamList } from '../../../app/navigation/types';
import { useChallengeStore } from '../store/challengeStore';
import { challengeApi } from '../api';
import { challengeDetectionService } from '../services/challengeDetectionService';
import { redirectToAccountLinking, isAccountLinkingError } from '../../../shared/utils/accountLinkingUtils';
import { useTodayData } from '../../dashboard/hooks/useDashboardQueries';
import { useChallengeAttendance } from './useChallengeAttendance';
import { useChallengeRewards } from './useChallengeRewards';
import { useChallengeTumbler } from './useChallengeTumbler';

const DEFAULT_DETECTION_RESULT = {
  transportUsed: false,
  cafeUsed: false,
  transportTransactions: [] as Transaction[],
  cafeTransactions: [] as Transaction[]
};

type ChallengeDetectionResult = {
  transportUsed: boolean;
  cafeUsed: boolean;
  transportTransactions: Transaction[];
  cafeTransactions: Transaction[];
};

export const useChallengeScreen = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const mainTabNavigation = navigation as unknown as NavigationProp<MainTabParamList>;
  const { isAttendanceLoading, handleAttendanceCheck } = useChallengeAttendance({
    navigation: mainTabNavigation
  });
  const {
    showRewardModal,
    selectedChallenge,
    handleClaimReward,
    handleConfirmReward,
    setShowRewardModal,
  } = useChallengeRewards();
  const {
    showTumblerModal,
    handleTumblerVerification,
    handleTumblerVerificationSuccess,
    handleTumblerVerificationFailure,
    setShowTumblerModal,
  } = useChallengeTumbler();

  const scrollViewRef = useRef<ScrollView>(null);
  const {
    challenges,
    todayChallenges,
    isLoading,
    tumblerVerificationFailed,
    initializeChallenges,
    loadTodayChallenges,
    checkTransportUsage,
    setTumblerVerificationFailed,
    updateChallengeProgress,
    completeChallenge,
  } = useChallengeStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [hasShownAccountError, setHasShownAccountError] = useState(false);

  const [challengeDetectionResult, setChallengeDetectionResult] = useState<ChallengeDetectionResult>(
    DEFAULT_DETECTION_RESULT
  );

  // 챌린지 화면에서도 데이터 에러 감지를 위해 쿼리 구독
  const { data: todayData, error: todayDataError } = useTodayData();

  useEffect(() => {
    const loadChallengeStatus = async () => {
      try {
        await loadTodayChallenges();
      } catch (error) {
        console.error('챌린지 상태 로드 실패:', error);
        initializeChallenges();
      }
    };

    initializeChallenges();
    setTimeout(() => {
      loadChallengeStatus();
    }, 500);
  }, [initializeChallenges, loadTodayChallenges]);

  // todayData 변경 시 챌린지 감지 (무한 루프 방지: todayData만 dependency)
  useEffect(() => {
    if (!todayData) return;

    const detectionResult = challengeDetectionService.detectFromData(todayData);
    setChallengeDetectionResult(detectionResult);

    // 대중교통 챌린지 자동 완료 처리
    if (detectionResult.transportUsed) {
      checkTransportUsage(true);
      const transportChallenge = challenges.find(c => c.type === 'transport');
      if (transportChallenge && transportChallenge.status !== 'completed') {
        updateChallengeProgress('transport', 1);
        completeChallenge('transport');
        const todayInstance = todayChallenges.find(tc => tc.challengeId === 'transport');
        if (todayInstance) {
          challengeApi.completeChallenge(todayInstance.instanceId).catch(err =>
            console.warn('대중교통 챌린지 완료 동기화 실패:', err)
          );
        }
      }
    }

    // 텀블러 인증 실패 상태 초기화
    if (detectionResult.cafeUsed && tumblerVerificationFailed) {
      setTumblerVerificationFailed(false);
    }
  }, [todayData, challenges, todayChallenges, checkTransportUsage, updateChallengeProgress, completeChallenge, tumblerVerificationFailed, setTumblerVerificationFailed]);

  // 탭 진입(포커스) 시 데이터 새로고침 (간소화)
  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });

      loadTodayChallenges().catch(e => {
        console.error('포커스 시 챌린지 데이터 로드 실패:', e);
      });
    }, [loadTodayChallenges])
  );

  useEffect(() => {
    if (challenges.length === 0 && !isLoading) {
      initializeChallenges();
    }
  }, [challenges.length, isLoading, initializeChallenges]);

  const onPullRefresh = useCallback(async () => {
    setIsPullRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['todayData'] }),
        queryClient.invalidateQueries({ queryKey: ['dayDetails'] }),
        loadTodayChallenges()
      ]);
    } catch (error) {
      console.error('Pull refresh error:', error);

      if (isAccountLinkingError(error)) {
        redirectToAccountLinking(mainTabNavigation, '챌린지 데이터를 불러오는데 실패했습니다.\n\n계좌 연결 후 다시 시도해주세요.');
      }
    } finally {
      setIsPullRefreshing(false);
    }
  }, [queryClient, loadTodayChallenges, mainTabNavigation]);


  // 400 에러 감지 시 계좌 연결 안내 (즉시 실행)
  useEffect(() => {
    if (hasShownAccountError || !todayDataError) return;

    if (isAccountLinkingError(todayDataError)) {
      setHasShownAccountError(true);
      redirectToAccountLinking(mainTabNavigation, '챌린지 데이터를 불러오는데 실패했습니다.\n\n계좌 연결 후 다시 시도해주세요.');
    }
  }, [todayDataError, mainTabNavigation, hasShownAccountError]);


  const handleRefreshTransactions = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const attendanceChallenge = challenges.find(c => c.type === 'attendance');
      const wasAttendanceCompleted = attendanceChallenge?.status === 'completed';

      await queryClient.invalidateQueries({ queryKey: ['todayData'] });
      await queryClient.invalidateQueries({ queryKey: ['dayDetails'] });

      if (wasAttendanceCompleted) {
        const updatedAttendanceChallenge = challenges.find(c => c.type === 'attendance');
        if (updatedAttendanceChallenge && updatedAttendanceChallenge.status !== 'completed') {
          updateChallengeProgress('attendance', 1);
          completeChallenge('attendance');
        }
      }

      Alert.alert('새로고침 완료', '결제내역을 다시 확인했습니다.');

    } catch (error) {
      console.error('결제내역 새로고침 중 에러:', error);
      Alert.alert('오류', '결제내역을 새로고침하는 중 오류가 발생했습니다.');
    } finally {
      setIsRefreshing(false);
    }
  }, [challenges, updateChallengeProgress, completeChallenge, queryClient]);

  return {
    challenges,
    todayChallenges,
    isLoading,
    tumblerVerificationFailed,
    challengeDetectionResult,
    isAttendanceLoading,
    showRewardModal,
    selectedChallenge,
    showTumblerModal,
    isRefreshing,
    isPullRefreshing,
    scrollViewRef,
    initializeChallenges,
    onPullRefresh,
    handleAttendanceCheck,
    handleTumblerVerification,
    handleClaimReward,
    handleConfirmReward,
    handleTumblerVerificationSuccess,
    handleTumblerVerificationFailure,
    handleRefreshTransactions,
    setShowRewardModal,
    setShowTumblerModal,
  };
};
