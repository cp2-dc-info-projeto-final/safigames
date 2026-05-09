## Casos de Uso:

### Caso de uso 1: Gerenciar cadastro

#### Atores:

- User.
  
#### Fluxo principal:

- O user seleciona a opção “Cadastre-se”.
  
- O sistema leva o user até a tela de registro contendo um formulário.
  
- O user preenche os campos do formulário (informando nome de usuário e criando uma senha).
  
- O sistema consulta o banco de dados para verificar a disponibilidade das informações fornecidas.
  
- O banco de dados retorna uma confirmação positiva.
  
- O sistema realiza o cadastro, salvando os dados do novo user.
  
- O sistema encaminha o user para o menu principal do jogo.

#### Fluxo Alternativo A: O email já está cadastrado

- O sistema apresenta formulário de cadastro.
 
- O user preenche os campos.

- O sistema consulta o banco de dados.

- O banco de dados retorna que o email informado já está em uso.

- O sistema exibe uma mensagem de erro informando que o email digitado já está em uso.

#### Fluxo Alternativo B: Campo vazio

- O sistema apresenta formulário de cadastro.

- O user não preenche um dos campos e clica no botão de "Criar Conta"

- O sistema analisa os campos de cadastro e pede que o user preencha todos os campos.

#### Fluxo Alternativo C: Senha diferente dos padrões exigidos

- O sistema apresenta formulário de cadastro.

- O user insere uma senha.

- O sistema analisa se a senha está dentro dos padrões exigidos (mínimo 6 caracteres)

- O sistema exibe uma mensagem de erro e informa ao user que a senha está fora dos padrões.

- O sistema exibe uma mensagem sugerindo que o user coloque a senha correta.

#### Fluxo Alternativo D: Excluir user

- O user acessa o menu do seu perfil com as configurações da sua conta.

- O user aperta o botão excluir conta.

- O sistema solicita a senha do user para proseguir com a exclusão.
  
- O usário digita a senha.
  
- O sistema analisa a veracidade da senha no banco de dados.
  
- O banco de dados retorna uma confirmação positiva.
  
- O sistema pergunta se quer confirmar a exclusão.
  
- O user aperta o botão confirmar.
  
- O sistema apaga os dados do user no banco de dados.
  
- O sistema apresenta mensagem de sucesso.

#### Fluxo Alternativo E: Editar cadastro do user

- O user acessa o menu do seu perfil com as configurações da sua conta.

- O user aperta o botão "editar dados".
  
- O sistema exibe os dados de cadastro do user.

- O user edita dados do seu cadastro e aperta o botão confirmar.
  
- O sistema edita os dados do user no banco de dados.

### Caso de Uso 2: Fazer log-in.

#### Atores: 

- User

#### Fluxo principal:

- O user seleciona a opção "Login".

- O sistema leva o user até a tela de preenchimento de senha e nome de usuário.

- User preenche os campos da tela.

- O sistema consulta o banco de dados para a confirmação dos dados inseridos.

- O banco de dados retorna uma confirmação positiva.

- O sistema encaminha o user para o menu principal do jogo.

#### Fluxo Alternativo A: Email inválido

- O sistema apresenta a página de formulário de Login.

- O user insere um email.

- O sistema consulta o banco de dados.

- O banco de dados retorna que o email informado já está em uso.

- O sistema exibe uma mensagem dizendo que o email está inválido e sugere que o user digite outro email.

#### Fluxo Alternativo B: Senha inválida

- O sistema apresenta a página de formulário de Login.

- O user insere uma senha.

- O sistema consulta o banco de dados.

- O banco de dados retorna que a senha informada está inválida.

- O sistema exibe uma mensagem dizendo que a senha está invalida e sugere que o user insira uma senha correta.

#### Fluxo Alternativo C: Campo vazio

- O sistema apresenta a página de formulário de Login.

- O user não preenche um dos campos e clica no botão de "Login".

- O sistema analisa os campos de cadastro e pede que o user preencha todos os campos.

### Caso de Uso 3: Jogar

#### Atores: 

- Jogador

#### Fluxo principal: 

- O jogador acessa o menu principal do jogo

- O jogador clica no botão "Iniciar jogo"

- O jogador não tem slots de save iniciados

- O jogador inicia um novo save

- O jogador pode interagir dentro do jogo com comandos

#### Fluxo alternativo A: Carregar save

- O jogador acessa o menu principal do jogo

- O jogador clica no botão "Iniciar jogo"

- O jogador já tem slots de save iniciado (no mínimo 1)

- O jogador inicia o save existente

- O jogador pode interagir dentro do jogo com comandos

### Caso de Uso 4: Excluir save

#### Atores: 

- Jogador

#### Fluxo principal: 

- O jogador acessa o menu principal do jogo 

- O jogador clica em "Saves"

- O jogador escolhe um save e clica em "Excluir save"

- O sistema faz requisição ao banco de dados para excluir os dados do save

- O banco de dados exclui os dados do save e retorna uma mensagem de sucesso

#### Fluxo alternativo: Não há saves

- O jogador acessa o menu principal do jogo 

- O jogador clica em "Saves"

- A página exibe a mensagem "Não há saves existentes"

- O jogador clica no botão voltar

- O jogador volta para o menu inicial

### Caso de Uso 5: Gerenciar inimigos

#### Atores: 

- Adm

#### Fluxo principal: 

- O adm acessa o menu principal do jogo

- O adm acessa a página "Inimigos"

- A página exibe uma lista com todos os inimigos

- O adm pode criar, editar, e excluir inimigos
 
### Caso de Uso 6: Gerenciar NPCs

#### Atores: 

- Adm

#### Fluxo principal: 

- O adm acessa o menu principal do jogo

- O adm acessa a página "NPCs"

- A página exibe uma lista com todos os NPCs

- O adm pode criar, editar, e excluir NPCs

### Caso de Uso 7: Excluir jogadores

#### Atores: 

- Adm

#### Fluxo principal: 

- O adm acessa o menu principal do jogo

- O adm acessa a página "jogadores"

- A página exibe uma lista com todos os jogadores

- O adm clica num botão "Excluir jogador" e exclui o jogador correspondente ao botão