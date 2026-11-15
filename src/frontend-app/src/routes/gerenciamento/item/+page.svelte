<script lang="ts">
  import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Button, Card, Heading, Label, Input } from "flowbite-svelte";
  import Menu from '../../../components/Menu.svelte';
  import { onMount } from 'svelte';
  import api from '$lib/api';
  import type { ApiResponse, ApiFieldError } from '$lib/api';
  import type { User } from '$lib/models/User';
  import type { Item } from '$lib/models/Item';
  import { TrashBinOutline, FloppyDiskAltOutline, ArrowLeftOutline, UserEditOutline } from 'flowbite-svelte-icons';
  import ConfirmModal from '../../../components/ConfirmModal.svelte';
  import { goto } from '$app/navigation';

  type ApiResponseWithFieldErrors<T> = ApiResponse<T> & {
    fieldErrors?: ApiFieldError[];
  };

  function getFieldErrors<T>(body: ApiResponse<T> | ApiResponseWithFieldErrors<T> | undefined): ApiFieldError[] {
    return (body as ApiResponseWithFieldErrors<T> | undefined)?.fieldErrors ?? [];
  }

  const EMPTY_ITEM: Item = {
    id: 0,
    nome: '',
    descricao: '',
    tipo: '',
    fator_vida: 0,
    fator_dano: 0,
    fator_defesa: 0,
    preco: 0
  };

  let user: User | null = $state(null);
  let error = $state('');
  let itens: Item[] = $state([]);
  let selectedItem: Item | null = $state(null);
  let loading = $state(false);
  let deletingId: number | null = $state(null);
  let confirmOpen = $state(false);
  let confirmTargetId: number | null = $state(null);
  let fieldErrors: ApiFieldError[] = $state([]);
  let itemDados: Item = $state({ ...EMPTY_ITEM });
  let editingId: number | null = $state(null);
  let editingName = $state('');
  let editingDesc = $state('');
  let editingTipo = $state('');
  let editingFatorVida = $state(0);
  let editingFatorDano = $state(0);
  let editingFatorDefesa = $state(0);
  let editingPreco = $state(0);

  function errorOf(field: string): string | null {
    return fieldErrors.find((item) => item.field === field)?.message ?? null;
  }

  function resetItemDados() {
    itemDados = { ...EMPTY_ITEM };
  }

  function getElement(id: string): HTMLElement | null {
    return document.getElementById(id);
  }

  function handleCancel() {
    const table = getElement('itemContainer');
    const formCreate = getElement('containerForm');
    const formEdit = getElement('containerFormEdit');

    if (table) table.style.display = 'block';
    if (formCreate) formCreate.style.display = 'none';
    if (formEdit) formEdit.style.display = 'none';

    error = '';
    fieldErrors = [];
  }

  function openAddForm() {
    const table = getElement('itemContainer');
    const formCreate = getElement('containerForm');

    if (table) table.style.display = 'none';
    if (formCreate) formCreate.style.display = 'block';

    error = '';
    fieldErrors = [];
  }

  function mostraFormEdit(item: Item) {
    const table = getElement('itemContainer');
    const formEdit = getElement('containerFormEdit');

    if (table) table.style.display = 'none';
    if (formEdit) formEdit.style.display = 'block';

    editingId = item.id;
    editingName = item.nome;
    editingDesc = item.descricao;
    editingTipo = item.tipo;
    editingFatorVida = item.fator_vida;
    editingFatorDano = item.fator_dano;
    editingFatorDefesa = item.fator_defesa;
    editingPreco = item.preco;
    error = '';
    fieldErrors = [];
  }

  function cancelEdit() {
    handleCancel();
  }

  onMount(async () => {
    try {
      const res = await api.get('/users/me');
      const body = res.data as ApiResponse<User>;
      if (body.success && body.data) {
        user = { ...body.data };
      } else {
        error = body.message ?? 'Erro ao carregar usuário.';
      }
    } catch (e: any) {
      const body = e.response?.data as ApiResponse<User> | undefined;
      error = body?.message || 'Erro ao carregar usuário.';
    } finally {
      loading = true;
      await buscaItem();
    }
  });

  async function buscaItem() {
    try {
      const res = await api.get('/game/item');
      const body = res.data as ApiResponse<Item[]>;
      if (body.success) {
        itens = body.data ?? [];
      } else {
        error = body.message ?? 'Erro ao carregar itens.';
      }
    } catch (e: any) {
      console.error('Erro ao carregar itens:', e);
      const body = e.response?.data as ApiResponse<Item[]> | undefined;
      error = body?.message || 'Erro ao carregar itens';
    } finally {
      loading = false;
    }
  }

  async function criaItem() {
    loading = true;
    error = '';
    fieldErrors = [];

    try {
      const res = await api.post('/game/item', itemDados);
      const body = res.data as ApiResponseWithFieldErrors<Item>;

      if (body.success && body.data) {
        itens = [...itens, body.data];
        resetItemDados();
        handleCancel();
      } else {
        error = body.message ?? 'Erro ao criar item.';
        fieldErrors = getFieldErrors(body);
      }
    } catch (e: any) {
      console.error('Erro ao criar item:', e);
      const body = e.response?.data as ApiResponseWithFieldErrors<Item> | undefined;
      error = body?.message || 'Erro ao criar item.';
      fieldErrors = getFieldErrors(body);
    } finally {
      loading = false;
    }
  }

  async function editaItem() {
    if (editingId === null) return;

    const payload = {
      nome: editingName,
      descricao: editingDesc,
      tipo: editingTipo,
      fator_vida: editingFatorVida,
      fator_dano: editingFatorDano,
      fator_defesa: editingFatorDefesa,
      preco: editingPreco
    };

    try {
      const res = await api.put(`/game/item/${editingId}`, payload);
      const body = res.data as ApiResponseWithFieldErrors<Item>;

      if (!body.success) {
        error = body.message ?? 'Erro ao editar item.';
        fieldErrors = getFieldErrors(body);
        return;
      }

      itens = itens.map((item) => (item.id === editingId ? { ...item, ...payload } : item));
      handleCancel();
    } catch (e: any) {
      const body = e.response?.data as ApiResponseWithFieldErrors<Item> | undefined;
      error = body?.message || 'Erro ao editar item.';
      fieldErrors = getFieldErrors(body);
    } finally {
      await buscaItem();
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
      const res = await api.delete(`/game/item/${id}`);
      const body = res.data as ApiResponse<null>;

      if (!body.success) {
        error = body.message ?? 'Erro ao remover item.';
        return;
      }

      itens = itens.filter((item) => item.id !== id);
    } catch (e: any) {
      console.error('Erro ao deletar item:', e);
      const body = e.response?.data as ApiResponse<null> | undefined;
      error = body?.message || 'Erro ao remover item.';
    } finally {
      deletingId = null;
    }
  }
