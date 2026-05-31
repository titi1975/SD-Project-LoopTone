import { httpAdapter } from "../../../infra/adapters/http/HttpAdapter";
import type { AuthResponse, LoginPayload, RegisterUserPayload, User } from "./auth-types";

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await httpAdapter.post<AuthResponse, LoginPayload>("/api/auth/login", payload);
    return response.data;
  },

  async register(payload: RegisterUserPayload): Promise<User> {
    const response = await httpAdapter.post<User, RegisterUserPayload>("/api/users/", payload);
    return response.data;
  },
};
