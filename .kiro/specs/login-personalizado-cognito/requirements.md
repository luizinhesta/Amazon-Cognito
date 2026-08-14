# Requirements Document

## Introduction

Este documento especifica os requisitos para o Projeto 1 de uma série de laboratórios AWS: uma aplicação web com login totalmente customizado utilizando Amazon Cognito. A aplicação permite registro, autenticação, recuperação de senha e gerenciamento de perfil de usuário através de telas React personalizadas (sem Hosted UI, Managed Login, login social ou usuários IAM). O backend é composto por API Gateway REST API protegida por Cognito User Pool Authorizer, AWS Lambda e hospedagem via S3 privado com CloudFront.

## Glossary

- **Aplicacao_Frontend**: Aplicação React com TypeScript construída com Vite, responsável por todas as telas e interações do usuário
- **Servico_Autenticacao**: Módulo que utiliza AWS Amplify Auth para comunicação com o Cognito User Pool
- **API_Gateway**: API Gateway REST API (tipo Regional) que expõe os endpoints do backend
- **Funcao_Lambda**: Função AWS Lambda com Node.js e TypeScript que processa as requisições da API
- **Autorizador_Cognito**: Cognito User Pool Authorizer configurado na API Gateway para validar tokens JWT
- **Bucket_S3**: Bucket S3 privado que armazena os arquivos estáticos do frontend
- **Distribuicao_CloudFront**: Distribuição CloudFront com Origin Access Control que serve o frontend via HTTPS
- **Pool_Usuarios**: Cognito User Pool que gerencia registro, autenticação e atributos dos usuários
- **Token_ID**: Token JWT emitido pelo Cognito contendo claims do usuário autenticado
- **Rota_Privada**: Componente React que restringe acesso a páginas apenas para usuários autenticados

## Requirements

### Requisito 1: Página Inicial

**User Story:** Como um visitante, eu quero ver uma página inicial temática com opções de entrada e criação de conta, para que eu possa navegar facilmente para o login ou registro.

#### Critérios de Aceitação

1. THE Aplicacao_Frontend SHALL exibir uma página inicial com tema de jogo do dinossauro na rota raiz da aplicação
2. THE Aplicacao_Frontend SHALL exibir um botão "Entrar" visível na página inicial
3. WHEN o usuário clica no botão "Entrar", THE Aplicacao_Frontend SHALL navegar para a tela de login
4. THE Aplicacao_Frontend SHALL exibir um botão "Criar conta" visível na página inicial
5. WHEN o usuário clica no botão "Criar conta", THE Aplicacao_Frontend SHALL navegar para a tela de registro
6. THE Aplicacao_Frontend SHALL renderizar a página inicial com layout responsivo que se adapta a viewports de no mínimo 320px (móvel) até 1920px (desktop) sem sobreposição de elementos ou perda de funcionalidade
7. IF o usuário já está autenticado e acessa a página inicial, THEN THE Aplicacao_Frontend SHALL redirecionar o usuário para a área autenticada

### Requisito 2: Login Customizado

**User Story:** Como um usuário registrado, eu quero fazer login com meu email e senha em uma tela customizada, para que eu possa acessar a área autenticada sem depender da Hosted UI do Cognito.

#### Critérios de Aceitação

1. THE Aplicacao_Frontend SHALL exibir campos de email e senha na tela de login
2. THE Aplicacao_Frontend SHALL exibir um botão para alternar a visibilidade da senha (mostrar/ocultar)
3. WHEN o usuário submete o formulário de login com credenciais válidas, THE Servico_Autenticacao SHALL autenticar o usuário via Cognito User Pool e armazenar os tokens JWT
4. WHEN o usuário submete o formulário de login com credenciais válidas, THE Aplicacao_Frontend SHALL redirecionar o usuário para a área autenticada
5. IF o usuário submete email em formato inválido, THEN THE Aplicacao_Frontend SHALL exibir mensagem de validação em português informando o formato correto sem submeter o formulário
6. IF o usuário submete senha incorreta, THEN THE Aplicacao_Frontend SHALL exibir mensagem em português informando que as credenciais estão incorretas
7. IF o usuário não confirmou o email (erro UserNotConfirmedException), THEN THE Aplicacao_Frontend SHALL redirecionar para a tela de confirmação de código
8. WHILE o processo de autenticação está em andamento, THE Aplicacao_Frontend SHALL exibir um indicador de carregamento e desabilitar o botão de login
9. THE Aplicacao_Frontend SHALL exibir um link "Esqueci minha senha" que navega para a tela de recuperação de senha
10. THE Aplicacao_Frontend SHALL exibir um link "Criar conta" que navega para a tela de registro

