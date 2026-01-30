import axios, { type AxiosError } from 'axios';

type ApiErrorPayload = {
  message?: string;
  error?: string;
};

export const isAxiosError = (error: unknown): error is AxiosError<ApiErrorPayload> => {
  return axios.isAxiosError(error);
};

export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return '알 수 없는 오류가 발생했습니다.';
};

export const handleApiError = (error: unknown, defaultMessage: string): string => {
  if (isAxiosError(error)) {
    const responseMessage = error.response?.data?.message || error.response?.data?.error;
    return responseMessage || error.message || defaultMessage;
  }

  return getErrorMessage(error) || defaultMessage;
};
