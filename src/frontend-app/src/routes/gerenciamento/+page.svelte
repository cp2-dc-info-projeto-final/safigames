<script lang="ts">

    import { P, A, Heading, Card, Label, Input, Select, Button,  Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Badge} from "flowbite-svelte";
    import Menu from '../../components/Menu.svelte';
    import { onMount } from 'svelte'; // ciclo de vida
    import api from '$lib/api'; // API backend
    import type { ApiFieldError, ApiResponse } from '$lib/api';
    import type { User } from '$lib/models/User';
    import type { Personagem } from '$lib/models/Personagem';
    import { TrashBinOutline, UserEditOutline } from 'flowbite-svelte-icons'; // ícones
    import ConfirmModal from '../../components/ConfirmModal.svelte'; // modal de confirmação

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
    } 
  })

  async function listaPersonagem(){
    await buscaPersonagem();
    console.log("hino nacional")
    const tablePersonagem = document.getElementById('personagemContainer');
    const personagemButton = document.getElementById('personagemButton');
    personagemButton.style.display = "none"
    tablePersonagem.style.display = "block";
  }

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

<button 
    id="personagemButton"
    class="ml-2 px-3 py-1 bg-secondary-100 hover:bg-primary-200 text-white rounded text-lg flex items-center gap-1"
    on:click={listaPersonagem}>
    Personagem
</button>

<!-- Container de tabela personagem -->
<div id="personagemContainer" class="flex flex-col gap-4 w-full max-w-full" style="display:none">
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
          <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]" colspan="2">Gerenciar</TableHeadCell>

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
        on:click={() => {
          const tablePersonagem = document.getElementById('personagemContainer');
          tablePersonagem.style.display = "none";
          const personagemButton = document.getElementById('personagemButton');
          personagemButton.style.display = "block";
        }}>
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