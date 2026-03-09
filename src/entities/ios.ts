export interface IosApp {
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

export interface IosAppListResponse {
  success: boolean;
  apps: IosApp[];
  total: number;
}

export interface IosAppListParams {
  isLive?: boolean | string;
  distributor?: string;
  appName?: string;
  appCode?: string;
  storeId?: string;
}