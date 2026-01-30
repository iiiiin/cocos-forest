import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NavigationProp } from '@react-navigation/native';
import type { MainTabParamList } from '../../../app/navigation/types';
import { useChallengeStore } from '../store/challengeStore';
import { challengeApi } from '../api';
import { isAccountLinkingError, redirectToAccountLinking } from '../../../shared/utils/accountLinkingUtils';

type Params = {
  navigation: NavigationProp<MainTabParamList>;
};

export const useChallengeAttendance = ({ navigation }: Params) => {
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);
  const {
    challenges,
    todayChallenges,
    updateChallengeProgress,
    completeChallenge,
    claimReward,
  } = useChallengeStore();

  const handleAttendanceCheck = useCallback(async () => {
    setIsAttendanceLoading(true);
    try {
      const attendanceChallenge = challenges.find(c => c.type === 'attendance');
      if (attendanceChallenge?.status === 'completed') {
        Alert.alert('알림', '이미 오늘 출석체크를 완료했습니다.');
        return;
      }

      const attendanceInstance = todayChallenges.find(c => c.challengeId === 'attendance');

      if (attendanceInstance) {
        const completeRes = await challengeApi.completeChallenge(attendanceInstance.instanceId);
        if (!completeRes.success) {
          console.warn('출석 완료 동기화 실패:', completeRes.message);
        }
      }

      updateChallengeProgress('attendance', 1);
      completeChallenge('attendance');

      const today = new Date().toISOString().split('T')[0];
      try {
        const attendanceData = JSON.parse(await AsyncStorage.getItem('attendanceData') || '{}');
        attendanceData[today] = true;
        await AsyncStorage.setItem('attendanceData', JSON.stringify(attendanceData));

        await claimReward('attendance');
      } catch (error) {
        console.warn('출석체크 상태 저장 실패:', error);
      }

      Alert.alert(
        '출석체크 완료! 🎉',
        '출석체크가 완료되었습니다!\n\n보상받기 버튼을 눌러 포인트를 수령하세요!',
        [{ text: '확인', style: 'default' }]
      );
    } catch (error: unknown) {
      console.error('출석체크 처리 실패:', error);

      if (isAccountLinkingError(error)) {
        redirectToAccountLinking(navigation, '출석체크를 위해 계좌 연결이 필요합니다.');
        return;
      }

      const status = (error as { response?: { status?: number } })?.response?.status;
      const message = status === 400
        ? '계좌 정보가 필요합니다. 계좌 연결 후 다시 시도해주세요.'
        : status === 403
        ? '인증이 만료되었거나 로그인 정보가 없습니다. 다시 로그인 후 시도해주세요.'
        : '출석체크 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      Alert.alert('오류', message);
    } finally {
      setIsAttendanceLoading(false);
    }
  }, [challenges, todayChallenges, updateChallengeProgress, completeChallenge, claimReward, navigation]);

  return {
    isAttendanceLoading,
    handleAttendanceCheck,
  };
};
