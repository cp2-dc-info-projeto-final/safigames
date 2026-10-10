<script lang="ts">
  import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Button, Card, Heading, Label, Input } from "flowbite-svelte";
  import Menu from '../../../components/Menu.svelte';
  import { onMount } from 'svelte';
  import api from '$lib/api';
  import type { ApiResponse, ApiFieldError } from '$lib/api';
  import type { Comerciante } from '$lib/models/Comerciante';
  import { TrashBinOutline, FloppyDiskAltOutline, ArrowLeftOutline, UserEditOutline } from 'flowbite-svelte-icons';
  import ConfirmModal from '../../../components/ConfirmModal.svelte';
  import { goto } from '$app/navigation';

  let error = $state('');
  let comerciantes: Comerciante[] = $state([]);
  let selectedComerciante: Comerciante | null = $state(null);
  let loading = $state(false);
  let deletingId: number | null = $state(null);
  let confirmOpen = $state(false);
  let confirmTargetId: number | null = null;
  let fieldErrors: ApiFieldError[] = $state([]);
  let nome_comerciante = $state('');
  let descricao_comerciante = $state('');
  let editingId: number | null = $state(null);
  let editingName = $state('');
  let editingDesc = $state('');
  let novoNome = $state('');
  let novoDesc = $state('');

  function getElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Elemento ${id} não encontrado`);
    }
    return element;
  }

  onMount(async () => {
    buscaComerciante();
  });

  function errorOf(field: string): string | null {
    return fieldErrors.find((item) => item.field === field)?.message ?? null;
  }

  async function buscaComerciante() {
    try {
      const res = await api.get('/game/comerciante');
      const body = res.data as ApiResponse<Comerciante[]>;
      if (body.success) {
        comerciantes = body.data ?? [];
      } else {
        error = body.message ?? 'Erro ao carregar comerciantes.';
      }
    } catch (e: any) {
      console.error('Erro ao carregar comerciantes:', e);
      const body = e.response?.data as ApiResponse<Comerciante[]> | undefined;
      error = body?.message ?? 'Erro ao carregar comerciantes';
    } finally {
      loading = false;
    }
  }

  async function criaComerciante() {
    loading = true;
    error = '';
    fieldErrors = [];
    try {
      const res = await api.post('/game/comerciante', { nome: nome_comerciante, descricao: descricao_comerciante });
      const body = res.data as ApiResponse<Comerciante>;
      if (body.success && body.data) {
        comerciantes = [...comerciantes, body.data];
        nome_comerciante = '';
        descricao_comerciante = '';
        handleCancel();
        return;
      }
      error = body.message ?? 'Erro ao criar comerciante.';
      fieldErrors = (body as any).fieldErrors ?? (body as any).errors ?? [];
    } catch (e: any) {
      console.error('Erro ao criar comerciante:', e);
      const body = e.response?.data as ApiResponse<Comerciante> | undefined;
      error = body?.message ?? 'Erro ao criar comerciante.';
      fieldErrors = (body as any)?.fieldErrors ?? (body as any)?.errors ?? [];
    } finally {
      loading = false;
    }
  }

  async function editaComerciante() {
    if (!editingId) {
      return;
    }

    novoNome = editingName;
    novoDesc = editingDesc;

    try {
      const res = await api.put(`/game/comerciante/${editingId}`, { nome: novoNome, descricao: novoDesc });
      const body = res.data as ApiResponse<Comerciante>;
      if (!body.success) {
        error = body.message ?? 'Erro ao editar comerciante.';
        fieldErrors = (body as any).fieldErrors ?? (body as any).errors ?? [];
        return;
      }

      handleCancel();
    } catch (e: any) {
      const body = e.response?.data as ApiResponse<Comerciante> | undefined;
      error = body?.message ?? 'Erro ao editar comerciante.';
      fieldErrors = (body as any)?.fieldErrors ?? (body as any)?.errors ?? [];
    } finally {
      await buscaComerciante();
    }
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
      handleDelete(confirmTargetId);
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
      const res = await api.delete(`/game/comerciante/${id}`);
      const body = res.data as ApiResponse<null>;
      if (!body.success) {
        error = body.message ?? 'Erro ao remover comerciante.';
        return;
      }
      comerciantes = comerciantes.filter((comerciante) => comerciante.id !== id);
    } catch (e: any) {
      console.error('Erro ao deletar comerciante:', e);
      const body = e.response?.data as ApiResponse<null> | undefined;
      error = body?.message ?? 'Erro ao remover comerciante.';
    } finally {
      deletingId = null;
      await buscaComerciante();
    }
  }

  function handleCancel() {
    const tabela = getElement('comercianteContainer');
    tabela.style.display = 'block';

    const form = getElement('containerForm');
    form.style.display = 'none';

    const formEdit = getElement('containerFormEdit');
    formEdit.style.display = 'none';
  }

  function mostraFormEdit(comerciante_id: number, comerciante_nome: string, comerciante_descricao: string) {
    const menu = getElement('comercianteContainer');
    menu.style.display = 'none';

    const formEdit = getElement('containerFormEdit');
    formEdit.style.display = 'block';

    editingId = comerciante_id;
    editingName = comerciante_nome;
    editingDesc = comerciante_descricao;
  }
</script>

<Menu />

<svelte:head>
  <title>Gerenciamento</title>
</svelte:head>

<div class="mt-auto mb-auto" style="display:none" id="containerForm">
  <!-- Card do formulário -->
  <Card class="max-w-md mx-auto mt-10 p-0 bg-primary-900 overflow-hidden shadow-lg border border-secondary-600 rounded-lg">
    <!-- Formulário principal -->
    <form
      class="flex flex-col gap-6 p-6"
      onsubmit={(event) => {
        event.preventDefault();
        criaComerciante();
      }}
    >
      <!-- Nome  -->
      <Heading tag="h3" class="text-4xl mb-2 text-center text-secondary-100">
        Crie um comerciante
      </Heading>
      <!-- Mensagem de erro -->
      {#if error}
        <div class="text-red-500 text-center">{error}</div>
      {/if}
      <!-- Campo Nome -->
      <div>
        <Label for="nome" class="text-lg text-secondary-500">Nome</Label>
        <Input id="nome" bind:value={nome_comerciante} placeholder="Digite o nome do comerciante" required class="mt-1" />
        {#if errorOf('nome')}
          <div class="mt-1 text-sm text-red-500">{errorOf('nome')}</div>
        {/if}
      </div>
      <div>
        <Label for="descricao" class="text-lg text-secondary-500">Descrição</Label>
        <Input id="descricao" bind:value={descricao_comerciante} placeholder="Digite a descrição do comerciante" required class="mt-1" />
        {#if errorOf('descricao')}
          <div class="mt-1 text-sm text-red-500">{errorOf('descricao')}</div>
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

<!-- Card do formulário de ediçao -->
<div class="mt-auto mb-auto" style="display:none" id="containerFormEdit">
  <Card class="max-w-md mx-auto mt-10 p-0 bg-primary-900 overflow-hidden shadow-lg border border-secondary-600 rounded-lg">
    <!-- Formulário principal -->
    <form
      class="flex flex-col gap-6 p-6"
      onsubmit={(event) => {
        event.preventDefault();
        editaComerciante();
      }}
    >
      <!-- Nome  -->
      <Heading tag="h3" class="text-4xl mb-2 text-center text-secondary-100">
        Edite o comerciante
      </Heading>
      <!-- Mensagem de erro -->
      {#if error}
        <div class="text-red-500 text-center">{error}</div>
      {/if}
      <!-- Campo Nome -->
      <div>
        <Label for="nome" class="text-lg text-secondary-500">Nome</Label>
        <Input id="nome" bind:value={editingName} placeholder="Digite o nome do comerciante" required class="mt-1" />
        {#if errorOf('nome')}
          <div class="mt-1 text-sm text-red-500">{errorOf('nome')}</div>
        {/if}
      </div>
      <div>
        <Label for="descricao" class="text-lg text-secondary-500">Descrição</Label>
        <Input id="descricao" bind:value={editingDesc} placeholder="Digite a descrição do comerciante" required class="mt-1" />
        {#if errorOf('descricao')}
          <div class="mt-1 text-sm text-red-500">{errorOf('descricao')}</div>
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
        <Button type="submit" color="primary"  disabled={loading}>
          <FloppyDiskAltOutline class="inline w-5 h-5 mr-2 align-text-bottom" />
            Salvar
        </Button> 
      </div>
    </form>
  </Card>
</div>

<!-- Container de tabela comerciante -->
<div id="comercianteContainer" class="mx-auto flex h-80 min-h-0 w-full max-w-4xl flex-col items-center gap-4 overflow-y-auto px-4">
  {#if selectedComerciante}
    <section class="flex flex-col gap-4 p-4 bg-primary-900 border border-secondary-500 rounded-lg shadow-lg">
      <div class="mb-6">
        <h2 id="personagem-title" class="text-xl font-bold break-words text-secondary-500">{selectedComerciante.nome}</h2>
      </div>
      <dl class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div><dt class="font-semibold text-secondary-500">ID:</dt><dd class="text-white">{selectedComerciante.id}</dd></div>
        <div><dt class="font-semibold text-secondary-500">Descrição:</dt><dd class="text-white">{selectedComerciante.descricao}</dd></div>
      </dl>
      <div class="mt-6 flex items-center justify-center">
        <button
          type="button"
          class="px-4 py-2 rounded border border-secondary-500 hover:border-secondary-300 text-secondary-500 transition"
          onclick={() => selectedComerciante = null}>
            Fechar
        </button>
      </div>
    </section>
  {:else}
    {#if comerciantes.length > 0}
      <div class="mx-auto grid h-fit w-full max-w-3xl grid-cols-1 gap-3 overflow-y-auto p-1 sm:grid-cols-2 lg:grid-cols-2">
        {#each comerciantes as comerciante (comerciante.id)}
          <article class="relative min-h-[100px] rounded-lg border border-secondary-500 bg-primary-900 text-secondary-500 shadow-lg">
            <button
              type="button"
              class="flex h-full w-full flex-col justify-between rounded-lg p-3 pr-12 pb-2 text-left transition hover:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
              aria-label={`Ver detalhes de ${comerciante.nome}`}
              onclick={() => selectedComerciante = comerciante}>
              <div>
                <h2 class="text-lg font-bold break-words">{comerciante.nome}</h2>
                <br />
              </div>
              <div class="mt-auto flex flex-col gap-1">
                <h2 class="text-lm font-bold text-secondary-500">ID: 
                  <p class="text-white">{comerciante.id}</p>
                </h2>
              </div>
            </button>
            <div class="absolute top-3 right-3 flex flex-col gap-2">
              <button
                type="button"
                title="Editar"
                aria-label={`Editar ${comerciante.nome}`}
                class="p-2 rounded border border-green-100 hover:border-green-300 transition bg-transparent"
                onclick={() => mostraFormEdit(comerciante.id, comerciante.nome, comerciante.descricao)}>
                  <UserEditOutline class="w-5 h-5 text-primary-500" />
              </button>
              <button
                type="button"
                title="Remover"
                aria-label={`Remover ${comerciante.nome}`}
                class="p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
                onclick={() => openConfirm(comerciante.id)}
                disabled={deletingId === comerciante.id || loading}>
                  <TrashBinOutline class="w-5 h-5 text-red-400" />
              </button>
            </div>
          </article>
        {/each}
      </div>
    {:else}
      <p class="p-6 text-center rounded-lg border border-secondary-500 bg-primary-900 text-secondary-500">Nenhum comerciante encontrado!</p>
    {/if}
  {/if}
</div>
<div class="flex justify-between">
  <!-- Botão adicionar -->
  <button
    title="adicionar"
    class="px-4 py-2 rounded border border-red-50 hover:border-red-300 transition bg-transparent text-secondary-500"
    onclick={() => {
      const tabelaComerciante = getElement('comercianteContainer');
      tabelaComerciante.style.display = 'none';

      const formComerciante = getElement('containerForm');
      formComerciante.style.display = 'block';
    }}>
      Adicionar
  </button>
    <!-- Botão voltar -->
  <button
    title="voltar"
    class="px-4 py-2 rounded border border-red-50 hover:border-red-300 transition bg-transparent text-secondary-500"
    onclick={() => goto('/gerenciamento')}>
    Voltar
  </button>
</div>   


<ConfirmModal
    open={confirmOpen}
    message="Tem certeza que deseja remover este comerciante?"
    confirmText="Remover"
    cancelText="Cancelar"
    onConfirm={handleConfirm}
    onCancel={cancelarDelecao}
/>