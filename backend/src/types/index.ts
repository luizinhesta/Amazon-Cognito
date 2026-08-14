// Shared types for the backend Lambda function

export interface LambdaResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export interface HealthResponse {
  status: string;
  message: string;
}

export interface MeResponse {
  autenticado: boolean;
  usuarioId: string;
  email: string;
  nome: string;
  apelido: string;
}

export interface GameStatusResponse {
  message: string;
}

export interface ErrorResponse {
  message: string;
}
