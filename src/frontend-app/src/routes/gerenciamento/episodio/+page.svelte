<script lang="ts">

    import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Button, Card, Heading, Label, Input } from "flowbite-svelte";
    import Menu from '../../../components/Menu.svelte';
    import InputModal from '../../../components/InputModal.svelte';
    import { onMount } from 'svelte'; // ciclo de vida
    import api from '$lib/api'; // API backend
    import type { ApiResponse, ApiFieldError } from '$lib/api';
    import type { User } from '$lib/models/User';
    import type { Episodio } from '$lib/models/Episodio';
    import { TrashBinOutline, FloppyDiskAltOutline, ArrowLeftOutline, UserEditOutline } from 'flowbite-svelte-icons'; // ícones
    import ConfirmModal from '../../../components/ConfirmModal.svelte'; // modal de confirmação
    import { goto } from '$app/navigation';

    let user: User;
    let error = '';
    let episodios: Episodio[] = $state([]);
    let loading: boolean;
    let deletingId: number | null = $state(null); // id em deleção
    let confirmOpen = $state(false); // modal aberto?
    let confirmTargetId: number | null = null; // id alvo do modal
    let fieldErrors: ApiFieldError[] = [];
    let tabelaEpisodio: HTMLElement;
    let formEpisodio: HTMLElement;
    let titulo_episodio: string = $state(''); // titulo digitado no form de cadastro de episódio
    let inputOpen = $state(false);
    let editingId: number | null = $state(null); // id em edição
    let editingTitle: string = $state(''); // titulo em edição
    let novoTitulo: string = $state(''); // titulo digitado que substituirá o antigo
    let episodioEditado = {
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
        buscaEpisodio();
    } 
  })

  function errorOf(field: string): string | null {
    return fieldErrors.find((item) => item.field === field)?.message ?? null;
  }


  async function buscaEpisodio() {
    try{
      const res = await api.get('/game/episodio');
      const body = res.data as ApiResponse<Episodio[]>;
      if (body.success) {
        episodios = body.data ?? [];
      } else {
        error = body.message;
      }
    } catch (e: any) {
        console.error('Erro ao carregar episodios:', e);
        const body = e.response?.data as ApiResponse<Episodio[]> | undefined;
        error = body?.message || 'Erro ao carregar episodios';
      } finally {
          loading = false;
        }
  }

  async function criaEpisodio() {
    loading = true;
    error = '';
    fieldErrors = [];
    try {
      const res = await api.post('/game/episodio', { titulo: titulo_episodio });
      const body = res.data as ApiResponse<Episodio>;
      if (body.success && body.data) {
        episodios.push(body.data);
        titulo_episodio = '';
        handleCancel();
      } else {
        error = body.message;
        fieldErrors = body.fieldErrors ?? [];
      }
    } catch (e: any) {
      console.error('Erro ao criar episódio:', e);
      const body = e.response?.data as ApiResponse<Episodio> | undefined;
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
      const res = await api.delete(`/game/episodio/${id}`);
      const body = res.data as ApiResponse<null>;
      if (!body.success) {
        error = body.message;
        return;
      }
      episodios = episodios.filter(episodio => episodio.id !== id);
    } catch (e: any) {
      console.error('Erro ao deletar episódio:', e);
      const body = e.response?.data as ApiResponse<null> | undefined;
      error = body?.message || 'Erro ao remover episódio.';
    } finally {
      deletingId = null;
    }
  }

  function handleCancel() {
    tabelaEpisodio = document.getElementById('episodioContainer');
    tabelaEpisodio.style.display = "block";
    formEpisodio = document.getElementById('containerForm');
    formEpisodio.style.display = "none";
  }

  function abrirModalEdit(personagem_id: number, personagem_nome: string) {
    tabelaEpisodio = document.getElementById('episodioContainer');
    tabelaEpisodio.style.display = "none";
    editingId = personagem_id;
    editingTitle = personagem_nome;
    inputOpen = true;
  }

  async function confirmEdit(){
    novoTitulo = editingTitle;
    inputOpen = false;
    goto('/gerenciamento/episodio')
    try{
      const res = await api.put(`/game/episodio/${editingId}`, { titulo: novoTitulo });
        const body = res.data as ApiResponse<Episodio>;
        if (!body.success) {
          error = body.message;
          fieldErrors = body.errors;
          return;
        }
    } catch (e: any) {
      const body = e.response?.data as ApiResponse<Episodio> | undefined;
      error = body?.message || 'Erro ao editar titulo.';
      fieldErrors = body?.errors || [];
    }
    finally {
      buscaEpisodio();
    }
  }

  function cancelEdit(){
    inputOpen = false;
  }


