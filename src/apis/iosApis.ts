import { api } from '@/lib/axios';
import { IosAppListParams, IosAppListResponse } from "@/entities/ios";

export const getIosAppList = async (
  params?: IosAppListParams,
): Promise<IosAppListResponse> => {
  // This assumes the backend exposes an iOS apps endpoint similar to /android-apps.
  // Update this path if your actual iOS apps API differs.
  const data = await api.get<IosAppListResponse>('/apps', {
    params,
  });
  return data;
};

export const getStatisticsIosApp = async (payload: any) => {
  const { from, to, appID } = payload;
  try {
    const data = await api.get('/logs', {
      params: { from, to, appID },
      timeout: 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return data;
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        message: 'Request timeout. Please try again with a smaller date range.',
      };
    }
    return { success: false, message: error.message || 'Unknown error' };
  }
};

