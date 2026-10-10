<script lang="ts">
  import { P, A, Heading, Card, Label, Input, Select, Button,  Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Badge} from "flowbite-svelte";
  import type { ApiFieldError, ApiResponse } from '$lib/api';
  import { onMount } from 'svelte'; // ciclo de vida
  import type { Personagem } from '$lib/models/Personagem';
  import type { User } from '$lib/models/User';
  import type { Cena } from '$lib/models/Cena';
  import type { Episodio } from '$lib/models/Episodio';
  import api from '$lib/api'; // API backend
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  //Arrays
  let cenas: Cena[] = []

  //Variáveis de controle
  let exibeMenu: boolean = false;
  let exibeCena: boolean = true;

  let user: User;
  let personagem: Personagem;
  let episodio: Episodio;
  let progresso: any;
  let episodioAtual: any;
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
        progresso = { ...body.data }
        episodioAtual = progresso[personagem.id_episodio];
        console.log(progresso)
      } else {
        error = body.message ?? 'Erro ao carregar progresso.';
      }
    } catch (e: any) {
      console.error('Erro ao carregar progresso:', e);
      const body = e.response?.data as ApiResponse<Personagem> | undefined;
      error = body?.message || 'Erro ao carregar progresso';
    } finally {
      loading = false;
    }
  }

  async function exibicaoMenu(){
    exibeMenu = !exibeMenu;
    console.log(`Estado do menu: ${exibeMenu} e Estado da cena: ${exibeCena}` )
  }
</script>

<div class="text-center fixed w-[85%] top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded">
  <Heading tag="h1" class="text-primary-500 mt-1">{progresso ? episodioAtual.episodio_titulo : "Erro: Episódio indefinido"}</Heading>
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
{#if exibeCena && progresso && episodioAtual.tipo == "Diálogo"}
  <div class="min-h-screen fixed inset-0 bg-primary-900 text-primary-500 p-4 flex flex-col gap-4">
    <!-- Topo: Menu circular à esquerda -->
    <div class="flex items-center">
      <button
        type="button"
        class="w-16 h-16 rounded-full border-2 border-primary-500 flex items-center justify-center font-bold hover:bg-primary-800 transition"
        on:click={exibicaoMenu}>
          menu
      </button>
    </div>

    <!-- Corpo Principal: Grid/Flex de duas colunas -->
    <div class="flex flex-1 gap-4">
      <!-- Coluna da Esquerda: Status do Jogador -->
      <div class="w-1/4 border-2 border-primary-500 p-4 rounded-none flex flex-col">
        <h2 class="text-5xl font-bold mb-2 text-primary-500">status:</h2>
        <!-- Conteúdo do status vai aqui -->
        <div class="text-xg text-primary-500">
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
        <div class="h-40 border-2 border-primary-500 p-4 flex items-center justify-center">
          <span class="text-2xl font-semibold">*ilustração*</span>
        </div>

        <!-- Bloco Inferior: Diálogo (com cantos arredondados como no esboço) -->
        <div class="flex-5x1 border-2 border-primary-500 rounded-3xl p-6 bg-primary-800/50">
          <h3 class="text-3xl font-bold mb-4">Diálogo</h3>
          <p class="text-primary-500">
            {episodioAtual.dialogo}
          </p>
        </div>
      </div>
    </div>
  </div>
{/if}