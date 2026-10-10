<script lang="ts">

    import { Button, Card, Heading, Label, Input, Select } from "flowbite-svelte";
    import Menu from '../../../components/Menu.svelte';
    import InputModal from '../../../components/InputModal.svelte';
    import { onMount } from 'svelte';
    import api from '$lib/api';
    import type { ApiResponse, ApiFieldError } from '$lib/api';
    import type { Episodio } from '$lib/models/Episodio';
    import type { Inimigo } from '$lib/models/Inimigo';
    import type { Comerciante } from '$lib/models/Comerciante';
    import type { Cena, CenaFormData } from '$lib/models/Cena';
    import { TrashBinOutline, FloppyDiskAltOutline, ArrowLeftOutline, CirclePlusSolid } from 'flowbite-svelte-icons';
    import ConfirmModal from '../../../components/ConfirmModal.svelte';
    import { goto } from '$app/navigation';

    let inputOpen = $state(false);
    let exibeFormCena = $state(false);
    let exibeSelect = $state(true);
    let exibeCards = $state(true);
    let selectedEpisodio: number | null = $state(null);
    let selectedCena: Cena | null = $state(null);
    let confirmOpen = $state(false);
    let exibeFormEpisodio = $state(false);
    let confirmType: 'episodio' | 'cena' | null = $state(null);

    let episodios: Episodio[] = $state([]);
    let itensSelect: any = $state([]);
    let itensSelectInimigo: any = $state([]);
    let itensSelectTipo: any = $state([
      { value: 'combate', name: 'Combate' },
      { value: 'dialogo', name: 'Diálogo' },
      { value: 'comercio', name: 'Comércio' }
    ]);
    let itensSelectComerciante: any = $state([]);
    let cenas: Cena[] = $state([]);
    let inimigos: Inimigo[] = $state([]);
    let comerciantes: Comerciante[] = $state([]);
    let fieldErrors: ApiFieldError[] = $state([]);

    let cena: CenaFormData = $state({
      id: 0,
      npc: '',
      dialogo: '',
      tipo: '',
      id_inimigo: 0,
      id_comerciante: 0,
      id_episodio: 0
    });

    let error: string = $state('');
    let loading = $state(false);
    let deletingId: number | null = $state(null);
    let confirmTargetId: number | null = $state(null);
    let titulo_episodio: string = $state('');
    let editingId: number | null = $state(null);
    let editingTitle: string = $state('');
    let novoTitulo: string = $state('');

    onMount(async () => {
      try {
        await api.get('/users/me');
      } catch (e: any) {
        const body = e.response?.data as ApiResponse<any> | undefined;
        error = body?.message || 'Erro ao carregar usuário.';
      } finally {
        loading = true;
        await Promise.all([buscaEpisodio(), buscaInimigo(), buscaComerciante()]);
      }
    });

    function errorOf(field: string): string | null {
      return fieldErrors.find((item) => item.field === field)?.message ?? null;
    }

    function extractFieldErrors(body: any): ApiFieldError[] {
      if (Array.isArray(body?.fieldErrors)) return body.fieldErrors;
      if (Array.isArray(body?.errors)) return body.errors;
      return [];
    }

    async function buscaEpisodio() {
      try {
        const res = await api.get('/game/episodio');
        const body = res.data as ApiResponse<Episodio[]>;
        if (body.success) {
          episodios = body.data ?? [];
        } else {
          error = body.message ?? 'Erro ao carregar episódios.';
        }
      } catch (e: any) {
        console.error('Erro ao carregar episodios:', e);
        const body = e.response?.data as ApiResponse<Episodio[]> | undefined;
        error = body?.message || 'Erro ao carregar episodios';
      } finally {
        loading = false;
        itensSelect = episodios.map((episodio) => ({
          value: episodio.id.toString(),
          name: episodio.titulo
        }));
      }
    }

    async function buscaInimigo() {
      try {
        const res = await api.get('/game/inimigo');
        const body = res.data as ApiResponse<Inimigo[]>;
        if (body.success) {
          inimigos = body.data ?? [];
        } else {
          error = body.message ?? 'Erro ao carregar inimigos.';
        }
      } catch (e: any) {
        console.error('Erro ao carregar inimigos:', e);
        const body = e.response?.data as ApiResponse<Inimigo[]> | undefined;
        error = body?.message || 'Erro ao carregar inimigos';
      } finally {
        loading = false;
        itensSelectInimigo = inimigos.map((inimigo) => ({
          value: inimigo.id.toString(),
          name: inimigo.nome
        }));
      }
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
        error = body?.message || 'Erro ao carregar comerciantes';
      } finally {
        loading = false;
        itensSelectComerciante = comerciantes.map((comerciante) => ({
          value: comerciante.id.toString(),
          name: comerciante.nome
        }));
      }
    }

    async function buscaCena(idEpisodio: number | null) {
      if (idEpisodio === null) {
        cenas = [];
        return;
      }
      try {
        const res = await api.get(`/game/cena/${idEpisodio}`);
        const body = res.data as ApiResponse<Cena[]>;
        if (body.success) {
          cenas = body.data ?? [];
        } else {
          error = body.message ?? 'Erro ao carregar cenas.';
        }
      } catch (e: any) {
        console.error('Erro ao carregar cenas:', e);
        const body = e.response?.data as ApiResponse<Cena[]> | undefined;
        error = body?.message || 'Erro ao carregar cenas';
      } finally {
        loading = false;
      }
    }

    async function criaCena(idEpisodio: number | null) {
      if (idEpisodio === null) return;

      loading = true;
      error = '';
      fieldErrors = [];

      try {
        const payload = { ...cena, id_episodio: idEpisodio };
        const res = await api.post(`/game/cena/${idEpisodio}`, payload);
        const body = res.data as ApiResponse<Cena>;

        if (body.success && body.data) {
          cenas = [...cenas, body.data];
          cena = {
            id: 0,
            npc: '',
            dialogo: '',
            tipo: '',
            id_inimigo: 0,
            id_comerciante: 0,
            id_episodio: idEpisodio
          };
          handleCancel();
        } else {
          error = body.message ?? 'Erro ao criar cena.';
          fieldErrors = extractFieldErrors(body);
        }
      } catch (e: any) {
        console.error('Erro ao criar cena:', e);
        const body = e.response?.data as ApiResponse<Cena> | undefined;
        error = body?.message || 'Erro ao criar cena.';
        fieldErrors = body ? extractFieldErrors(body) : [];
      } finally {
        await buscaCena(idEpisodio);
        loading = false;
      }
    }

    $effect(() => {
      if (selectedEpisodio !== null && selectedEpisodio !== undefined) {
        buscaCena(selectedEpisodio);
      }
    });

    async function criaEpisodio() {
      loading = true;
      error = '';
      fieldErrors = [];
      try {
        const res = await api.post('/game/episodio', { titulo: titulo_episodio });
        const body = res.data as ApiResponse<Episodio>;
        if (body.success && body.data) {
          episodios = [...episodios, body.data];
          titulo_episodio = '';
          handleCancel();
        } else {
          error = body.message ?? 'Erro ao criar episódio.';
          fieldErrors = extractFieldErrors(body);
        }
      } catch (e: any) {
        console.error('Erro ao criar episódio:', e);
        const body = e.response?.data as ApiResponse<Episodio> | undefined;
        error = body?.message || 'Erro ao criar episódio.';
        fieldErrors = body ? extractFieldErrors(body) : [];
      } finally {
        await buscaEpisodio();
        loading = false;
      }
    }

    function openConfirm(id: number, type: 'episodio' | 'cena') {
      confirmTargetId = id;
      confirmType = type;
      confirmOpen = true;
    }

    function closeConfirm() {
      confirmOpen = false;
      confirmTargetId = null;
      confirmType = null;
    }

    function handleConfirm() {
      if (confirmTargetId !== null) {
        if (confirmType === 'episodio') {
          handleDelete(confirmTargetId);
        } else if (confirmType === 'cena') {
          deletaCena(confirmTargetId);
        }
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
        const res = await api.delete(`/game/episodio/${id}`);
        const body = res.data as ApiResponse<null>;
        if (!body.success) {
          error = body.message ?? 'Erro ao remover episódio.';
          return;
        }
        episodios = episodios.filter((episodio) => episodio.id !== id);
      } catch (e: any) {
        console.error('Erro ao deletar episódio:', e);
        const body = e.response?.data as ApiResponse<null> | undefined;
        error = body?.message || 'Erro ao remover episódio.';
      } finally {
        await buscaEpisodio();
        selectedEpisodio = null;
        deletingId = null;
      }
    }

    async function deletaCena(id: number | null) {
      if (id === null) return;

      error = '';
      try {
        const res = await api.delete(`/game/cena/${id}`);
        const body = res.data as ApiResponse<null>;
        if (!body.success) {
          error = body.message ?? 'Erro ao remover cena.';
          return;
        }
        cenas = cenas.filter((cenaAtual) => cenaAtual.id !== id);
      } catch (e: any) {
        console.error('Erro ao deletar cena:', e);
        const body = e.response?.data as ApiResponse<null> | undefined;
        error = body?.message || 'Erro ao remover cena.';
      } finally {
        if (selectedEpisodio !== null) {
          await buscaCena(selectedEpisodio);
        }
      }
    }

    function handleCancel() {
      exibeCards = true;
      exibeSelect = true;
      exibeFormEpisodio = false;
      exibeFormCena = false;
      cena = {
        id: 0,
        npc: '',
        dialogo: '',
        tipo: '',
        id_inimigo: 0,
        id_comerciante: 0,
        id_episodio: selectedEpisodio ?? 0
      };
      fieldErrors = [];
    }

    async function confirmEdit() {
      if (editingId === null) return;

      novoTitulo = editingTitle;
      inputOpen = false;
      try {
        const res = await api.put(`/game/episodio/${editingId}`, { titulo: novoTitulo });
        const body = res.data as ApiResponse<Episodio>;
        if (!body.success) {
          error = body.message ?? 'Erro ao editar titulo.';
          fieldErrors = extractFieldErrors(body);
          return;
        }
      } catch (e: any) {
        const body = e.response?.data as ApiResponse<Episodio> | undefined;
        error = body?.message || 'Erro ao editar titulo.';
        fieldErrors = body ? extractFieldErrors(body) : [];
      } finally {
        await buscaEpisodio();
      }
    }

    function cancelEdit() {
      inputOpen = false;
      handleCancel();
    }
