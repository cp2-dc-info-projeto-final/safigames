<script lang="ts">

    import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Button, Card, Heading, Label, Input } from "flowbite-svelte";
    import Menu from '../../../components/Menu.svelte';
    import { onMount } from 'svelte'; // ciclo de vida
    import api from '$lib/api'; // API backend
    import type { ApiResponse, ApiFieldError } from '$lib/api';
    import type { User } from '$lib/models/User';
    import type { Comerciante } from '$lib/models/Comerciante';
    import { TrashBinOutline, FloppyDiskAltOutline, ArrowLeftOutline, UserEditOutline } from 'flowbite-svelte-icons'; // ícones
    import ConfirmModal from '../../../components/ConfirmModal.svelte'; // modal de confirmação
    import { goto } from '$app/navigation';

    let user: User;
    let error = '';
    let comerciantes: Comerciante[] = $state([]);
    let loading: boolean;
    let deletingId: number | null = $state(null); // id em deleção
    let confirmOpen = $state(false); // modal aberto?
    let confirmTargetId: number | null = null; // id alvo do modal
    let fieldErrors: ApiFieldError[] = [];
    let tabelaComerciante: HTMLElement;
    let formComerciante: HTMLElement;
    let nome_comerciante: string = $state(''); // nome digitado no form de cadastro de episódio
    let descricao_comerciante: string = $state(''); 
    let inputOpen = $state(false);
    let editingId: number | null = $state(null); // id em edição
    let editingName: string = $state(''); // nome em edição
    let novoNome: string = $state(''); // nome digitado que substituirá o antigo
    let comercianteEditado = {
      id: 0,
      nome: "",
      descricao: ""
    };


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
        buscaComerciante();
    } 
  })

  function errorOf(field: string): string | null {
    return fieldErrors.find((item) => item.field === field)?.message ?? null;
  }


  async function buscaComerciante() {
    try{
      const res = await api.get('/game/comerciante');
      const body = res.data as ApiResponse<Comerciante[]>;
      if (body.success) {
        comerciantes = body.data ?? [];
      } else {
        error = body.message;
      }
    } catch (e: any) {
        console.error('Erro ao carregar comerciantes:', e);
        const body = e.response?.data as ApiResponse<Comerciante[]> | undefined;
        error = body?.message || 'Erro ao carregar comerciantes';
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
        comerciantes.push(body.data);
        nome_comerciante = '';
        descricao_comerciante = '';
        handleCancel();
      } else {
        error = body.message;
        fieldErrors = body.fieldErrors ?? [];
      }
    } catch (e: any) {
      console.error('Erro ao criar episódio:', e);
      const body = e.response?.data as ApiResponse<Comerciante> | undefined;
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
      const res = await api.delete(`/game/comerciante/${id}`);
      const body = res.data as ApiResponse<null>;
      if (!body.success) {
        error = body.message;
        return;
      }
      comerciantes = comerciantes.filter(comerciante => comerciante.id !== id);
    } catch (e: any) {
      console.error('Erro ao deletar episódio:', e);
      const body = e.response?.data as ApiResponse<null> | undefined;
      error = body?.message || 'Erro ao remover episódio.';
    } finally {
      deletingId = null;
    }
  }

  function handleCancel() {
    tabelaComerciante = document.getElementById('comercianteContainer');
    tabelaComerciante.style.display = "block";
    formComerciante = document.getElementById('containerForm');
    formComerciante.style.display = "none";
  }

  function abrirModalEdit(comerciante_id: number, comerciante_nome: string, ) {
    tabelaComerciante = document.getElementById('comercianteContainer');
    tabelaComerciante.style.display = "none";
    editingId = comerciante_id;
    editingName = comerciante_nome;
    inputOpen = true;
  }

  async function confirmEdit(){
    novoNome = editingName;
    inputOpen = false;
    goto('/gerenciamento/comerciante')
    try{
      const res = await api.put(`/game/comerciante/${editingId}`, { nome: novoNome });
        const body = res.data as ApiResponse<Comerciante>;
        if (!body.success) {
          error = body.message;
          fieldErrors = body.errors;
          return;
        }
    } catch (e: any) {
      const body = e.response?.data as ApiResponse<Comerciante> | undefined;
      error = body?.message || 'Erro ao editar nome.';
      fieldErrors = body?.errors || [];
    }
    finally {
      buscaComerciante();
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
      <form class="flex flex-col gap-6 p-6" on:submit|preventDefault={criaComerciante}>
        <!-- Nome  -->
        <Heading tag="h3" class="text-4xl mb-2 text-center text-primary-100">
          Crie um comerciante
        </Heading>
        <!-- Mensagem de erro -->
        {#if error}
          <div class="text-red-500 text-center">{error}</div>
        {/if}
        <!-- Campo Nome -->
        <div>
          <Label for="nome" class="text-lg text-primary-500">Nome</Label>
          <Input id="nome" bind:value={nome_comerciante} placeholder="Digite o nome do comerciante" required class="mt-1" />
          {#if errorOf('nome')}
            <div class="mt-1 text-sm text-red-500">{errorOf('nome')}</div>
          {/if}
        </div>
        <div>
          <Label for="descricao" class="text-lg text-primary-500">Descrição</Label>
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



<!-- Container de tabela comerciante -->
<div id="comercianteContainer" class="flex flex-col gap-4 w-full max-w-full">
    <!-- Wrapper da Tabela -->
    <div class="w-full overflow-hidden shadow-lg border border-primary-500 rounded-lg">
      <Table id="comercianteTable" class="w-full table-fixed border-collapse">
        <TableHead class="text-sm md:text-base bg-primary-900 text-primary-500">
          <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">Nome</TableHeadCell>
          <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">Descrição</TableHeadCell>
          <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]" colspan="2">Gerenciar</TableHeadCell>
        </TableHead>
        <TableBody>
        {#each comerciantes as comerciante} 
          <TableBodyRow class="text-sm md:text-base bg-primary-900 text-primary-500">
            <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">{comerciante.nome}</TableBodyCell>
            <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">{comerciante.descricao}</TableBodyCell>
            <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">
              <button
                title="Remover"
                class="p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
                on:click={() => openConfirm(comerciante.id)}
                disabled={deletingId === comerciante.id || loading}>
                <TrashBinOutline class="w-5 h-5 text-red-400" />
              </button>
             </TableBodyCell>
            <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">
              <button
                title="Editar"
                class="p-2 rounded border border-green-100 hover:border-green-300 transition bg-transparent"
                on:click={() =>abrirModalEdit(comercianteEditado.id = (comerciante.id), comercianteEditado.nome = (comerciante.nome), comercianteEditado.descricao = (comerciante.descricao))}>
                <UserEditOutline class="w-5 h-5 text-primary-500" />
              </button>
            </TableBodyCell>
            
  
          </TableBodyRow>
        {/each}
        {#if comerciantes.length === 0}
          <TableBodyRow class="text-sm md:text-base bg-primary-900 text-primary-500">
            <TableBodyCell class="p-2 text-center break-words" colspan="8">Nenhum comerciante encontrado!</TableBodyCell>
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
        tabelaComerciante = document.getElementById('comercianteContainer');
        tabelaComerciante.style.display = "none";
        formComerciante = document.getElementById('containerForm');
        formComerciante.style.display = "block";
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
    message="Tem certeza que deseja remover este comerciante?"
    confirmText="Remover"
    cancelText="Cancelar"
    onConfirm={handleConfirm}
    onCancel={cancelarDelecao}
/>

<form on:submit|preventDefault={confirmEdit}>

<Input/>
</form>