### Requisito 3: Registro de Usuário

**User Story:** Como um novo usuário, eu quero me registrar fornecendo nome completo, apelido, email e senha, para que eu possa criar uma conta e acessar a aplicação.

#### Critérios de Aceitação

1. THE Aplicacao_Frontend SHALL exibir campos obrigatórios para nome completo (máximo 128 caracteres), apelido (máximo 64 caracteres), email (máximo 254 caracteres), senha e confirmação de senha na tela de registro
2. WHEN o usuário submete o formulário de registro com dados válidos, THE Servico_Autenticacao SHALL criar o usuário no Cognito User Pool com os atributos name, email e preferred_username
3. WHEN o registro é concluído com sucesso, THE Aplicacao_Frontend SHALL redirecionar o usuário para a tela de confirmação de código
4. IF as senhas digitadas não coincidem, THEN THE Aplicacao_Frontend SHALL exibir mensagem em português informando que as senhas não conferem e não submeter o formulário
5. IF a senha não atende à política de complexidade do Cognito, THEN THE Aplicacao_Frontend SHALL exibir mensagem em português descrevendo os requisitos de senha não atendidos
6. IF o email já está registrado no Pool_Usuarios, THEN THE Aplicacao_Frontend SHALL exibir mensagem em português informando que o usuário já existe
7. WHILE o processo de registro está em andamento, THE Aplicacao_Frontend SHALL exibir um indicador de carregamento e desabilitar o botão de registro
8. IF o usuário submete email em formato inválido, THEN THE Aplicacao_Frontend SHALL exibir mensagem de validação em português informando o formato correto
9. THE Aplicacao_Frontend SHALL exibir um link "Já tenho conta" ou equivalente que navega para a tela de login

### Requisito 4: Confirmação de Email

**User Story:** Como um usuário recém-registrado, eu quero confirmar meu email inserindo o código de verificação, para que eu possa ativar minha conta e fazer login.

#### Critérios de Aceitação

1. THE Aplicacao_Frontend SHALL exibir o email do usuário registrado, um campo para inserção do código de verificação de 6 dígitos numéricos e um botão de confirmação
2. WHEN o usuário insere um código válido e confirma, THE Servico_Autenticacao SHALL confirmar o registro do usuário no Cognito User Pool
3. WHEN a confirmação é bem-sucedida, THE Aplicacao_Frontend SHALL redirecionar o usuário para a tela de login com mensagem de sucesso
4. WHEN o código inserido está incorreto, THE Aplicacao_Frontend SHALL exibir mensagem em português informando que o código é inválido
5. WHEN o código inserido está expirado, THE Aplicacao_Frontend SHALL exibir mensagem em português informando que o código expirou e sugerindo reenvio
6. THE Aplicacao_Frontend SHALL exibir um botão "Reenviar código" para solicitar novo código de verificação
7. WHEN o usuário clica em "Reenviar código", THE Servico_Autenticacao SHALL solicitar o reenvio do código de verificação ao Cognito User Pool e THE Aplicacao_Frontend SHALL exibir mensagem em português informando o sucesso ou falha do reenvio
8. WHILE o processo de confirmação ou reenvio está em andamento, THE Aplicacao_Frontend SHALL exibir um indicador de carregamento e desabilitar os botões de confirmação e reenvio

