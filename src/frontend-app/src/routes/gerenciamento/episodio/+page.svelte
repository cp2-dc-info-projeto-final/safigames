<script lang="ts">

    import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Button, Card, Heading, Label, Input, Select } from "flowbite-svelte";
    import Menu from '../../../components/Menu.svelte';
    import InputModal from '../../../components/InputModal.svelte';
    import { onMount } from 'svelte'; // ciclo de vida
    import api from '$lib/api'; // API backend
    import type { ApiResponse, ApiFieldError } from '$lib/api';
    import type { User } from '$lib/models/User';
    import type { Episodio } from '$lib/models/Episodio';
    import type { Cena } from '$lib/models/Cena';
    import { TrashBinOutline, FloppyDiskAltOutline, ArrowLeftOutline, UserEditOutline, CirclePlusSolid } from 'flowbite-svelte-icons'; // ícones
    import ConfirmModal from '../../../components/ConfirmModal.svelte'; // modal de confirmação
    import { goto } from '$app/navigation';

    let user: User;
    let error = '';
    let episodios: Episodio[] = $state([]);
    let selectedEpisodio: number | null = $state(null);
    let cenas: Cena[] = $state([]);
    let loading: boolean;
    let deletingId: number | null = $state(null); // id em deleção
    let confirmOpen = $state(false); // modal aberto?
    let confirmTargetId: number | null = null; // id alvo do modal
    let fieldErrors: ApiFieldError[] = [];
    let divCards: HTMLElement;
    let divSelect: HTMLElement;
    let formEpisodio: HTMLElement;
    let formCena: HTMLElement;
    let titulo_episodio: string = $state(''); // titulo digitado no form de cadastro de episódio
    let inputOpen = $state(false);
    let exibeFormCena = $state(false); 
    let exibeSelect = $state(false);
    let exibeCards = $state(false);
    let editingId: number | null = $state(null); // id em edição
    let editingTitle: string = $state(''); // titulo em edição
    let novoTitulo: string = $state(''); // titulo digitado que substituirá o antigo
    let itensSelect: any = $state([
      {value:"", name:"Escolha um episódio.."}
    ]);
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
        itensSelect = 
          episodios.map(episodio => ({
            value: episodio.id.toString(),
            name: episodio.titulo 
          }));
      }
    }

  async function buscaCena(idEpisodio: number) {
  try{
    const res = await api.get(`/game/cena/${idEpisodio}`);
    const body = res.data as ApiResponse<Cena[]>;
    if (body.success) {
      cenas = body.data ?? [];
    } else {
      error = body.message;
    }
  } catch (e: any) {
      console.error('Erro ao carregar cenas:', e);
      const body = e.response?.data as ApiResponse<Cena[]> | undefined;
      error = body?.message || 'Erro ao carregar cenas';
    } finally {
        loading = false;
      }
  }

  async function criaCena(idEpisodio: number){

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
      buscaEpisodio();
      loading = false;
    }
  }

  // Abre modal de confirmação
  function openConfirm(id: number) {
    console.log("entrou no openconfirm")
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

    // mudar a exibição para ocultar ou exibir com if
    document.getElementById('divCards') && (document.getElementById('divCards').style.display = "block");
    document.getElementById('divSelect') && (document.getElementById('divSelect').style.display = "block");
    formEpisodio = document.getElementById('containerForm');
    formEpisodio.style.display = "none";
    exibeFormCena = false;
  }

  function abrirModalEdit(episodio_id: number, episodio_nome: string) {
    divCards = document.getElementById('divCards');
    divCards.style.display = "none";
    editingId = episodio_id;
    editingTitle = episodio_nome;
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
    handleCancel();
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
{#if exibeFormCena}
<div class="mt-auto mb-auto" style="display:none" id="containerFormCena">
  <!-- Card do formulário -->
  <Card class="max-w-md mx-auto mt-10 p-0 bg-primary-900 overflow-hidden shadow-lg border border-primary-600 rounded-lg">
    <!-- Formulário principal -->
    <form class="flex flex-col gap-6 p-6" on:submit|preventDefault={criaCena(idEpisodio)}>
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
{/if}

{#if exibeSelect}
<div>
  <div id="divSelect">
    <Heading tag="h3" class="text-4xl mb-2 text-center text-primary-100">
      Selecione o episodio:
    </Heading>

    <!-- Contêiner Flexbox para alinhar o select e o botão lado a lado -->
    <div class="flex items-center justify-center gap-2">
      {#if itensSelect.length > 0}
        <Select 
          class="w-80"
          items={itensSelect}
          bind:value={selectedEpisodio}
          clearable
        ></Select>
      {/if}

      <button class="px-4 py-2 rounded border-none transition bg-transparent text-primary-50 inline" on:click={() => {
      document.getElementById('divCards') && (document.getElementById('divCards').style.display = "none");
      divSelect = document.getElementById('divSelect');
      divSelect.style.display = "none";
      formEpisodio = document.getElementById('containerForm');
      formEpisodio.style.display = "block";}}>
        <CirclePlusSolid class="shrink-0 h-6 w-6" />
      </button>
    </div>
  </div>
</div>
{/if}

<!--Div container card cenas-->
{#if selectedEpisodio && cenas.length > 0}
  {#if exibeCards}
<div class="block">
  <div class="flex flex-col items-center gap-4 my-8 max-w-3xl mx-auto md:grid md:grid-cols-2" id="divCards">
    {#each cenas as cena}
      <!-- Card de usuário -->
      <Card class="max-w-sm w-full p-0 overflow-hidden shadow-lg border border-primary-500">
        <div class="px-4 pt-4 pb-2 bg-primary-900 text-left flex items-center justify-between">
          <div>
            <div class="text-lg font-semibold text-primary-500 text-left inline">ID:</div>
            <div class="text-lg text-gray-400 text-left inline">{cena.id}</div> <br>
            <div class="text-lg font-semibold text-primary-500 text-left inline">NPC:</div>
            <div class="text-lg font-semibold text-primary-500 text-left inline">{cena.NPC}</div> <br>
            <div class="text-lg font-semibold text-primary-500 text-left inline">Diálogo:</div>
            <div class="text-lg text-gray-400 text-left inline"> {cena.dialogo}</div>
          </div>
          <div class="flex gap-2">
            <!-- Botão editar -->
            <!-- Botão remover -->
            <button
              title="Remover"
              class="p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
              on:click={() => openConfirm(cena.id)}
              disabled={cena.id === cena.id || loading}
            >
              <TrashBinOutline class="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>
      </Card>
    {/each}
  </div>
</div>  
  {/if}
{:else if selectedEpisodio && cenas.length == 0}
  <div class="px-4 pt-4 pb-2 bg-primary-900 text-left flex items-center justify-between">
      <div class="text-lg font-semibold text-primary-500 text-left text-center w-full inline">Não há cenas para esse episódio!</div>
  </div>
{/if}
<div class="flex justify-between">
  <!-- Botão adicionar -->
  {#if selectedEpisodio}
  <button
  title="adicionar"
  class="px-4 py-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent text-primary-500"
  on:click={() => {
    exibeFormCena = true;
    divSelect = document.getElementById('divSelect');
    divSelect.style.display = "none";
    document.getElementById('divCards') && (document.getElementById('divCards').style.display = "none");
  }}>
  Adicionar
</button>
{/if}
  <!-- Botão voltar -->
    <button
      title="voltar"
      class="px-4 py-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent text-primary-500"
      on:click={goto('/gerenciamento')}>
      Voltar
    </button>
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