<script lang="ts">

    import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell } from "flowbite-svelte";
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
    let loading: boolean;
    let deletingId: number | null = $state(null); // id em deleção
    let confirmOpen = $state(false); // modal aberto?
    let confirmTargetId: number | null = null; // id alvo do modal


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


<!-- Container de tabela personagem -->
<div id="personagemContainer" class="flex flex-col gap-4 w-full max-w-full">
    <!-- Wrapper da Tabela -->
    <div class="w-full overflow-hidden shadow-lg border border-primary-500 rounded-lg">
      <Table id="personagemTable" class="w-full table-fixed border-collapse">
        <TableHead class="text-sm md:text-base bg-primary-900 text-primary-500">
          <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">Nome</TableHeadCell>
          <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">Vida</TableHeadCell>
          <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">Defesa</TableHeadCell>
          <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">XP</TableHeadCell>
          <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">Stamina</TableHeadCell>
          <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">Classe</TableHeadCell>
          <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">Armadura</TableHeadCell>
          <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">Dinheiro</TableHeadCell>
          <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">Usuário</TableHeadCell>
          <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">Excluir</TableHeadCell>

        </TableHead>
        <TableBody>
        {#each personagens as personagem} 
          <TableBodyRow class="text-sm md:text-base bg-primary-900 text-primary-500">
            <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">{personagem.nome}</TableBodyCell>
            <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">{personagem.vida}</TableBodyCell>
            <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">{personagem.defesa}</TableBodyCell>
            <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">{personagem.xp}</TableBodyCell>
            <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">{personagem.stamina}</TableBodyCell>
            <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">{personagem.classe}</TableBodyCell>
            <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">{personagem.armadura}</TableBodyCell>
            <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">{personagem.dinheiro}</TableBodyCell>
            <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">{personagem.id_user}</TableBodyCell>
            <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">
            <button
              title="Remover"
              class="p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
              on:click={() => openConfirm(personagem.id)}
              disabled={deletingId === personagem.id || loading}
            >
              <TrashBinOutline class="w-5 h-5 text-red-400" />
            </button>
            </TableBodyCell>
  
          </TableBodyRow>
        {/each}
        {#if personagens.length === 0}
          <TableBodyRow class="text-sm md:text-base bg-primary-900 text-primary-500">
            <TableBodyCell class="p-2 text-center break-words" colspan="8">Nenhum personagem encontrado!</TableBodyCell>
          </TableBodyRow>
        {/if}
        </TableBody>
      </Table>
    </div>
  
    <!-- Botão voltar (Fora da tabela, embaixo e à direita) -->
    <div class="flex justify-end w-full">
      <button
        title="voltar"
        class="px-4 py-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent text-primary-500"
        on:click={goto('/gerenciamento')}>
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