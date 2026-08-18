<script lang=ts>
    import { P, A, Heading, Card, Label, Input, Select, Button,  Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Badge} from "flowbite-svelte";
    import type { ApiFieldError, ApiResponse } from '$lib/api';
    import { onMount } from 'svelte'; // ciclo de vida
    import type { Personagem } from '$lib/models/Personagem';
    import type { User } from '$lib/models/User';
    import api from '$lib/api'; // API backend
    import { ArrowLeftOutline, FloppyDiskAltOutline, TrashBinOutline, UserEditOutline } from 'flowbite-svelte-icons'; // ícones

    let novoJ = $state("Novo jogo");
    let carregarS = $state("Carregar save");
    let sair = $state("Sair");
    let error = '';
    let fieldErrors: ApiFieldError[] = [];
    let nome_personagem = $state('');
    let classe_personagem = $state('');
    let loading: boolean;
    let user: User;
 

    async function criaPersonagem() {
      fieldErrors = [];

      if (!nome_personagem || !classe_personagem){
        fieldErrors = [{ field: 'nome', message: 'Nome e classe do personagem não podem ser vazios!' }];
        error = 'Nome e classe do personagem não podem ser vazios!';
        return;
      }

      loading = true;
      error = '';
      try{
        const dadosPersonagem = {
          nome: nome_personagem, 
          classe: classe_personagem, 
          id: user.id
        }

        const res = await api.post('/game/personagem', dadosPersonagem);
        const body = res.data as ApiResponse<Personagem>;
        if (!body.success) {
          error = body.message;
          fieldErrors = body.errors;
          return;
      } 
    } catch (e: any){
      const body = e.response?.data as ApiResponse<Personagem> | undefined;
        error = body?.message || 'Erro ao criar personagem.';
      } finally {
        loading = false;
    }
  }
    function errorOf(field: string): string | null {
    return fieldErrors.find((item) => item.field === field)?.message ?? null;
  }

  function handleCancel() {
    const menu = document.getElementById('menu');
    const formPersonagem = document.getElementById('containerForm');
    menu.style.display = "block";
    formPersonagem.style.display = "none";
  }

  function mostraFormPersonagem(){
    const formPersonagem = document.getElementById('containerForm');
    const menu = document.getElementById('menu');
    menu.style.display = "none"
    formPersonagem.style.display = "block";
  }

  function listaPersonagem(){
    const tablePersonagem = document.getElementById('personagemContainer');
    const menu = document.getElementById('menu');
    menu.style.display = "none"
    tablePersonagem.style.display = "block";
  }

  // Opções de roles
  const classeOptions = [
    { value: 'Guerreiro', name: 'Guerreiro' },
    { value: 'Assassino', name: 'Assassino' }
  ];

  onMount(async () => {
    try {
        const res = await api.get(`/users/me`);
        const body = res.data as ApiResponse<User>;
        if (body.success && body.data) {
          user = { ...body.data };
        } else {
          error = body.message;
        }
      } catch (e: any) {
        const body = e.response?.data as ApiResponse<User> | undefined;
        error = body?.message || 'Erro ao carregar usuário.';
      } finally {
    } 
  }) 

</script>

<style>
    :global(body) {
  font-family: 'fonte-topiy';
}
</style>

<svelte:head>
  <title>Esgotamento</title>
</svelte:head>

<div class="text-center fixed top-4 left-1/2 -translate-x-1/2 z-50 text-white px-4 py-2 rounded">
    <img src="/images/titulo_grafite_sem_fundo_pixelado.png" alt="ESGOTAMENTO">
</div>
<div class="text-center fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 text-white p-6 rounded-lg" id="menu">
    <A class="text-primary-600 hover:text-secondary-50 text-4xl" onclick={mostraFormPersonagem} onmouseenter={() => novoJ = "> Novo jogo <"} onmouseleave={() => novoJ = "Novo jogo"}>{novoJ}</A><br>
    <A class="text-primary-600 mt-6 mb-6 text-4xl hover:text-secondary-50" onclick={listaPersonagem} onmouseenter={() => carregarS = "> Carregar save <"} onmouseleave={() => carregarS = "Carregar Save"} >{carregarS}</A><br>
    <A class="text-primary-600 text-4xl hover:text-secondary-50" href="/" onmouseenter={() => sair= "> Sair <"} onmouseleave={() => sair = "Sair"}>{sair}</A>
</div>

<div class=" text-center fixed bottom-6 right-6 z-50 text-white p-4 rounded-full">
    <P class="text-primary-500">Por: Safigames</P>
</div>

