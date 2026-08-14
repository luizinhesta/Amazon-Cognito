# Implementation Plan: Login Personalizado Cognito

## Overview

Implementação de uma aplicação web com login customizado utilizando Amazon Cognito. A implementação segue uma abordagem incremental: configuração do projeto → utilitários e serviços base → backend Lambda → frontend (componentes, páginas, rotas) → integração e testes. TypeScript é utilizado em todas as camadas.

## Tasks

- [x] 1. Configuração do projeto e interfaces base
  - [x] 1.1 Inicializar projeto frontend com Vite + React + TypeScript
    - Criar projeto com `npm create vite@latest` usando template react-ts
    - Instalar dependências: `aws-amplify`, `react-router-dom`, `fast-check` (dev)
    - Configurar `vitest` e `@testing-library/react` para testes
    - Criar `.env.example` com variáveis VITE_AWS_REGION, VITE_COGNITO_USER_POOL_ID, VITE_COGNITO_USER_POOL_CLIENT_ID, VITE_API_URL
    - Criar `.gitignore` excluindo node_modules, .env, dist
    - Criar estrutura de diretórios: components/, pages/, routes/, services/, contexts/, hooks/, utils/, styles/, assets/
    - _Requirements: 16.1, 16.3, 16.4_

  - [x] 1.2 Inicializar projeto backend com Node.js + TypeScript
    - Criar diretório `backend/` com package.json e tsconfig.json
    - Instalar dependências: `@types/aws-lambda`, `vitest`, `fast-check` (dev)
    - Criar estrutura: src/index.ts, src/routes/, src/utils/, src/types/
    - _Requirements: 16.2, 13.1_

  - [x] 1.3 Definir tipos e interfaces compartilhadas do frontend
    - Criar interfaces AuthState, UserProfile, AuthContextValue, LoginResult, RegisterData, ProfileAttributes em `src/types/`
    - Criar interfaces ValidationResult, ApiResponse, ApiConfig
    - _Requirements: 7.1, 9.4_

  - [x] 1.4 Definir tipos do backend
    - Criar tipos LambdaResponse em `backend/src/types/index.ts`
    - Definir interfaces para respostas de cada endpoint
    - _Requirements: 13.2, 9.9_

- [x] 2. Implementar utilitários de validação e mapeamento de erros
  - [x] 2.1 Implementar funções de validação em `src/utils/validators.ts`
    - Implementar `validateEmail`: verificar formato com @ e domínio válido
    - Implementar `validatePassword`: mínimo 8 chars, maiúscula, minúscula, número, caractere especial
    - Implementar `validatePasswordMatch`: comparação byte-a-byte
    - Implementar `validateName`: não vazio, máximo 128 caracteres
    - Implementar `validatePreferredUsername`: não vazio, máximo 64 caracteres
    - Implementar `validateConfirmationCode`: exatamente 6 dígitos numéricos
    - Todas as mensagens de erro em português brasileiro
    - _Requirements: 2.5, 3.1, 3.4, 3.5, 3.8, 5.7, 5.8_

  - [x]* 2.2 Escrever property tests para validação de email
    - **Property 1: Email Validation Correctness**
    - **Validates: Requirements 2.5, 3.8**

  - [x]* 2.3 Escrever property tests para validação de match de senha
    - **Property 2: Password Match Validation**
    - **Validates: Requirements 3.4, 5.8**

  - [x]* 2.4 Escrever property tests para validação de complexidade de senha
    - **Property 3: Password Complexity Validation**
    - **Validates: Requirements 3.5, 5.7, 17.7**

  - [x]* 2.5 Escrever property tests para validação de comprimento de campos
    - **Property 4: Field Length Validation**
    - **Validates: Requirements 7.3, 7.5**

  - [x] 2.6 Implementar mapeamento de erros em `src/utils/errorMapper.ts`
    - Implementar `mapCognitoError`: mapear códigos Cognito para mensagens PT-BR
    - Implementar `mapApiError`: mapear status HTTP para mensagens PT-BR
    - Garantir que NotAuthorizedException e UserNotFoundException retornam mesma mensagem (segurança)
    - _Requirements: 15.1, 15.6_

  - [x]* 2.7 Escrever property tests para mapeamento de erros Cognito
    - **Property 12: Cognito Error Mapping Completeness**
    - **Validates: Requirements 15.1, 15.6**

