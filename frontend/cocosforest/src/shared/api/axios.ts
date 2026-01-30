import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../../app/config/env';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 인증 토큰 추가
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(ENV.AUTH_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
      }
    } catch (error) {
      console.error('토큰 로드 오류:', error);
    }

    if (ENV.IS_DEV) {
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 토큰 만료 처리
apiClient.interceptors.response.use(
  (response) => {
    if (ENV.IS_DEV) {
    }
    return response;
  },
  async (error) => {
    if (ENV.IS_DEV) {
      console.error('❌ API Response Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status || 'Network Error');
    }

    // 401 에러 시 토큰 재발급 시도
    if (error.response?.status === 401) {
      try {
        const refreshToken = await AsyncStorage.getItem(ENV.REFRESH_TOKEN_KEY);
        if (refreshToken) {
          // TODO: 실제 토큰 재발급 API 호출 구현
          // const newToken = await refreshAccessToken(refreshToken);
          // await AsyncStorage.setItem(ENV.AUTH_TOKEN_KEY, newToken);
        } else {
        }
      } catch (refreshError) {
        console.error('토큰 재발급 실패:', refreshError);
        // 리프레시 토큰도 만료된 경우 로그아웃 처리
        await AsyncStorage.removeItem(ENV.AUTH_TOKEN_KEY);
        await AsyncStorage.removeItem(ENV.REFRESH_TOKEN_KEY);
      }
    }

    // 403 에러 시 인증 상태 확인 및 안내
    if (error.response?.status === 403) {
      const token = await AsyncStorage.getItem(ENV.AUTH_TOKEN_KEY);
      console.error('🚫 403 Forbidden 오류 발생');
      console.error('🚫 요청 URL:', error.config?.url);
      console.error('🚫 요청 메서드:', error.config?.method);
      console.error('🚫 응답 상태:', error.response?.status);
      console.error('🚫 응답 데이터:', error.response?.data);
      console.error('🚫 요청 헤더:', JSON.stringify(error.config?.headers, null, 2));
      
      if (!token) {
        console.error('🚫 403 Forbidden: 인증 토큰이 없습니다. 로그인이 필요합니다.');
        console.error('🚫 AsyncStorage 키:', ENV.AUTH_TOKEN_KEY);
        error.message = '로그인이 필요합니다. 로그인 후 다시 시도해주세요.';
        
        // 토큰이 없는 경우 자동으로 로그아웃 상태로 설정
        try {
          await AsyncStorage.removeItem(ENV.AUTH_TOKEN_KEY);
          await AsyncStorage.removeItem(ENV.REFRESH_TOKEN_KEY);
          await AsyncStorage.removeItem(ENV.AUTH_USER_KEY);
        } catch (cleanupError) {
          console.error('🧹 인증 정보 삭제 실패:', cleanupError);
        }
      } else {
        console.error('🚫 403 Forbidden: 인증 토큰이 유효하지 않거나 권한이 없습니다.');
        console.error('🚫 저장된 토큰:', token.substring(0, 50) + '...');
        console.error('🚫 토큰 길이:', token.length);
        console.error('🚫 토큰 형식 확인:', token.startsWith('eyJ') ? 'JWT 형식' : 'JWT 형식이 아님');
        
        // 토큰이 있지만 403 오류가 발생한 경우, 토큰이 만료되었을 가능성이 높음
        error.message = '인증이 만료되었습니다. 로그인을 다시 해주세요.';
      }
    }

    // 500 에러 시 서버 오류 안내
    if (error.response?.status === 500) {
      console.error('🚨 500 Internal Server Error: 서버에서 내부 오류가 발생했습니다.');
      error.message = '서버에서 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }

    return Promise.reject(error);
  }
);

// Mock adapter 선언 (개발 환경에서만 초기화)
let mock: MockAdapter | undefined;

// 개발 환경에서만 mock adapter 설정 (실제 API 연동 시 비활성화)
if (ENV.IS_DEV && false) { // false로 설정하여 Mock 비활성화
  mock = new MockAdapter(apiClient);
}

// 토큰 상태 디버깅 함수
export const debugTokenStatus = async () => {
  try {
    const token = await AsyncStorage.getItem(ENV.AUTH_TOKEN_KEY);
    const refreshToken = await AsyncStorage.getItem(ENV.REFRESH_TOKEN_KEY);
    const user = await AsyncStorage.getItem(ENV.AUTH_USER_KEY);
    
    
    return {
      hasAccessToken: !!token,
      hasRefreshToken: !!refreshToken,
      hasUser: !!user,
      tokenLength: token?.length || 0,
      refreshTokenLength: refreshToken?.length || 0
    };
  } catch (error) {
    console.error('🔍 토큰 상태 확인 실패:', error);
    return null;
  }
};

// 서버 연결 테스트 함수
export const testServerConnection = async () => {
  try {
    
    // 헬스체크 엔드포인트 테스트
    const healthResponse = await apiClient.get('/api/health');
    
    // 토큰 없이 접근 가능한 엔드포인트 테스트
    
    return { success: true, healthStatus: healthResponse.status };
  } catch (error: any) {
    console.error('🌐 === 서버 연결 테스트 실패 ===');
    console.error('🌐 오류 타입:', error.name);
    console.error('🌐 오류 메시지:', error.message);
    console.error('🌐 응답 상태:', error.response?.status);
    console.error('🌐 응답 데이터:', error.response?.data);
    console.error('🌐 요청 URL:', error.config?.url);
    console.error('🌐 요청 메서드:', error.config?.method);
    console.error('🌐 ================================');
    
    return { 
      success: false, 
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    };
  }
};

// Mock 설정을 export하여 다른 파일에서 사용할 수 있도록
export { mock };

export default apiClient;
export { apiClient as axiosInstance };