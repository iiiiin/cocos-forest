import type { Transaction } from '../dashboard/types';

export type ChallengeType = 'attendance' | 'transport' | 'tumbler';

export type ChallengeStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export type Challenge = {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  status: ChallengeStatus;
  progress: number;
  maxProgress: number;
  completedAt?: string;
  rewardClaimed: boolean;
};

export type AttendanceChallenge = Challenge & {
  type: 'attendance';
  checkedIn: boolean;
  checkInTime?: string;
};


export type TransportChallenge = Challenge & {
  type: 'transport';
  hasUsedTransport: boolean;
  transportTransactions: Transaction[];
};

export type TumblerChallenge = Challenge & {
  type: 'tumbler';
  hasCafeTransaction: boolean;
  tumblerVerified: boolean;
  cafeTransactions: Transaction[];
};

export type ChallengeReward = {
  challengeId: string;
  points: number;
  claimedAt: string;
};

// 백엔드 API 스펙에 맞는 새로운 타입 정의
export interface TodayChallengesResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    date: string;
    fresh: boolean;
    lastSyncedAt: string;
    challenges: ChallengeInstance[];
  };
}

export interface ChallengeInstance {
  instanceId: string;
  challengeId: string;
  title: string;
  rule: string;
  rewardPoints: number;
  status: string;
  claimable: boolean;
  metrics: Record<string, unknown>;
  additionalProp1: Record<string, unknown>;
  additionalProp2: Record<string, unknown>;
  additionalProp3: Record<string, unknown>;
  awarded: boolean;
  awardedAt: string;
  message: string;
}

export interface ClaimRewardResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: string;
}
