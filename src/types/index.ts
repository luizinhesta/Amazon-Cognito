export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
}

export interface UserProfile {
  userId: string;       // sub do Cognito
  email: string;
  name: string;
  preferredUsername: string;  // apelido
  emailVerified: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (data: RegisterData) => Promise<void>;
  confirmEmail: (email: string, code: string) => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (attributes: Partial<ProfileAttributes>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export type LoginResult =
  | { status: 'success' }
  | { status: 'confirmSignUp'; email: string };

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  preferredUsername: string;
}

export interface ProfileAttributes {
  name: string;
  preferredUsername: string;
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage: string | null;  // Mensagem em PT-BR
}

export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;  // 10000ms
  getToken: () => Promise<string | null>;
}
