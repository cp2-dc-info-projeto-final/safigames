<script lang=ts>
    import { P, A, Heading, Card, Label, Input, Select, Button} from "flowbite-svelte";
    import type { ApiFieldError, ApiResponse } from '$lib/api';
    import api from '$lib/api'; // API backend
    import { ArrowLeftOutline, FloppyDiskAltOutline } from 'flowbite-svelte-icons'; // ícones

    let novoJ = $state("Novo jogo");
    let carregarS = $state("Carregar save");
    let sair = $state("Sair");
    let error = '';
    let fieldErrors: ApiFieldError[] = [];

    async function criaPersonagem() {
    }

    function errorOf(field: string): string | null {
    return fieldErrors.find((item) => item.field === field)?.message ?? null;
  }

  function handleCancel() {
    const menu = document.getElementById('menu');
    const formPersonagem = document.getElementById('containerForm');
    menu.style.display = "block";
    formPersonagem.style.display = "none";
  }

  function mostraFormPersonagem(){
    const formPersonagem = document.getElementById('containerForm');
    const menu = document.getElementById('menu');
    menu.style.display = "none"
    formPersonagem.style.display = "block";
  }

  // Opções de roles
  const classeOptions = [
    { value: 'Guerreiro', name: 'Guerreiro' },
    { value: 'Arqueiro', name: 'Arqueiro' },
    { value: 'Mago', name: 'Mago' }
  ];

</script>

<style>
    :global(body) {
  font-family: 'fonte-topiy';
}

</style>
<svelte:head>
  <title>Esgotamento</title>
</svelte:head>


<div class="text-center fixed top-4 left-1/2 -translate-x-1/2 z-50 text-white px-4 py-2 rounded">
    <img src="/images/titulo_grafite_sem_fundo_pixelado.png" alt="ESGOTAMENTO">
</div>
<div class="text-center fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 text-white p-6 rounded-lg" id="menu">
    <A class="text-primary-600 hover:text-secondary-50 text-4xl" onclick={mostraFormPersonagem} onmouseenter={() => novoJ = "> Novo jogo <"} onmouseleave={() => novoJ = "Novo jogo"}>{novoJ}</A><br>
    <A class="text-primary-600 mt-6 mb-6 text-4xl hover:text-secondary-50" onmouseenter={() => carregarS = "> Carregar save <"} onmouseleave={() => carregarS = "Carregar Save"} >{carregarS}</A><br>
    <A class="text-primary-600 text-4xl hover:text-secondary-50" href="/" onmouseenter={() => sair= "> Sair <"} onmouseleave={() => sair = "Sair"}>{sair}</A>
</div>

<div class=" text-center fixed bottom-6 right-6 z-50 text-white p-4 rounded-full">
    <P class="text-primary-500">Por: Safigames</P>
</div>

<div class="mt-auto mb-auto" style="display:none" id="containerForm">
<!-- Card do formulário -->
<Card class="max-w-md mx-auto mt-10 p-0 bg-primary-900 overflow-hidden shadow-lg border border-primary-600 rounded-lg">
    <!-- Formulário principal -->
    <form class="flex flex-col gap-6 p-6" on:submit|preventDefault={criaPersonagem}>
      <!-- Título -->
      <Heading tag="h3" class="text-4xl mb-2 text-center text-primary-100">
        Crie seu personagem
      </Heading>
      <!-- Mensagem de erro -->
      {#if error}
        <div class="text-red-500 text-center">{error}</div>
      {/if}
      <!-- Campo Nome -->
      <div>
        <Label for="nome" class="text-lg text-primary-500">Nome</Label>
        <Input id="nome" placeholder="Digite o nome do personagem" required class="mt-1" />
        {#if errorOf('nome')}
          <div class="mt-1 text-sm text-red-500">{errorOf('nome')}</div>
        {/if}
      </div>
  
      <!-- Campo classe -->
      <div>
            <Label for="classe" class="text-lg text-primary-500">Escolha sua classe</Label>
            <Select id="classe"  items={classeOptions} class="mt-1" />
          
  
        {#if errorOf('role')}
          <div class="mt-1 text-sm text-red-500">{errorOf('role')}</div>
        {/if}
      </div>
      <!-- Botões de ação -->
      
      <div class="text-lg flex gap-4 justify-end mt-4">
        <!-- Botão cancelar/voltar -->
        <Button color="light" type="button" onclick={handleCancel} >
          <ArrowLeftOutline class="inline w-5 h-5 mr-2 align-text-bottom" />
            Voltar
        </Button>
        <!-- Botão salvar -->
        <Button type="submit" color="primary" >
          <FloppyDiskAltOutline class="inline w-5 h-5 mr-2 align-text-bottom" />
            Criar
        </Button> 
      </div>
    </form>
    
  </Card>
</div>