</script>
<Menu />

<svelte:head>
  <title>Gerenciamento</title>
</svelte:head>

<div class="mt-auto mb-auto" style="display:none" id="containerForm">
  <!-- Card do formulário -->
  <Card class="max-w-md mx-auto mt-10 p-0 bg-primary-900 overflow-hidden shadow-lg border border-primary-600 rounded-lg">
      <!-- Formulário principal -->
      <form class="flex flex-col gap-6 p-6" on:submit|preventDefault={criaEpisodio}>
        <!-- Título -->
        <Heading tag="h3" class="text-4xl mb-2 text-center text-primary-100">
          Crie um episódio
        </Heading>
        <!-- Mensagem de erro -->
        {#if error}
          <div class="text-red-500 text-center">{error}</div>
        {/if}
        <!-- Campo Título -->
        <div>
          <Label for="titulo" class="text-lg text-primary-500">Título</Label>
          <Input id="titulo" bind:value={titulo_episodio} placeholder="Digite o titulo do episodio" required class="mt-1" />
          {#if errorOf('titulo')}
            <div class="mt-1 text-sm text-red-500">{errorOf('titulo')}</div>
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



<!-- Container de tabela episodio -->
<div id="episodioContainer" class="flex flex-col gap-4 w-full max-w-full">
    <!-- Wrapper da Tabela -->
    <div class="w-full overflow-hidden shadow-lg border border-primary-500 rounded-lg">
      <Table id="episodioTable" class="w-full table-fixed border-collapse">
        <TableHead class="text-sm md:text-base bg-primary-900 text-primary-500">
          <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">Título</TableHeadCell>
          <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">Cenas</TableHeadCell>
          <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]" colspan="2">Gerenciar</TableHeadCell>
        </TableHead>
        <TableBody>
        {#each episodios as episodio} 
          <TableBodyRow class="text-sm md:text-base bg-primary-900 text-primary-500">
            <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">{episodio.titulo}</TableBodyCell>
            <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">Algumas cenas </TableBodyCell> <!-- Célula de cenas não integrada ao banco de dados -->
            <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">
              <button
                title="Remover"
                class="p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
                on:click={() => openConfirm(episodio.id)}
                disabled={deletingId === episodio.id || loading}>
                <TrashBinOutline class="w-5 h-5 text-red-400" />
              </button>
             </TableBodyCell>
            <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">
              <button
                title="Editar"
                class="p-2 rounded border border-green-100 hover:border-green-300 transition bg-transparent"
                on:click={() =>abrirModalEdit(episodioEditado.id = (episodio.id), episodioEditado.titulo = (episodio.titulo))}>
                <UserEditOutline class="w-5 h-5 text-primary-500" />
              </button>
            </TableBodyCell>
            
  
          </TableBodyRow>
        {/each}
        {#if episodios.length === 0}
          <TableBodyRow class="text-sm md:text-base bg-primary-900 text-primary-500">
            <TableBodyCell class="p-2 text-center break-words" colspan="8">Nenhum episodio encontrado!</TableBodyCell>
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
        tabelaEpisodio = document.getElementById('episodioContainer');
        tabelaEpisodio.style.display = "none";
        formEpisodio = document.getElementById('containerForm');
        formEpisodio.style.display = "block";
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



<ConfirmModal
    open={confirmOpen}
    message="Tem certeza que deseja remover este episódio?"
    confirmText="Remover"
    cancelText="Cancelar"
    onConfirm={handleConfirm}
    onCancel={cancelarDelecao}
/>

<form on:submit|preventDefault={confirmEdit}>
  <InputModal
    open={inputOpen}
    bind:nome={editingTitle}
    onConfirm={confirmEdit}
    onEnter={confirmEdit}
    onCancel={cancelEdit}
  />
</form>