</script>

<Menu />

<svelte:head>
  <title>Gerenciamento</title>
</svelte:head>

{#if exibeFormEpisodio}
  <div class="mt-auto mb-auto" id="containerForm">
    <Card class="max-w-md mx-auto mt-10 p-0 bg-primary-900 overflow-hidden shadow-lg border border-secondary-600 rounded-lg">
      <form class="flex flex-col gap-6 p-6" onsubmit={(event) => { event.preventDefault(); criaEpisodio(); }}>
        <Heading tag="h3" class="text-4xl mb-2 text-center text-secondary-100">
          Crie um episódio
        </Heading>

        {#if error}
          <div class="text-red-500 text-center">{error}</div>
        {/if}

        <div>
          <Label for="titulo" class="text-lg text-secondary-500">Título</Label>
          <Input id="titulo" bind:value={titulo_episodio} placeholder="Digite o titulo do episodio" required class="mt-1" />
          {#if errorOf('titulo')}
            <div class="mt-1 text-sm text-red-500">{errorOf('titulo')}</div>
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
{/if}

{#if exibeFormCena}
  <div class="mt-auto mb-auto" id="containerFormCena">
    <Card class="max-w-md mx-auto mt-10 p-0 bg-primary-900 overflow-hidden shadow-lg border border-secondary-600 rounded-lg">
      <form class="flex flex-col gap-6 p-6">
        <Heading tag="h3" class="text-4xl mb-2 text-center text-secondary-100">
          Crie uma cena
        </Heading>

        {#if error}
          <div class="text-red-500 text-center">{error}</div>
        {/if}

        <div>
          <Label for="tipo" class="text-lg text-secondary-500">Tipo</Label>
          <Select
            id="tipo"
            class="w-80"
            items={itensSelectTipo}
            bind:value={cena.tipo}
            clearable>
          </Select>
        </div>

        {#if cena.tipo == 'dialogo'}
          <div>
            <Label for="npc" class="text-lg text-secondary-500">NPC</Label>
            <Input id="npc" bind:value={cena.npc} placeholder="Digite o nome do NPC da cena" required class="mt-1" />
            {#if errorOf('npc')}
              <div class="mt-1 text-sm text-red-500">{errorOf('npc')}</div>
            {/if}
          </div>
          <div>
            <Label for="dialogo" class="text-lg text-secondary-500">Diálogo</Label>
            <textarea id="dialogo" bind:value={cena.dialogo} placeholder="Digite o diálogo da cena" required class="mt-1 w-full resize-y min-h-[80px]"></textarea>
            {#if errorOf('dialogo')}
              <div class="mt-1 text-sm text-red-500">{errorOf('dialogo')}</div>
            {/if}
          </div>
        {/if}

        {#if cena.tipo == 'combate'}
          <div>
            <Label for="inimigo" class="text-lg text-secondary-500">Inimigo</Label>
            <Select
              id="inimigo"
              class="w-80"
              items={itensSelectInimigo}
              bind:value={cena.id_inimigo}
              clearable
            ></Select>
          </div>
        {/if}

        {#if cena.tipo == 'comercio'}
          <div>
            <Label for="comerciante" class="text-lg text-secondary-500">Comerciante</Label>
            <Select
              id="comerciante"
              class="w-80"
              items={itensSelectComerciante}
              bind:value={cena.id_comerciante}
              clearable
            ></Select>
          </div>
          <div>
            <Label for="dialogo" class="text-lg text-secondary-500">Diálogo</Label>
            <textarea id="dialogo" bind:value={cena.dialogo} placeholder="Digite o diálogo da cena" required class="mt-1 w-full resize-y min-h-[80px]"></textarea>
            {#if errorOf('dialogo')}
              <div class="mt-1 text-sm text-red-500">{errorOf('dialogo')}</div>
            {/if}
          </div>
        {/if}

        <div class="text-lg flex gap-4 justify-end mt-4">
          <Button color="light" type="button" onclick={handleCancel} disabled={loading}>
            <ArrowLeftOutline class="inline w-5 h-5 mr-2 align-text-bottom" />
              Voltar
          </Button>
          <Button type="submit" onclick={() => { criaCena(selectedEpisodio); }} color="primary" disabled={loading}>
            <FloppyDiskAltOutline class="inline w-5 h-5 mr-2 align-text-bottom" />
              Criar
          </Button>
        </div>
      </form>
    </Card>
  </div>
{/if}

{#if exibeSelect && !selectedCena}
  <div>
    <div id="divSelect">
      <Heading tag="h3" class="text-4xl mb-2 text-center text-secondary-100">
        Selecione o episodio:
      </Heading>
      <div class="flex items-center justify-center gap-2">
        {#if itensSelect.length > 0}
          <Select
            class="w-80"
            items={itensSelect}
            bind:value={selectedEpisodio}
            clearable>
          </Select>
          {#if selectedEpisodio}
            <button
              title="Remover"
              class="p-2 rounded transition bg-transparent"
              onclick={() => {
                if (selectedEpisodio !== null) {
                  openConfirm(selectedEpisodio, 'episodio');
                }
              }}
              disabled={selectedEpisodio === deletingId || loading}>
                <TrashBinOutline class="w-5 h-5 text-red-400" />
            </button>
          {/if}
        {/if}

        <button
          class="px-4 py-2 rounded border-none transition bg-transparent text-primary-50 inline"
          onclick={() => {
            exibeCards = false;
            exibeSelect = false;
            exibeFormEpisodio = true;
          }}>
            <CirclePlusSolid class="shrink-0 h-6 w-6" />
        </button>
      </div>
    </div>
  </div>
{/if}

{#if exibeCards}
  {#if selectedEpisodio}
    <div id="cenaContainer" class="mx-auto flex h-80 min-h-0 w-full max-w-4xl flex-col items-center gap-4 overflow-y-auto px-4">
      {#if selectedCena}
        <section class="w-full max-w-2xl mt-4 p-6 rounded-lg border border-secondary-500 bg-primary-900 text-secondary-500 shadow-lg" aria-labelledby="personagem-title">
          <div class="mb-6">
            <h2 id="personagem-title" class="text-xl font-bold break-words">{selectedCena.id}</h2>
          </div>
          <dl class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><dt class="font-semibold">Episodio ID:</dt><dd class="text-white">{selectedCena.id_episodio}</dd></div>
            <div><dt class="font-semibold">NPC:</dt><dd class="text-white">{((selectedCena as any).npc ?? '—')}</dd></div>
            <div><dt class="font-semibold">Inimigo ID:</dt><dd class="text-white">{((selectedCena as any).id_inimigo ?? '—')}</dd></div>
            <div><dt class="font-semibold">Inimigo:</dt><dd class="text-white">{inimigos.find(inimigo => Number(inimigo.id) === Number(selectedCena?.id_inimigo))?.nome ?? '—'}</dd></div>
            <div><dt class="font-semibold">Comerciante ID:</dt><dd class="text-white">{((selectedCena as any).id_comerciante ?? '—')}</dd></div>
            <div><dt class="font-semibold">Comerciante:</dt><dd class="text-white">{comerciantes.find(comerciante => Number(comerciante.id) === Number(selectedCena?.id_comerciante))?.nome ?? '—'}</dd></div>
            <div><dt class="font-semibold">Tipo</dt><dd class="text-white">{selectedCena.tipo}</dd></div>
            <div><dt class="font-semibold">Dialogo</dt><dd class="text-white">{((selectedCena as any).dialogo ?? '—')}</dd></div>
          </dl>

          <div class="mt-6 flex items-center justify-center">

            <button
              type="button"
              class="px-4 py-2 rounded border border-secondary-500 hover:border-secondary-300 transition"
              onclick={() => selectedCena = null}>
                Fechar
            </button>
          </div>
        </section>
      {:else}
        {#if cenas.length > 0}
          <div class="mt-4 grid h-fit w-full max-w-3xl grid-cols-1 gap-3 overflow-y-auto p-1 sm:grid-cols-2 lg:grid-cols-2">
            {#each cenas as cena (cena.id)}
              <article class="relative min-h-[100px] rounded-lg border border-secondary-500 bg-primary-900 text-secondary-500 shadow-lg">
                <button
                  type="button"
                  class="flex h-full w-full flex-col justify-between rounded-lg p-3 pr-12 pb-2 text-left transition hover:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
                  onclick={() => selectedCena = cena}>
                  <div class="mt-auto flex flex-col gap-1">
                    <div class="text-lg font-bold">
                      <span>ID:</span>
                      <span class="text-white">{cena.id}</span>
                    </div>
                    <div class="text-lm font-bold">
                      <span>
                        {#if cena.tipo === 'dialogo'}
                          NPC:
                        {:else if cena.tipo === 'combate'}
                          Inimigo:
                        {:else if cena.tipo === 'comercio'}
                          Comerciante:
                        {/if}
                      </span>
                      <span class="text-white">
                        {#if cena.tipo === 'dialogo'}
                          {cena.npc}
                        {:else if cena.tipo === 'combate'}
                          {inimigos.find(inimigo => Number(inimigo.id) === Number(cena.id_inimigo))?.nome ?? '—'}
                        {:else if cena.tipo === 'comercio'}
                          {comerciantes.find(comerciante => Number(comerciante.id) === Number(cena.id_comerciante))?.nome ?? '—'}
                        {/if}
                      </span>
                    </div>
                    <div class="text-lm font-bold">
                      <span>Tipo:</span>
                      <span class="text-white">{cena.tipo}</span>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  title="Remover"
                  class="absolute top-3 right-3 p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
                  onclick={() => openConfirm(cena.id, 'cena')}
                  disabled={deletingId === cena.id || loading}>
                    <TrashBinOutline class="w-5 h-5 text-red-400" />
                </button>
              </article>
            {/each}
          </div>
        {:else if cenas.length == 0}
          <div class="px-4 pt-4 pb-2 bg-primary-900 text-left flex items-center justify-between">
            <div class="text-lg font-semibold text-secondary-500 text-center w-full inline">Não há cenas para esse episódio!</div>
          </div>
        {/if}
      {/if}
    </div> 
  {/if}
{/if}

<div class="mt-4 flex justify-between">
  {#if selectedEpisodio}
    <button
      title="adicionar"
      class="px-4 py-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent text-secondary-500"
      onclick={() => {
        exibeFormCena = true;
        exibeSelect = false;
        exibeCards = false;
      }}>
        Adicionar Cena
    </button>
  {/if}

  <button
    title="voltar"
    class="px-4 py-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent text-secondary-500"
    onclick={() => goto('/gerenciamento')}>
      Voltar
  </button>
</div>

<ConfirmModal
  open={confirmOpen}
  message={confirmType === 'episodio' ? "Tem certeza que deseja remover este episódio?" : "Tem certeza que deseja remover esta cena?"}
  confirmText="Remover"
  cancelText="Cancelar"
  onConfirm={handleConfirm}
  onCancel={cancelarDelecao}
/>

<form onsubmit={(event) => { event.preventDefault(); confirmEdit(); }}>
  <InputModal
    open={inputOpen}
    bind:nome={editingTitle}
    onConfirm={confirmEdit}
    onEnter={confirmEdit}
    onCancel={cancelEdit}
  />
</form>