### Requisito 5: Recuperação de Senha

**User Story:** Como um usuário que esqueceu a senha, eu quero recuperar minha senha informando meu email e definindo uma nova senha com código de verificação, para que eu possa restabelecer o acesso à minha conta.

#### Critérios de Aceitação

1. THE Aplicacao_Frontend SHALL exibir um campo de email e botão para solicitar código de recuperação na primeira etapa
2. WHEN o usuário informa um email válido e solicita recuperação, THE Servico_Autenticacao SHALL enviar um código de recuperação para o email informado via Cognito User Pool
3. WHEN o código de recuperação é enviado com sucesso, THE Aplicacao_Frontend SHALL exibir campos para código de verificação, nova senha e confirmação de nova senha
4. WHEN o usuário informa código válido e nova senha que atende à política, THE Servico_Autenticacao SHALL redefinir a senha do usuário no Cognito User Pool
5. WHEN a redefinição de senha é bem-sucedida, THE Aplicacao_Frontend SHALL redirecionar o usuário para a tela de login com mensagem de sucesso
6. IF o código de recuperação está incorreto ou expirado, THEN THE Aplicacao_Frontend SHALL exibir mensagem em português informando o erro específico
7. IF a nova senha não atende à política de complexidade, THEN THE Aplicacao_Frontend SHALL exibir mensagem em português descrevendo os requisitos de senha
8. IF as senhas (nova e confirmação) não coincidem, THEN THE Aplicacao_Frontend SHALL exibir mensagem em português informando que as senhas não conferem
9. WHILE o processo de recuperação está em andamento, THE Aplicacao_Frontend SHALL exibir um indicador de carregamento e desabilitar os botões de ação
10. IF o email informado não está registrado no Pool_Usuarios, THEN THE Aplicacao_Frontend SHALL exibir mensagem genérica em português sem revelar se o email existe ou não no sistema

### Requisito 6: Área Autenticada

**User Story:** Como um usuário autenticado, eu quero acessar uma área restrita que exibe minhas informações e opções de navegação, para que eu possa utilizar os recursos da aplicação.

#### Critérios de Aceitação

1. THE Aplicacao_Frontend SHALL exibir o nome, apelido e email do usuário autenticado na área autenticada
2. THE Aplicacao_Frontend SHALL exibir botões "Meu perfil", "Jogar", "Ranking" e "Sair" na área autenticada
3. WHEN o usuário clica em "Jogar", THE Aplicacao_Frontend SHALL exibir mensagem informando que o jogo será disponibilizado no Projeto 2
4. WHEN o usuário clica em "Ranking", THE Aplicacao_Frontend SHALL exibir mensagem informando que o ranking será disponibilizado no Projeto 2
5. WHEN o usuário clica em "Meu perfil", THE Aplicacao_Frontend SHALL navegar para a tela de perfil do usuário
6. WHEN o usuário clica em "Sair", THE Servico_Autenticacao SHALL encerrar a sessão do usuário e revogar os tokens
7. WHEN o logout é concluído com sucesso, THE Aplicacao_Frontend SHALL redirecionar o usuário para a página inicial
8. IF o logout falha, THEN THE Aplicacao_Frontend SHALL exibir mensagem de erro em português informando a falha ao encerrar a sessão e manter o usuário na área autenticada

### Requisito 7: Perfil do Usuário

**User Story:** Como um usuário autenticado, eu quero visualizar e editar meus dados de perfil, para que eu possa manter minhas informações atualizadas.

#### Critérios de Aceitação

