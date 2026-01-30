import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useChallengeStore } from '../store/challengeStore';
import { challengeApi } from '../api';

export const useChallengeTumbler = () => {
  const [showTumblerModal, setShowTumblerModal] = useState(false);
  const {
    challenges,
    todayChallenges,
    verifyTumbler,
    setTumblerVerificationFailed,
  } = useChallengeStore();

  const handleTumblerVerification = useCallback(() => {
    setShowTumblerModal(true);
  }, []);

  const handleTumblerVerificationSuccess = useCallback(async () => {
    try {
      verifyTumbler(true);
      setShowTumblerModal(false);
      setTumblerVerificationFailed(false);

      try {
        const tumblerChallenge = challenges.find(c => c.id === 'tumbler');
        if (tumblerChallenge) {
          const todayChallenge = todayChallenges.find(tc => tc.challengeId === 'tumbler');
          if (todayChallenge) {
            const completeResponse = await challengeApi.completeChallenge(todayChallenge.instanceId);
            if (!completeResponse.success) {
              console.warn('백엔드 동기화 실패:', completeResponse.message);
            }
          }
        }
      } catch (apiError) {
        console.error('백엔드 동기화 실패:', apiError);
      }
    } catch (error) {
      console.error('텀블러 인증 성공 처리 중 오류:', error);
      Alert.alert('오류', '텀블러 인증 처리 중 오류가 발생했습니다.');
    }
  }, [verifyTumbler, setTumblerVerificationFailed, challenges, todayChallenges]);

  const handleTumblerVerificationFailure = useCallback(() => {
    verifyTumbler(false);
    setTumblerVerificationFailed(true);
    setShowTumblerModal(false);
  }, [verifyTumbler, setTumblerVerificationFailed]);

  return {
    showTumblerModal,
    handleTumblerVerification,
    handleTumblerVerificationSuccess,
    handleTumblerVerificationFailure,
    setShowTumblerModal,
  };
};
