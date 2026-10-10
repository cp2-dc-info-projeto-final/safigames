<script lang="ts">
  import Menu from '../../components/Menu.svelte';
  import { FolderOpenSolid } from 'flowbite-svelte-icons';
  import { goto } from '$app/navigation';
</script>

<Menu />

<svelte:head>
  <title>Gerenciamento</title>
</svelte:head>
<h1 class="text-6xl font-medium text-center text-secondary-200 mb-10">
  Gerenciamento
</h1>
<div class="grid grid-cols-4 gap-20">
  <div class="flex flex-col items-center">
    <button class="px-3 py-1 rounded" on:click={() => goto('/gerenciamento/personagem')}>
      <FolderOpenSolid class="h-25 w-25 text-secondary-50 hover:text-secondary-200'" />
    </button>
    <p class="text-lg font-medium text-center text-primary-50">Personagem</p>
  </div>
  <div class="flex flex-col items-center">
    <button class="px-3 py-1 rounded" on:click={() => goto('/gerenciamento/episodio')}>
      <FolderOpenSolid class="h-25 w-25 text-secondary-50 hover:text-secondary-51" />
    </button>
    <p class="text-lg font-medium text-center text-primary-50">Episódio</p>
  </div>
  <div class="flex flex-col items-center">
    <button class="px-3 py-1 rounded" on:click={() => goto('/gerenciamento/comerciante')}>
      <FolderOpenSolid class="h-25 w-25 text-secondary-50 hover:text-secondary-51" />
    </button>
    <p class="text-lg font-medium text-center text-primary-50">Comerciante</p>
  </div>
  <div class="flex flex-col items-center">
    <button class="px-3 py-1 rounded" on:click={() => goto('/gerenciamento/item')}>
      <FolderOpenSolid class="h-25 w-25 text-secondary-50 hover:text-secondary-51" />
    </button>
    <p class="text-lg font-medium text-center text-primary-50">Item</p>
  </div>
</div>