import { api } from '@/lib/axios';
import {
  AndroidAppListResponse,
  AndroidAppListParams,
  StatisticsAndroidAppResponse,
} from '@/entities/android';

export const getAndroidAppList = async (
  params?: AndroidAppListParams,
): Promise<AndroidAppListResponse> => {
  const data = await api.get<AndroidAppListResponse>('/android-apps', {
    params,
  });
  return data;
};

export const getStatisticsAndroidApp = async (
  payload: any,
): Promise<StatisticsAndroidAppResponse> => {
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

    console.log('getStatisticsAndroidApp: ', data);

    if (data && typeof data === 'object' && 'data' in data) {
      return data as StatisticsAndroidAppResponse;
    }
    throw new Error('Unexpected response structure');
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        message: 'Request timeout. Please try again with a smaller date range.',
        data: [],
        summary: [],
        subDetail: [],
        statistic: [],
      };
    }
    return {
      success: false,
      message: error.message || 'Unknown error',
      data: [],
      summary: [],
      subDetail: [],
      statistic: [],
    };
  }
};