<div class="mt-auto mb-auto" style="display:none" id="containerForm">
<!-- Card do formulário -->
<Card class="max-w-md mx-auto mt-10 p-0 bg-primary-900 overflow-hidden shadow-lg border border-primary-600 rounded-lg">
    <!-- Formulário principal -->
    <form class="flex flex-col gap-6 p-6" on:submit|preventDefault={criaPersonagem}>
      <!-- Título -->
      <Heading tag="h3" class="text-4xl mb-2 text-center text-primary-100">
        Crie seu personagem
      </Heading>
      <!-- Mensagem de erro -->
      {#if error}
        <div class="text-red-500 text-center">{error}</div>
      {/if}
      <!-- Campo Nome -->
      <div>
        <Label for="nome" class="text-lg text-primary-500">Nome</Label>
        <Input id="nome" bind:value={nome_personagem} placeholder="Digite o nome do personagem" required class="mt-1" />
        {#if errorOf('nome')}
          <div class="mt-1 text-sm text-red-500">{errorOf('nome')}</div>
        {/if}
      </div>
  
      <!-- Campo classe -->
      <div>
            <Label for="classe" class="text-lg text-primary-500">Escolha sua classe</Label>
            <Select id="classe" bind:value={classe_personagem}  items={classeOptions} class="mt-1" />
        {#if errorOf('role')}
          <div class="mt-1 text-sm text-red-500">{errorOf('role')}</div>
        {/if}
      </div>
      <!-- Botões de ação -->
      
      <div class="text-lg flex gap-4 justify-end mt-4">
        <!-- Botão cancelar/voltar -->
        <Button color="light" type="button" onclick={handleCancel} disabled={loading}>
          <ArrowLeftOutline class="inline w-5 h-5 mr-2 align-text-bottom" />
            Voltar
        </Button>
        <!-- Botão salvar -->
        <Button type="submit" color="primary" disabled={loading}>
          <FloppyDiskAltOutline class="inline w-5 h-5 mr-2 align-text-bottom" />
            Criar
        </Button> 
      </div>
    </form>
    
  </Card>
</div>

<!-- Container de tabela personagem -->
<div id="personagemContainer" class="flex flex-col gap-4 w-full max-w-full" style="display:none">
  <!-- Wrapper da Tabela -->
  <div class="w-full overflow-hidden shadow-lg border border-primary-500 rounded-lg">
    <Table id="personagemTable" class="w-full table-fixed border-collapse">
      <TableHead class="text-sm md:text-base bg-primary-900 text-primary-500">
        <TableHeadCell class="p-2 text-center break-words">Nome</TableHeadCell>
        <TableHeadCell class="p-2 text-center break-words">Vida</TableHeadCell>
        <TableHeadCell class="p-2 text-center break-words">Defesa</TableHeadCell>
        <TableHeadCell class="p-2 text-center break-words">XP</TableHeadCell>
        <TableHeadCell class="p-2 text-center break-words">Stamina</TableHeadCell>
        <TableHeadCell class="p-2 text-center break-words">Classe</TableHeadCell>
        <TableHeadCell class="p-2 text-center break-words">Armadura</TableHeadCell>
        <TableHeadCell class="p-2 text-center break-words">Dinheiro</TableHeadCell>
      </TableHead>
      <TableBody>
        <TableBodyRow class="text-sm md:text-base bg-primary-900 text-primary-500">
          <TableBodyCell class="p-2 text-center break-words">El matador</TableBodyCell>
          <TableBodyCell class="p-2 text-center break-words">100</TableBodyCell>
          <TableBodyCell class="p-2 text-center break-words">20</TableBodyCell>
          <TableBodyCell class="p-2 text-center break-words">0</TableBodyCell>
          <TableBodyCell class="p-2 text-center break-words">5</TableBodyCell>
          <TableBodyCell class="p-2 text-center break-words">Assassino</TableBodyCell>
          <TableBodyCell class="p-2 text-center break-words">Sem armadura</TableBodyCell>
          <TableBodyCell class="p-2 text-center break-words">42</TableBodyCell>
        </TableBodyRow>
      </TableBody>
    </Table>
  </div>

  <!-- Botão voltar (Fora da tabela, embaixo e à direita) -->
  <div class="flex justify-end w-full">
    <button
      title="voltar"
      class="px-4 py-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent text-primary-500"
      on:click={() => {
        const tablePersonagem = document.getElementById('personagemContainer');
        const menu = document.getElementById('menu');
        menu.style.display = "block";
        tablePersonagem.style.display = "none";
      }}>
      Voltar
    </button>
  </div>
</div>


<!-- Div para a tabela de personagens
<div>
  <Table id="personagemTable" class="w-full h-full mx-auto shadow-lg border border-primary-500 rounded-lg" style="display:none">
    <TableHead class="text-lg bg-primary-900 text-primary-500">
      <TableHeadCell class="w-32">Nome</TableHeadCell>
      <TableHeadCell class="w-32">Vida</TableHeadCell>
      <TableHeadCell class="w-32">Defesa</TableHeadCell>
      <TableHeadCell class="w-24">XP</TableHeadCell>
      <TableHeadCell class="w-32">Stamina</TableHeadCell>
      <TableHeadCell class="w-32">Classe</TableHeadCell>
      <TableHeadCell class="w-32">Armadura</TableHeadCell>
      <TableHeadCell class="w-32">Dinheiro</TableHeadCell>
    </TableHead>
    <TableBody>
        <TableBodyRow class="text-lg bg-primary-900 text-primary-500" >
          <TableBodyCell>El matador</TableBodyCell>
          <TableBodyCell>100</TableBodyCell>
          <TableBodyCell>20</TableBodyCell>
          <TableBodyCell>0</TableBodyCell>
          <TableBodyCell>5</TableBodyCell>
          <TableBodyCell>Assassino</TableBodyCell>
          <TableBodyCell>Sem armadura</TableBodyCell>
          <TableBodyCell>42</TableBodyCell>
          <TableBodyCell>
            Botão voltar
            <button
              title="voltar"
              class="p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent">
              Voltar
            </button>
          </TableBodyCell>
        </TableBodyRow>
    </TableBody>
  </Table>
</div> -->