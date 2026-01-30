import { axiosInstance } from '../../shared/api/axios';
import { handleApiError, isAxiosError } from '../../shared/utils/errorUtils';
import { TodayChallengesResponse, ClaimRewardResponse } from './types';

const CHALLENGE_ENDPOINTS = {
  STATUS: '/api/challenges/status',
  TODAY: '/api/challenges/today',
  CLAIM: '/api/challenges',
  COMPLETE: '/api/challenges',
  ATTENDANCE: '/api/challenges/attendance',
  TRANSPORT: '/api/challenges/transport',
  TUMBLER: '/api/challenges/tumbler',
  REWARD: '/api/challenges/reward',
  RESET: '/api/challenges/reset',
} as const;

export interface ChallengeProgressRequest {
  challengeType: 'attendance' | 'transport' | 'tumbler';
  progress: number;
  maxProgress: number;
  additionalData?: {
    transportUsed?: boolean;
    tumblerVerified?: boolean;
  };
}

export interface ChallengeProgressResponse {
  success: boolean;
  challengeId: string;
  challengeType: string;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  pointsEarned?: number;
  message: string;
}

export interface ChallengeStatusResponse {
  challenges: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    icon: string;
    difficulty: string;
    points: number;
    status: string;
    progress: number;
    maxProgress: number;
    completedAt?: string;
    rewardClaimed: boolean;
  }>;
  totalPoints: number;
  completedChallenges: number;
}

export interface RewardClaimRequest {
  challengeId: string;
  challengeType: string;
}

export interface RewardClaimResponse {
  success: boolean;
  pointsEarned: number;
  totalPoints: number;
  message: string;
}


const buildProgressError = (
  challengeId: string,
  challengeType: string,
  progress: number,
  maxProgress: number,
  defaultMessage: string,
  error: unknown
): ChallengeProgressResponse => ({
  success: false,
  challengeId,
  challengeType,
  progress,
  maxProgress,
  isCompleted: false,
  pointsEarned: 0,
  message: handleApiError(error, defaultMessage),
});

const resolveAttendanceErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    if (!error.response) {
      return '네트워크 연결을 확인해주세요. 서버에 연결할 수 없습니다.';
    }

    const status = error.response.status;
    if (status === 404) {
      return '출석체크 API를 찾을 수 없습니다. 서버 설정을 확인해주세요.';
    }
    if (status === 500) {
      return '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
    if (status === 401) {
      return '인증이 필요합니다. 로그인을 다시 해주세요.';
    }
    if (status >= 400) {
      return `서버 오류 (${status}): ${error.response?.data?.message || '알 수 없는 오류'}`;
    }
  }

  return handleApiError(error, '출석체크 중 오류가 발생했습니다.');
};

