<script lang="ts">
    import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Button, Card, Heading, Label, Input } from "flowbite-svelte";
    import Menu from '../../../components/Menu.svelte';
    import InputModal from '../../../components/InputModal.svelte';
    import { onMount } from 'svelte'; // ciclo de vida
    import api from '$lib/api'; // API backend
    import type { ApiResponse, ApiFieldError } from '$lib/api';
    import type { User } from '$lib/models/User';
    import type { Item } from '$lib/models/Item';
    import { TrashBinOutline, FloppyDiskAltOutline, ArrowLeftOutline, UserEditOutline } from 'flowbite-svelte-icons'; // ícones
    import ConfirmModal from '../../../components/ConfirmModal.svelte'; // modal de confirmação
    import { goto } from '$app/navigation';

    let user: User;
    let error = '';
    let itens: Item[] = $state([]);
    let loading: boolean;
    let deletingId: number | null = $state(null); // id em deleção
    let confirmOpen = $state(false); // modal aberto?
    let confirmTargetId: number | null = null; // id alvo do modal
    let fieldErrors: ApiFieldError[] = [];
    let tabelaItem: HTMLElement;
    let formItem: HTMLElement;
    let titulo_item: string = $state(''); // titulo digitado no form de cadastro de episódio
    let inputOpen = $state(false);
    let editingId: number | null = $state(null); // id em edição
    let editingTitle: string = $state(''); // titulo em edição
    let novoTitulo: string = $state(''); // titulo digitado que substituirá o antigo
    let itemEditado = {
      id: 0,
      titulo: ""
    }

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
        buscaItem();
    } 
  })

  function errorOf(field: string): string | null {
    return fieldErrors.find((item) => item.field === field)?.message ?? null;
  }


  async function buscaItem() {
    try{
      const res = await api.get('/game/item');
      const body = res.data as ApiResponse<Item[]>;
      if (body.success) {
        itens = body.data ?? [];
      } else {
        error = body.message;
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
      const res = await api.post('/game/item', { titulo: titulo_item });
      const body = res.data as ApiResponse<Item>;
      if (body.success && body.data) {
        itens.push(body.data);
        titulo_item = '';
        handleCancel();
      } else {
        error = body.message;
        fieldErrors = body.fieldErrors ?? [];
      }
    } catch (e: any) {
      console.error('Erro ao criar episódio:', e);
      const body = e.response?.data as ApiResponse<Item> | undefined;
      error = body?.message || 'Erro ao criar episódio.';
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
      const res = await api.delete(`/game/item/${id}`);
      const body = res.data as ApiResponse<null>;
      if (!body.success) {
        error = body.message;
        return;
      }
      itens = itens.filter(item => item.id !== id);
    } catch (e: any) {
      console.error('Erro ao deletar episódio:', e);
      const body = e.response?.data as ApiResponse<null> | undefined;
      error = body?.message || 'Erro ao remover episódio.';
    } finally {
      deletingId = null;
    }
  }

  function handleCancel() {
    tabelaItem = document.getElementById('itemContainer');
    tabelaItem.style.display = "block";
    formItem = document.getElementById('containerForm');
    formItem.style.display = "none";
  }

  function abrirModalEdit(item_id: number, item_nome: string) {
    tabelaItem = document.getElementById('itemContainer');
    tabelaItem.style.display = "none";
    editingId = item_id;
    editingTitle = item_nome;
    inputOpen = true;
  }

  async function confirmEdit(){
    novoTitulo = editingTitle;
    inputOpen = false;
    goto('/gerenciamento/item')
    try{
      const res = await api.put(`/game/item/${editingId}`, { titulo: novoTitulo });
        const body = res.data as ApiResponse<Item>;
        if (!body.success) {
          error = body.message;
          fieldErrors = body.errors;
          return;
        }
    } catch (e: any) {
      const body = e.response?.data as ApiResponse<Item> | undefined;
      error = body?.message || 'Erro ao editar titulo.';
      fieldErrors = body?.errors || [];
    }
    finally {
      buscaItem();
    }
  }

  function cancelEdit(){
    inputOpen = false;
    handleCancel();
  }
</script>

<!-- Container de tabela  -->
<div id="itemContainer" class="flex flex-col gap-4 w-full max-w-full">
  <!-- Wrapper da Tabela -->
  <div class="w-full overflow-hidden shadow-lg border border-primary-500 rounded-lg">
    <Table id="itemTable" class="w-full table-fixed border-collapse">
      <TableHead class="text-sm md:text-base bg-primary-900 text-primary-500">
        <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">Nome</TableHeadCell>
        <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">Cenas</TableHeadCell>
        <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]" colspan="2">Gerenciar</TableHeadCell>
      </TableHead>
      <TableBody>
      {#each itens as item} 
        <TableBodyRow class="text-sm md:text-base bg-primary-900 text-primary-500">
          <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">{item.titulo}</TableBodyCell>
          <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">Algumas cenas </TableBodyCell> <!-- Célula de cenas não integrada ao banco de dados -->
          <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">
            <button
              title="Remover"
              class="p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
              on:click={() => openConfirm(item.id)}
              disabled={deletingId === item.id || loading}>
              <TrashBinOutline class="w-5 h-5 text-red-400" />
            </button>
           </TableBodyCell>
          <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">
            <button
              title="Editar"
              class="p-2 rounded border border-green-100 hover:border-green-300 transition bg-transparent"
              on:click={() =>abrirModalEdit(itemEditado.id = (item.id), itemEditado.titulo = (item.titulo))}>
              <UserEditOutline class="w-5 h-5 text-primary-500" />
            </button>
          </TableBodyCell>
          

        </TableBodyRow>
      {/each}
      {#if items.length === 0}
        <TableBodyRow class="text-sm md:text-base bg-primary-900 text-primary-500">
          <TableBodyCell class="p-2 text-center break-words" colspan="8">Nenhum item encontrado!</TableBodyCell>
        </TableBodyRow>
      {/if}
      </TableBody>
    </Table>
  </div>

  
  <div class="flex justify-between">
    <!-- Botão adicionar -->
    <button
    title="adicionar"
    class="px-4 py-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent text-primary-500"
    on:click={() => {
      tabelaItem = document.getElementById('itemContainer');
      tabelaItem.style.display = "none";
      formItem = document.getElementById('containerForm');
      formItem.style.display = "block";
    }}>
    Adicionar
  </button>
    <!-- Botão voltar -->
      <button
        title="voltar"
        class="px-4 py-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent text-primary-500"
        on:click={goto('/gerenciamento')}>
        Voltar
      </button>
  </div>   
</div>