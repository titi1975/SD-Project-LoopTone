import { httpAdapter } from "../../../infra/adapters/http/HttpAdapter";
import type { 
  AuthResponse, 
  LoginPayload, 
  RegisterUserPayload, 
  User,
  VerifyEmailPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload
} from "./auth-types";

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await httpAdapter.post<AuthResponse, LoginPayload>("/api/auth/login", payload);
    return response.data;
  },

  async register(payload: RegisterUserPayload): Promise<User> {
    const response = await httpAdapter.post<User, RegisterUserPayload>("/api/users/", payload);
    return response.data;
  },

  // NOVOS ENDPOINTS DE INTEGRAÇÃO
  async verifyEmail(payload: VerifyEmailPayload): Promise<{ message: string }> {
    const response = await httpAdapter.post<{ message: string }, VerifyEmailPayload>("/api/auth/verify-email", payload);
    return response.data;
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string }> {
    const response = await httpAdapter.post<{ message: string }, ForgotPasswordPayload>("/api/auth/forgot-password", payload);
    return response.data;
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
    const response = await httpAdapter.post<{ message: string }, ResetPasswordPayload>("/api/auth/reset-password", payload);
    return response.data;
  }
};