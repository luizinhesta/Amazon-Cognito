# Guia de Implantação AWS

Guia passo a passo para configuração manual dos serviços AWS necessários para a aplicação de login customizado com Cognito.

## Pré-requisitos

- Conta AWS ativa com permissões de administrador (ou permissões para criar recursos em Cognito, Lambda, API Gateway, S3, CloudFront, IAM)
- Familiaridade básica com o Console AWS
- Node.js 20.x instalado localmente (para build do projeto)
- AWS CLI configurada (opcional, para upload via terminal)

---

## Etapa 1: Criar Cognito User Pool

1. Acesse o Console AWS e navegue para **Amazon Cognito** na região **us-east-1** (Leste dos EUA - Virgínia do Norte)
2. Clique em **Criar grupo de usuários**

### Configurar experiência de login

3. Em **Provedores de autenticação**, selecione **Grupo de usuários do Cognito**
4. Em **Opções de login do grupo de usuários do Cognito**, marque **E-mail**
5. Clique em **Próximo**

### Configurar requisitos de segurança

6. Em **Política de senha**, selecione **Personalizada** e configure:
   - Comprimento mínimo da senha: **8**
   - Marque: **Contém pelo menos 1 letra maiúscula**
   - Marque: **Contém pelo menos 1 letra minúscula**
   - Marque: **Contém pelo menos 1 número**
   - Marque: **Contém pelo menos 1 caractere especial**
7. Em **Autenticação multifator**, selecione **Sem MFA**
8. Clique em **Próximo**

### Configurar experiência de registro

9. Em **Registro por autoatendimento**, marque **Habilitar autorregistro**
10. Em **Verificação de atributos e confirmação de conta de usuário**:
    - Selecione **Enviar mensagem de e-mail, verificar endereço de e-mail**
    - Em **Verificação de alterações de atributos**, marque **Manter o valor do atributo original ativo quando uma atualização estiver pendente - E-mail**
11. Em **Atributos obrigatórios**, adicione os seguintes atributos obrigatórios:
    - **name**
    - **email** (já selecionado por padrão)
    - **preferred_username**
12. Clique em **Próximo**

### Configurar entrega de mensagens

13. Em **Provedor de e-mail**, selecione **Enviar e-mail com o Cognito** (para desenvolvimento)
14. Clique em **Próximo**

### Integrar a aplicação

15. Em **Nome do grupo de usuários**, insira um nome descritivo (ex: `login-customizado-pool`)
16. Em **Nome do cliente de aplicação**, insira um nome (ex: `login-customizado-app`)
17. Em **Segredo do cliente**, selecione **Não gerar um segredo do cliente**
18. Expanda **Configurações avançadas do cliente de aplicação** e em **Fluxos de autenticação**, marque:
    - **ALLOW_USER_SRP_AUTH**
    - **ALLOW_REFRESH_TOKEN_AUTH**
19. Clique em **Próximo**

### Revisar e criar

20. Revise todas as configurações e clique em **Criar grupo de usuários**

### Informações importantes para anotar

Após a criação, anote os seguintes valores (serão usados nas variáveis de ambiente):

- **ID do grupo de usuários** (formato: `us-east-1_XXXXXXXXX`) — visível na página de detalhes do grupo de usuários
- **ID do cliente de aplicação** (formato: `xxxxxxxxxxxxxxxxxxxxxxxxxx`) — em **Integração de aplicações** > **Clientes de aplicação e análises**

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
4. Clique em **Criar função**
5. Selecione **Criar do zero**
6. Configure:
   - **Nome da função**: `login-customizado-api`
   - **Runtime**: **Node.js 20.x**
   - **Arquitetura**: x86_64
7. Em **Permissões**, mantenha **Criar uma nova função com permissões básicas do Lambda**
8. Clique em **Criar função**

### Fazer upload do código

9. Na página da função, em **Origem do código**, clique em **Fazer upload de** > **Arquivo .zip**
10. Faça upload do arquivo `lambda-function.zip` criado anteriormente
11. Clique em **Salvar**

### Configurar handler

