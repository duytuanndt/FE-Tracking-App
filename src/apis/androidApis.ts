import { api } from '@/lib/axios';
export const getProfile = async () => {
  const data = await api.get('/auth/profile');
  return data;
};

export const getStatisticsAndroidApp = async (payload: any) => {
  const { from, to, appID } = payload;

  // handle avoid timeout for large data
  // const data: any = await api.get(
  //   `/android-logs?from=${from}&to=${to}&appID=${appID}`,
  // );
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

    // console.error('getStatisticsAndroidApp error:', error);
    return { success: false, message: error.message || 'Unknown error' };
  }
};

export const getAndroidLogs = async (payload: any) => {
  const { from, to, appID } = payload;

  const data = await api.get(
    `/android-logs?from=${from}&to=${to}&appID=${appID}`,
  );

  return data;
};
