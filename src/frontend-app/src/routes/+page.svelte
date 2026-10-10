<script lang="ts">
  import { Heading } from 'flowbite-svelte';
  import Menu from '../components/Menu.svelte';
  import { P } from "flowbite-svelte";
  import { onMount } from 'svelte';
  import { getCurrentUser } from '$lib/auth';

  let isAdmin = $state(false);

  onMount(async () => {
    const user = await getCurrentUser();
    isAdmin = user?.role === 'admin';
  });
</script>

<style>
	:global(body) {
  font-family: 'fonte-topiy';
	}
</style>

<Menu />

<svelte:head>
  <title>Projeto Safigames</title>
</svelte:head>

<main class={['flex flex-col items-center justify-center min-h-screen w-full', !isAdmin ? 'bg-primary-800' : 'bg-secondary-800'].join(' ')}>
	<div class="text-center p-8 pt-32">
		<Heading
			tag="h2"
			class={['text-4xl font-extrabold tracking-tight mb-6', !isAdmin ? 'text-primary-200' : 'text-secondary-200'].join(' ')}>
			Esgotamento: Um projeto Safigames
		</Heading>
		<P class="text-xl leading-relaxed text-primary-50 mb-4 text-justify">
			Somos do Colégio Pedro II - Campus Duque de Caxias do terceiro ano do curso desenvolvimento de sistemas. 
			Como projeto final, estamos desenvolvendo um jogo estilo RPG de texto. O jogo será baseado em botões para interagir com o mundo.
			O jogo será dividido em episódios, e haverá ilustração no formato ASCII.
		</P>
		<img src='../images/ilustracao-de-exemplo.png' alt="Ilustração de exemplo">
	</div>
</main>