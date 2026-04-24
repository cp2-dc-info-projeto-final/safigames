## Casos de Uso:

### Caso de uso 1: Gerenciar cadastro

#### Atores:

- User.
  
#### Fluxo principal:

- O user seleciona a opção “Criar conta”.
  
- O sistema leva o user até a tela de registro contendo um formulário.
  
- O user preenche os campos do formulário (informando nome de usuário e criando uma senha).
  
- O sistema consulta o banco de dados para verificar a disponibilidade das informações fornecidas.
  
- O banco de dados retorna uma confirmação positiva.
  
- O sistema realiza o cadastro, salvando os dados do novo user.
  
- O sistema encaminha o user para o menu principal do jogo.

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

### Caso de Uso 3: Jogar

#### Atores: 

- Jogador

#### Fluxo principal: 

- O jogador acessa o menu principal do jogo

- O jogador clica no botão "Iniciar jogo"

- O jogador inicia um novo save

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