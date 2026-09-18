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
    let formEdit: HTMLElement;
    let itemDados: Item = $state({
      id: 0,
      nome: "",
      descricao: "",
      tipo: "",
      fator_vida: 0,
      fator_dano: 0,
      fator_defesa: 0,
      preco: 0
    })
    let inputOpen = $state(false);
    let editingId: number | null = $state(null); // id em edição
    let editingName: string = $state('');
    let editingDesc: string = $state('');
    let editingTipo: string = $state('');
    let editingFatorVida: number = $state(0);
    let editingFatorDano: number = $state(0);
    let editingFatorDefesa: number = $state(0);
    let editingPreco: number = $state(0);
    let novoNome: string = $state('');
    let novoDesc: string = $state('');
    let novoTipo: string = $state('');
    let novoFatorVida: number = $state(0);
    let novoFatorDano: number = $state(0);
    let novoFatorDefesa: number = $state(0);
    let novoPreco: number = $state(0);

    let itemEditado = {
      id: 0,
      nome: "",
      descricao: "",
      tipo: "",
      fator_vida: 0,
      fator_dano: 0,
      fator_defesa: 0,
      preco: 0
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
      const res = await api.post('/game/item', itemDados);
      const body = res.data as ApiResponse<Item>;
      if (body.success && body.data) {
        itens.push(body.data);
        for (let chave in itemDados) {
            // Passamos o objeto como 1º argumento e a chave como 2º argumento
            if (Object.hasOwn(itemDados, chave)) {
                itemDados[chave] = null; // Limpa o valor de forma segura
            }
        }
        handleCancel();
      } else {
        error = body.message;
        fieldErrors = body.fieldErrors ?? [];
      }
    } catch (e: any) {
      console.error('Erro ao criar item:', e);
      const body = e.response?.data as ApiResponse<Item> | undefined;
      error = body?.message || 'Erro ao criar item.';
    } finally {
      loading = false;
    }
  }

  async function editaItem(){
    novoNome = editingName;
    novoDesc = editingDesc;
    novoTipo = editingTipo;
    novoFatorVida = editingFatorVida;
    novoFatorDano = editingFatorDano;
    novoFatorDefesa = editingFatorDefesa;
    novoPreco = editingPreco;

    formEdit = document.getElementById('containerFormEdit');
    formEdit.style.display = "none";
    tabelaItem = document.getElementById('itemContainer');
    tabelaItem.style.display = "block";
    goto('/gerenciamento/item')
    try{
      const res = await api.put(`/game/item/${editingId}`, { nome: novoNome, descricao: novoDesc, tipo: novoTipo, fator_vida: novoFatorVida, fator_dano: novoFatorDano, fator_defesa: novoFatorDefesa, preco: novoPreco  });
        const body = res.data as ApiResponse<Item>;
        if (!body.success) {
          error = body.message;
          fieldErrors = body.errors;
          return;
        }
    } catch (e: any) {
      const body = e.response?.data as ApiResponse<Item> | undefined;
      error = body?.message || 'Erro ao editar item.';
      fieldErrors = body?.errors || [];
    }
    finally {
      buscaItem();
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
      console.error('Erro ao deletar item:', e);
      const body = e.response?.data as ApiResponse<null> | undefined;
      error = body?.message || 'Erro ao remover item.';
    } finally {
      deletingId = null;
    }
  }

  function handleCancel() {
    tabelaItem = document.getElementById('itemContainer');
    tabelaItem.style.display = "block";
    formEdit = document.getElementById('containerFormEdit');
    formEdit.style.display = "none";
  }


  function mostraFormEdit(item_id: number, item_nome: string, item_descricao: string, item_tipo: string, item_fatorVida: number, item_fatorDano: number, item_fatorDefesa: number, item_preco: number){
    tabelaItem = document.getElementById('itemContainer');
    tabelaItem.style.display = "none"
    formEdit = document.getElementById('containerFormEdit');
    formEdit.style.display = "block";
    editingId = item_id;
    editingName = item_nome;
    editingDesc = item_descricao;
    editingTipo = item_tipo;
    editingFatorVida = item_fatorVida;
    editingFatorDano = item_fatorDano;
    editingFatorDefesa = item_fatorDefesa;
    editingPreco = item_preco;
  }


  function cancelEdit(){
    inputOpen = false;
    handleCancel();
  }
