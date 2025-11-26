import { api } from '@/lib/axios';
export const getProfile = async () => {
  const data = await api.get('/auth/profile');
  return data;
};

export const getStatisticsAndroidApp = async (payload: any) => {
  const { from, to, appID } = payload;

  const data: any = await api.get(
    `/android-logs?from=${from}&to=${to}&appID=${appID}`,
  );

  console.log('getStatisticsAndroidApp: ', data);
  return data;
};

export const getAndroidLogs = async (payload: any) => {
  const { from, to, appID } = payload;

  const data = await api.get(
    `/android-logs?from=${from}&to=${to}&appID=${appID}`,
  );

  return data;
};
