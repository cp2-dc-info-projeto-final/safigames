<script lang="ts">
  import { P, A, Heading, Card, Label, Input, Select, Button,  Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Badge} from "flowbite-svelte";
  import type { ApiFieldError, ApiResponse } from '$lib/api';
  import { onMount } from 'svelte'; // ciclo de vida
  import type { Personagem } from '$lib/models/Personagem';
  import type { User } from '$lib/models/User';
  import type { Cena } from '$lib/models/Cena';
  import type { Episodio } from '$lib/models/Episodio';
  import type { Inimigo } from '$lib/models/Inimigo';
  import { PauseSolid } from 'flowbite-svelte-icons';
  import api from '$lib/api'; // API backend
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  //Arrays
  let cenas: Cena[] = []

  //Variáveis de controle
  let exibeMenu: boolean = false;
  let exibeCena: boolean = true;
  let indiceCena: number = 0;

  let user: User;

  // let logCombate: string[] = [
  //   `Você causou ${dano} de dano no inimigo.`,
  //   `O inimigo causou ${dano} de dano em você.`,
  // ];  

  let personagem: Personagem;
  let episodio: Episodio;
  export let progresso: any[] = [];
  let cenaAtual: any;
  let inimigoAtual: Inimigo;
  let error = '';
  let loading = false;
  let idPersonagem: number;
  let idEpisodio: number;
  $: idPersonagem = Number($page.params.id);
  
  /**
    - PASSAR CENAS
    Combate: ao inimigo ter a vida zerada
    Diálogo: quando apertar enter
    Comércio: botão sair

    - MORTE 
    A vida do inimigo fica numa variável. 
    Se a vida do inimigo zera, passa para a próxima cena. Se a vida do jogador zera, volta para os stats do início da cena (o inimigo e o jogador).
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

  $: if (cenaAtual && cenaAtual.tipo == 'Combate'){
    buscaInimigo(cenaAtual.cena_id)
  }

  function proximaCena() {
        if (indiceCena < progresso.length - 1 && cenaAtual.tipo == "Diálogo") {
            indiceCena++;
            console.log(indiceCena)
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

    console.log("Valor bruto da vida:", inimigoAtual.vida, typeof inimigoAtual.vida);
    console.log("Valor bruto do dano:", personagem?.dano, typeof personagem?.dano);

    const vidaAtual = Number(inimigoAtual.vida)
    const dano = Number(personagem.dano) || 0;

    inimigoAtual.vida = vidaAtual - dano;
    console.log(`Você deu ${personagem.dano} pontos de dano e a vida do inimigo é ${inimigoAtual.vida}`)
  }
  
  function InimigoAtaque(inimigo: any, personagem: any){
    personagem.vida = personagem.vida - inimigo.dano
  }

  function MostrarInventário(){

  }

  function OcultarInventário(){

  }

  function UsarItem(){

  }

  function EncerrarTurno(){

  }


  async function exibicaoMenu(){
    exibeMenu = !exibeMenu;
    console.log(`Estado do menu: ${exibeMenu} e Estado da cena: ${exibeCena}` )
  }
</script>

<!-- Evento global de teclado para escutar o Enter -->
<svelte:window on:keydown={(e) => {
  if (e.key === 'Enter') {
      proximaCena();
  }
}} />

<svelte:head>
  <title>{cenaAtual?.episodio_titulo}</title>
</svelte:head>

<div class="text-center fixed w-[85%] top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded">
  <Heading tag="h1" class="text-primary-500 mt-1">{cenaAtual ? cenaAtual.episodio_titulo : "Erro: Episódio indefinido"}</Heading>
</div>

{#if exibeMenu}
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
    <!-- Caixa Retangular Centralizada -->
    <div class="w-96 border-2 border-primary-500 bg-primary-900 p-6 flex flex-col items-center gap-4 shadow-2xl rounded-none">
      <h2 class="text-3xl font-bold tracking-widest border-b-2 border-primary-500 text-primary-500 pb-2 w-full text-center">
        PAUSA
      </h2>

      <!-- Opções do Menu -->
      <div class="flex flex-col gap-3 w-full mt-2">
        <button
          type="button"
          on:click={exibicaoMenu}
          class="w-full py-2 border-2 border-primary-500 hover:bg-primary-500 hover:text-white text-primary-500 font-semibold transition">
            Continuar
        </button>

        <button
          type="button"
          class="w-full py-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-semibold transition"
          on:click={() => goto('/menu_game')}>
            Sair para o Menu
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Container cena de diálogo -->
{#if exibeCena && cenaAtual && cenaAtual.tipo == "Diálogo"}
  <div class="min-h-screen fixed inset-0 bg-primary-900 text-primary-500 p-4 flex flex-col gap-4">
    <!-- Topo: Menu circular à esquerda -->
    <div class="flex items-center">
      <button
        type="button"
        class="w-16 h-16 rounded-full cursor-pointer border-2 border-primary-300 flex items-center justify-center font-bold hover:bg-primary-800 transition"
        on:click={exibicaoMenu}>
          <PauseSolid class="shrink-0 h-9 w-9 text-primary-50" />
      </button>
    </div>

    <!-- Corpo Principal: Grid/Flex de duas colunas -->
    <div class="flex flex-1 gap-4">
      <!-- Coluna da Esquerda: Status do Jogador -->
      <div class="w-1/4 border-2 border-primary-300 p-4 rounded-none flex flex-col">
        <h2 class="text-5xl font-bold mb-2 text-primary-500">status:</h2>
        <!-- Conteúdo do status vai aqui -->
        <div class="text-xg text-primary-50">
          <p>Vida: {personagem.vida}</p>
          <p>Defesa: {personagem.defesa}</p>
          <p>Xp: {personagem.xp}</p>
          <p>Classe: {personagem.classe}</p>
          <p>Dinheiro: {personagem.dinheiro}</p>
        </div>
      </div>

      <!-- Coluna da Direita: Ilustração + Diálogo -->
      <div class="w-3/4 flex flex-col gap-4">
        <!-- Bloco Superior: Ilustração -->
        <div class="h-40 border-2 border-primary-300 p-4 flex items-center justify-center">
          <span class="text-2xl font-semibold">*ilustração*</span>
        </div>

        <!-- Bloco Inferior: Diálogo -->
        <div class="flex-5x1 border-2 border-primary-300 p-6 bg-primary-800/50">
          <h3 class="text-3xl font-bold mb-4">Diálogo</h3>
          <p class="text-primary-50 whitespace-pre-line">
            {cenaAtual.dialogo}
          </p>
        </div>

        <!-- Indicador para pressionar Enter -->
        <div class="mt-6 text-right">
          <span class="text-lg text-primary-500 animate-pulse italic">
            Pressione enter para continuar...
          </span>
        </div>
      </div>
    </div>
  </div>

<!-- Container cena de combate -->
{:else if exibeCena && cenaAtual && cenaAtual.tipo == "Combate"}
  <div class="min-h-screen fixed inset-0 bg-primary-900 text-primary-500 p-4 flex flex-col gap-4">
    <!-- Topo: Menu circular à esquerda -->
    <div class="flex items-center">
      <button
        type="button"
        class="w-16 h-16 rounded-full border-2 border-primary-300 flex items-center justify-center font-bold hover:bg-primary-800 transition"
        on:click={exibicaoMenu}>
          <PauseSolid class="shrink-0 h-9 w-9 text-primary-50" />
      </button>
    </div>

    <!-- Corpo Principal: Grid/Flex de duas colunas -->
    <div class="flex flex-1 gap-4">
      <!-- Coluna da Esquerda: Status do Jogador -->
      <div class="w-1/4 border-2 border-primary-300 p-4 rounded-none flex flex-col">
        <h2 class="text-5xl font-bold mb-2 text-primary-500">status:</h2>
        <!-- Conteúdo do status vai aqui -->
        <div class="text-xg text-primary-50">
          <p>Vida: {personagem.vida}</p>
          <p>Defesa: {personagem.defesa}</p>
          <p>Xp: {personagem.xp}</p>
          <p>Classe: {personagem.classe}</p>
          <p>Dinheiro: {personagem.dinheiro}</p>
        </div>
      </div>

      <!-- Coluna do Meio: Ilustração + Log de Combate -->
      <div class="w-3/4 flex flex-col gap-4 relative pb-16">
        <!-- Bloco Superior: Ilustração -->
        <div class="h-40 border-2 border-primary-300 p-4 flex items-center justify-center">
          <span class="text-2xl font-semibold">*ilustração*</span>
        </div>

        <!-- Bloco Inferior: Log de combate -->
        <div class="flex-5x1 border-2 border-primary-300 p-6 bg-primary-800/50">
          {#if inimigoAtual?.vida == 0}
          <p class="text-primary-50 whitespace-pre-line">
            Você derrotou {inimigoAtual.nome}!
          </p>
          {/if}
        </div>

        <!-- Botões de Ação do Combate -->
        <div class="py-2 absolute bottom-25 left-0 right-0 flex justify-center gap-4">
          <button type="button" on:click={PersonagemAtaque(personagem)} class="px-12 py-6 text-lg border-2 border-primary-300 font-bold text-primary-50 hover:bg-primary-700 cursor-pointer transition">
            Atacar
          </button>
          <button type="button" class="px-6 py-2 text-lg border-2 border-primary-300 font-bold text-primary-50 hover:bg-primary-700 cursor-pointer transition">
            Inventário
          </button>
          <button type="button" class="px-6 py-2 text-lg border-2 border-primary-300 font-bold text-primary-50 hover:bg-primary-700 cursor-pointer transition">
            Encerrar turno
          </button>
        </div>
        
      </div>

      <!-- Coluna da Direita: Status do inimigo -->
      <div class="w-1/4 border-2 border-primary-300 p-4 rounded-none flex flex-col">
        <h2 class="text-5xl font-bold mb-2 text-primary-500">status do inimigo:</h2>
        <!-- Conteúdo do status vai aqui -->
        <div class="text-xg text-primary-50">
          <p>Nome: {inimigoAtual ? inimigoAtual.nome : 'Inimigo Indefinido'}</p>
          <p>Descrição: {inimigoAtual ? inimigoAtual.descricao : 'Inimigo Indefinido'}</p>
          <p>Vida: {inimigoAtual ? inimigoAtual.vida : 'Inimigo Indefinido'}</p>
          <p>Defesa: {inimigoAtual ? inimigoAtual.defesa : 'Inimigo Indefinido'}</p>
        </div>
      </div>
    </div>
  </div>
{/if}