1. THE Aplicacao_Frontend SHALL exibir os atributos do usuário (nome, apelido, email, status de confirmação do email) na tela de perfil
2. WHEN o usuário solicita alteração de nome, THE Aplicacao_Frontend SHALL exibir campo editável para o novo nome e botão de confirmação
3. WHEN o usuário confirma a alteração de nome com valor válido (não vazio, máximo 128 caracteres), THE Servico_Autenticacao SHALL atualizar o atributo name no Cognito User Pool
4. WHEN o usuário solicita alteração de apelido, THE Aplicacao_Frontend SHALL exibir campo editável para o novo apelido e botão de confirmação
5. WHEN o usuário confirma a alteração de apelido com valor válido (não vazio, máximo 64 caracteres), THE Servico_Autenticacao SHALL atualizar o atributo preferred_username no Cognito User Pool
6. WHEN o usuário solicita alteração de senha, THE Aplicacao_Frontend SHALL exibir campos para senha atual, nova senha e confirmação de nova senha
7. WHEN o usuário confirma a alteração de senha com dados válidos, THE Servico_Autenticacao SHALL atualizar a senha do usuário no Cognito User Pool
8. WHEN a atualização de atributo é bem-sucedida, THE Aplicacao_Frontend SHALL exibir mensagem de sucesso em português
9. IF a atualização de atributo falha, THEN THE Aplicacao_Frontend SHALL exibir mensagem de erro em português informando o motivo da falha
10. IF a senha atual informada está incorreta durante alteração de senha, THEN THE Aplicacao_Frontend SHALL exibir mensagem em português informando que a senha atual está incorreta
11. WHILE o processo de atualização de perfil está em andamento, THE Aplicacao_Frontend SHALL exibir um indicador de carregamento e desabilitar o botão de confirmação
12. THE Aplicacao_Frontend SHALL exibir botões "Voltar" e "Sair" na tela de perfil

### Requisito 8: Rotas Privadas

**User Story:** Como desenvolvedor, eu quero proteger as rotas da área autenticada, para que usuários não autenticados não possam acessar páginas restritas.

#### Critérios de Aceitação

1. WHEN um usuário não autenticado tenta acessar uma Rota_Privada, THE Aplicacao_Frontend SHALL redirecionar o usuário para a tela de login
2. WHEN um usuário autenticado acessa uma Rota_Privada, THE Aplicacao_Frontend SHALL renderizar o conteúdo da página solicitada
3. WHEN a sessão do usuário expira durante a navegação, THE Aplicacao_Frontend SHALL redirecionar o usuário para a tela de login
4. THE Aplicacao_Frontend SHALL verificar o estado de autenticação antes de renderizar qualquer Rota_Privada
5. WHILE a verificação do estado de autenticação está em andamento, THE Aplicacao_Frontend SHALL exibir um indicador de carregamento em vez de redirecionar prematuramente
6. WHEN um usuário autenticado tenta acessar uma rota pública de autenticação (login, registro), THE Aplicacao_Frontend SHALL redirecionar o usuário para a área autenticada

### Requisito 9: API Gateway REST API

**User Story:** Como desenvolvedor, eu quero expor endpoints REST protegidos por Cognito, para que o frontend possa consumir dados do backend de forma segura.

#### Critérios de Aceitação

1. THE API_Gateway SHALL expor o endpoint GET /health sem autorização e retornar status 200 com corpo JSON contendo indicação de que a API está funcionando
2. THE API_Gateway SHALL expor o endpoint GET /me com Autorizador_Cognito e retornar status 200 com dados do usuário autenticado no corpo JSON
3. THE API_Gateway SHALL expor o endpoint GET /game/status com Autorizador_Cognito e retornar status 200 com mensagem JSON informando que o jogo será disponibilizado no Projeto 2
4. WHEN o endpoint GET /me recebe uma requisição com Token_ID válido, THE Funcao_Lambda SHALL retornar status 200 com resposta no formato { autenticado: true, usuarioId: sub, email: email, nome: name, apelido: preferred_username }
5. WHEN uma requisição sem Token_ID válido é enviada a um endpoint protegido, THE Autorizador_Cognito SHALL retornar resposta com status 401
6. THE API_Gateway SHALL utilizar integração Lambda Proxy com uma única Funcao_Lambda para todos os endpoints
7. THE API_Gateway SHALL ser implantada no stage "dev"
8. THE API_Gateway SHALL ser do tipo Regional na região us-east-1
9. THE API_Gateway SHALL retornar respostas com Content-Type application/json em todos os endpoints

