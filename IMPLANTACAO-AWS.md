# Guia de Implantação AWS

Guia passo a passo para configuração manual dos serviços AWS necessários para a aplicação de login customizado com Cognito.

## Pré-requisitos

- Conta AWS ativa com permissões de administrador (ou permissões para criar recursos em Cognito, Lambda, API Gateway, S3, CloudFront, IAM)
- Familiaridade básica com o Console AWS
- Node.js 20.x instalado localmente (para build do projeto)
- AWS CLI configurada (opcional, para upload via terminal)

---

## Etapa 1: Criar Cognito User Pool

1. Acesse o Console AWS e navegue para **Amazon Cognito** na região **us-east-1** (N. Virginia)
2. Clique em **Create user pool**

### Configurar experiência de login

3. Em **Authentication providers**, selecione **Cognito user pool**
4. Em **Cognito user pool sign-in options**, marque **Email**
5. Clique em **Next**

### Configurar requisitos de segurança

6. Em **Password policy**, selecione **Custom** e configure:
   - Comprimento mínimo da senha: **8**
   - Marque: **Contains at least 1 uppercase letter**
   - Marque: **Contains at least 1 lowercase letter**
   - Marque: **Contains at least 1 number**
   - Marque: **Contains at least 1 special character**
7. Em **Multi-factor authentication**, selecione **No MFA**
8. Clique em **Next**

### Configurar experiência de registro

9. Em **Self-service sign-up**, marque **Enable self-registration**
10. Em **Attribute verification and user account confirmation**:
    - Selecione **Send email message, verify email address**
    - Em **Verifying attribute changes**, marque **Keep original attribute value active when an update is pending - Email**
11. Em **Required attributes**, adicione os seguintes atributos obrigatórios:
    - **name**
    - **email** (já selecionado por padrão)
    - **preferred_username**
12. Clique em **Next**

### Configurar entrega de mensagens

13. Em **Email provider**, selecione **Send email with Cognito** (para desenvolvimento)
14. Clique em **Next**

### Integrar a aplicação

15. Em **User pool name**, insira um nome descritivo (ex: `login-customizado-pool`)
16. Em **App client name**, insira um nome (ex: `login-customizado-app`)
17. Em **Client secret**, selecione **Don't generate a client secret**
18. Expanda **Advanced app client settings** e em **Authentication flows**, marque:
    - **ALLOW_USER_SRP_AUTH**
    - **ALLOW_REFRESH_TOKEN_AUTH**
19. Clique em **Next**

### Revisar e criar

20. Revise todas as configurações e clique em **Create user pool**

### Informações importantes para anotar

Após a criação, anote os seguintes valores (serão usados nas variáveis de ambiente):

- **User Pool ID** (formato: `us-east-1_XXXXXXXXX`) — visível na página de detalhes do User Pool
- **App Client ID** (formato: `xxxxxxxxxxxxxxxxxxxxxxxxxx`) — em **App integration** > **App clients and analytics**

---

## Etapa 2: Criar Função Lambda

### Preparar o código

1. No diretório `backend/` do projeto, execute:
   ```bash
   npm install
   npm run build
   ```
2. Crie um arquivo ZIP com o conteúdo da pasta `dist/`:
   ```bash
   cd dist
   zip -r ../lambda-function.zip .
   cd ..
   ```
   No Windows (PowerShell):
   ```powershell
   Compress-Archive -Path dist\* -DestinationPath lambda-function.zip
   ```

### Criar a função no Console AWS

3. Navegue para **AWS Lambda** na região **us-east-1**
4. Clique em **Create function**
5. Selecione **Author from scratch**
6. Configure:
   - **Function name**: `login-customizado-api`
   - **Runtime**: **Node.js 20.x**
   - **Architecture**: x86_64
7. Em **Permissions**, mantenha **Create a new role with basic Lambda permissions**
8. Clique em **Create function**

### Fazer upload do código

9. Na página da função, em **Code source**, clique em **Upload from** > **.zip file**
10. Faça upload do arquivo `lambda-function.zip` criado anteriormente
11. Clique em **Save**

### Configurar handler

12. Em **Runtime settings**, clique em **Edit**
13. Altere o **Handler** para: `index.handler`
14. Clique em **Save**

### Configurar variáveis de ambiente

15. Vá para a aba **Configuration** > **Environment variables**
16. Clique em **Edit** e adicione:
    - **Key**: `ALLOWED_ORIGINS`
    - **Value**: `http://localhost:5173` (adicione a URL do CloudFront após criá-lo, separada por vírgula)
