<script lang=ts>
  import { P, A, Heading, Card, Label, Input, Select, Button, Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell } from "flowbite-svelte";
  import type { ApiFieldError, ApiResponse } from '$lib/api';
  import { onMount } from 'svelte';
  import type { Personagem } from '$lib/models/Personagem';
  import type { User } from '$lib/models/User';
  import ConfirmModal from '../../components/ConfirmModal.svelte';
  import api from '$lib/api';
  import { ArrowLeftOutline, FloppyDiskAltOutline, TrashBinOutline, UserEditOutline, PlaySolid } from 'flowbite-svelte-icons';
  import InputModal from "../../components/InputModal.svelte";
  import { goto } from '$app/navigation';

  let novoJ = $state("Novo jogo");
  let showTitle = $state(true);
  let carregarS = $state("Carregar save");
  let sair = $state("Sair");
  let error = $state('');
  let fieldErrors: ApiFieldError[] = $state([]);
  let nome_personagem = $state('');
  let classe_personagem = $state('');
  let loading = $state(false);
  let user: User | null = null;
  let personagens: Personagem[] = $state([]);
  let showEmptyCharacters = $state(false);
  let showBackButton = $state(false);
  let selectedPersonagem: Personagem | null = $state(null);
  let deletingId: number | null = $state(null);
  let confirmOpen = $state(false);
  let confirmTargetId: number | null = null;
  let inputOpen = $state(false);
  let editingId: number | null = $state(null);
  let editingName = $state('');
  let novoName = $state('');

  function getFieldErrors<T>(body?: ApiResponse<T>): ApiFieldError[] {
    const errors = (body as { errors?: ApiFieldError[] } | undefined)?.errors;
    return Array.isArray(errors) ? errors : [];
  }

  function errorOf(field: string): string | null {
    return fieldErrors.find((item) => item.field === field)?.message ?? null;
  }

  async function criaPersonagem() {
    fieldErrors = [];
    if (!nome_personagem || !classe_personagem) {
      fieldErrors = [{ field: 'nome', message: 'Nome e classe do personagem não podem ser vazios!' }];
      error = 'Nome e classe do personagem não podem ser vazios!';
      return;
    }

    if (!user) {
      error = 'Usuário não carregado.';
      return;
    }

    loading = true;
    error = '';
    try {
      const dadosPersonagem = {
        nome: nome_personagem,
        classe: classe_personagem,
        id: user.id
      };
      const res = await api.post('/game/personagem', dadosPersonagem);
      const body = res.data as ApiResponse<Personagem>;
      if (!body.success) {
        error = body.message ?? 'Erro ao criar personagem.';
        fieldErrors = getFieldErrors(body);
        return;
      }
    } catch (e: any) {
      const body = e.response?.data as ApiResponse<Personagem> | undefined;
      error = body?.message || 'Erro ao criar personagem.';
      fieldErrors = getFieldErrors(body);
    } finally {
      loading = false;
      await buscaPersonagem();
      const formPersonagem = document.getElementById('containerForm');
      if (formPersonagem) formPersonagem.style.display = 'none';
      const menu = document.getElementById('menu');
      if (menu) menu.style.display = 'block';
      const ultimoPersonagem = personagens[personagens.length - 1];
      if (ultimoPersonagem?.id) {
        goto(`/game/${ultimoPersonagem.id}`);
      }
    }
  }

  async function buscaPersonagem() {
    try {
      const res = await api.get('/game/personagem');
      const body = res.data as ApiResponse<Personagem[]>;
      if (body.success) {
        personagens = body.data ?? [];
      } else {
        error = body.message ?? 'Erro ao carregar personagens';
      }
    } catch (e: any) {
      console.error('Erro ao carregar personagens:', e);
      const body = e.response?.data as ApiResponse<Personagem[]> | undefined;
      error = body?.message || 'Erro ao carregar personagens';
    } finally {
      loading = false;
    }
  }

  function setElementDisplay(id: string, display: 'block' | 'none' | 'flex') {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = display;
    }
  }

  function handleCancel() {
    showTitle = true;
    setElementDisplay('menu', 'block');
    setElementDisplay('containerForm', 'none');
  }

  function openConfirm(id: number) {
    confirmTargetId = id;
    confirmOpen = true;
  }

  function closeConfirm() {
    confirmOpen = false;
    confirmTargetId = null;
  }

  function handleConfirm() {
    if (confirmTargetId !== null) {
      void handleDelete(confirmTargetId);
    }
    closeConfirm();
  }

  function cancelarDelecao() {
    closeConfirm();
  }

  async function handleDelete(id: number) {
    deletingId = id;
    error = '';
    try {
      const res = await api.delete(`/game/personagem/${id}`);
      const body = res.data as ApiResponse<null>;
      if (!body.success) {
        error = body.message ?? 'Erro ao remover usuário.';
        return;
      }
      personagens = personagens.filter(personagem => personagem.id !== id);
    } catch (e: any) {
      console.error('Erro ao deletar usuário:', e);
      const body = e.response?.data as ApiResponse<null> | undefined;
      error = body?.message || 'Erro ao remover usuário.';
    } finally {
      deletingId = null;
    }
  }

  function mostraFormPersonagem() {
    showTitle = false;
    showEmptyCharacters = false;
    setElementDisplay('menu', 'none');
    setElementDisplay('containerForm', 'flex');
  }

  async function listaPersonagem() {
    showBackButton = true;
    await buscaPersonagem();
    showEmptyCharacters = personagens.length === 0;
    setElementDisplay('menu', 'none');
    setElementDisplay('personagemContainer', 'block');
  }

  function abrirModalEdit(personagem_id: number, personagem_nome: string) {
    editingId = personagem_id;
    editingName = personagem_nome;
    inputOpen = true;
  }

  function cancelEdit() {
    inputOpen = false;
  }

  async function confirmEdit() {
    if (editingId === null) {
      return;
    }

    novoName = editingName.trim();
    if (!novoName) {
      error = 'Nome do personagem não pode ser vazio.';
      fieldErrors = [{ field: 'nome', message: 'Nome do personagem não pode ser vazio.' }];
      return;
    }

    inputOpen = false;
    try {
      const res = await api.put(`/game/personagem/${editingId}`, { nome: novoName });
      const body = res.data as ApiResponse<Personagem>;
      if (!body.success) {
        error = body.message ?? 'Erro ao editar nome.';
        fieldErrors = getFieldErrors(body);
        return;
      }
    } catch (e: any) {
      const body = e.response?.data as ApiResponse<Personagem> | undefined;
      error = body?.message || 'Erro ao editar nome.';
      fieldErrors = getFieldErrors(body);
    } finally {
      await buscaPersonagem();
    }
  }

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
        error = body.message ?? 'Erro ao carregar usuário.';
      }
    } catch (e: any) {
      const body = e.response?.data as ApiResponse<User> | undefined;
      error = body?.message || 'Erro ao carregar usuário.';
    }
  });
