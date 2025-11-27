import { api } from '@/lib/axios';
import {
  AndroidAppListResponse,
  AndroidAppListParams,
} from '@/entities/android';

export const getAndroidAppList = async (
  params?: AndroidAppListParams,
): Promise<AndroidAppListResponse> => {
  const data = await api.get<AndroidAppListResponse>('/android-apps', {
    params,
  });
  return data;
};

export const getStatisticsAndroidApp = async (payload: any) => {
  const { from, to, appID } = payload;
  console.log('from', from);
  console.log('to', to);
  console.log('appID', appID);
  try {
    const data = await api.get('/android-logs', {
      params: { from, to, appID },
      timeout: 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    // console.log('getStatisticsAndroidApp: ', data);
    return data;
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      // console.warn('getStatisticsAndroidApp timeout:', error.message);
      return {
        success: false,
        message: 'Request timeout. Please try again with a smaller date range.',
      };
    }
    return { success: false, message: error.message || 'Unknown error' };
  }
};