17. Clique em **Save**

### Configurar timeout (opcional)

18. Em **Configuration** > **General configuration**, clique em **Edit**
19. Ajuste o **Timeout** para **10 segundos** (suficiente para a aplicação)
20. Clique em **Save**

---

## Etapa 3: Configurar API Gateway

### Criar a API

1. Navegue para **API Gateway** na região **us-east-1**
2. Clique em **Create API**
3. Em **REST API**, clique em **Build**
4. Configure:
   - **API name**: `login-customizado-api`
   - **API endpoint type**: **Regional**
5. Clique em **Create API**

### Criar Authorizer do Cognito

6. No menu lateral, clique em **Authorizers**
7. Clique em **Create authorizer**
8. Configure:
   - **Authorizer name**: `CognitoAuthorizer`
   - **Authorizer type**: **Cognito**
   - **Cognito user pool**: selecione o User Pool criado na Etapa 1
   - **Token source**: `Authorization`
9. Clique em **Create authorizer**

### Criar recurso /health

10. No menu lateral, clique em **Resources**
11. Clique em **Create resource**
12. Em **Resource path**, mantenha `/` e em **Resource name**, insira `health`
13. Marque **Enable API Gateway CORS**
14. Clique em **Create resource**

### Criar método GET para /health

15. Com o recurso `/health` selecionado, clique em **Create method**
16. Configure:
    - **Method type**: **GET**
    - **Integration type**: **Lambda function**
    - Marque **Lambda proxy integration**
    - **Lambda function**: selecione `login-customizado-api`
17. Clique em **Create method**

### Criar recurso /me

18. Volte para o recurso raiz `/` e clique em **Create resource**
19. Em **Resource name**, insira `me`
20. Marque **Enable API Gateway CORS**
21. Clique em **Create resource**

### Criar método GET para /me (com Authorizer)

22. Com o recurso `/me` selecionado, clique em **Create method**
23. Configure:
    - **Method type**: **GET**
    - **Integration type**: **Lambda function**
    - Marque **Lambda proxy integration**
    - **Lambda function**: selecione `login-customizado-api`
24. Em **Method request settings**:
    - **Authorization**: selecione **CognitoAuthorizer**
25. Clique em **Create method**

### Criar recurso /game

26. Volte para o recurso raiz `/` e clique em **Create resource**
27. Em **Resource name**, insira `game`
28. Clique em **Create resource**

### Criar recurso /game/status

29. Com o recurso `/game` selecionado, clique em **Create resource**
30. Em **Resource name**, insira `status`
31. Marque **Enable API Gateway CORS**
32. Clique em **Create resource**

### Criar método GET para /game/status (com Authorizer)

33. Com o recurso `/game/status` selecionado, clique em **Create method**
34. Configure:
    - **Method type**: **GET**
    - **Integration type**: **Lambda function**
    - Marque **Lambda proxy integration**
    - **Lambda function**: selecione `login-customizado-api`
35. Em **Method request settings**:
    - **Authorization**: selecione **CognitoAuthorizer**
36. Clique em **Create method**

### Habilitar CORS

> **Nota:** Se você marcou "Enable API Gateway CORS" ao criar os recursos, os métodos OPTIONS já foram criados automaticamente. Caso contrário, siga os passos abaixo para cada recurso.

37. Para cada recurso (`/health`, `/me`, `/game/status`), caso o CORS não tenha sido configurado automaticamente:
    - Selecione o recurso
    - Clique em **Enable CORS**
    - Em **Access-Control-Allow-Headers**: `Authorization,Content-Type`
    - Em **Access-Control-Allow-Methods**: `GET,OPTIONS`
    - Em **Access-Control-Allow-Origin**: `*` (a Lambda gerencia origens específicas)
    - Clique em **Save**

### Deploy da API

38. Clique em **Deploy API**
39. Em **Stage**, selecione **New stage**
40. Em **Stage name**, insira `dev`
41. Clique em **Deploy**

### Anotar URL da API

42. Após o deploy, anote a **Invoke URL** exibida (formato: `https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev`)
    - Esta URL será usada na variável de ambiente `VITE_API_URL` do frontend

---

## Etapa 4: Criar Bucket S3

### Criar o bucket

1. Navegue para **Amazon S3**
2. Clique em **Create bucket**
3. Configure:
   - **Bucket name**: nome único (ex: `login-customizado-frontend-<SEU-ID>`)
   - **AWS Region**: **us-east-1**