- [x] 3. Implementar backend Lambda
  - [x] 3.1 Implementar utilitário CORS em `backend/src/utils/cors.ts`
    - Definir lista de origens permitidas (localhost:5173 + variável de ambiente para CloudFront)
    - Implementar `getCorsHeaders`: retornar headers CORS se origem válida
    - Implementar `isOriginAllowed`: validar origem contra lista permitida
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [x]* 3.2 Escrever property tests para validação CORS
    - **Property 10: CORS Origin Validation**
    - **Validates: Requirements 10.7, 13.8**

  - [x] 3.3 Implementar helper de respostas em `backend/src/utils/response.ts`
    - Implementar `buildResponse`: construir resposta Lambda Proxy com statusCode, headers (Content-Type + CORS) e body JSON
    - Implementar `buildErrorResponse`: resposta de erro com mensagem genérica
    - _Requirements: 13.2, 9.9_

  - [x] 3.4 Implementar utilitário de log seguro em `backend/src/utils/logger.ts`
    - Implementar função de sanitização que mascara dados sensíveis mostrando máximo 4 últimos caracteres
    - _Requirements: 14.3_

  - [x]* 3.5 Escrever property tests para mascaramento de dados sensíveis
    - **Property 11: Sensitive Data Masking**
    - **Validates: Requirements 14.3**

  - [x] 3.6 Implementar rotas da Lambda
    - Implementar `GET /health` em `backend/src/routes/health.ts`: retornar status ok
    - Implementar `GET /me` em `backend/src/routes/me.ts`: extrair claims do evento e retornar dados do usuário
    - Implementar `GET /game/status` em `backend/src/routes/gameStatus.ts`: retornar mensagem de projeto 2
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 13.3, 13.4, 13.5, 13.9_

  - [x] 3.7 Implementar handler principal em `backend/src/index.ts`
    - Rotear requisições com base em httpMethod + path
    - Tratar rotas não encontradas com 404
    - Implementar try/catch global retornando 500 com mensagem genérica
    - Log seguro de erros (sem stack traces, dados sensíveis)
    - _Requirements: 13.2, 13.6, 15.5_

  - [x]* 3.8 Escrever property tests para extração de claims da Lambda
    - **Property 7: Lambda Claim Extraction and Mapping**
    - **Validates: Requirements 9.4, 13.4**

  - [x]* 3.9 Escrever property tests para formato de resposta da Lambda
    - **Property 8: Lambda Response Format Invariant**
    - **Validates: Requirements 13.2, 9.9**

  - [x]* 3.10 Escrever property tests para rota desconhecida retornar 404
    - **Property 9: Lambda Unknown Route Returns 404**
    - **Validates: Requirements 13.6**

  - [x]* 3.11 Escrever property tests para segurança do error handler
    - **Property 13: Lambda Error Handler Safety**
    - **Validates: Requirements 15.5**