12. Em **Configurações de runtime**, clique em **Editar**
13. Altere o **Manipulador** para: `index.handler`
14. Clique em **Salvar**

### Configurar variáveis de ambiente

15. Vá para a aba **Configuração** > **Variáveis de ambiente**
16. Clique em **Editar** e adicione:
    - **Chave**: `ALLOWED_ORIGINS`
    - **Valor**: `http://localhost:5173` (adicione a URL do CloudFront após criá-lo, separada por vírgula)
17. Clique em **Salvar**

### Configurar timeout (opcional)

18. Em **Configuração** > **Configuração geral**, clique em **Editar**
19. Ajuste o **Tempo limite** para **10 segundos** (suficiente para a aplicação)
20. Clique em **Salvar**

---

## Etapa 3: Configurar API Gateway

### Criar a API

1. Navegue para **API Gateway** na região **us-east-1**
2. Clique em **Criar API**
3. Em **API REST**, clique em **Compilar**
4. Configure:
   - **Nome da API**: `login-customizado-api`
   - **Tipo de endpoint da API**: **Regional**
5. Clique em **Criar API**

### Criar Autorizador do Cognito

6. No menu lateral, clique em **Autorizadores**
7. Clique em **Criar autorizador**
8. Configure:
   - **Nome do autorizador**: `CognitoAuthorizer`
   - **Tipo de autorizador**: **Cognito**
   - **Grupo de usuários do Cognito**: selecione o grupo de usuários criado na Etapa 1
   - **Origem do token**: `Authorization`
9. Clique em **Criar autorizador**

### Criar recurso /health

10. No menu lateral, clique em **Recursos**
11. Clique em **Criar recurso**
12. Em **Caminho do recurso**, mantenha `/` e em **Nome do recurso**, insira `health`
13. Marque **Habilitar CORS do API Gateway**
14. Clique em **Criar recurso**

### Criar método GET para /health

15. Com o recurso `/health` selecionado, clique em **Criar método**
16. Configure:
    - **Tipo de método**: **GET**
    - **Tipo de integração**: **Função Lambda**
    - Marque **Integração de proxy Lambda**
    - **Função Lambda**: selecione `login-customizado-api`
17. Clique em **Criar método**

### Criar recurso /me

18. Volte para o recurso raiz `/` e clique em **Criar recurso**
19. Em **Nome do recurso**, insira `me`
20. Marque **Habilitar CORS do API Gateway**
21. Clique em **Criar recurso**

### Criar método GET para /me (com Autorizador)

22. Com o recurso `/me` selecionado, clique em **Criar método**
23. Configure:
    - **Tipo de método**: **GET**
    - **Tipo de integração**: **Função Lambda**
    - Marque **Integração de proxy Lambda**
    - **Função Lambda**: selecione `login-customizado-api`
24. Em **Configurações de solicitação de método**:
    - **Autorização**: selecione **CognitoAuthorizer**
25. Clique em **Criar método**

### Criar recurso /game

26. Volte para o recurso raiz `/` e clique em **Criar recurso**
27. Em **Nome do recurso**, insira `game`
28. Clique em **Criar recurso**

### Criar recurso /game/status

29. Com o recurso `/game` selecionado, clique em **Criar recurso**
30. Em **Nome do recurso**, insira `status`
31. Marque **Habilitar CORS do API Gateway**
32. Clique em **Criar recurso**

### Criar método GET para /game/status (com Autorizador)

33. Com o recurso `/game/status` selecionado, clique em **Criar método**
34. Configure:
    - **Tipo de método**: **GET**
    - **Tipo de integração**: **Função Lambda**
    - Marque **Integração de proxy Lambda**
    - **Função Lambda**: selecione `login-customizado-api`
35. Em **Configurações de solicitação de método**:
    - **Autorização**: selecione **CognitoAuthorizer**
36. Clique em **Criar método**

### Habilitar CORS

> **Nota:** Se você marcou "Habilitar CORS do API Gateway" ao criar os recursos, os métodos OPTIONS já foram criados automaticamente. Caso contrário, siga os passos abaixo para cada recurso.

