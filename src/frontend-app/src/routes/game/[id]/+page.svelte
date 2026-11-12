<script lang="ts">
  import { P, A, Heading, Card, Label, Input, Select, Button,  Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Badge} from "flowbite-svelte";
  import type { ApiFieldError, ApiResponse } from '$lib/api';
  import { onMount } from 'svelte'; // ciclo de vida
  import type { Personagem } from '$lib/models/Personagem';
  import type { User } from '$lib/models/User';
  import type { Cena } from '$lib/models/Cena';
  import type { Episodio } from '$lib/models/Episodio';
  import type { Inimigo } from '$lib/models/Inimigo';
  import type { Item } from '$lib/models/Item';
  import { PauseSolid, CloseOutline } from 'flowbite-svelte-icons';
  import api from '$lib/api'; // API backend
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
	import TypeWriter from "../../../components/TypeWriter.svelte";

  // Função de espera para atrasar o turno do inimigo
  const esperar = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  //Arrays
  let cenas: Cena[] = []
  let itens: any[] = [];

  //Variáveis de controle
  let exibeMenu: boolean = false;
  let exibeCena: boolean = true;
  let indiceCena: number = 0;
  let turnoJogador: boolean = true;
  let jogadorMorto: boolean = false;
  let inimigoMorto: boolean = false;
  let mostrandoInventario: boolean = false;
  let mostrandoLog: boolean = false;
  let statusItem: boolean = false;
  let usouItem: boolean = false;

  let logCombate: string = '';

  // variavel de controle para verificar se é a primeira vez que o jogador tá atacando
  let verificaPrimeiroAtaque: boolean = true;

  // "backup" da stamina para restaurar depois do inimigo atacar
  let staminaBackup: number = 0;
  let staminaPersonagem: number = 0;

  let bonusDanoTemp: number = 0;
  


  let user: User;

  // let logCombate: string[] = [
  //   `Você causou ${dano} de dano no inimigo.`,
  //   `O inimigo causou ${dano} de dano em você.`,
  // ];  

  let personagem: Personagem;
  let personagemCopia: Personagem;
  let episodio: Episodio;
  export let progresso: any[] = [];
  let cenaAtual: any;
  let inimigoAtual: Inimigo;
  let error = '';
  let loading = false;
  let idPersonagem: number;
  let idEpisodio: number;
  // item selecionado no inventário
  let item_selecionado: Item;

  $: idPersonagem = Number($page.params.id);
  
  /**
    - PASSAR CENAS
    Comércio: botão sair
   
  */

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
      await buscaPersonagem();
      await buscaProgresso(idEpisodio);
    } 
  })

  async function buscaPersonagem() {
    try{
      const res = await api.get(`/game/personagem/${idPersonagem}`);
      const body = res.data as ApiResponse<Personagem[]>;

      if (body.success) {
        const personagens = body.data;

        if (Array.isArray(personagens) && personagens.length > 0) {
          personagem = { ...personagens[0] };
          personagemCopia = { ...personagens[0] };
          staminaPersonagem = Number(personagem.stamina);
          idEpisodio = personagem.id_episodio;
          console.log(personagem);
        } else {
          error = 'Erro ao carregar personagem.';
        }
      } else {
        error = body.message ?? 'Erro ao carregar personagem.';
      }
    } catch (e: any) {
      console.error('Erro ao carregar personagens:', e);
      const body = e.response?.data as ApiResponse<Personagem> | undefined;
      error = body?.message || 'Erro ao carregar personagens';
    } finally {
      loading = false;
    }
  }

  async function buscaProgresso(idEpisodio: number) {
    try{
      const res = await api.get(`/game/progresso/${idEpisodio}`);
      const body = res.data as ApiResponse<Episodio>;
      if (body.success){
        progresso = body.data
        if (progresso.length > 0) {
          cenaAtual = progresso[indiceCena];
        }
        console.log(progresso)
      } else {
        error = body.message ?? 'Erro ao carregar progresso.';
      }
    } catch (e: any) {
      console.error('Erro ao carregar progresso:', e);
      const body = e.response?.data as ApiResponse<Episodio> | undefined;
      error = body?.message || 'Erro ao carregar progresso';
    } finally {
      loading = false;
    }
  }
  
  async function buscaInimigo(idCena: number) {
    try{
      const res = await api.get(`/game/inimigo/${idCena}`);
      const body = res.data as ApiResponse<Inimigo>;
      if (body.success){
        inimigoAtual = body.data[0]
        console.log(inimigoAtual)
      } else {
        error = body.message ?? 'Erro ao buscar inimigo.';
      }
    } catch (e: any) {
      console.error('Erro ao buscar inimigo:', e);
      const body = e.response?.data as ApiResponse<Inimigo> | undefined;
      error = body?.message || 'Erro ao buscar inimigo';
    } finally {
      loading = false;
    }
  }
  
  async function buscaInventario(id_personagem: number) {
    try{
      console.log(id_personagem)
      const res = await api.get(`/game/inventario/${id_personagem}`);
      const body = res.data as ApiResponse<Item>;
      if (body.success){
        itens = body.data
        console.log(itens);
      } else {
        error = body.message ?? 'Erro ao buscar inventario.';
      }
    } catch (e: any) {
      console.error('Erro ao buscar inventario:', e);
      const body = e.response?.data as ApiResponse<Item> | undefined;
      error = body?.message || 'Erro ao buscar inventario';
    } finally {
      loading = false;
    }
  }

  $: if (cenaAtual && cenaAtual.tipo == 'Combate'){
    buscaInimigo(cenaAtual.cena_id)
  }

  function proximaCena() {
    if (cenaAtual && cenaAtual.tipo == "Combate" && !inimigoMorto) return
    if (indiceCena < progresso.length - 1 && cenaAtual.tipo == "Diálogo" || (inimigoAtual && inimigoAtual.vida == 0)) {
        indiceCena++;
    } else {
        console.log("Você chegou ao fim das cenas!");
    }
    if (progresso.length > 0) {
      cenaAtual = progresso[indiceCena];
    }
  }

  function PersonagemAtaque(personagem: any){
    if (!inimigoAtual) {
      console.error("O inimigoAtual está nulo ou indefinido!");
        return;
    }

    const vidaAtual = Number(inimigoAtual.vida)
    const danoBase = Number(personagem.dano_arma)
    const danoTotal = danoBase + bonusDanoTemp;
    const staminaArma = Number(personagem.stamina_arma);

    if (verificaPrimeiroAtaque){
      staminaBackup = personagem.stamina;
      verificaPrimeiroAtaque = false;
    }

    if (personagem && personagem.stamina >= staminaArma){
      personagem.stamina -= staminaArma;
      inimigoAtual.vida = vidaAtual - danoTotal;
      logCombate = `Você deu ${danoTotal} pontos de dano e a vida do inimigo agora é ${inimigoAtual.vida}`;
      if (inimigoAtual.vida == 0) {inimigoMorto = true};
      console.log(`Você deu ${personagem.dano_arma} pontos de dano e a vida do inimigo agora é ${inimigoAtual.vida}. Sua stamina agora é ${personagem.stamina}`)
    }
    else{
      logCombate = "Você não tem stamina suficiente. Encerre o turno para recuperar."
    }
  }
  
  function InimigoAtaque(){

    const vidaAtual = Number(personagem.vida)
    const dano = Number(inimigoAtual.dano)

    personagem.vida = vidaAtual - dano;
    personagem.stamina = staminaBackup;
    
    if (personagem.vida <= 0){
      jogadorMorto = true;
    }

    logCombate = `Você levou ${dano} pontos de dano e sua vida agora é ${personagem.vida}`;
    console.log(`Você levou ${inimigoAtual.dano} pontos de dano e sua vida agora é ${personagem.vida}`)
    turnoJogador = true;
  }

  async function MostrarInventario(){
    turnoJogador = !turnoJogador;
    mostrandoLog = !mostrandoLog;
    mostrandoInventario = !mostrandoInventario;
    if (personagem && !usouItem){
      await buscaInventario(personagem.id_personagem);
    }
  }

  function OcultarInventario(){
    turnoJogador = !turnoJogador;
    mostrandoLog = !mostrandoLog;
    mostrandoInventario = !mostrandoInventario;
    item_selecionado = null;
    statusItem = false;
  }

  function MostrarStatus(item_selecionado_id: number){
    console.log("entrou no status")
    statusItem = true;
    item_selecionado = itens.find(item => item.id == item_selecionado_id);
  }

  function UsarItem(item: Item){
    if (!item) return;
    const limite = personagemCopia?.vida;
    let danoLevado: number = 0;
    if (personagem && item.tipo == "Cura" && limite > personagem.vida && personagem.stamina >= item.stamina){
      let cura: number = item.fator_vida
      danoLevado = limite - personagem?.vida;
      if (danoLevado == cura){
        personagem.vida = limite;
        itens = itens.filter(item => item.id !== item_selecionado.id);
        personagem.stamina -= item.stamina;
        usouItem = true;
        logCombate = `Você curou ${cura} pontos de vida e sua vida agora é ${personagem.vida}`;
        OcultarInventario()
      }
      else if (danoLevado > cura){
        personagem.vida += cura;
        itens = itens.filter(item => item.id !== item_selecionado.id);
        personagem.stamina -= item.stamina;
        item_selecionado = null;
        statusItem = false;
        usouItem = true;
        logCombate = `Você curou ${cura} pontos de vida e sua vida agora é ${personagem.vida}`;
        OcultarInventario()
      }
      else if (danoLevado < cura){
        cura = limite - personagem.vida;
        personagem.vida += cura;
        itens = itens.filter(item => item.id !== item_selecionado.id);
        personagem.stamina -= item.stamina;
        item_selecionado = null;
        statusItem = false;
        usouItem = true;
        logCombate = `Você curou ${cura} pontos de vida e sua vida agora é ${personagem.vida}`;
        OcultarInventario()
      }
    }
    else if (personagem && item.tipo == "Dano") {
      bonusDanoTemp = item.fator_dano
      
      itens = itens.filter(item => item.id !== item_selecionado.id);
      personagem.stamina -= item.stamina;
      item_selecionado = null;
      statusItem = false;
      usouItem = true;

      logCombate = `Você usou ${item.nome_item}! Seu dano aumentou em ${bonusDanoTemp} para este turno.`;
      OcultarInventario();
      return;
    }
    else{
      return "Sua vida está cheia"
    }
  }

  async function EncerrarTurno(){
    if (personagem){
      turnoJogador = false;

      bonusDanoTemp = 0;

      if (verificaPrimeiroAtaque){
      staminaBackup = staminaPersonagem;
      verificaPrimeiroAtaque = false;
    }

      await esperar(1500)

      InimigoAtaque()
    }
  }


  async function exibicaoMenu(){
    exibeMenu = !exibeMenu;
    console.log(`Estado do menu: ${exibeMenu} e Estado da cena: ${exibeCena}` )
  }