</script>

<style>
  :global(body) {
    font-family: 'fonte-topiy';
  }
</style>

<svelte:head>
  <title>Esgotamento</title>
</svelte:head>

{#if showTitle}
<div class="text-center fixed top-4 left-1/2 -translate-x-1/2 z-50 text-white px-4 py-2 rounded">
    <img src="/images/titulo_grafite_sem_fundo_pixelado.png" alt="ESGOTAMENTO">
</div>
{/if}
<div class="text-center fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 text-white p-6 rounded-lg" id="menu">
    <A 
      class="text-primary-600 hover:text-secondary-500 text-4xl" 
      onclick={mostraFormPersonagem} onmouseenter={() => novoJ = "> Novo jogo <"} 
      onmouseleave={() => novoJ = "Novo jogo"}>
        {novoJ}
    </A><br>
    <A 
      class="text-primary-600 mt-6 mb-6 text-4xl hover:text-secondary-500" 
      onclick={listaPersonagem} 
      onmouseenter={() => carregarS = "> Carregar save <"} 
      onmouseleave={() => carregarS = "Carregar Save"}>
        {carregarS}
    </A><br>
    <A 
      class="text-primary-600 text-4xl hover:text-secondary-500" 
      href="/" 
      onmouseenter={() => sair= "> Sair <"} 
      onmouseleave={() => sair = "Sair"}>
        {sair}
    </A>
</div>

<div class=" text-center fixed bottom-6 right-6 z-50 text-white p-4 rounded-full">
    <P class="text-primary-500">Por: Safigames</P>
</div>

<div class="fixed inset-0 items-center justify-center overflow-hidden" style="display:none" id="containerForm">
  <!-- Card do formulário -->
  <Card class="max-w-md mx-auto mt-10 p-0 bg-primary-900 overflow-hidden shadow-lg border border-primary-600 rounded-lg">
    <!-- Formulário principal -->
    <form class="flex flex-col gap-6 p-6" onsubmit={(event) => { event.preventDefault(); void criaPersonagem(); }}>
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
<div id="personagemContainer" class="mx-auto flex h-80 min-h-0 w-full max-w-4xl flex-col items-center gap-4 overflow-y-auto px-4">
  {#if selectedPersonagem}
    <section class="w-full max-w-2xl mx-auto p-6 rounded-lg border border-secondary-500 bg-primary-900 text-secondary-500 shadow-lg" aria-labelledby="personagem-title">
      <div class="mb-6">
        <h2 id="personagem-title" class="text-xl font-bold break-words">{selectedPersonagem.nome}</h2>
      </div>
      <dl class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div><dt class="font-semibold">Vida</dt><dd class="text-white">{selectedPersonagem.vida}</dd></div>
        <div><dt class="font-semibold">Defesa</dt><dd class="text-white">{selectedPersonagem.defesa}</dd></div>
        <div><dt class="font-semibold">XP</dt><dd class="text-white">{selectedPersonagem.xp}</dd></div>
        <div><dt class="font-semibold">Stamina</dt><dd class="text-white">{selectedPersonagem.stamina}</dd></div>
        <div><dt class="font-semibold">Classe</dt><dd class="text-white">{selectedPersonagem.classe}</dd></div>
        <div><dt class="font-semibold">Armadura</dt><dd class="text-white">{selectedPersonagem.armadura}</dd></div>
        <div><dt class="font-semibold">Dinheiro</dt><dd class="text-white">{selectedPersonagem.dinheiro}</dd></div>
        <div><dt class="font-semibold">Usuário</dt><dd class="text-white">{((selectedPersonagem as any).id_user ?? '—')}</dd></div>
        <div><dt class="font-semibold">ID</dt><dd class="text-white">{selectedPersonagem.id}</dd></div>
      </dl>

      <div class="mt-6 flex items-center justify-center">
        <button
          type="button"
          class="px-4 py-2 rounded border border-secondary-500 hover:border-secondary-300 transition"
          onclick={() => selectedPersonagem = null}>
            Fechar
        </button>
      </div>
    </section>
  {:else}
    {#if personagens.length > 0}
      <div class="mx-auto grid h-fit w-full max-w-3xl grid-cols-1 gap-3 overflow-y-auto p-1 sm:grid-cols-2 lg:grid-cols-2">
        {#each personagens as personagem (personagem.id)}
          <article class="relative min-h-[100px] rounded-lg border border-secondary-500 bg-primary-900 text-secondary-500 shadow-lg">
            <button
              type="button"
              class="flex h-full w-full flex-col justify-between rounded-lg p-3 pr-16 pb-2 text-left transition hover:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
              aria-label={`Ver detalhes de ${personagem.nome}`}
              onclick={() => selectedPersonagem = personagem}>
              <div>
                <h2 class="text-lg font-bold break-words">{personagem.nome}</h2>
                <br />
              </div>
              <div class="mt-auto flex flex-col gap-1">
                <h2 class="text-lm font-bold">User ID: 
                  <p class="text-white">{((personagem as any).id_user ?? '—')}</p>
                </h2>
                <h2 class="text-lm font-bold">ID: 
                  <p class="text-white">{personagem.id}</p>
                </h2>
              </div>
            </button>
            <div class="absolute top-3 right-3 flex flex-col gap-2">
              <button
                title="Carregar"
                class="p-2 rounded border border-green-100 hover:border-green-300 transition bg-transparent"
                onclick={() => goto(`/game/${personagem.id}`)}>
                  <PlaySolid class="w-5 h-5 text-primary-500" />
              </button>
              <button
                title="Editar"
                class="p-2 rounded border border-green-100 hover:border-green-300 transition bg-transparent"
                onclick={() => abrirModalEdit(personagem.id, personagem.nome)}>
                  <UserEditOutline class="w-5 h-5 text-primary-500" />
              </button>
              <button
                type="button"
                title="Remover"
                aria-label={`Remover ${personagem.nome}`}
                class="p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
                onclick={() => openConfirm(personagem.id)}
                disabled={deletingId === personagem.id || loading}>
                  <TrashBinOutline class="w-5 h-5 text-red-400" />
              </button>
            </div>
          </article>
        {/each}
      </div>
    {:else if showEmptyCharacters}
      <p class="mt-4 p-6 text-center rounded-lg border border-secondary-500 bg-primary-900 text-secondary-500">Nenhum personagem encontrado!</p>
    {/if}
  {/if}
  
    <!-- Botão voltar (Fora da tabela, embaixo e à direita) -->
  {#if showBackButton}
    <div class="mt-auto flex w-full justify-end">
      <button
        title="voltar"
        class="mt-4 px-4 py-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent text-secondary-500"
        onclick={() => window.location.reload()}>
          Voltar
      </button>
    </div>
  {/if}
</div>

<ConfirmModal
  open={confirmOpen}
  message="Tem certeza que deseja remover este usuário?"
  confirmText="Remover"
  cancelText="Cancelar"
  onConfirm={handleConfirm}
  onCancel={cancelarDelecao}
/>