- [x] 4. Checkpoint - Validar backend
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implementar serviços e contexto de autenticação do frontend
  - [x] 5.1 Configurar Amplify Auth em `src/main.tsx`
    - Importar e configurar Amplify com userPoolId e userPoolClientId das variáveis de ambiente
    - _Requirements: 14.1, 14.2, 14.8, 17.5_

  - [x] 5.2 Implementar AuthService em `src/services/authService.ts`
    - Wrapper sobre Amplify Auth: signIn, signUp, confirmSignUp, resendSignUpCode, resetPassword, confirmResetPassword, changePassword, updateUserAttributes, getCurrentUser, signOut, getIdToken
    - _Requirements: 2.3, 3.2, 4.2, 4.7, 5.2, 5.4, 6.6, 7.3, 7.5, 7.7_

  - [x] 5.3 Implementar ApiService em `src/services/apiService.ts`
    - Cliente HTTP com baseUrl da variável de ambiente, timeout de 10s
    - Injetar token JWT no header Authorization automaticamente
    - Tratamento de erros HTTP (401 → sessão expirada, timeout, network error)
    - _Requirements: 9.4, 15.2, 15.4_

  - [x] 5.4 Implementar AuthContext e Provider em `src/contexts/AuthContext.tsx`
    - Criar contexto com estado (isAuthenticated, isLoading, user)
    - Implementar reducer para gerenciar transições de estado
    - Expor métodos: login, register, confirmEmail, resendConfirmationCode, forgotPassword, resetPassword, changePassword, updateProfile, logout, refreshUser
    - Verificar sessão existente ao montar o Provider
    - _Requirements: 8.4, 8.5_

  - [x] 5.5 Implementar hook useAuth em `src/hooks/useAuth.ts`
    - Hook para consumir AuthContext com validação de existência do Provider
    - _Requirements: 8.4_

  - [x] 5.6 Implementar hook useForm em `src/hooks/useForm.ts`
    - Hook genérico de formulário com validação, estado de loading e gerenciamento de erros
    - _Requirements: 2.8, 3.7, 4.8, 5.9_

- [x] 6. Implementar componentes reutilizáveis
  - [x] 6.1 Implementar LoadingSpinner em `src/components/LoadingSpinner/`
    - Componente de indicador de carregamento reutilizável com CSS Module
    - _Requirements: 2.8, 3.7, 4.8, 5.9, 8.5_

  - [x] 6.2 Implementar PasswordInput em `src/components/PasswordInput/`
    - Input de senha com botão toggle de visibilidade (mostrar/ocultar)
    - _Requirements: 2.2_

  - [x] 6.3 Implementar ErrorMessage em `src/components/ErrorMessage/`
    - Componente de exibição padronizada de mensagens de erro
    - _Requirements: 15.1_

  - [x] 6.4 Implementar PrivateRoute em `src/components/PrivateRoute/`
    - Verificar isAuthenticated do AuthContext
    - Se isLoading → renderizar LoadingSpinner
    - Se !isAuthenticated → redirecionar para /login
    - Se isAuthenticated → renderizar children
    - _Requirements: 8.1, 8.2, 8.4, 8.5_

  - [x] 6.5 Implementar PublicRoute em `src/components/PublicRoute/`
    - Se isAuthenticated → redirecionar para /dashboard
    - Caso contrário → renderizar children
    - _Requirements: 8.6_

  - [x]* 6.6 Escrever property tests para PrivateRoute
    - **Property 5: Private Route Access Control**
    - **Validates: Requirements 8.1, 8.2**

  - [x]* 6.7 Escrever property tests para PublicRoute
    - **Property 6: Public Route Redirect for Authenticated Users**
    - **Validates: Requirements 8.6**

- [x] 7. Implementar páginas da aplicação
  - [x] 7.1 Implementar HomePage em `src/pages/HomePage/`
    - Página inicial com tema dinossauro
    - Botões "Entrar" (navega para /login) e "Criar conta" (navega para /register)
    - Layout responsivo (320px a 1920px)
    - Se autenticado, redirecionar para /dashboard
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 7.2 Implementar LoginPage em `src/pages/LoginPage/`
    - Campos de email e senha (com PasswordInput)
    - Validação de email antes de submeter
    - Indicador de loading durante autenticação
    - Tratamento de UserNotConfirmedException (redirecionar para confirmação)
    - Links "Esqueci minha senha" e "Criar conta"
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

  - [x] 7.3 Implementar RegisterPage em `src/pages/RegisterPage/`
    - Campos: nome (max 128), apelido (max 64), email, senha, confirmação de senha
    - Validações: email, match de senhas, complexidade de senha
    - Indicador de loading, tratamento de erros (email já existe)
    - Link "Já tenho conta" para /login
    - Redirecionar para confirmação após sucesso
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

  - [x] 7.4 Implementar ConfirmEmailPage em `src/pages/ConfirmEmailPage/`
    - Exibir email do usuário, campo para código de 6 dígitos
    - Botão de confirmação e botão "Reenviar código"
    - Tratamento de erros: código inválido, código expirado
    - Indicador de loading, redirecionar para login após sucesso
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [x] 7.5 Implementar ForgotPasswordPage em `src/pages/ForgotPasswordPage/`
    - Etapa 1: campo de email + botão solicitar código
    - Etapa 2: campos código, nova senha, confirmação de senha
    - Validações de senha e match
    - Tratamento de erros (código incorreto/expirado, email não encontrado com mensagem genérica)
    - Redirecionar para login após sucesso
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10_

  - [x] 7.6 Implementar DashboardPage em `src/pages/DashboardPage/`
    - Exibir nome, apelido e email do usuário
    - Botões: "Meu perfil", "Jogar" (mensagem projeto 2), "Ranking" (mensagem projeto 2), "Sair"
    - Logout com tratamento de erro
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

  - [x] 7.7 Implementar ProfilePage em `src/pages/ProfilePage/`
    - Exibir atributos do usuário (nome, apelido, email, status verificação)
    - Edição de nome e apelido com validação
    - Alteração de senha (senha atual, nova senha, confirmação)
    - Tratamento de erros e mensagens de sucesso
    - Botões "Voltar" e "Sair"
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11, 7.12_

