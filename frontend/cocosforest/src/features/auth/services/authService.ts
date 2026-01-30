import { LoginForm, SignupForm, TokenInfo, SignupRequestDto, SignupResponseDto, EmailSendRequest, NicknameCheckRequest, EmailVerifyRequest, LogoutRequest, ReissueRequest } from "../types";
import apiClient from "../../../shared/api/axios";
import { unwrapResponse, request } from "../../../shared/api/request";
import { handleApiError, isAxiosError } from "../../../shared/utils/errorUtils";
import type { BaseResponse } from "../../../shared/types/api";

export const authService = {
  // 로그인
  login: async (loginData: LoginForm): Promise<TokenInfo> => {
    try {
      const response = await apiClient.post<BaseResponse<TokenInfo>>(
        "/api/user/login",
        { email: loginData.email, password: loginData.password }
      );
      return unwrapResponse(response, "로그인에 실패했습니다.");
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 400) {
        throw new Error("비밀번호를 잘못 입력하셨습니다.");
      }
      throw new Error(handleApiError(error, "로그인에 실패했습니다."));
    }
  },

  // 회원가입
  signup: async (signupData: SignupForm): Promise<SignupResponseDto> => {
    const requestData: SignupRequestDto = {
      email: signupData.email,
      password: signupData.password,
      nickname: signupData.nickname,
      phoneNumber: signupData.phoneNumber,
      termsAgreed: signupData.agreements.terms,
      privacyPolicyAgreed: signupData.agreements.privacy,
      marketingAgreed: signupData.agreements.marketing,
    };

    return request(
      apiClient.post("/api/user/signup", requestData),
      "회원가입에 실패했습니다."
    );
  },

  // 이메일 중복 체크
  checkEmailDuplicate: async (email: string): Promise<boolean> => {
    try {
      const requestData: EmailSendRequest = { email };
      await request(
        apiClient.post("/api/email/check-email-duplicate", requestData),
        "이메일 중복 확인에 실패했습니다."
      );
      return false;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        return true;
      }
      throw new Error(handleApiError(error, "이메일 중복 확인에 실패했습니다."));
    }
  },

  // 닉네임 중복 체크
  checkNicknameDuplicate: async (nickname: string): Promise<boolean> => {
    try {
      const requestData: NicknameCheckRequest = { nickname };
      await request(
        apiClient.post("/api/user/check-nickname-duplicate", requestData),
        "닉네임 중복 확인에 실패했습니다."
      );
      return false;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        return true;
      }
      throw new Error(handleApiError(error, "닉네임 중복 확인에 실패했습니다."));
    }
  },

  // 인증번호 발송
  sendVerificationCode: async (email: string): Promise<void> => {
    const requestData: EmailSendRequest = { email };
    await request(
      apiClient.post("/api/email/send-verification", requestData),
      "인증번호 발송에 실패했습니다."
    );
  },

  // 인증번호 확인
  verifyCode: async (email: string, code: string): Promise<boolean> => {
    const requestData: EmailVerifyRequest = { email, code };
    try {
      await request(
        apiClient.post("/api/email/verify-code", requestData),
        "인증번호 검증에 실패했습니다."
      );
      return true;
    } catch (error) {
      return false;
    }
  },

  // 로그아웃
  logout: async (refreshToken: string): Promise<void> => {
    const requestData: LogoutRequest = { refreshToken };
    await request(
      apiClient.post("/api/user/logout", requestData),
      "로그아웃에 실패했습니다."
    );
  },

  // 토큰 재발급
  reissue: async (refreshToken: string): Promise<TokenInfo> => {
    const requestData: ReissueRequest = { refreshToken };
    return request(
      apiClient.post("/api/user/reissue", requestData),
      "토큰 재발급에 실패했습니다."
    );
  },
};
