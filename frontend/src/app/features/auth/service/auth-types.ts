export type User = {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
};

export type RegisterUserPayload = {
  nome: string;
  email: string;
  senha: string;
};

export type LoginPayload = {
  email: string;
  senha: string;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: string;
  user: User;
};
