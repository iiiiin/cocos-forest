import type { AxiosResponse } from 'axios';
import type { BaseResponse } from '../types/api';
import { handleApiError } from '../utils/errorUtils';

export const unwrapResponse = <T>(
  response: AxiosResponse<BaseResponse<T>>,
  fallbackMessage: string
): T => {
  if (!response.data.isSuccess) {
    throw new Error(response.data.message || fallbackMessage);
  }
  return response.data.result;
};

export const request = async <T>(
  call: Promise<AxiosResponse<BaseResponse<T>>>,
  fallbackMessage: string
): Promise<T> => {
  try {
    const response = await call;
    return unwrapResponse(response, fallbackMessage);
  } catch (error) {
    throw new Error(handleApiError(error, fallbackMessage));
  }
};
