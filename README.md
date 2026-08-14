# 🦕 Login Personalizado com Amazon Cognito

## Visão Geral

Este é o **Projeto 1** de uma série de laboratórios AWS. A aplicação implementa um sistema de login totalmente customizado utilizando Amazon Cognito, sem depender da Hosted UI ou Managed Login.

**Stack tecnológica:**

- **Frontend:** React + TypeScript com Vite
- **Backend:** AWS Lambda (Node.js + TypeScript)
- **API:** API Gateway REST API com Cognito User Pool Authorizer
- **Autenticação:** Amazon Cognito User Pool via AWS Amplify Auth
- **Hospedagem:** S3 privado + CloudFront (HTTPS)

**Funcionalidades:**

- Registro de usuário com confirmação por email
- Login com email e senha
- Recuperação de senha
- Gerenciamento de perfil (nome, apelido, senha)
- Área autenticada com rotas protegidas
- Mensagens de erro em português brasileiro

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- npm 9+
- Conta AWS com acesso ao Console
- Cognito User Pool configurado (veja [IMPLANTACAO-AWS.md](./IMPLANTACAO-AWS.md))

## Instalação

```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

## Execução Local

```bash
# Copiar variáveis de ambiente
cp .env.example .env
# Editar .env com valores reais do Cognito

# Iniciar frontend (porta padrão: 5173)
npm run dev

# Build do backend (para deploy na Lambda)
cd backend
npm run build
```

> **Nota:** O backend é executado como função Lambda na AWS. Para desenvolvimento local, utilize o frontend apontando para a API Gateway já implantada.

## Estrutura de Diretórios

```
├── src/                        # Código-fonte do frontend
│   ├── assets/                 # Imagens e recursos estáticos
│   ├── components/             # Componentes reutilizáveis
│   │   ├── ErrorMessage/       # Exibição de mensagens de erro
│   │   ├── LoadingSpinner/     # Indicador de carregamento
│   │   ├── PasswordInput/      # Input de senha com toggle de visibilidade
│   │   ├── PrivateRoute/       # Proteção de rotas autenticadas
│   │   └── PublicRoute/        # Redirecionamento de rotas públicas
│   ├── contexts/               # Context API (AuthContext)
│   ├── hooks/                  # Hooks customizados (useAuth, useForm)
│   ├── pages/                  # Páginas da aplicação
│   │   ├── HomePage/           # Página inicial
│   │   ├── LoginPage/          # Login
│   │   ├── RegisterPage/       # Registro
│   │   ├── ConfirmEmailPage/   # Confirmação de email
│   │   ├── ForgotPasswordPage/ # Recuperação de senha
│   │   ├── DashboardPage/      # Área autenticada
│   │   └── ProfilePage/        # Perfil do usuário
│   ├── routes/                 # Configuração de rotas (React Router)
│   ├── services/               # Serviços (AuthService, ApiService)
│   ├── styles/                 # Estilos globais e variáveis CSS
│   ├── types/                  # Interfaces e tipos TypeScript
│   └── utils/                  # Utilitários (validação, mapeamento de erros)
├── backend/                    # Código-fonte do backend (Lambda)
│   ├── src/
│   │   ├── index.ts            # Handler principal da Lambda
│   │   ├── routes/             # Handlers de cada rota (health, me, gameStatus)
│   │   ├── types/              # Tipos do backend
│   │   └── utils/              # Utilitários (CORS, response, logger)
│   ├── package.json
│   └── tsconfig.json
├── public/                     # Arquivos públicos do Vite
├── .env.example                # Template de variáveis de ambiente
├── index.html                  # HTML principal do Vite
├── package.json                # Dependências do frontend
├── vite.config.ts              # Configuração do Vite
└── tsconfig.json               # Configuração do TypeScript
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_AWS_REGION` | Região AWS do Cognito User Pool | `us-east-1` |
| `VITE_COGNITO_USER_POOL_ID` | ID do Cognito User Pool | `us-east-1_XXXXXXXXX` |
| `VITE_COGNITO_USER_POOL_CLIENT_ID` | ID do App Client (sem secret) | `xxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `VITE_API_URL` | URL base da API Gateway (stage dev) | `https://xxx.execute-api.us-east-1.amazonaws.com/dev` |

> ⚠️ **Importante:** Nunca cometa o arquivo `.env` com valores reais no repositório. Ele já está incluído no `.gitignore`.

## Testes

```bash
# Testes do frontend (unit + property-based)
npm test

# Testes do backend
cd backend
npm test
```

Os testes utilizam [Vitest](https://vitest.dev/) como framework e [fast-check](https://fast-check.dev/) para property-based testing.

## Documentação Adicional

- [ARQUITETURA.md](./ARQUITETURA.md) — Arquitetura da aplicação, componentes, fluxo de autenticação e diagramas
- [IMPLANTACAO-AWS.md](./IMPLANTACAO-AWS.md) — Guia passo a passo para configuração manual dos serviços AWS (Cognito, Lambda, API Gateway, S3, CloudFront)