4. Em **Block Public Access settings for this bucket**:
   - Marque **Block all public access** (mantenha todas as opções marcadas)
5. Mantenha as demais configurações padrão
6. Clique em **Create bucket**

> **Importante:** O bucket deve permanecer privado. O acesso público é feito exclusivamente via CloudFront com Origin Access Control.

---

## Etapa 5: Configurar CloudFront

### Criar distribuição

1. Navegue para **Amazon CloudFront**
2. Clique em **Create distribution**

### Configurar origem

3. Em **Origin domain**, selecione o bucket S3 criado na Etapa 4
4. Em **Origin access**:
   - Selecione **Origin access control settings (recommended)**
   - Clique em **Create new OAC**
   - Mantenha as configurações padrão e clique em **Create**

### Configurar comportamento padrão

5. Em **Viewer protocol policy**, selecione **Redirect HTTP to HTTPS**
6. Em **Allowed HTTP methods**, selecione **GET, HEAD**
7. Em **Cache policy**, selecione **CachingOptimized** (ou mantenha o padrão)

### Configurações gerais

8. Em **Default root object**, insira `index.html`
9. Mantenha as demais configurações padrão
10. Clique em **Create distribution**

### Atualizar Bucket Policy do S3

11. Após criar a distribuição, o CloudFront exibirá um banner informando que é necessário atualizar a bucket policy. Clique em **Copy policy**
12. Navegue para o bucket S3 > aba **Permissions** > **Bucket policy**
13. Clique em **Edit** e cole a policy copiada. Ela terá o seguinte formato:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowCloudFrontServicePrincipal",
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudfront.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::SEU-BUCKET-NAME/*",
            "Condition": {
                "StringEquals": {
                    "AWS:SourceArn": "arn:aws:cloudfront::SEU-ACCOUNT-ID:distribution/SEU-DISTRIBUTION-ID"
                }
            }
        }
    ]
}
```

14. Clique em **Save changes**

### Configurar Custom Error Responses (para SPA)

15. Na distribuição CloudFront, vá para a aba **Error pages**
16. Clique em **Create custom error response**
17. Configure para erro 403:
    - **HTTP error code**: 403
    - **Customize error response**: Yes
    - **Response page path**: `/index.html`
    - **HTTP response code**: 200
18. Clique em **Create custom error response**
19. Repita para erro 404:
    - **HTTP error code**: 404
    - **Customize error response**: Yes
    - **Response page path**: `/index.html`
    - **HTTP response code**: 200
20. Clique em **Create custom error response**

> **Nota:** Essas configurações permitem que o React Router funcione corretamente quando rotas são acessadas diretamente pela URL do navegador.

### Anotar URL do CloudFront

21. Aguarde o status da distribuição mudar para **Deployed** (pode levar alguns minutos)
22. Anote o **Distribution domain name** (formato: `https://dxxxxxxxxxx.cloudfront.net`)
    - Esta URL é onde a aplicação estará acessível

### Atualizar origens CORS da Lambda

23. Volte para a função Lambda (Etapa 2) e atualize a variável de ambiente `ALLOWED_ORIGINS`:
    ```
    http://localhost:5173,https://dxxxxxxxxxx.cloudfront.net
    ```

---

## Etapa 6 (Opcional): Domínio Customizado

Esta etapa é opcional. A aplicação funciona perfeitamente com a URL padrão do CloudFront.

### Solicitar certificado ACM

1. Navegue para **AWS Certificate Manager (ACM)** na região **us-east-1** (obrigatório para CloudFront)
2. Clique em **Request a certificate**
3. Selecione **Request a public certificate** e clique em **Next**
4. Em **Fully qualified domain name**, insira seu domínio (ex: `app.seudominio.com.br`)
5. Em **Validation method**, selecione **DNS validation**
6. Clique em **Request**
7. Na página do certificado, anote os registros CNAME para validação DNS
8. Adicione os registros CNAME no seu provedor de DNS (ou Route 53)
9. Aguarde o status mudar para **Issued** (pode levar até 30 minutos)

### Configurar domínio alternativo no CloudFront

10. Na distribuição CloudFront, clique em **Edit** nas configurações gerais
11. Em **Alternate domain name (CNAME)**, clique em **Add item** e insira seu domínio (ex: `app.seudominio.com.br`)
12. Em **Custom SSL certificate**, selecione o certificado ACM criado acima
13. Clique em **Save changes**

### Configurar registro DNS no Route 53

14. Navegue para **Route 53** > **Hosted zones**
15. Selecione a hosted zone do seu domínio
16. Clique em **Create record**
17. Configure:
    - **Record name**: subdomínio desejado (ex: `app`)
    - **Record type**: **A**
    - Marque **Alias**
    - **Route traffic to**: **Alias to CloudFront distribution**
    - Selecione a distribuição CloudFront
18. Clique em **Create records**

### Atualizar origens CORS

19. Atualize a variável de ambiente `ALLOWED_ORIGINS` da Lambda para incluir o domínio customizado:
    ```
    http://localhost:5173,https://dxxxxxxxxxx.cloudfront.net,https://app.seudominio.com.br
    ```

---

## Deploy do Frontend

### Build do projeto

1. Na raiz do projeto frontend, configure o arquivo `.env` com os valores reais:
   ```
   VITE_AWS_REGION=us-east-1
   VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
   VITE_COGNITO_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
   VITE_API_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev
   ```

2. Execute o build:
   ```bash
   npm install
   npm run build
   ```

### Upload para o S3

3. Via AWS CLI:
   ```bash
   aws s3 sync dist/ s3://SEU-BUCKET-NAME --delete
   ```

   Ou via Console AWS:
   - Navegue para o bucket S3
   - Clique em **Upload**
   - Arraste todo o conteúdo da pasta `dist/` (não a pasta em si, mas seu conteúdo)
   - Clique em **Upload**

### Invalidar cache do CloudFront

4. Após o upload, invalide o cache para que as alterações sejam refletidas imediatamente:

   Via AWS CLI:
   ```bash
   aws cloudfront create-invalidation --distribution-id SEU-DISTRIBUTION-ID --paths "/*"
   ```

   Ou via Console AWS:
   - Navegue para a distribuição CloudFront
   - Vá para a aba **Invalidations**
   - Clique em **Create invalidation**
   - Em **Object paths**, insira `/*`
   - Clique em **Create invalidation**

5. Aguarde a invalidação ser concluída (status **Completed**)

---

## Variáveis de Ambiente do Frontend

Crie um arquivo `.env` na raiz do projeto com os seguintes valores obtidos durante a configuração:

| Variável | Onde encontrar | Exemplo |
|----------|---------------|---------|
| `VITE_AWS_REGION` | Região do User Pool | `us-east-1` |
| `VITE_COGNITO_USER_POOL_ID` | Cognito > User Pool > User pool overview | `us-east-1_AbCdEfGhI` |
| `VITE_COGNITO_USER_POOL_CLIENT_ID` | Cognito > User Pool > App integration > App clients | `1a2b3c4d5e6f7g8h9i0j1k2l3m` |
| `VITE_API_URL` | API Gateway > Stages > dev > Invoke URL | `https://abc123def4.execute-api.us-east-1.amazonaws.com/dev` |

```env
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=us-east-1_AbCdEfGhI
VITE_COGNITO_USER_POOL_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m
VITE_API_URL=https://abc123def4.execute-api.us-east-1.amazonaws.com/dev
```

> **Segurança:** Nunca commite o arquivo `.env` com valores reais no repositório. Use o `.env.example` como referência com valores placeholder.

---

## Verificação Final

Após completar todas as etapas, verifique se a aplicação está funcionando:

1. Acesse a URL do CloudFront (ou domínio customizado) no navegador
2. A página inicial deve carregar corretamente
3. Teste o fluxo de registro:
   - Crie uma conta com email válido
   - Verifique o email com o código recebido
   - Faça login com as credenciais criadas
4. Na área autenticada, verifique se o nome e email aparecem corretamente
5. Teste o endpoint de health: acesse `<VITE_API_URL>/health` no navegador — deve retornar `{"status":"ok","message":"API funcionando corretamente"}`

### Troubleshooting

| Problema | Possível causa | Solução |
|----------|---------------|---------|
| Página em branco no CloudFront | Default root object não configurado | Verifique se `index.html` está definido como Default Root Object |
| Erro 403 ao acessar rota direta | Custom Error Response não configurado | Configure respostas para erros 403 e 404 conforme Etapa 5 |
| CORS error no console | Origem não adicionada na Lambda | Atualize `ALLOWED_ORIGINS` com a URL correta |
| 401 na API | Token expirado ou Authorizer mal configurado | Verifique Token source no Authorizer e faça login novamente |
| Certificado não validando | Registros CNAME não propagados | Aguarde propagação DNS (até 48h) ou verifique registros |