</script>
<Menu/>
<!-- Container de tabela  -->
<div id="itemContainer" class="flex flex-col gap-4 w-full max-w-full">
  <!-- Wrapper da Tabela -->
  <div class="w-full overflow-hidden shadow-lg border border-primary-500 rounded-lg">
    <Table id="itemTable" class="w-full table-fixed border-collapse">
      <TableHead class="text-sm md:text-base bg-primary-900 text-primary-500">
        <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">Nome</TableHeadCell>
        <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">Descrição</TableHeadCell>
        <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">Tipo</TableHeadCell>
        <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">Fator vida</TableHeadCell>
        <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">Fator dano</TableHeadCell>
        <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">Fator defesa</TableHeadCell>
        <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">Preço</TableHeadCell>
        <TableHeadCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]" colspan="2">Gerenciar</TableHeadCell>
      </TableHead>
      <TableBody>
      {#each itens as item} 
        <TableBodyRow class="text-sm md:text-base bg-primary-900 text-primary-500">
          <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">{item.nome}</TableBodyCell>
          <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">{item.descricao}</TableBodyCell>
          <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">{item.tipo}</TableBodyCell>
          <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">{item.fator_vida}</TableBodyCell>
          <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">{item.fator_dano}</TableBodyCell>
          <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">{item.fator_defesa}</TableBodyCell>
          <TableBodyCell class="p-2 text-center whitespace-normal break-words [word-break:break-word]">{item.preco}</TableBodyCell>
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
              on:click={() =>mostraFormEdit(itemEditado.id = (item.id), itemEditado.nome = (item.nome), itemEditado.descricao = (item.descricao), itemEditado.tipo = (item.tipo), itemEditado.fator_vida = (item.fator_vida), itemEditado.fator_dano = (item.fator_dano), itemEditado.fator_defesa = (item.fator_defesa), itemEditado.preco = (item.preco) )}>
              <UserEditOutline class="w-5 h-5 text-primary-500" />
            </button>
          </TableBodyCell>
          

        </TableBodyRow>
      {/each}
      {#if itens.length === 0}
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

<div class="mt-auto mb-auto" style="display:none" id="containerForm">
  <!-- Card do formulário -->
  <Card class="max-w-md mx-auto mt-10 p-0 bg-primary-900 overflow-hidden shadow-lg border border-primary-600 rounded-lg">
    <!-- Formulário principal -->
    <form class="flex flex-col gap-6 p-6" on:submit|preventDefault={criaItem}>
      <!-- Título -->
      <Heading tag="h3" class="text-4xl mb-2 text-center text-primary-100">
        Crie um item
      </Heading>
      <!-- Mensagem de erro -->
      {#if error}
        <div class="text-red-500 text-center">{error}</div>
      {/if}
      <!-- Campo Título -->
      <div>
        <Label for="nome" class="text-lg text-primary-500">Nome</Label>
        <Input id="nome" bind:value={itemDados.nome} placeholder="Digite o nome do item" required class="mt-1" />
        {#if errorOf('nome')}
          <div class="mt-1 text-sm text-red-500">{errorOf('nome')}</div>
        {/if}
      </div>
      <!-- Campo Título -->
      <div>
        <Label for="descricao" class="text-lg text-primary-500">Descrição</Label>
        <Input id="descricao" bind:value={itemDados.descricao} placeholder="Digite a descrição do item" required class="mt-1" />
        {#if errorOf('descricao')}
          <div class="mt-1 text-sm text-red-500">{errorOf('descricao')}</div>
        {/if}
      </div>
      <!-- Campo Título -->
      <div>
        <Label for="tipo" class="text-lg text-primary-500">Tipo</Label>
        <Input id="tipo" bind:value={itemDados.tipo} placeholder="Digite o tipo do item" required class="mt-1" />
        {#if errorOf('tipo')}
          <div class="mt-1 text-sm text-red-500">{errorOf('tipo')}</div>
        {/if}
      </div>
      <!-- Campo Título -->
      <div>
        <Label for="fator_vida" class="text-lg text-primary-500">Fator de vida</Label>
        <Input id="fator_vida" bind:value={itemDados.fator_vida} type="number" placeholder="Digite o fator de vida do item" required class="mt-1" />
        {#if errorOf('fator_vida')}
          <div class="mt-1 text-sm text-red-500">{errorOf('fator_vida')}</div>
        {/if}
      </div>
      <!-- Campo Título -->
      <div>
        <Label for="fator_dano" class="text-lg text-primary-500">Fator de dano</Label>
        <Input id="fator_dano" bind:value={itemDados.fator_dano} type="number" placeholder="Digite o fator de dano do item" required class="mt-1" />
        {#if errorOf('fator_dano')}
          <div class="mt-1 text-sm text-red-500">{errorOf('fator_dano')}</div>
        {/if}
      </div>
      <!-- Campo Título -->
      <div>
        <Label for="fator_defesa" class="text-lg text-primary-500">Fator de defesa</Label>
        <Input id="fator_defesa" bind:value={itemDados.fator_defesa} type="number" placeholder="Digite o fator de defesa do item" required class="mt-1" />
        {#if errorOf('fator_defesa')}
          <div class="mt-1 text-sm text-red-500">{errorOf('fator_defesa')}</div>
        {/if}
      </div>
      <!-- Campo Título -->
      <div>
        <Label for="preco" class="text-lg text-primary-500">Preço</Label>
        <Input id="preco" bind:value={itemDados.preco} type="number" placeholder="Digite o preço do item" required class="mt-1" />
        {#if errorOf('preco')}
          <div class="mt-1 text-sm text-red-500">{errorOf('preco')}</div>
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


<div class="mt-auto mb-auto" style="display:none" id="containerFormEdit">
  <!-- Card do formulário de editar -->
  <Card class="max-w-md mx-auto mt-10 p-0 bg-primary-900 overflow-hidden shadow-lg border border-primary-600 rounded-lg">
    <!-- Formulário principal -->
    <form class="flex flex-col gap-6 p-6" on:submit|preventDefault={editaItem}>
      <!-- Título -->
      <Heading tag="h3" class="text-4xl mb-2 text-center text-primary-100">
        Edite um item
      </Heading>
      <!-- Mensagem de erro -->
      {#if error}
        <div class="text-red-500 text-center">{error}</div>
      {/if}
      <!-- Campo Título -->
      <div>
        <Label for="nome" class="text-lg text-primary-500">Nome</Label>
        <Input id="nome" bind:value={editingName} placeholder="Digite o nome do item" required class="mt-1" />
        {#if errorOf('nome')}
          <div class="mt-1 text-sm text-red-500">{errorOf('nome')}</div>
        {/if}
      </div>
      <!-- Campo Título -->
      <div>
        <Label for="descricao" class="text-lg text-primary-500">Descrição</Label>
        <Input id="descricao" bind:value={editingDesc} placeholder="Digite a descrição do item" required class="mt-1" />
        {#if errorOf('descricao')}
          <div class="mt-1 text-sm text-red-500">{errorOf('descricao')}</div>
        {/if}
      </div>
      <!-- Campo Título -->
      <div>
        <Label for="tipo" class="text-lg text-primary-500">Tipo</Label>
        <Input id="tipo" bind:value={editingTipo} placeholder="Digite o tipo do item" required class="mt-1" />
        {#if errorOf('tipo')}
          <div class="mt-1 text-sm text-red-500">{errorOf('tipo')}</div>
        {/if}
      </div>
      <!-- Campo Título -->
      <div>
        <Label for="fator_vida" class="text-lg text-primary-500">Fator de vida</Label>
        <Input id="fator_vida" bind:value={editingFatorVida} type="number" placeholder="Digite o fator de vida do item" required class="mt-1" />
        {#if errorOf('fator_vida')}
          <div class="mt-1 text-sm text-red-500">{errorOf('fator_vida')}</div>
        {/if}
      </div>
      <!-- Campo Título -->
      <div>
        <Label for="fator_dano" class="text-lg text-primary-500">Fator de dano</Label>
        <Input id="fator_dano" bind:value={editingFatorDano} type="number" placeholder="Digite o fator de dano do item" required class="mt-1" />
        {#if errorOf('fator_dano')}
          <div class="mt-1 text-sm text-red-500">{errorOf('fator_dano')}</div>
        {/if}
      </div>
      <!-- Campo Título -->
      <div>
        <Label for="fator_defesa" class="text-lg text-primary-500">Fator de defesa</Label>
        <Input id="fator_defesa" bind:value={editingFatorDefesa} type="number" placeholder="Digite o fator de defesa do item" required class="mt-1" />
        {#if errorOf('fator_defesa')}
          <div class="mt-1 text-sm text-red-500">{errorOf('fator_defesa')}</div>
        {/if}
      </div>
      <!-- Campo Título -->
      <div>
        <Label for="preco" class="text-lg text-primary-500">Preço</Label>
        <Input id="preco" bind:value={editingPreco} type="number" placeholder="Digite o preço do item" required class="mt-1" />
        {#if errorOf('preco')}
          <div class="mt-1 text-sm text-red-500">{errorOf('preco')}</div>
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