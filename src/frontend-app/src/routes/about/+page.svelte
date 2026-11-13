<script lang="ts">
  import { Heading, P, ImagePlaceholder } from "flowbite-svelte";
  import Menu from '../../components/Menu.svelte';
  import { onMount } from 'svelte';
  import { getCurrentUser, getToken, type User } from '$lib/auth';
  let isAdmin = $state(false);

  let user: User | null = null;
  let hasToken = false;
  let loadingUser = false;
  let authRequestId = 0;

  onMount(async () => {
	hasToken = getToken() !== null;

    if (!hasToken) {
      user = null;
      loadingUser = false;
      return;
    }

    if (user || loadingUser) {
      return;
    }

    loadingUser = true;
    const requestId = ++authRequestId;

    try {
      const userData = await getCurrentUser();
      isAdmin = userData?.role === 'admin';
      if (requestId !== authRequestId) {
        return;
      }
      user = userData;
      hasToken = userData !== null;
    } catch {
      if (requestId !== authRequestId) {
        return;
      }
      user = null;
      hasToken = false;
    } finally {
      if (requestId === authRequestId) {
        loadingUser = false;
      }
    }
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
    <div class="text-center pt-10 flex flex-col md:flex-row items-center gap-4" style="display:flex">
      <img src="/images/vit.jpg" alt="" class={['rounded-lg border-primary-50 border shadow-lg w-full md:w-auto', !isAdmin ? 'shadow-primary-500' : 'shadow-secondary-500'].join(' ')}>
      <P class="text-lg leading-relaxed text-primary-50 mb-4 text-justify pl-0 md:pl-5">
        Vitória Ferreira de Almeida, moradora da Vila São João - São João de Meriti, entrou no Colégio Pedro II para ter uma formação técnica e melhores oportunidades no mercado.
      </P>
    </div>
    <div class="text-center pt-10 flex flex-col md:flex-row items-center gap-4" style="display:flex">
      <img src="/images/isaac.jpg" alt="" class={['rounded-lg border-primary-50 border shadow-lg w-full md:w-auto', !isAdmin ? 'shadow-primary-500' : 'shadow-secondary-500'].join(' ')}>
      <P class="text-lg leading-relaxed text-primary-50 mb-4 text-justify pl-0 md:pl-5">
        Isaac de Magalhães Rocha da Silva, morador de Nova Campinas - Duque de Caxias, entrou no Colégio Pedro II para ter um melhor ensino e porque sempre teve interesse em ingressar na escola.
      </P>
    </div>
    <div class="text-center pt-10 flex flex-col md:flex-row items-center gap-4" style="display:flex">
      <img src="/images/jao.jpg" alt="" class={['rounded-lg border-primary-50 border shadow-lg w-full md:w-auto', !isAdmin ? 'shadow-primary-500' : 'shadow-secondary-500'].join(' ')}>
      <P class="text-lg leading-relaxed text-primary-50 mb-4 text-justify pl-0 md:pl-5">
        João Vitor Nascimento da Silva, morador de Olavo Bilac - Duque de Caxias, entrou no Colégio Pedro II para fazer Desenvolvimento de Sistemas, pois sempre gostou dessa área e queria uma formação técnica.
      </P>
    </div>
    <div class="text-center pt-10 flex flex-col md:flex-row items-center gap-4" style="display:flex">
      <img src="/images/dan.jpg" alt="" class={['rounded-lg border-primary-50 border shadow-lg w-full md:w-auto', !isAdmin ? 'shadow-primary-500' : 'shadow-secondary-500'].join(' ')}>
      <P class="text-lg leading-relaxed text-primary-50 mb-4 text-justify pl-0 md:pl-5">
        Daniel do Nascimento Folly, morador da Vila Rosali - São João de Meriti, entrou no Colégio Pedro II para ter uma formação acadêmica melhor e numa área que tem interesse.
      </P>
    </div>
  </div>