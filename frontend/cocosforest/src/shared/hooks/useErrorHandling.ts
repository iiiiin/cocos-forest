import { useCallback } from 'react';
import { handleApiError, isAxiosError } from '../utils/errorUtils';

/**
 * React Query 에러 처리를 위한 커스텀 훅
 */
export const useErrorHandling = () => {
  /**
   * 에러를 사용자 친화적인 메시지로 변환
   */
  const getErrorMessage = useCallback((error: unknown): string => {
    return handleApiError(error, '알 수 없는 오류가 발생했습니다.');
  }, []);

  /**
   * 에러 로깅 및 사용자 알림
   */
  const handleError = useCallback((error: unknown, context: string) => {
    const userMessage = getErrorMessage(error);

    return userMessage;
  }, [getErrorMessage]);

  /**
   * React Query용 onError 핸들러
   */
  const createQueryErrorHandler = useCallback((context: string) => {
    return (error: unknown) => {
      handleError(error, context);
    };
  }, [handleError]);

  /**
   * 재시도 가능한 에러인지 판단
   */
  const shouldRetry = useCallback((error: unknown, failureCount: number): boolean => {
    if (failureCount >= 3) return false;
    if (!isAxiosError(error)) return true;

    const status = error.response?.status;
    if (!status) return true;

    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(status);
  }, []);

  return {
    getErrorMessage,
    handleError,
    createQueryErrorHandler,
    shouldRetry,
  };
};
