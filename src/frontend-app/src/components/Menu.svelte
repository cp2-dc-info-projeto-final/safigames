<script lang="ts">
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Heading} from "flowbite-svelte";
  import { onMount } from "svelte";
  import { logout, getCurrentUser, getToken, type User } from "$lib/auth";
  import { goto } from "$app/navigation";
  import { ArrowRightToBracketOutline, PlaySolid, AdjustmentsHorizontalSolid } from "flowbite-svelte-icons";
  import { page } from "$app/stores";
  let isAdmin = false;
  
  let user: User | null = null;
  let hasToken = false;
  let loadingUser = false;
  let authRequestId = 0;

  // Verifica token sincronamente (instantâneo)
  async function updateAuthStatus() {
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
  }

  // Reativo à mudança de página
  $: if ($page.url.pathname) {
    void updateAuthStatus();
  }

  onMount(async () => {
    void updateAuthStatus();
  });

  // função para logout (só apaga o token)
  async function handleLogout() {
    try {
      authRequestId += 1;
      await logout();
      user = null;
      hasToken = false;
      loadingUser = false;
      window.location.assign('/login')
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  }

	function irParaJogo() {
		goto('/menu_game'); // Caminho do jogo
	}

  function irParaGerenciamento(){
    goto('/gerenciamento'); // Gerenciamento
  }

</script>

<div class="relative px-8">
  <Navbar class="fixed start-0 top-0 z-20 w-full bg-primary-900 px-2 py-2.5 sm:px-4">
    <NavBrand href="/">
      <img src="/images/rato-sem-fundo.png" class="me-6 h-9 sm:h-12" alt="Logo aleatória" />
      <Heading 
        class={
          ['self-center text-2xl font-semibold whitespace-nowrap', !isAdmin ? 'text-primary-500' : 'text-secondary-500']
          .join(' ')
        }>
        Projeto Safigames
      </Heading>
    </NavBrand>
    <NavHamburger class={[!isAdmin ? 'bg-primary-600' : 'bg-secondary-600'].join(' ')}/>
    <NavUl>
      <NavLi 
        href="/" 
        nonActiveClass={
          ['text-xl font-bold px-4 py-2 transition-colors rounded-lg', 
          !isAdmin 
            ? 'text-primary-500 hover:text-primary-200 hover:bg-primary-900 focus:text-primary-400 focus:bg-primary-300' 
            : 'text-secondary-500 hover:text-secondary-200 hover:bg-secondary-900 focus:text-secondary-400 focus:bg-secondary-300']
          .join(' ')
        }>Início
      </NavLi>
      <NavLi 
        href="/about" 
        nonActiveClass={
          ['text-xl font-bold px-4 py-2 transition-colors rounded-lg', 
          !isAdmin 
            ? 'text-primary-500 hover:text-primary-200 hover:bg-primary-900 focus:text-primary-400 focus:bg-primary-300' 
            : 'text-secondary-500 hover:text-secondary-200 hover:bg-secondary-900 focus:text-secondary-400 focus:bg-secondary-300']
          .join(' ')
        }>Sobre
      </NavLi>
      {#if hasToken}
        {#if user} <!-- se existir usuário é porque conseguiu logar-->
          <NavLi 
            href="/perfil" 
            nonActiveClass={
              ['text-xl font-bold px-4 py-2 transition-colors rounded-lg', 
              !isAdmin 
                ? 'text-primary-500 hover:text-primary-200 hover:bg-primary-900 focus:text-primary-400 focus:bg-primary-300' 
                : 'text-secondary-500 hover:text-secondary-200 hover:bg-secondary-900 focus:text-secondary-400 focus:bg-secondary-300']
              .join(' ')
            }>Perfil
          </NavLi>
          {#if user.role === 'admin'} <!-- só exibe menu usuários para admin-->
            <NavLi 
              href="/users" 
              nonActiveClass={
                ['text-xl font-bold px-4 py-2 transition-colors rounded-lg', 
                !isAdmin 
                  ? 'text-primary-500 hover:text-primary-200 hover:bg-primary-900 focus:text-primary-400 focus:bg-primary-300' 
                  : 'text-secondary-500 hover:text-secondary-200 hover:bg-secondary-900 focus:text-secondary-400 focus:bg-secondary-300']
                .join(' ')
              }>Usuários
            </NavLi>
            <button 
              class="ml-2 px-3 py-1 text-white rounded text-lg flex items-center gap-1 bg-secondary-50 hover:bg-secondary-51"
              on:click={irParaGerenciamento}>
              <AdjustmentsHorizontalSolid class="shrink-0 h-6 w-6" />
              Gerenciar
            </button>
          {/if}
          <NavLi>
            <div class="flex items-center">
              <span class={['text-lg px-4', !isAdmin ? 'text-primary-500' : 'text-secondary-500'].join(' ')}>Olá, {user.login}</span>
                {#if user}
                  {#if user.role === 'jogador'}
                    <button 
                      class="ml-2 px-3 py-1 text-white rounded text-lg flex items-center gap-1 bg-secondary-500 hover:bg-secondary-200"
                      on:click={irParaJogo}>
                      <PlaySolid class="shrink-0 h-6 w-6" />
                      Jogar
                    </button>
                  {/if}
                {/if}
              <button 
                class={
                  ['ml-2 px-3 py-1 text-white rounded text-sm flex items-center gap-1 bg-primary-900', 
                  !isAdmin 
                    ? 'hover:bg-primary-200' 
                    : 'hover:bg-secondary-200']
                  .join(' ')
                }
                on:click={handleLogout}>
                <ArrowRightToBracketOutline class="w-6 h-6" /> Sair
              </button>
            </div>
          </NavLi>
        {:else if loadingUser}
          <NavLi class="text-lg font-bold px-4 py-2 text-primary-500">Carregando...</NavLi>
        {:else}
          <NavLi href="/login" nonActiveClass="text-lg font-bold px-4 py-2 text-primary-500 hover:text-primary-200 hover:bg-primary-900 focus:text-primary-400 focus:bg-primary-300 transition-colors rounded-lg">Login</NavLi>
        {/if}
      {:else}
        <!-- se não tem token, exibe botão de login-->
        <NavLi href="/login" nonActiveClass="text-lg font-bold px-4 py-2 text-primary-500 hover:text-primary-200 hover:bg-primary-900 focus:text-primary-400 focus:bg-primary-300 transition-colors rounded-lg">Login</NavLi>
      {/if}
    </NavUl>
  </Navbar>
</div>