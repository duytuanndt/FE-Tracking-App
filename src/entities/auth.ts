export interface RefreshTokenResponse {
  access_token?: string;
  refresh_token?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  profilePicture: string;
  role: string;
  id: string;
}
