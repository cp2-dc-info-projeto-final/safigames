<script lang="ts">
  import { Heading } from 'flowbite-svelte';
  import Menu from '../components/Menu.svelte';
  import {  P } from "flowbite-svelte";
</script>

<Menu />

<div class="text-center p-8 pt-32">
	<Heading tag="h2" class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">Esgotamento: Um projeto Safigames</Heading>
	<P class="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4 text-justify">
		Somos do Colégio Pedro II - Campus Duque de Caxias do terceiro ano do curso desenvolvimento de sistemas. 
		Como projeto final, estamos desenvolvendo um jogo estilo RPG de texto. O jogo será baseado em botões para interagir com o mundo.
		O jogo será dividido em episódios, e haverá ilustração no formato ASCII.
	</P>
	<img src='../images/ilustracao-de-exemplo.png' alt="Ilustração de exemplo">
</div>