</script>

<!-- Evento global de teclado para escutar o Enter -->
<svelte:window on:keydown={(e) => {
  if (e.key === 'Enter' && !exibeMenu) {
      proximaCena();
  }}} 
  on:click={() => {
  if (!exibeMenu){
    proximaCena();
  }
}} />

<svelte:head>
  <title>{cenaAtual?.episodio_titulo}</title>
</svelte:head>

<div class="text-center fixed w-11/12 max-w-[85%] top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded">
  <Heading tag="h1" class="text-primary-500 mb-2 md:mt-1 text-2xl sm:text-3xl md:text-5xl">{cenaAtual ? cenaAtual.episodio_titulo : "Erro: Episódio indefinido"}</Heading>
</div>

{#if exibeMenu}
  <!-- Menu de pause para telas médias/grandes e pequenas -->
  <div class="flex fixed inset-0 bg-black/70 backdrop-blur-sm items-center justify-center z-50">
    <!-- Caixa Retangular Centralizada -->
    <div class="w-11/12 max-w-sm md:w-96 border-2 border-primary-500 bg-primary-900 p-6 flex flex-col items-center gap-4 shadow-2xl rounded-none">
      <h2 class="text-3xl font-bold tracking-widest border-b-2 border-primary-500 text-primary-500 pb-2 w-full text-center">
        PAUSA
      </h2>

      <!-- Opções do Menu -->
      <div class="flex flex-col gap-3 w-full mt-2" >
        <button
          type="button"
          on:click|stopPropagation={exibicaoMenu} 
          class="w-full py-2 border-2 border-primary-500 hover:bg-primary-500 hover:text-white text-primary-500 font-semibold transition">
            Continuar
        </button>

        <button
          type="button"
          class="w-full py-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-semibold transition"
          on:click|stopPropagation={() => goto('/menu_game')}>
            Sair para o Menu
        </button>
      </div>
    </div>
  </div>

{/if}

<!-- Container cena de diálogo -->
{#if exibeCena && cenaAtual && cenaAtual.tipo == "Diálogo"}
  <div class="min-h-screen fixed inset-0 bg-primary-900 text-primary-500 px-2 md:px-4 py-3 pt-10 md:pt-4 flex flex-col gap-4">
    <!-- Topo: Menu circular à esquerda -->
    <div class="flex items-center">
      <button
        type="button"
        class="w-12 h-12 md:w-16 md:h-16 rounded-full cursor-pointer border-2 border-primary-300 flex items-center justify-center font-bold bg-primary-900 hover:bg-primary-800 transition shadow-lg"
        on:click={exibicaoMenu}>
          <PauseSolid class="shrink-0 w-8 h-8 md:w-12 md:h-12 text-primary-50" />
      </button>
    </div>

    <!-- Corpo Principal: Grid/Flex de duas colunas -->
    <div class="flex flex-col md:flex-row flex-1 gap-4 pb-28 md:pb-0">
      <!-- Coluna da Esquerda: Status do Jogador -->
      <div class="hidden md:flex w-1/4 border-2 border-primary-300 p-4 rounded-none flex-col">
        <h2 class="text-5xl font-bold mb-2 text-primary-500">Status:</h2>
        <!-- Conteúdo do status -->
        <div class="text-xg text-primary-50">
          <p>Vida: {personagem.vida}</p>
          <p>Defesa: {personagem.defesa}</p>
          <p>Stamina: {personagem.stamina}</p>
          <p>Xp: {personagem.xp}</p>
          <p>Classe: {personagem.classe}</p>
          <p>Dinheiro: {personagem.dinheiro}</p>
        </div>
      </div>

      <!-- Coluna do Meio: Ilustração + Diálogo -->
      <div class="w-full md:w-3/4 flex flex-col gap-4 relative pb-24 md:pb-28">
        <!-- Bloco Superior: Ilustração -->
        <div class="h-24 md:h-40 border-2 border-primary-300 p-4 flex items-center justify-center">
          <span class="text-xl md:text-2xl font-semibold">*ilustração*</span>
        </div>

      <!-- Status do Jogador EXCLUSIVO para telas pequenas (Logo abaixo da ilustração) -->
      <div class="flex md:hidden w-full border-2 border-primary-300 bg-primary-900 p-3 flex-col shadow-md">
        <h2 class="text-2xl font-bold text-primary-500 pb-1 mb-1">Status</h2>
        <div class="text-xs text-primary-50 flex-col grid grid-cols-2 gap-x-2 gap-y-0.5">
          <p>Vida: {personagem.vida}</p>
          <p>Defesa: {personagem.defesa}</p>
          <p>Stamina: {personagem.stamina}</p>
          <p>Xp: {personagem.xp}</p>
          <p>Classe: {personagem.classe}</p>
          <p>Dinheiro: {personagem.dinheiro}</p>
        </div>
      </div>

        <!-- Bloco Inferior: Diálogo -->
        <div class="border-2 border-primary-300 p-4 md:p-6 flex-1">
          <h3 class="text-2xl md:text-5xl font-bold mb-2 md:mb-4">Diálogo</h3>
          <p class="text-xs md:text-base text-primary-50 whitespace-pre-line leading-relaxed">
            {cenaAtual.dialogo}
          </p>
        </div>  
        <!-- Indicador para pressionar Enter (Telas Médias/Grandes) -->
        <div class="mb-2 text-right">
          <span class="hidden md:block text-2xl text-primary-500 animate-pulse italic ">
            Pressione enter para continuar...
          </span>
        </div>

        <!-- Indicador para pressionar na tela (Telas pequenas) -->
        <div class="-mt-7 mb-2 text-right">
          <span class="block md:hidden text-xl text-primary-500 animate-pulse italic ">
            Clique na tela para continuar...
          </span>
        </div>
      </div>
    </div>
  </div>

<!-- Container cena de combate -->
{:else if exibeCena && cenaAtual && cenaAtual.tipo == "Combate"}
  <div class="min-h-screen fixed inset-0 bg-primary-900 text-primary-500 px-2 md:px-4 py-3 pt-10 md:pt-4 flex flex-col gap-4">
    <!-- Topo: Menu circular à esquerda -->
    <div class="flex items-center">
      <button
        type="button"
        class="w-12 h-12 md:w-16 md:h-16 rounded-full cursor-pointer border-2 border-primary-300 flex items-center justify-center font-bold bg-primary-900 hover:bg-primary-800 transition shadow-lg"
        on:click={exibicaoMenu}>
          <PauseSolid class="shrink-0 w-8 h-8 md:w-12 md:h-12 text-primary-50" />
      </button>
    </div>

    <!-- Corpo Principal: Grid/Flex de duas colunas -->
    <div class="flex flex-col md:flex-row flex-1 gap-4 pb-28 md:pb-0">
      <!-- Coluna da Esquerda: Status do Jogador -->
      <div class="hidden md:flex w-1/4 border-2 border-primary-300 p-4 rounded-none flex-col">
        <h2 class="text-5xl font-bold mb-2 text-primary-500">Status:</h2>
        <!-- Conteúdo do status -->
        <div class="text-xg text-primary-50">
          <p>Vida: {personagem.vida}</p>
          <p>Defesa: {personagem.defesa}</p>
          <p>Stamina: {personagem.stamina}</p>
          <p>Xp: {personagem.xp}</p>
          <p>Classe: {personagem.classe}</p>
          <p>Dinheiro: {personagem.dinheiro}</p>
        </div>
        <!-- status do item -->
        {#if statusItem}
        <h2 class="text-5xl font-bold mt-10 mb-2 text-primary-500">Status do item:</h2>
        <div class="text-xg text-primary-50">
          <p>Descrição: {item_selecionado ? item_selecionado.descricao : 'Item Indefinido'}</p>
          <p>{item_selecionado.tipo == "Cura" ? `Fator de cura: ${item_selecionado.fator_vida}` : ''}</p>
          <p>{item_selecionado.tipo == "Dano" ? `Fator de dano: ${item_selecionado.fator_dano}` : ''}</p>
          <p>Stamina necessária: {item_selecionado ? item_selecionado.stamina : 'Item Indefinido'}</p>
        </div>
        {/if}
      </div>

      <!-- Coluna do Meio: Ilustração + Log de Combate -->
      <div class="w-full md:w-3/4 flex flex-col gap-4 relative pb-24 md:pb-28">
        <!-- Bloco Superior: Ilustração -->
        <div class="h-24 md:h-40 border-2 border-primary-300 p-4 flex items-center justify-center">
          <span class="text-xl md:text-2xl font-semibold">*ilustração*</span>
        </div>

      <!-- Status do Jogador EXCLUSIVO para telas pequenas (Logo abaixo da ilustração) -->
      <div class="flex md:hidden w-full border-2 border-primary-300 bg-primary-900 p-3 flex-col shadow-md">
        <h2 class="text-2xl font-bold text-primary-500 pb-1 mb-1">Status</h2>
        <div class="text-xs text-primary-50 flex-col grid grid-cols-2 gap-x-2 gap-y-0.5">
          <p>Vida: {personagem.vida}</p>
          <p>Defesa: {personagem.defesa}</p>
          <p>Stamina: {personagem.stamina}</p>
          <p>Xp: {personagem.xp}</p>
          <p>Classe: {personagem.classe}</p>
          <p>Dinheiro: {personagem.dinheiro}</p>
        </div>
      </div>

      <!-- Status do Inimigo EXCLUSIVO para telas pequenas (Logo abaixo da ilustraçã) -->
      <div class="flex md:hidden w-full border-2 border-primary-300 bg-primary-900 p-3 flex-col shadow-md">
        <h2 class="text-2xl font-bold text-primary-500 pb-1 mb-1">Inimigo</h2>
        <div class="text-xs text-primary-50 flex-col grid gap-x-2 gap-y-0.5">
          <p>Nome: {inimigoAtual ? inimigoAtual.nome : '?'}</p>
          <p>Descrição: {inimigoAtual ? inimigoAtual.descricao : 'Inimigo Indefinido'}</p>
          <p>Vida: {inimigoAtual ? inimigoAtual.vida : '?'}</p>
          <p>Defesa: {inimigoAtual ? inimigoAtual.defesa : '?'}</p>
        </div>
      </div>

        <!-- Bloco Inferior: Log de combate -->
        {#if !mostrandoLog}
          <div class="border-2 border-primary-300 p-4 md:p-6 flex-1">
            <h3 class="text-2xl md:text-4xl font-bold mb-2 md:mb-4">O combate começou. Escolha sua ação!</h3>
            {#if inimigoAtual?.vida == 0}
            <p class="text-primary-50 whitespace-pre-line text-xs md:text-base">
              Você derrotou {inimigoAtual.nome}!
            </p>
            {:else}
            <p class="text-primary-50 whitespace-pre-line text-xs md:text-base">
              {logCombate}
            </p>
            {/if}
          </div>
        {/if}

        {#if turnoJogador && inimigoAtual && inimigoAtual.vida > 0}
        <!-- Botões de Ação do Combate -->
        <div class="absolute bottom-1 md:bottom-5 left-0 right-0 flex flex-wrap justify-center gap-2 md:gap-4 px-2">
          <button type="button" on:click|stopPropagation={() => {PersonagemAtaque(personagem)}} class="px-4 md:px-12 py-2 md:py-4 text-sm md:text-lg border-2 border-primary-300 font-bold text-primary-50 hover:bg-primary-700 cursor-pointer transition bg-primary-900 shadow-md">
            Atacar
          </button>
          <button type="button" on:click|stopPropagation={() => {MostrarInventario()}} class="px-4 md:px-12 py-2 md:py-4 text-sm md:text-lg border-2 border-primary-300 font-bold text-primary-50 hover:bg-primary-700 cursor-pointer transition bg-primary-900 shadow-md">
            Inventário
          </button>
          <button type="button" on:click|stopPropagation={() => {EncerrarTurno()}} class="px-4 md:px-12 py-2 md:py-4 text-sm md:text-lg border-2 border-primary-300 font-bold text-primary-50 hover:bg-primary-700 cursor-pointer transition bg-primary-900 shadow-md">
            Encerrar turno
          </button>
        </div>
        {:else if inimigoAtual && inimigoAtual.vida <= 0}
        <div class="absolute bottom-2 left-0 right-0 flex justify-center px-2">
          <button type="button" on:click|stopPropagation={() => {proximaCena()}} class="px-8 py-3 md:px-12 md:py-5 text-base md:text-lg border-2 border-primary-300 font-bold text-primary-50 hover:bg-primary-700 cursor-pointer transition bg-primary-900 shadow-md">
            Próxima Cena 
          </button>
        </div>
        {:else if mostrandoInventario}
          <!-- Inventário -->
          <div class="border-2 border-primary-300 p-4 md:p-6 flex-1 relative">
            <h3 class="text-2xl md:text-5xl font-bold mb-2 md:mb-4">Inventário</h3>
            <button type="button" on:click|stopPropagation={() => {OcultarInventario()}} class="absolute top-4 right-4 text-primary-50 hover:text-primary-300 cursor-pointer">
              <CloseOutline class="shrink-0 h-7 w-7 md:h-9 md:w-9" />
          </button>
            {#each itens as item}
            <button type="button" on:click|stopPropagation={() => {MostrarStatus(item.id)}} class="px-4 md:px-12 py-2 md:py-4 text-sm md:text-lg border-2 border-primary-300 font-bold text-primary-50 hover:bg-primary-700 cursor-pointer transition bg-primary-900 shadow-md">
              {item.nome_item}
            </button>
            {/each}
          </div>
          {#if item_selecionado}
          <div class="absolute bottom-1 md:bottom-5 left-0 right-0 flex flex-wrap justify-center gap-2 md:gap-4 px-2">
            <button type="button" on:click|stopPropagation={() => {UsarItem(item_selecionado)}} class="px-4 md:px-12 py-2 md:py-4 text-sm md:text-lg border-2 border-primary-300 font-bold text-primary-50 hover:bg-primary-700 cursor-pointer transition bg-primary-900 w-fit">
              Usar Item
            </button>
          </div>
          {/if}
        {/if}
      </div>

      <!-- Coluna da Direita: Status do inimigo -->
      <div class="hidden md:flex w-1/4 border-2 border-primary-300 p-4 rounded-none flex-col">
        <h2 class="text-3xl lg:text-5xl font-bold mb-2 text-primary-500">Status do inimigo:</h2>
        <!-- Conteúdo do status vai aqui -->
        <div class="text-base text-primary-50">
          <p>Nome: {inimigoAtual ? inimigoAtual.nome : 'Inimigo Indefinido'}</p>
          <p>Descrição: {inimigoAtual ? inimigoAtual.descricao : 'Inimigo Indefinido'}</p>
          <p>Vida: {inimigoAtual ? inimigoAtual.vida : 'Inimigo Indefinido'}</p>
          <p>Defesa: {inimigoAtual ? inimigoAtual.defesa : 'Inimigo Indefinido'}</p>
        </div>
      </div>
    </div>
  </div>

{/if}

{#if jogadorMorto}
<div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
  <!-- Caixa Retangular Centralizada -->
  <div class="w-96 border-2 border-primary-500 bg-primary-900 p-6 flex flex-col items-center gap-4 shadow-2xl rounded-none">
    <h2 class="text-3xl font-bold tracking-widest border-b-2 border-primary-500 text-primary-500 pb-2 w-full text-center">
      VOCÊ MORREU!!
    </h2>
    <!-- Opções do Menu -->
      <button
        type="button"
        class="w-full py-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-semibold transition"
        on:click={() => goto('/menu_game')}>
          Sair para o Menu
      </button>
    </div>
  </div>
{/if}