export const challengeApi = {
  // 오늘의 챌린지 조회 (GET /api/challenges/today)
  getTodayChallenges: async (): Promise<TodayChallengesResponse> => {
    const response = await axiosInstance.get(CHALLENGE_ENDPOINTS.TODAY);
    return response.data;
  },

  // 챌린지 보상 수령 (POST /api/challenges/{userChallengeId}/claim)
  claimChallengeReward: async (userChallengeId: string): Promise<ClaimRewardResponse> => {
    const response = await axiosInstance.post(
      `${CHALLENGE_ENDPOINTS.CLAIM}/${userChallengeId}/claim`
    );
    return response.data;
  },

  // 챌린지 진행률 업데이트
  updateProgress: async (data: ChallengeProgressRequest): Promise<ChallengeProgressResponse> => {
    const response = await axiosInstance.post(
      CHALLENGE_ENDPOINTS.STATUS,
      data
    );
    return response.data;
  },

  // 챌린지 상태 조회
  getChallengeStatus: async (): Promise<ChallengeStatusResponse> => {
    const response = await axiosInstance.get(CHALLENGE_ENDPOINTS.STATUS);
    return response.data;
  },

  // 출석체크
  checkAttendance: async (): Promise<ChallengeProgressResponse> => {
    try {
      const response = await axiosInstance.post(CHALLENGE_ENDPOINTS.ATTENDANCE);
      
      if (response.data.isSuccess && response.data.result) {
        const result = response.data.result;
        return {
          success: result.success || true,
          challengeId: 'attendance',
          challengeType: 'attendance',
          progress: result.progress || 1,
          maxProgress: result.maxProgress || 1,
          isCompleted: result.isCompleted || result.awarded || true,
          pointsEarned: result.points || result.pointsEarned || 100,
          message: result.message || result.reason || '출석체크가 완료되었습니다.',
        };
      } else if (response.data.success === false) {
        return {
          success: false,
          challengeId: 'attendance',
          challengeType: 'attendance',
          progress: response.data.progress || 0,
          maxProgress: response.data.maxProgress || 1,
          isCompleted: response.data.isCompleted || false,
          pointsEarned: response.data.pointsEarned || 0,
          message: response.data.message || '출석체크에 실패했습니다.',
        };
      } else {
        return {
          success: false,
          challengeId: 'attendance',
          challengeType: 'attendance',
          progress: 0,
          maxProgress: 1,
          isCompleted: false,
          pointsEarned: 0,
          message: response.data.message || '출석체크에 실패했습니다.',
        };
      }
    } catch (error: unknown) {
      return {
        success: false,
        challengeId: 'attendance',
        challengeType: 'attendance',
        progress: 0,
        maxProgress: 1,
        isCompleted: false,
        pointsEarned: 0,
        message: resolveAttendanceErrorMessage(error),
      };
    }
  },


  // 대중교통 이용 확인 (결제내역 API 연동)
  checkTransport: async (): Promise<ChallengeProgressResponse> => {
    try {
      const response = await axiosInstance.post(CHALLENGE_ENDPOINTS.TRANSPORT);
      return response.data;
    } catch (error: unknown) {
      return buildProgressError('transport', 'transport', 0, 1, '대중교통 이용 확인 중 오류가 발생했습니다.', error);
    }
  },

  // 텀블러 인증
  verifyTumbler: async (imageData?: string): Promise<ChallengeProgressResponse> => {
    try {
      const response = await axiosInstance.post(CHALLENGE_ENDPOINTS.TUMBLER, {
        imageData
      });
      return response.data;
    } catch (error: unknown) {
      return buildProgressError('tumbler', 'tumbler', 0, 1, '텀블러 인증 중 오류가 발생했습니다.', error);
    }
  },

  // 보상 수령
  claimReward: async (data: RewardClaimRequest): Promise<RewardClaimResponse> => {
    try {
      const response = await axiosInstance.post(CHALLENGE_ENDPOINTS.REWARD, data);
      return response.data;
    } catch (error: unknown) {
      return {
        success: false,
        pointsEarned: 0,
        totalPoints: 0,
        message: handleApiError(error, '보상 수령 중 오류가 발생했습니다.'),
      };
    }
  },

  // 챌린지 완료 처리
  completeChallenge: async (userChallengeId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axiosInstance.post(
        `${CHALLENGE_ENDPOINTS.COMPLETE}/${userChallengeId}/complete`
      );
      
      return {
        success: response.data.isSuccess || response.data.success || true,
        message: response.data.message || '챌린지가 완료되었습니다.',
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: handleApiError(error, '챌린지 완료 처리 중 오류가 발생했습니다.'),
      };
    }
  },

  // 일일 챌린지 리셋 (새벽에 자동 실행)
  resetDailyChallenges: async (): Promise<{ success: boolean }> => {
    try {
      const response = await axiosInstance.post(CHALLENGE_ENDPOINTS.RESET);
      return { success: response.data.success || true };
    } catch (error: unknown) {
      return { success: false };
    }
  },

  // 서버 헬스체크
  healthCheck: async (): Promise<{ success: boolean; message: string }> => {
    try {
      await axiosInstance.get('/api/health');
      return { 
        success: true, 
        message: '서버가 정상적으로 작동 중입니다.' 
      };
    } catch (error: unknown) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      const statusLabel = status ?? 'NETWORK_ERROR';
      return { 
        success: false, 
        message: `서버 연결 실패: ${statusLabel}` 
      };
    }
  },
};