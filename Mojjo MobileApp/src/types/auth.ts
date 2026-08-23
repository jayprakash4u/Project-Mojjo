export type UserRole = 'Customer' | 'Courier' | 'Admin' | 'SuperAdmin';

export interface UserProfile {
  id: string;
  phoneNumber: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  role: UserRole;
  isPhoneVerified: boolean;
  rewardPoints: number;
  createdAt: string;
  defaultAddressId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface AuthSession {
  user: UserProfile | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface SendOtpRequest {
  phoneNumber: string;
}

export interface SendOtpResponse {
  phoneNumber: string;
  isNewUser: boolean;
  expiresInSeconds: number;
  demoOtp?: string;
}

export interface PhoneLoginOtpRequest {
  phoneNumber: string;
  otp: string;
  fullName?: string;
}

export interface UserProfileDto {
  id: string;
  fullName?: string;
  email?: string;
  phone: string;
  avatarUrl?: string;
  rewardCoinBalance: number;
  roles: string[];
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled?: boolean;
}

export interface AuthResultDto {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  user: UserProfileDto;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}