</script>

<Menu/>

<div id="itemContainer" class="mx-auto flex h-80 min-h-0 w-full max-w-4xl flex-col items-center gap-4 overflow-y-auto px-4">
  {#if selectedItem}
    <section class="w-full max-w-2xl mx-auto p-6 rounded-lg border border-secondary-500 bg-primary-900 text-secondary-500 shadow-lg" aria-labelledby="personagem-title">
      <div class="mb-6">
        <h2 id="personagem-title" class="text-xl font-bold break-words">{selectedItem.nome}</h2>
      </div>
      <dl class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div><dt class="font-semibold">ID</dt><dd class="text-white">{selectedItem.id}</dd></div>
        <div><dt class="font-semibold">Tipo</dt><dd class="text-white">{selectedItem.tipo}</dd></div>
        <div><dt class="font-semibold">Fator de vida</dt><dd class="text-white">{((selectedItem as any).fator_vida ?? '-')}</dd></div>
        <div><dt class="font-semibold">Fator de dano</dt><dd class="text-white">{((selectedItem as any).fator_dano ?? '-')}</dd></div>
        <div><dt class="font-semibold">Fator de defesa</dt><dd class="text-white">{((selectedItem as any).fator_defesa ?? '-')}</dd></div>
        <div><dt class="font-semibold">Preço</dt><dd class="text-white">{selectedItem.preco}</dd></div>
        <div><dt class="font-semibold">Descrição</dt><dd class="text-white">{selectedItem.descricao}</dd></div>
      </dl>

      <div class="mt-6 flex items-center justify-center">
        <button
          type="button"
          class="px-4 py-2 rounded border border-secondary-500 hover:border-secondary-300 transition"
          onclick={() => selectedItem = null}>
            Fechar
        </button>
      </div>
    </section>
  {:else}
    {#if itens.length > 0}
      <div class="mx-auto grid h-fit w-full max-w-3xl grid-cols-1 gap-3 overflow-y-auto p-1 sm:grid-cols-2 lg:grid-cols-2">
        {#each itens as item (item.id)}
          <article class="relative min-h-[100px] rounded-lg border border-secondary-500 bg-primary-900 text-secondary-500 shadow-lg">
            <button
              type="button"
              class="flex h-full w-full flex-col justify-between rounded-lg p-3 pr-12 pb-2 text-left transition hover:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
              aria-label={`Ver detalhes de ${item.nome}`}
              onclick={() => selectedItem = item}>
              <div>
                <h2 class="text-lg font-bold break-words">{item.nome}</h2>
                <br />
              </div>
              <div class="mt-auto flex flex-col gap-1">
                <p class="text-lm font-bold">Tipo: <span class="text-white">{item.tipo}</span></p>
                <p class="text-lm font-bold">ID: <span class="text-white">{item.id}</span></p>
              </div>
            </button>
            <button
              type="button"
              title="Remover"
              aria-label={`Remover ${item.nome}`}
              class="absolute top-3 right-3 p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
              onclick={() => openConfirm(item.id)}
              disabled={deletingId === item.id || loading}>
                <TrashBinOutline class="w-5 h-5 text-red-400" />
            </button>
          </article>
        {/each}
      </div>
    {:else}
      <p class="p-6 text-center rounded-lg border border-secondary-500 bg-primary-900 text-secondary-500">Nenhum item encontrado!</p>
    {/if}
  {/if}
  
    <!-- Botão voltar (Fora da tabela, embaixo e à direita) -->
  <div class="mt-auto flex w-full justify-end">
    <button
      title="voltar"
      class="px-4 py-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent text-secondary-500"
      onclick={() => goto('/gerenciamento')}>
        Voltar
    </button>
  </div>
</div>

<div class="mt-auto mb-auto" style="display:none" id="containerForm">
  <Card class="max-w-md mx-auto mt-10 p-0 bg-primary-900 overflow-hidden shadow-lg border border-secondary-600 rounded-lg">
    <form class="flex flex-col gap-6 p-6" onsubmit={(event) => { event.preventDefault(); criaItem(); }}>
      <Heading tag="h3" class="text-4xl mb-2 text-center text-secondary-100">
        Crie um item
      </Heading>
      {#if error}
        <div class="text-red-500 text-center">{error}</div>
      {/if}

      <div>
        <Label for="nome" class="text-lg text-secondary-500">Nome</Label>
        <Input id="nome" bind:value={itemDados.nome} placeholder="Digite o nome do item" required class="mt-1" />
        {#if errorOf('nome')}
          <div class="mt-1 text-sm text-red-500">{errorOf('nome')}</div>
        {/if}
      </div>

      <div>
        <Label for="descricao" class="text-lg text-secondary-500">Descrição</Label>
        <Input id="descricao" bind:value={itemDados.descricao} placeholder="Digite a descrição do item" required class="mt-1" />
        {#if errorOf('descricao')}
          <div class="mt-1 text-sm text-red-500">{errorOf('descricao')}</div>
        {/if}
      </div>

      <div>
        <Label for="tipo" class="text-lg text-secondary-500">Tipo</Label>
        <Input id="tipo" bind:value={itemDados.tipo} placeholder="Digite o tipo do item" required class="mt-1" />
        {#if errorOf('tipo')}
          <div class="mt-1 text-sm text-red-500">{errorOf('tipo')}</div>
        {/if}
      </div>

      <div>
        <Label for="fator_vida" class="text-lg text-secondary-500">Fator de vida</Label>
        <Input id="fator_vida" value={itemDados.fator_vida} type="number" placeholder="Digite o fator de vida do item" required class="mt-1" oninput={(event) => itemDados.fator_vida = Number((event.currentTarget as HTMLInputElement).value || 0)} />
        {#if errorOf('fator_vida')}
          <div class="mt-1 text-sm text-red-500">{errorOf('fator_vida')}</div>
        {/if}
      </div>

      <div>
        <Label for="fator_dano" class="text-lg text-secondary-500">Fator de dano</Label>
        <Input id="fator_dano" value={itemDados.fator_dano} type="number" placeholder="Digite o fator de dano do item" required class="mt-1" oninput={(event) => itemDados.fator_dano = Number((event.currentTarget as HTMLInputElement).value || 0)} />
        {#if errorOf('fator_dano')}
          <div class="mt-1 text-sm text-red-500">{errorOf('fator_dano')}</div>
        {/if}
      </div>

      <div>
        <Label for="fator_defesa" class="text-lg text-secondary-500">Fator de defesa</Label>
        <Input id="fator_defesa" value={itemDados.fator_defesa} type="number" placeholder="Digite o fator de defesa do item" required class="mt-1" oninput={(event) => itemDados.fator_defesa = Number((event.currentTarget as HTMLInputElement).value || 0)} />
        {#if errorOf('fator_defesa')}
          <div class="mt-1 text-sm text-red-500">{errorOf('fator_defesa')}</div>
        {/if}
      </div>

      <div>
        <Label for="preco" class="text-lg text-secondary-500">Preço</Label>
        <Input id="preco" value={itemDados.preco} type="number" placeholder="Digite o preço do item" required class="mt-1" oninput={(event) => itemDados.preco = Number((event.currentTarget as HTMLInputElement).value || 0)} />
        {#if errorOf('preco')}
          <div class="mt-1 text-sm text-red-500">{errorOf('preco')}</div>
        {/if}
      </div>

      <div class="text-lg flex gap-4 justify-end mt-4">
        <Button color="light" type="button" onclick={handleCancel} disabled={loading}>
          <ArrowLeftOutline class="inline w-5 h-5 mr-2 align-text-bottom" />
          Voltar
        </Button>
        <Button type="submit" color="primary" disabled={loading}>
          <FloppyDiskAltOutline class="inline w-5 h-5 mr-2 align-text-bottom" />
          Criar
        </Button>
      </div>
    </form>
  </Card>
</div>

<div class="mt-auto mb-auto" style="display:none" id="containerFormEdit">
  <Card class="max-w-md mx-auto mt-10 p-0 bg-primary-900 overflow-hidden shadow-lg border border-secondary-600 rounded-lg">
    <form class="flex flex-col gap-6 p-6" onsubmit={(event) => { event.preventDefault(); editaItem(); }}>
      <Heading tag="h3" class="text-4xl mb-2 text-center text-secondary-100">
        Edite um item
      </Heading>
      {#if error}
        <div class="text-red-500 text-center">{error}</div>
      {/if}

      <div>
        <Label for="nome" class="text-lg text-secondary-500">Nome</Label>
        <Input id="nome" bind:value={editingName} placeholder="Digite o nome do item" required class="mt-1" />
        {#if errorOf('nome')}
          <div class="mt-1 text-sm text-red-500">{errorOf('nome')}</div>
        {/if}
      </div>

      <div>
        <Label for="descricao" class="text-lg text-secondary-500">Descrição</Label>
        <Input id="descricao" bind:value={editingDesc} placeholder="Digite a descrição do item" required class="mt-1" />
        {#if errorOf('descricao')}
          <div class="mt-1 text-sm text-red-500">{errorOf('descricao')}</div>
        {/if}
      </div>

      <div>
        <Label for="tipo" class="text-lg text-secondary-500">Tipo</Label>
        <Input id="tipo" bind:value={editingTipo} placeholder="Digite o tipo do item" required class="mt-1" />
        {#if errorOf('tipo')}
          <div class="mt-1 text-sm text-red-500">{errorOf('tipo')}</div>
        {/if}
      </div>

      <div>
        <Label for="fator_vida" class="text-lg text-secondary-500">Fator de vida</Label>
        <Input id="fator_vida" value={editingFatorVida} type="number" placeholder="Digite o fator de vida do item" required class="mt-1" oninput={(event) => editingFatorVida = Number((event.currentTarget as HTMLInputElement).value || 0)} />
        {#if errorOf('fator_vida')}
          <div class="mt-1 text-sm text-red-500">{errorOf('fator_vida')}</div>
        {/if}
      </div>

      <div>
        <Label for="fator_dano" class="text-lg text-secondary-500">Fator de dano</Label>
        <Input id="fator_dano" value={editingFatorDano} type="number" placeholder="Digite o fator de dano do item" required class="mt-1" oninput={(event) => editingFatorDano = Number((event.currentTarget as HTMLInputElement).value || 0)} />
        {#if errorOf('fator_dano')}
          <div class="mt-1 text-sm text-red-500">{errorOf('fator_dano')}</div>
        {/if}
      </div>

      <div>
        <Label for="fator_defesa" class="text-lg text-secondary-500">Fator de defesa</Label>
        <Input id="fator_defesa" value={editingFatorDefesa} type="number" placeholder="Digite o fator de defesa do item" required class="mt-1" oninput={(event) => editingFatorDefesa = Number((event.currentTarget as HTMLInputElement).value || 0)} />
        {#if errorOf('fator_defesa')}
          <div class="mt-1 text-sm text-red-500">{errorOf('fator_defesa')}</div>
        {/if}
      </div>

      <div>
        <Label for="preco" class="text-lg text-secondary-500">Preço</Label>
        <Input id="preco" value={editingPreco} type="number" placeholder="Digite o preço do item" required class="mt-1" oninput={(event) => editingPreco = Number((event.currentTarget as HTMLInputElement).value || 0)} />
        {#if errorOf('preco')}
          <div class="mt-1 text-sm text-red-500">{errorOf('preco')}</div>
        {/if}
      </div>

      <div class="text-lg flex gap-4 justify-end mt-4">
        <Button color="light" type="button" onclick={handleCancel} disabled={loading}>
          <ArrowLeftOutline class="inline w-5 h-5 mr-2 align-text-bottom" />
          Voltar
        </Button>
        <Button type="submit" color="primary" disabled={loading}>
          <FloppyDiskAltOutline class="inline w-5 h-5 mr-2 align-text-bottom" />
          Salvar
        </Button>
      </div>
    </form>
  </Card>
</div>

<ConfirmModal
  open={confirmOpen}
  message="Tem certeza que deseja remover este item?"
  confirmText="Remover"
  cancelText="Cancelar"
  onConfirm={handleConfirm}
  onCancel={cancelarDelecao}
/>