<script lang="ts">
  import Menu from '../../../components/Menu.svelte';
  import { onMount } from 'svelte'; // ciclo de vida
  import api from '$lib/api'; // API backend
  import type { ApiResponse } from '$lib/api';
  import type { User } from '$lib/models/User';
  import type { Personagem } from '$lib/models/Personagem';
  import { TrashBinOutline } from 'flowbite-svelte-icons'; // ícones
  import ConfirmModal from '../../../components/ConfirmModal.svelte'; // modal de confirmação
  import { goto } from '$app/navigation';

  let user: User;
  let error = '';
  let personagens: Personagem[] = $state([]);
  let loading = $state(false);
  let deletingId: number | null = $state(null); // id em deleção
  let confirmOpen = $state(false); // modal aberto?
  let confirmTargetId: number | null = null; // id alvo do modal
  let selectedPersonagem: Personagem | null = $state(null);

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
    } finally {
      loading = true;
      buscaPersonagem();
    } 
  })


  async function buscaPersonagem() {
    try{
      const res = await api.get('/game/personagemsemid');
      const body = res.data as ApiResponse<Personagem[]>;
      if (body.success) {
        personagens = body.data ?? [];
      } else {
        error = body.message;
      }
    } catch (e: any) {
      console.error('Erro ao carregar personagens:', e);
      const body = e.response?.data as ApiResponse<Personagem[]> | undefined;
      error = body?.message || 'Erro ao carregar personagens';
    } finally {
      loading = false;
    }
  }

  // Abre modal de confirmação
  function openConfirm(id: number) {
    confirmTargetId = id;
    confirmOpen = true;
  }
  // Fecha modal
  function closeConfirm() {
    console.log("Ta entrando")
    confirmOpen = false;
    confirmTargetId = null;
  }

    // Confirma remoção
    function handleConfirm() {
    if (confirmTargetId !== null) {
      handleDelete(confirmTargetId);
    }
    closeConfirm();
  }

  // Cancela remoção
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
        error = body.message;
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
</script>

<Menu />

<svelte:head>
  <title>Gerenciamento</title>
</svelte:head>

<!-- Personagem cards and focused details -->
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
              class="flex h-full w-full flex-col justify-between rounded-lg p-3 pr-12 pb-2 text-left transition hover:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
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
            <button
              type="button"
              title="Remover"
              aria-label={`Remover ${personagem.nome}`}
              class="absolute top-3 right-3 p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
              onclick={() => openConfirm(personagem.id)}
              disabled={deletingId === personagem.id || loading}>
                <TrashBinOutline class="w-5 h-5 text-red-400" />
            </button>
          </article>
        {/each}
      </div>
    {:else}
      <p class="p-6 text-center rounded-lg border border-secondary-500 bg-primary-900 text-secondary-500">Nenhum personagem encontrado!</p>
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

<ConfirmModal
    open={confirmOpen}
    message="Tem certeza que deseja remover este usuário?"
    confirmText="Remover"
    cancelText="Cancelar"
    onConfirm={handleConfirm}
    onCancel={cancelarDelecao}
/>