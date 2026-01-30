import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useChallengeStore } from '../store/challengeStore';
import type { Challenge } from '../types';

export const useChallengeRewards = () => {
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const { todayChallenges, claimReward, claimChallengeReward } = useChallengeStore();

  const handleClaimReward = useCallback((challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowRewardModal(true);
  }, []);

  const handleConfirmReward = useCallback(async () => {
    if (!selectedChallenge) {
      setShowRewardModal(false);
      setSelectedChallenge(null);
      return;
    }

    try {
      if (selectedChallenge.type === 'attendance') {
        await claimReward(selectedChallenge.id);
        Alert.alert('보상 수령 완료!', `${selectedChallenge.points}포인트를 획득했습니다!`);
      } else {
        const challengeInstance = todayChallenges.find(c => c.challengeId === selectedChallenge.id);
        if (!challengeInstance) {
          await claimReward(selectedChallenge.id);
          Alert.alert('보상 수령 완료!', `${selectedChallenge.points}포인트를 획득했습니다!`);
        } else {
          const success = await claimChallengeReward(challengeInstance.instanceId);

          if (success) {
            Alert.alert('보상 수령 완료!', `${selectedChallenge.points}포인트를 획득했습니다!`);
          } else {
            await claimReward(selectedChallenge.id);
            Alert.alert('보상 수령 완료!', `${selectedChallenge.points}포인트를 획득했습니다!`);
          }
        }
      }
    } catch (error) {
      console.error('보상 수령 오류:', error);
      Alert.alert('오류', '보상 수령 중 오류가 발생했습니다.');
    } finally {
      setShowRewardModal(false);
      setSelectedChallenge(null);
    }
  }, [selectedChallenge, todayChallenges, claimReward, claimChallengeReward]);

  return {
    showRewardModal,
    selectedChallenge,
    handleClaimReward,
    handleConfirmReward,
    setShowRewardModal,
  };
};
