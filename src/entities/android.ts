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

export type StatisticsAndroidAppResponse = {
  success: boolean;
  message?: string;
  data: Data[];
  summary: Summary[];
  subDetail: SubDetail[];
  statistic: Statistic[];
};

export type Summary = {
  total: number;
  countryOrRegion: string;
  mini?: number;
  weekly?: number;
  monthly?: number;
  yearly?: number;
  'mini-coin-pack'?: number;
  'large-coin-pack'?: number;
  'one-time'?: number;
};

export type SubDetail = {
  appID: string;
  appIcon: string;
  appName: string;
  purchase: string;
  count: number;
};

export type Data = {
  _id: string;
  appID: string;
  appName: string;
  appIcon: string;
  appUrl: string;
  isLive?: boolean;
  storeId?: string;
  appCode?: string;
  distributor?: string;
  createdAt?: string;
  updatedAt?: string;
  ip?: string;
};

export type Statistic = {
  appID: string;
  appName: string;
  appCode: string;
  appIcon: string;
  appUrl: string;
  count: number;
  distributor: string;
};
