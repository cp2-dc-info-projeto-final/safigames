<script lang="ts">
  import { Heading, P, ImagePlaceholder } from "flowbite-svelte";
  import Menu from '../../components/Menu.svelte';
  import { onMount } from 'svelte';
  import { getCurrentUser } from '$lib/auth';
  let isAdmin = $state(false);

  onMount(async () => {
    const user = await getCurrentUser();
    isAdmin = user?.role === 'admin';
  });
</script>

<Menu />

<svelte:head>
  <title>Sobre</title>
</svelte:head>

<style>
  img{
    width: 150px;
    height: 150px;
  }
  :global(body) {
    font-family: 'fonte-topiy';
  }

</style>
<div class="text-center p-8 pt-32">
  <Heading tag="h1" class={['text-4xl font-extrabold tracking-tight mb-6', !isAdmin ? 'text-primary-100' : 'text-secondary-100']}>
    Sobre
  </Heading>
  <P class="text-xl leading-relaxed text-primary-50 mb-4 text-justify">
    Somos estudantes do 3º ano do Ensino Médio Integrado: Técnico em desenvolvimento de sistemas no Colégio Pedro II - Campus Duque de Caxias

  </P>
  <Heading tag="h3" class="text-lg leading-relaxed text-primary-50 text-justify">
    Abaixo, segue algumas fotos e informações sobre nossa equipe:
  </Heading>
  <div class="text-center pt-10" style="display:flex">
    <img src="/images/vit.jpg" alt="" class={['rounded-lg border-primary-50 border shadow-lg', !isAdmin ? 'shadow-primary-500' : 'shadow-secondary-500'].join(' ')}>
    <P class="text-lg leading-relaxed text-primary-50 mb-4 text-justify pl-5">
      Vitória Ferreira de Almeida, moradora da Vila São João - São João de Meriti, entrou no Colégio Pedro II para ter uma formação técnica e melhores oportunidades no mercado.
    </P>
  </div>
  <div class="text-center pt-10" style="display:flex">
    <P class="text-lg leading-relaxed text-primary-50 mb-4 text-justify pr-5">
      Isaac de Magalhães Rocha da Silva, morador de Nova Campinas - Duque de Caxias, entrou no Colégio Pedro II para ter um melhor ensino e porque sempre teve interesse em ingressar na escola.
    </P>
    <img src="/images/isaac.jpg" alt="" class={['rounded-lg border-primary-50 border shadow-lg', !isAdmin ? 'shadow-primary-500' : 'shadow-secondary-500'].join(' ')}>
  </div>
  <div class="text-center pt-10" style="display:flex">
    <img src="/images/jao.jpg" alt="" class={['rounded-lg border-primary-50 border shadow-lg', !isAdmin ? 'shadow-primary-500' : 'shadow-secondary-500'].join(' ')}>
    <P class="text-lg leading-relaxed text-primary-50 mb-4 text-justify pl-5">
      João Vitor Nascimento da Silva, morador de Olavo Bilac - Duque de Caxias, entrou no Colégio Pedro II para fazer Desenvolvimento de Sistemas, pois sempre gostou dessa área e queria uma formação técnica.
    </P>
  </div>
  <div class="text-center pt-10" style="display:flex">
    <P class="text-lg leading-relaxed text-primary-50 mb-4 text-justify pr-5">
      Daniel do Nascimento Folly, morador da Vila Rosali - São João de Meriti, entrou no Colégio Pedro II para ter uma formação acadêmica melhor e numa área que tem interesse.
    </P>
    <img src="/images/dan.jpg" alt="" class={['rounded-lg border-primary-50 border shadow-lg', !isAdmin ? 'shadow-primary-500' : 'shadow-secondary-500'].join(' ')}>
  </div>
</div>