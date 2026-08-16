# Guia de Implantação AWS

Guia passo a passo para configuração manual dos serviços AWS necessários para a aplicação de login customizado com Cognito.

## Pré-requisitos

- Conta AWS ativa com permissões de administrador (ou permissões para criar recursos em Cognito, Lambda, API Gateway, S3, CloudFront, IAM)
- Familiaridade básica com o Console AWS
- [Node.js](https://nodejs.org/) 20.x ou superior instalado localmente (para build do projeto)
- AWS CLI configurada (opcional, para upload via terminal)

### Instalar Node.js (Windows)

O Node.js é necessário para compilar o código do frontend e do backend antes de enviar para a AWS.

1. Acesse [https://nodejs.org/](https://nodejs.org/)
2. Baixe a versão **LTS** (recomendada para a maioria dos usuários)
3. Execute o instalador e siga os passos (aceite as opções padrão)
4. Após a instalação, **feche e abra novamente** o PowerShell/Terminal
5. Verifique a instalação executando:
   ```powershell
   node --version
   npm --version
   ```
   - Ambos os comandos devem retornar um número de versão (ex: `v20.x.x` e `10.x.x`)

> **⚠️ Importante:** Se o comando `npm` não for reconhecido após a instalação, reinicie o computador para que as variáveis de ambiente sejam atualizadas.

---

## Etapa 1: Criar Cognito User Pool

1. Acesse o Console AWS e navegue para **Amazon Cognito** na região **us-east-1** (Leste dos EUA - Virgínia do Norte)
2. No menu lateral, clique em **Grupos de usuários**
3. Clique em **Criar grupo de usuários**

### Definir a aplicação

4. Em **Tipo de aplicação**, selecione **Aplicação de página única (SPA)**
5. Em **Dê um nome para sua aplicação**, insira: `dino-login-app`

> **Nome sugerido:** `dino-login-app`
> (este nome será usado tanto para o grupo de usuários quanto para o cliente da aplicação)

### Configurar opções

6. Em **Opções para identificadores de login**, marque apenas **E-mail**
   - Desmarque "Número de telefone" e "Nome de usuário" se estiverem marcados
7. Em **Autorregistro**, marque **Habilitar autorregistro**
8. Em **Atributos obrigatórios para a inscrição**, clique no dropdown **Selecionar atributos** e adicione:
   - **name**
   - **preferred_username**
   - (o **email** já é incluído automaticamente por ser o identificador de login)

### Adicionar um URL de retorno

9. Em **URL de retorno**, insira: `http://localhost:5173`
   - (Essa URL é usada pela Hosted UI/Login gerenciado. Para nosso caso com login customizado ela não será utilizada diretamente, mas o campo é obrigatório para concluir a criação)

### Concluir criação

10. Role até o final e clique em **Criar**
11. Aguarde a criação do grupo de usuários e do cliente de aplicação
12. Você será redirecionado para a página **Visão geral** do grupo de usuários criado

---

### Configurar a política de senha

Após a criação, ajuste a política de senha no menu lateral:

13. No menu lateral esquerdo, em **Autenticação**, clique em **Métodos de autenticação**
14. Role até a seção **Política de senha** e clique em **Editar**
15. Em **Modo de política de senha**, selecione **Personalizada**
16. Configure:
    - **Tamanho mínimo da senha**: 8 caractere(s)
    - Em **Requisitos de senhas**, marque:
      - **Contém pelo menos 1 número**
      - **Contém pelo menos um caractere especial**
      - **Contém pelo menos 1 letra maiúscula**
      - **Contém pelo menos 1 letra minúscula**
    - **As senhas temporárias definidas pelos administradores expiram em**: 7 dia(s) (manter padrão)
17. Clique em **Salvar alterações**

### Configurar fluxos de autenticação do cliente de aplicação

18. No menu lateral esquerdo, em **Aplicações**, clique em **Clientes da aplicação**
19. Clique no cliente de aplicação criado (`dino-login-app`)
20. Na seção **Informações do cliente de aplicação**, clique em **Editar**
21. Em **Nome do cliente de aplicação**, confirme que está como `dino-login-app`
22. Em **Fluxos de autenticação**, marque:
    - **Fazer login com senha remota segura (SRP): ALLOW_USER_SRP_AUTH**
    - **Obter novos tokens de usuário de sessões autenticadas existentes: ALLOW_REFRESH_TOKEN_AUTH**
    - (os demais fluxos podem ficar desmarcados)
23. Em **Configurações avançadas de segurança**:
    - Marque **Habilitar revogação do token**
    - Marque **Impedir erros de existência de usuário** (retorna resposta genérica de falha para não revelar se um email está cadastrado)
24. Clique em **Salvar alterações**

### Verificar métodos de autenticação

25. No menu lateral esquerdo, em **Autenticação**, clique em **Métodos de autenticação**
26. Confirme que a autenticação baseada em escolha está configurada com **E-mail + Senha (SRP)**

### Informações importantes para anotar

Na página **Visão geral** do grupo de usuários (acessível pelo menu lateral), anote:

- **Nome do grupo de usuários**: `dino-login-app`
- **ID do grupo de usuários** (formato: `us-east-1_XXXXXXXXX`) — campo "ID do grupo de usuários" na seção "Informações do grupo de usuários"
- **ID do cliente de aplicação** — em **Aplicações** > **Clientes da aplicação**, clique no app e copie o "ID do cliente"

![Objeto](./Imagens/imagem(9).png)
![Objeto](./Imagens/imagem(10).png)
![Objeto](./Imagens/imagem(11).png)

---

## Etapa 2: Criar Função Lambda

### Preparar o código

1. Abra o PowerShell e navegue até a pasta `backend/` do projeto:
   ```powershell
   cd C:\github\AWS-Cognito\backend
   npm install
   npm run build
   ```
2. Ainda na pasta `backend/`, crie um arquivo ZIP com o conteúdo da pasta `dist/`:
   ```powershell
   Compress-Archive -Path C:\github\AWS-Cognito\backend\dist\* -DestinationPath C:\github\AWS-Cognito\backend\lambda-function.zip -Force
   ```
   > **Importante:** Execute este comando a partir da pasta `backend/`, **NÃO** de dentro da pasta `dist/`. O `-Force` sobrescreve se o arquivo já existir.

### Criar a função no Console AWS

3. Navegue para **AWS Lambda** na região **us-east-1**
4. Clique em **Criar função**
5. Selecione **Criar do zero**
6. Configure:
   - **Nome da função**: `dino-login-api`
   - **Runtime**: **Node.js 20.x**
   - **Arquitetura**: x86_64
7. Em **Permissões**, mantenha **Criar uma nova função com permissões básicas do Lambda**
8. Clique em **Criar função**

> **Nome sugerido para a função:** `dino-login-api`

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

![Objeto](./Imagens/imagem(1).png)
![Objeto](./Imagens/imagem(2).png)
---

## Etapa 3: Configurar API Gateway

### Criar a API

1. Navegue para **API Gateway** na região **us-east-1**
2. Clique em **Criar API**
3. Em **API REST**, clique em **Compilar**
4. Configure:
   - **Nome da API**: `dino-login-api`
   - **Tipo de endpoint da API**: **Regional**
5. Clique em **Criar API**

> **Nome sugerido para a API::** `dino-login-api`

### Criar Autorizador do Cognito

6. No menu lateral, clique em **Autorizadores**
7. Clique em **Criar autorizador**
8. Configure:
   - **Nome do autorizador**: `dino-login-cognito-authorizer`
   - **Tipo de autorizador**: **Cognito**
   - **Grupo de usuários do Cognito**: selecione a região `us-east-1` e busque `dino-login-app`
   - **Origem do token**: digite `Authorization` após o prefixo `method.request.header.` que já aparece pré-preenchido (ficando `method.request.header.Authorization`)
   - **Validação de token - opcional**: deixe em branco
9. Clique em **Criar autorizador**

> **⚠️ Atenção:** No campo "Origem do token", o Console pré-preenche com `method.request.header.` — você deve digitar APENAS `Authorization` após esse prefixo. Não deixe o ponto final solto, senão dará erro.

### Criar recurso /health

10. No menu lateral, clique em **Recursos**
11. Clique em **Criar recurso**
12. Em **Caminho do recurso**, mantenha `/` e em **Nome do recurso**, insira `health`
13. Marque **Habilitar CORS do API Gateway**
14. Clique em **Criar recurso**

> Nome sugerido para o recurso: `health`

### Criar método GET para /health

15. Com o recurso `/health` selecionado, clique em **Criar método**
16. Configure:
    - **Tipo de método**: **GET**
    - **Tipo de integração**: **Função Lambda**
    - Marque **Integração de proxy Lambda**
    - **Função Lambda**: selecione `dino-login-api`
17. Clique em **Criar método**

### Criar recurso /me

18. Volte para o recurso raiz `/` e clique em **Criar recurso**
19. Em **Nome do recurso**, insira `me`
20. Marque **Habilitar CORS do API Gateway**
21. Clique em **Criar recurso**

> Nome sugerido para o recurso: `me`

### Criar método GET para /me (com Autorizador)

22. Com o recurso `/me` selecionado, clique em **Criar método**
23. Configure:
    - **Tipo de método**: **GET**
    - **Tipo de integração**: **Função Lambda**
    - Marque **Integração de proxy Lambda**
    - **Função Lambda**: selecione `dino-login-api`
24. Em **Configurações de solicitação de método**:
    - **Autorização**: selecione **dino-login-cognito-authorizer**
25. Clique em **Criar método**

### Criar recurso /game

26. Volte para o recurso raiz `/` e clique em **Criar recurso**
27. Em **Nome do recurso**, insira `game`
28. Clique em **Criar recurso**

> Nome sugerido para o recurso: `game`

### Criar recurso /game/status

29. Com o recurso `/game` selecionado, clique em **Criar recurso**
30. Em **Nome do recurso**, insira `status`
31. Marque **Habilitar CORS do API Gateway**
32. Clique em **Criar recurso**

> Nome sugerido para o recurso: `status` (ficará como `/game/status`)

### Criar método GET para /game/status (com Autorizador)

33. Com o recurso `/game/status` selecionado, clique em **Criar método**
34. Configure:
    - **Tipo de método**: **GET**
    - **Tipo de integração**: **Função Lambda**
    - Marque **Integração de proxy Lambda**
    - **Função Lambda**: selecione `dino-login-api`
35. Em **Configurações de solicitação de método**:
    - **Autorização**: selecione **dino-login-cognito-authorizer**
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

![Objeto](./Imagens/imagem(12).png)
![Objeto](./Imagens/imagem(13).png)

---

## Etapa 4: Criar Bucket S3

### Criar o bucket

1. Navegue para **Amazon S3**
2. Clique em **Criar bucket**
3. Configure:
   - **Nome do bucket**: `dino-login-frontend-<SEU-ID>` (substitua `<SEU-ID>` por algo único, ex: seu ID de conta ou iniciais + data)
   - **Região da AWS**: **Leste dos EUA (Norte da Virgínia) us-east-1**
4. Em **Configurações de bloqueio de acesso público para este bucket**:
   - Marque **Bloquear todo o acesso público** (mantenha todas as opções marcadas)
5. Mantenha as demais configurações padrão
6. Clique em **Criar bucket**

> **Nome sugerido para o bucket:** `dino-login-frontend-<SEU-ID>` (o nome precisa ser globalmente único no S3)

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
13. Clique em **Editar** e cole a política copiada
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

![Objeto](./Imagens/imagem(7).png)
![Objeto](./Imagens/imagem(8).png)

### Atualizar origens CORS

19. Atualize a variável de ambiente `ALLOWED_ORIGINS` da Lambda para incluir o domínio customizado:
    ```
    http://localhost:5173,https://dxxxxxxxxxx.cloudfront.net,https://app.seudominio.com.br
    ```

---

## Deploy do Frontend

### Build do projeto

1. Abra o PowerShell e navegue para a raiz do projeto:
   ```powershell
   cd C:\github\AWS-Cognito
   ```

2. Crie o arquivo `.env` a partir do template (se ainda não existir):
   ```powershell
   Copy-Item .env.example .env
   ```

3. Edite o arquivo `.env` com os valores reais obtidos nas etapas anteriores:
   ```env
   VITE_AWS_REGION=us-east-1
   VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
   VITE_COGNITO_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
   VITE_API_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev
   ```

4. Instale as dependências e execute o build:
   ```powershell
   npm install
   npm run build
   ```

5. Após o build, a pasta `dist/` será criada com os seguintes arquivos:
   - `index.html` — página principal
   - `assets/` — pasta com arquivos JavaScript e CSS compilados
   - `vite.svg` — ícone

> **⚠️ Atenção:** O Vite lê o arquivo `.env` (NÃO o `.env.example`) durante o build. Se o `.env` não existir, as variáveis de ambiente ficarão como `undefined` na aplicação.

### Upload para o S3

6. Via Console AWS:
   - Navegue para o bucket S3
   - **Exclua** qualquer arquivo antigo que esteja no bucket
   - Clique em **Carregar**
   - Arraste o **conteúdo** da pasta `C:\github\AWS-Cognito\dist\` (os arquivos `index.html`, `vite.svg` e a pasta `assets/`)
   - Clique em **Carregar**

   Ou via AWS CLI (PowerShell):
   ```powershell
   aws s3 sync C:\github\AWS-Cognito\dist\ s3://SEU-BUCKET-NAME --delete
   ```

> **⚠️ Importante:** Faça upload do conteúdo da pasta `dist/` do **frontend** (raiz do projeto). NÃO confunda com a pasta `backend/dist/` que contém o código da Lambda.

### Invalidar cache do CloudFront

7. Após o upload, invalide o cache para que as alterações sejam refletidas imediatamente:

   Via Console AWS:
   - Navegue para a distribuição CloudFront
   - Vá para a aba **Invalidações**
   - Clique em **Criar invalidação**
   - Em **Caminhos de objeto**, insira `/*`
   - Clique em **Criar invalidação**

   Ou via AWS CLI (PowerShell):
   ```powershell
   aws cloudfront create-invalidation --distribution-id SEU-DISTRIBUTION-ID --paths "/*"
   ```

8. Aguarde a invalidação ser concluída (status **Concluída**)

---

## Variáveis de Ambiente do Frontend

Crie um arquivo `.env` na raiz do projeto com os seguintes valores obtidos durante a configuração:

| Variável | Onde encontrar | Exemplo |
|----------|---------------|---------|
| `VITE_AWS_REGION` | Região do grupo de usuários | `us-east-1` |
| `VITE_COGNITO_USER_POOL_ID` | Cognito > Grupo de usuários > Visão geral | `us-east-1_AbCdEfGhI` |
| `VITE_COGNITO_USER_POOL_CLIENT_ID` | Cognito > Aplicações > Clientes da aplicação > ID do cliente | `1a2b3c4d5e6f7g8h9i0j1k2l3m` |
| `VITE_API_URL` | API Gateway > Estágios > dev > URL de invocação | `https://abc123def4.execute-api.us-east-1.amazonaws.com/dev` |

> **Segurança:** Nunca commite o arquivo `.env` com valores reais no repositório. O `.env` já está no `.gitignore`. Use o `.env.example` apenas como referência com valores placeholder.

---

## Verificação Final

Após completar todas as etapas, verifique se a aplicação está funcionando corretamente.

### Testar a aplicação

1. Acesse a URL do CloudFront (ou domínio customizado) no navegador
2. A página inicial com o tema dinossauro deve carregar (botões "Entrar" e "Criar conta")
3. Teste o **fluxo de registro**:
   - Clique em "Criar conta"
   - Preencha nome completo, apelido, email e senha
   - Um código de 6 dígitos será enviado para o email informado
   - Insira o código na tela de confirmação
   - Após confirmar, faça login com as credenciais criadas
4. Teste o **login**:
   - Na tela de login, insira email e senha
   - Após o login, o dashboard deve exibir seu nome, apelido e email
5. Teste o **perfil**:
   - Clique em "Meu perfil" e verifique se as informações aparecem
   - Teste a edição de nome e apelido
6. Teste o **logout**:
   - Clique em "Sair" e confirme que foi redirecionado para a página inicial

### Verificar usuários cadastrados no Cognito

Para validar que os usuários estão sendo criados corretamente:

1. No Console AWS, navegue para **Amazon Cognito**
2. Clique no grupo de usuários (`dino-login-app`)
3. No menu lateral, em **Gerenciamento de usuários**, clique em **Usuários**
4. A lista de usuários cadastrados aparecerá com as seguintes informações:
   - **Nome de usuário** (UUID gerado automaticamente)
   - **Status da conta** (Confirmado / Não confirmado)
   - **E-mail** do usuário
   - **Data de criação**
5. Clique em um usuário para ver detalhes:
   - **Atributos do usuário**: email, name, preferred_username, email_verified
   - **Status de confirmação**: se o email foi verificado

> **Dica:** Após registrar um usuário pela aplicação, verifique nesta tela se ele aparece com status "Confirmado" e com os atributos corretos (name, preferred_username, email).

### Testar o endpoint de health da API

Acesse diretamente no navegador:
```
https://SEU-API-ID.execute-api.us-east-1.amazonaws.com/dev/health
```

Deve retornar:
```json
{"status":"ok","message":"API funcionando corretamente"}
```

![Objeto](./Imagens/imagem(3).png)
![Objeto](./Imagens/imagem(4).png)
![Objeto](./Imagens/imagem(5).png)