37. Para cada recurso (`/health`, `/me`, `/game/status`), caso o CORS não tenha sido configurado automaticamente:
    - Selecione o recurso
    - Clique em **Habilitar CORS**
    - Em **Access-Control-Allow-Headers**: `Authorization,Content-Type`
    - Em **Access-Control-Allow-Methods**: `GET,OPTIONS`
    - Em **Access-Control-Allow-Origin**: `*` (a Lambda gerencia origens específicas)
    - Clique em **Salvar**

### Implantar a API

38. Clique em **Implantar API**
39. Em **Estágio**, selecione **Novo estágio**
40. Em **Nome do estágio**, insira `dev`
41. Clique em **Implantar**

### Anotar URL da API

42. Após a implantação, anote a **URL de invocação** exibida (formato: `https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev`)
    - Esta URL será usada na variável de ambiente `VITE_API_URL` do frontend

---

## Etapa 4: Criar Bucket S3

### Criar o bucket

1. Navegue para **Amazon S3**
2. Clique em **Criar bucket**
3. Configure:
   - **Nome do bucket**: nome único (ex: `login-customizado-frontend-<SEU-ID>`)
   - **Região da AWS**: **Leste dos EUA (Norte da Virgínia) us-east-1**
4. Em **Configurações de bloqueio de acesso público para este bucket**:
   - Marque **Bloquear todo o acesso público** (mantenha todas as opções marcadas)
5. Mantenha as demais configurações padrão
6. Clique em **Criar bucket**

> **Importante:** O bucket deve permanecer privado. O acesso público é feito exclusivamente via CloudFront com Controle de Acesso de Origem.

---

## Etapa 5: Configurar CloudFront

### Criar distribuição

1. Navegue para **Amazon CloudFront**
2. Clique em **Criar distribuição**

### Configurar origem

3. Em **Domínio de origem**, selecione o bucket S3 criado na Etapa 4
4. Em **Acesso à origem**:
   - Selecione **Configurações de controle de acesso de origem (recomendado)**
   - Clique em **Criar novo OAC**
   - Mantenha as configurações padrão e clique em **Criar**

### Configurar comportamento padrão

5. Em **Política de protocolo do visualizador**, selecione **Redirecionar HTTP para HTTPS**
6. Em **Métodos HTTP permitidos**, selecione **GET, HEAD**
7. Em **Política de cache**, selecione **CachingOptimized** (ou mantenha o padrão)

### Configurações gerais

8. Em **Objeto raiz padrão**, insira `index.html`
9. Mantenha as demais configurações padrão
10. Clique em **Criar distribuição**

### Atualizar política do bucket S3

11. Após criar a distribuição, o CloudFront exibirá um banner informando que é necessário atualizar a política do bucket. Clique em **Copiar política**
12. Navegue para o bucket S3 > aba **Permissões** > **Política do bucket**
13. Clique em **Editar** e cole a política copiada. Ela terá o seguinte formato:

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

14. Clique em **Salvar alterações**

### Configurar respostas de erro personalizadas (para SPA)

15. Na distribuição CloudFront, vá para a aba **Páginas de erro**
16. Clique em **Criar resposta de erro personalizada**
17. Configure para erro 403:
    - **Código de erro HTTP**: 403
    - **Personalizar resposta de erro**: Sim
    - **Caminho da página de resposta**: `/index.html`
    - **Código de resposta HTTP**: 200
18. Clique em **Criar resposta de erro personalizada**
19. Repita para erro 404:
    - **Código de erro HTTP**: 404
    - **Personalizar resposta de erro**: Sim
    - **Caminho da página de resposta**: `/index.html`
    - **Código de resposta HTTP**: 200
20. Clique em **Criar resposta de erro personalizada**

> **Nota:** Essas configurações permitem que o React Router funcione corretamente quando rotas são acessadas diretamente pela URL do navegador.

### Anotar URL do CloudFront

