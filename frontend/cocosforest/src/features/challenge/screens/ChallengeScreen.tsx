import { ScrollView, SafeAreaView, RefreshControl } from 'react-native';
import { colors, commonStyles } from '../../../shared/styles/commonStyles';
import { UnifiedHeader } from '../../../shared/components';
import ChallengeInfoCard from '../components/ChallengeInfoCard';
import ChallengeList from '../components/ChallengeList';
import RewardModal from '../components/RewardModal';
import TumblerVerificationModal from '../components/TumblerVerificationModal';
import { useChallengeScreen } from '../hooks/useChallengeScreen';

const ChallengeScreen = () => {
  const {
    challenges,
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
  } = useChallengeScreen();

  return (
    <SafeAreaView style={commonStyles.safeContainer}>
      <ScrollView
        ref={scrollViewRef}
        style={commonStyles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isPullRefreshing}
            onRefresh={onPullRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <UnifiedHeader
          title="환경 챌린지"
          showRefresh={false}
          isRefreshing={isRefreshing}
          onRefresh={handleRefreshTransactions}
          showEco={false}
        />

        <ChallengeInfoCard />

        <ChallengeList
          challenges={challenges}
          isLoading={isLoading}
          challengeDetectionResult={challengeDetectionResult}
          isAttendanceLoading={isAttendanceLoading}
          tumblerVerificationFailed={tumblerVerificationFailed}
          onInitializeChallenges={initializeChallenges}
          onAttendanceCheck={handleAttendanceCheck}
          onTumblerVerification={handleTumblerVerification}
          onClaimReward={handleClaimReward}
        />
      </ScrollView>

      <RewardModal
        visible={showRewardModal}
        selectedChallenge={selectedChallenge}
        onClose={() => setShowRewardModal(false)}
        onConfirm={handleConfirmReward}
      />

      <TumblerVerificationModal
        visible={showTumblerModal}
        onClose={() => setShowTumblerModal(false)}
        onSuccess={handleTumblerVerificationSuccess}
        onFailure={handleTumblerVerificationFailure}
      />
    </SafeAreaView>
  );
};

export default ChallengeScreen;
