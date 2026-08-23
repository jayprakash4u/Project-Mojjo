import { ApiClient } from '../apiClient';
import { ENDPOINTS } from '../endpoints';
import {
  AuthResultDto,
  PhoneLoginOtpRequest,
  SendOtpRequest,
  SendOtpResponse,
  UserProfileDto,
} from '../../types/auth';

export class AuthApi {
  static async sendOtp(request: SendOtpRequest): Promise<SendOtpResponse> {
    return await ApiClient.post<SendOtpResponse>(ENDPOINTS.AUTH.SEND_OTP, request);
  }

  static async verifyOtp(request: PhoneLoginOtpRequest): Promise<AuthResultDto> {
    return await ApiClient.post<AuthResultDto>(
      ENDPOINTS.AUTH.VERIFY_OTP,
      request
    );
  }

  static async getMe(): Promise<UserProfileDto> {
    return await ApiClient.get<UserProfileDto>(ENDPOINTS.AUTH.ME);
  }

  static async logout(): Promise<void> {
    try {
      await ApiClient.post<void>(ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Best effort logout
    }
  }
}
