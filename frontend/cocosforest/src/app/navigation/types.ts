import type { SignupStep1Form, SignupDraft } from '../../features/auth/types';

// 인증 스택 네비게이션 타입
export type AuthStackParamList = {
 Login: undefined;
 SignupStep1: { signupData?: SignupStep1Form } | undefined;
 SignupStep2: {
  signupData: SignupStep1Form
 };
 SignupStep3: {
  signupData: SignupDraft
 };
};

// 메인 탭 네비게이션 타입
export type MainTabParamList = {
 Home: undefined;
 Dashboard: undefined;
 Challenge: undefined;
 Profile: undefined;
};

// 루트 스택 네비게이션 타입
export type RootStackParamList = {
 Auth: undefined;
 Main: undefined;
};