- [x] 8. Configurar rotas e integração
  - [x] 8.1 Implementar AppRouter em `src/routes/AppRouter.tsx`
    - Configurar React Router v6 com todas as rotas
    - Rotas públicas (com PublicRoute): /, /login, /register, /forgot-password
    - Rota pública sem redirect: /confirm-email
    - Rotas privadas (com PrivateRoute): /dashboard, /profile
    - _Requirements: 8.1, 8.2, 8.6_

  - [x] 8.2 Implementar App.tsx e integrar tudo
    - Montar AuthProvider envolvendo AppRouter
    - Importar estilos globais
    - _Requirements: 16.1_

- [x] 9. Checkpoint - Validar aplicação completa
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Criar documentação do projeto
  - [x] 10.1 Criar README.md em português
    - Visão geral do projeto, pré-requisitos, instalação, execução local, estrutura de diretórios, variáveis de ambiente
    - _Requirements: 16.5_

  - [x] 10.2 Criar ARQUITETURA.md em português
    - Explicação dos componentes, fluxo de autenticação, diagrama Mermaid
    - _Requirements: 16.6_

  - [x] 10.3 Criar IMPLANTACAO-AWS.md em português
    - Guia de configuração manual: Cognito User Pool, Lambda, API Gateway com Authorizer, S3, CloudFront
    - Incluir configuração opcional de domínio customizado
    - _Requirements: 16.7, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 12.1, 12.2, 12.3, 12.4, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8_

  - [x] 10.4 Criar estilos globais em `src/styles/global.css`
    - Variáveis CSS, reset básico, estilos do tema dinossauro
    - _Requirements: 1.1, 1.6_

- [x] 11. Final checkpoint - Validar projeto completo
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- A infraestrutura AWS (Cognito, API Gateway, Lambda, S3, CloudFront) é configurada manualmente via Console AWS conforme documentado em IMPLANTACAO-AWS.md
- O backend é uma Lambda monolítica que roteia todas as requisições

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4"] },
    { "id": 2, "tasks": ["2.1", "2.6", "3.1", "3.3", "3.4"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.7", "3.2", "3.5", "3.6"] },
    { "id": 4, "tasks": ["3.7"] },
    { "id": 5, "tasks": ["3.8", "3.9", "3.10", "3.11"] },
    { "id": 6, "tasks": ["5.1", "5.2", "5.3"] },
    { "id": 7, "tasks": ["5.4"] },
    { "id": 8, "tasks": ["5.5", "5.6"] },
    { "id": 9, "tasks": ["6.1", "6.2", "6.3", "6.4", "6.5", "10.4"] },
    { "id": 10, "tasks": ["6.6", "6.7", "7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7"] },
    { "id": 11, "tasks": ["8.1"] },
    { "id": 12, "tasks": ["8.2"] },
    { "id": 13, "tasks": ["10.1", "10.2", "10.3"] }
  ]
}
```
