export interface AndroidApp {
  _id: string;
  appID: string;
  appName: string;
  appIcon: string;
  appUrl: string;
  isLive: boolean;
  storeId: string;
  appCode: string;
  distributor: string;
}

export interface AndroidAppListResponse {
  success: boolean;
  apps: AndroidApp[];
  total: number;
}

export interface AndroidAppListParams {
  isLive?: boolean | string;
  distributor?: string;
  appName?: string;
  appCode?: string;
  storeId?: string;
}