### Requisito 10: Configuração de CORS

**User Story:** Como desenvolvedor, eu quero configurar CORS na API Gateway, para que o frontend possa fazer requisições ao backend de diferentes origens de forma segura.

#### Critérios de Aceitação

1. THE API_Gateway SHALL permitir requisições da origem http://localhost:5173 (porta padrão do Vite)
2. THE API_Gateway SHALL permitir requisições da origem da URL do CloudFront (https://<DISTRIBUTION_ID>.cloudfront.net)
3. WHERE domínio customizado é configurado, THE API_Gateway SHALL permitir requisições da origem do domínio customizado
4. THE API_Gateway SHALL permitir os headers Authorization e Content-Type nas requisições
5. THE API_Gateway SHALL permitir os métodos GET e OPTIONS nas requisições
6. THE API_Gateway SHALL responder a requisições preflight OPTIONS com os headers Access-Control-Allow-Origin, Access-Control-Allow-Headers e Access-Control-Allow-Methods
7. IF uma requisição é recebida de uma origem não configurada, THEN THE API_Gateway SHALL rejeitar a requisição sem incluir headers CORS na resposta

### Requisito 11: Hospedagem com S3 e CloudFront

**User Story:** Como desenvolvedor, eu quero hospedar o frontend em S3 privado com CloudFront, para que a aplicação seja servida via HTTPS com segurança e performance.

#### Critérios de Aceitação

1. THE Bucket_S3 SHALL bloquear todo acesso público ao bucket através da configuração "Block all public access" habilitada
2. THE Bucket_S3 SHALL possuir bucket policy permitindo acesso exclusivamente à distribuição CloudFront via Origin Access Control
3. THE Distribuicao_CloudFront SHALL utilizar Origin Access Control para acessar o Bucket_S3
4. THE Distribuicao_CloudFront SHALL redirecionar requisições HTTP para HTTPS (Viewer Protocol Policy: Redirect HTTP to HTTPS)
5. THE Distribuicao_CloudFront SHALL configurar index.html como objeto raiz padrão (Default Root Object)
6. WHEN uma rota do React é acessada diretamente pela URL e retorna erro 403 ou 404, THE Distribuicao_CloudFront SHALL retornar index.html com status HTTP 200 através de Custom Error Response para permitir o roteamento client-side
7. THE Distribuicao_CloudFront SHALL funcionar com a URL padrão do CloudFront sem necessidade de domínio customizado

### Requisito 12: Domínio Customizado (Opcional)

**User Story:** Como desenvolvedor, eu quero opcionalmente configurar um domínio customizado, para que a aplicação seja acessível por uma URL personalizada.

#### Critérios de Aceitação

1. WHERE domínio customizado é configurado, THE Distribuicao_CloudFront SHALL utilizar certificado ACM emitido na região us-east-1 com validação DNS, cobrindo o nome de domínio configurado
2. WHERE domínio customizado é configurado, THE Distribuicao_CloudFront SHALL incluir o domínio alternativo (CNAME) correspondente ao domínio configurado na configuração da distribuição
3. WHERE domínio customizado é configurado, THE Aplicacao_Frontend SHALL ser acessível via HTTPS através de registro Alias no Route 53 apontando para a distribuição CloudFront, respondendo com status 200 para a página inicial
4. IF o certificado ACM não está com status "Issued" no momento da configuração da distribuição, THEN THE Distribuicao_CloudFront SHALL falhar a implantação com mensagem de erro indicando que o certificado não está validado

### Requisito 13: Função Lambda

**User Story:** Como desenvolvedor, eu quero uma função Lambda única que processa todas as rotas da API, para que o backend seja simples e centralizado.

#### Critérios de Aceitação

1. THE Funcao_Lambda SHALL ser implementada em Node.js com TypeScript
2. THE Funcao_Lambda SHALL rotear requisições com base no método HTTP e path recebidos do evento de integração Lambda Proxy e retornar respostas no formato Lambda Proxy (statusCode, headers e body como string JSON)
3. WHEN a Funcao_Lambda recebe GET /health, THE Funcao_Lambda SHALL retornar status 200 com mensagem de API funcionando
4. WHEN a Funcao_Lambda recebe GET /me, THE Funcao_Lambda SHALL extrair os claims sub, email, name e preferred_username do Token_ID presente no evento e retornar status 200 com os dados do usuário contendo usuarioId, email, nome e apelido
5. WHEN a Funcao_Lambda recebe GET /game/status, THE Funcao_Lambda SHALL retornar status 200 com mensagem informando que o jogo será disponibilizado no Projeto 2
6. WHEN a Funcao_Lambda recebe uma rota não mapeada, THE Funcao_Lambda SHALL retornar status 404 com mensagem de rota não encontrada
7. THE Funcao_Lambda SHALL possuir permissões mínimas necessárias para execução (princípio do menor privilégio)
8. THE Funcao_Lambda SHALL incluir os headers CORS (Access-Control-Allow-Origin, Access-Control-Allow-Headers) em todas as respostas conforme as origens configuradas no Requisito 10
9. IF os claims do Token_ID não podem ser extraídos do evento na rota GET /me, THEN THE Funcao_Lambda SHALL retornar status 401 com mensagem indicando falha na identificação do usuário

### Requisito 14: Segurança

**User Story:** Como desenvolvedor, eu quero garantir que a aplicação siga boas práticas de segurança, para que os dados dos usuários estejam protegidos.

#### Critérios de Aceitação

1. THE Aplicacao_Frontend SHALL armazenar credenciais AWS exclusivamente em variáveis de ambiente (nunca no código-fonte), e o arquivo .env contendo valores reais SHALL ser incluído no .gitignore
2. THE Aplicacao_Frontend SHALL utilizar App Client do Cognito sem client secret
3. THE Funcao_Lambda SHALL registrar logs sem incluir tokens, senhas ou dados sensíveis do usuário, mascarando qualquer valor sensível exibindo no máximo os últimos 4 caracteres
4. THE Autorizador_Cognito SHALL validar a assinatura e a expiração do Token_ID recebido no header Authorization
5. IF o Token_ID está ausente, expirado ou com assinatura inválida em uma requisição protegida, THEN THE API_Gateway SHALL retornar status 401 com mensagem "Unauthorized"
6. IF uma requisição válida é feita a um endpoint protegido mas o Token_ID não contém os claims necessários para o recurso solicitado, THEN THE API_Gateway SHALL retornar status 403 com mensagem indicando acesso negado
7. THE Aplicacao_Frontend SHALL utilizar arquivo .env.example documentando as variáveis VITE_AWS_REGION, VITE_COGNITO_USER_POOL_ID, VITE_COGNITO_USER_POOL_CLIENT_ID e VITE_API_URL sem valores reais
8. THE Aplicacao_Frontend SHALL armazenar tokens JWT exclusivamente através do mecanismo padrão do Servico_Autenticacao (AWS Amplify Auth), sem armazenamento manual em cookies ou storage acessível por JavaScript customizado

### Requisito 15: Tratamento de Erros

**User Story:** Como um usuário, eu quero receber mensagens de erro claras em português, para que eu possa entender e resolver problemas durante o uso da aplicação.

#### Critérios de Aceitação

1. WHEN um erro de autenticação ocorre, THE Aplicacao_Frontend SHALL exibir mensagem em português brasileiro que identifique o tipo de erro ocorrido e oriente o usuário sobre a ação corretiva possível
2. WHEN a API retorna status 401, THE Aplicacao_Frontend SHALL exibir mensagem informando que a sessão expirou e redirecionar o usuário para a tela de login após o usuário visualizar a mensagem
3. WHEN a API retorna erro de CORS, THE Aplicacao_Frontend SHALL registrar no console a origem da requisição, o endpoint chamado e o tipo de erro CORS retornado
4. WHEN a API não responde dentro de 10 segundos ou retorna erro de rede, THE Aplicacao_Frontend SHALL exibir mensagem em português informando indisponibilidade temporária do serviço
5. IF a Funcao_Lambda encontra um erro não tratado, THEN THE Funcao_Lambda SHALL retornar status 500 com corpo JSON contendo mensagem genérica de erro sem incluir stack traces, caminhos internos do sistema ou nomes de dependências
6. THE Aplicacao_Frontend SHALL mapear no mínimo os seguintes códigos de erro do Cognito para mensagens em português brasileiro: NotAuthorizedException, UserNotFoundException, UsernameExistsException, CodeMismatchException, ExpiredCodeException, InvalidPasswordException, LimitExceededException e UserNotConfirmedException

### Requisito 16: Configuração do Projeto

**User Story:** Como desenvolvedor, eu quero uma estrutura de projeto organizada com documentação completa em português, para que eu possa configurar e implantar a aplicação de forma clara.

#### Critérios de Aceitação

1. THE Aplicacao_Frontend SHALL seguir a estrutura de diretórios com separação de components, pages, routes, services, contexts, hooks, styles e assets dentro do diretório src/
2. THE Funcao_Lambda SHALL residir no diretório backend/ contendo no mínimo package.json, tsconfig.json e diretório src/ com o código-fonte TypeScript
3. THE Aplicacao_Frontend SHALL incluir arquivo .env.example contendo as variáveis VITE_AWS_REGION, VITE_COGNITO_USER_POOL_ID, VITE_COGNITO_USER_POOL_CLIENT_ID e VITE_API_URL com valores placeholder descritivos sem dados reais
4. THE Aplicacao_Frontend SHALL incluir arquivo .gitignore excluindo node_modules, .env, dist e arquivos de build
5. THE Aplicacao_Frontend SHALL incluir README.md em português brasileiro contendo as seções: visão geral do projeto, pré-requisitos de software, instruções de instalação de dependências, instruções para executar localmente, estrutura de diretórios e lista de variáveis de ambiente
6. THE Aplicacao_Frontend SHALL incluir ARQUITETURA.md em português brasileiro contendo explicação dos componentes (Aplicacao_Frontend, Servico_Autenticacao, API_Gateway, Funcao_Lambda, Pool_Usuarios, Bucket_S3, Distribuicao_CloudFront), fluxo de autenticação e pelo menos um diagrama Mermaid ilustrando a comunicação entre os componentes
7. THE Aplicacao_Frontend SHALL incluir IMPLANTACAO-AWS.md em português brasileiro contendo guia de configuração manual no Console AWS cobrindo as etapas de criação do Cognito User Pool, criação da função Lambda, configuração da API Gateway com Autorizador_Cognito, criação do Bucket S3 e configuração da Distribuição CloudFront

### Requisito 17: Cognito User Pool

**User Story:** Como desenvolvedor, eu quero configurar o Cognito User Pool com atributos customizados, para que os dados dos usuários sejam armazenados e gerenciados adequadamente.

#### Critérios de Aceitação

1. THE Pool_Usuarios SHALL utilizar email como atributo de login (sign-in alias)
2. THE Pool_Usuarios SHALL armazenar os atributos obrigatórios name, email e preferred_username para cada usuário
3. THE Pool_Usuarios SHALL exigir verificação de email durante o registro antes de permitir autenticação
4. THE Pool_Usuarios SHALL enviar código de verificação numérico por email como método de confirmação de conta
5. THE Pool_Usuarios SHALL possuir App Client configurado sem client secret e com os fluxos de autenticação ALLOW_USER_SRP_AUTH e ALLOW_REFRESH_TOKEN_AUTH habilitados
6. THE Pool_Usuarios SHALL ser criado na região us-east-1
7. THE Pool_Usuarios SHALL aplicar política de senha com mínimo de 8 caracteres, exigindo pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial
8. THE Pool_Usuarios SHALL permitir auto-registro (self sign-up) de novos usuários
