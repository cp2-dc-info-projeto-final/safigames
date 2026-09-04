<script lang="ts">

    import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell } from "flowbite-svelte";
    import Menu from '../../components/Menu.svelte';
    import { onMount } from 'svelte'; // ciclo de vida
    import api from '$lib/api'; // API backend
    import type { ApiResponse } from '$lib/api';
    import type { User } from '$lib/models/User';
    import type { Personagem } from '$lib/models/Personagem';
    import { TrashBinOutline } from 'flowbite-svelte-icons'; // ícones
    import ConfirmModal from '../../components/ConfirmModal.svelte'; // modal de confirmação
    import { goto } from '$app/navigation';

    let user: User;
    let error = '';
    let personagens: Personagem[] = $state([]);

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
    } 
  })

</script>
<Menu />

<svelte:head>
  <title>Gerenciamento</title>
</svelte:head>

<div>
<button
    class="ml-2 px-3 py-1 bg-secondary-100 hover:bg-primary-200 text-white rounded text-lg flex items-center gap-1"
    on:click={goto('/gerenciamento/personagem')}>
    Personagem
</button>

<button 
    class="ml-2 px-3 py-1 bg-secondary-100 hover:bg-primary-200 text-white rounded text-lg flex items-center gap-1"
    on:click={goto('/gerenciamento/episodio')}>
    Episódio
</button>

</div>