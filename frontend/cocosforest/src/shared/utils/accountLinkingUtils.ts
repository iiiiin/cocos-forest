import { Alert } from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import type { MainTabParamList } from '../../app/navigation/types';
import { isAxiosError } from './errorUtils';

/**
 * 계좌 연결이 필요한 상황에서 사용자를 프로필 화면으로 안내하는 유틸리티
 */
export const redirectToAccountLinking = (
  navigation: NavigationProp<MainTabParamList>,
  errorMessage?: string
) => {
  const defaultMessage = '계좌 정보를 불러올 수 없습니다.\n\n먼저 계좌를 연결해주세요.';

  Alert.alert(
    '계좌 연결 필요',
    errorMessage || defaultMessage,
    [
      {
        text: '취소',
        style: 'cancel'
      },
      {
        text: '계좌 연결하기',
        onPress: () => {
          navigation.navigate('Profile', { openAccountModal: true } as never);
        }
      }
    ]
  );
};

/**
 * API 에러 응답을 분석해서 계좌 연결 관련 에러인지 확인
 */
export const isAccountLinkingError = (error: unknown): boolean => {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || '';
    if (status === 400) return true;

    const accountKeywords = ['account', '계좌', 'card', '카드', '카드를 연결해주세요'];
    return accountKeywords.some(keyword => message.toLowerCase().includes(keyword.toLowerCase()));
  }

  if (error instanceof Error) {
    const message = error.message;
    if (
      message.includes('잘못된 요청입니다') ||
      message.includes('파라미터를 확인해주세요') ||
      message.includes('bad request')
    ) {
      return true;
    }

    const accountKeywords = ['account', '계좌', 'card', '카드', '카드를 연결해주세요'];
    return accountKeywords.some(keyword => message.toLowerCase().includes(keyword.toLowerCase()));
  }

  return false;
};

/**
 * 네트워크 에러나 일반적인 API 에러인지 확인
 */
export const isNetworkError = (error: unknown): boolean => {
  return isAxiosError(error) ? !error.response : false;
};