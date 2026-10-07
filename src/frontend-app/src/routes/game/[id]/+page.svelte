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

    let user: User;
    let personagem: Personagem;
    let episodio: Episodio;
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
            error = body.message;
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
      const body = res.data as ApiResponse<Personagem>;
      if (body.success && body.data.length > 0) {
        personagem = body.data[0];
        idEpisodio = personagem.id_episodio;
      } else {
        error = body.message;
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
      console.log(body)
      error = body.message;
    } catch (e: any) {
        console.error('Erro ao carregar progresso:', e);
        const body = e.response?.data as ApiResponse<Personagem> | undefined;
        error = body?.message || 'Erro ao carregar progresso';
      } finally {
          loading = false;
        }
  }
</script>

<div class="text-xxl text-primary-500">
    Entrou no game piá
</div>