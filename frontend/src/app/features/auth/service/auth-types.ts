export type User = {
  id: number;
  nome: string;
  sobrenome: string;
  email: string;
  ativo: boolean;
};

export type RegisterUserPayload = {
  nome: string;
  sobrenome: string;
  idade: number;
  cep: string;
  endereco: string;
  numeroResidencia: number;
  email: string;
  cpf: string;
  senha: string;
  aceitouTermos: boolean;
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


export type VerifyEmailPayload = {
  email: string;
  code: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  email: string;
  resetToken: string;
  novaSenha: string;
};