21. Aguarde o status da distribuição mudar para **Implantado** (pode levar alguns minutos)
22. Anote o **Nome de domínio da distribuição** (formato: `https://dxxxxxxxxxx.cloudfront.net`)
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
2. Clique em **Solicitar um certificado**
3. Selecione **Solicitar um certificado público** e clique em **Próximo**
4. Em **Nome de domínio totalmente qualificado**, insira seu domínio (ex: `app.seudominio.com.br`)
5. Em **Método de validação**, selecione **Validação de DNS**
6. Clique em **Solicitar**
7. Na página do certificado, anote os registros CNAME para validação DNS
8. Adicione os registros CNAME no seu provedor de DNS (ou Route 53)
9. Aguarde o status mudar para **Emitido** (pode levar até 30 minutos)

### Configurar domínio alternativo no CloudFront

10. Na distribuição CloudFront, clique em **Editar** nas configurações gerais
11. Em **Nome de domínio alternativo (CNAME)**, clique em **Adicionar item** e insira seu domínio (ex: `app.seudominio.com.br`)
12. Em **Certificado SSL personalizado**, selecione o certificado ACM criado acima
13. Clique em **Salvar alterações**

### Configurar registro DNS no Route 53

14. Navegue para **Route 53** > **Zonas hospedadas**
15. Selecione a zona hospedada do seu domínio
16. Clique em **Criar registro**
17. Configure:
    - **Nome do registro**: subdomínio desejado (ex: `app`)
    - **Tipo de registro**: **A**
    - Marque **Alias**
    - **Rotear tráfego para**: **Alias para distribuição do CloudFront**
    - Selecione a distribuição CloudFront
18. Clique em **Criar registros**

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
   - Clique em **Carregar**
   - Arraste todo o conteúdo da pasta `dist/` (não a pasta em si, mas seu conteúdo)
   - Clique em **Carregar**

### Invalidar cache do CloudFront

4. Após o upload, invalide o cache para que as alterações sejam refletidas imediatamente:

   Via AWS CLI:
   ```bash
   aws cloudfront create-invalidation --distribution-id SEU-DISTRIBUTION-ID --paths "/*"
   ```

   Ou via Console AWS:
   - Navegue para a distribuição CloudFront
   - Vá para a aba **Invalidações**
   - Clique em **Criar invalidação**
   - Em **Caminhos de objeto**, insira `/*`
   - Clique em **Criar invalidação**

5. Aguarde a invalidação ser concluída (status **Concluída**)

---

## Variáveis de Ambiente do Frontend

Crie um arquivo `.env` na raiz do projeto com os seguintes valores obtidos durante a configuração:

| Variável | Onde encontrar | Exemplo |
|----------|---------------|---------|
| `VITE_AWS_REGION` | Região do grupo de usuários | `us-east-1` |
| `VITE_COGNITO_USER_POOL_ID` | Cognito > Grupo de usuários > Visão geral do grupo | `us-east-1_AbCdEfGhI` |
| `VITE_COGNITO_USER_POOL_CLIENT_ID` | Cognito > Grupo de usuários > Integração de aplicações > Clientes de aplicação | `1a2b3c4d5e6f7g8h9i0j1k2l3m` |
| `VITE_API_URL` | API Gateway > Estágios > dev > URL de invocação | `https://abc123def4.execute-api.us-east-1.amazonaws.com/dev` |

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

### Solução de Problemas

| Problema | Possível causa | Solução |
|----------|---------------|---------|
| Página em branco no CloudFront | Objeto raiz padrão não configurado | Verifique se `index.html` está definido como Objeto raiz padrão |
| Erro 403 ao acessar rota direta | Resposta de erro personalizada não configurada | Configure respostas para erros 403 e 404 conforme Etapa 5 |
| Erro de CORS no console | Origem não adicionada na Lambda | Atualize `ALLOWED_ORIGINS` com a URL correta |
| 401 na API | Token expirado ou Autorizador mal configurado | Verifique a Origem do token no Autorizador e faça login novamente |
| Certificado não validando | Registros CNAME não propagados | Aguarde propagação DNS (até 48h) ou verifique registros |
