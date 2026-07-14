<script lang="ts">
  // Formulário de usuário
  import { Card, Button, Label, Input, Heading, Select, A } from 'flowbite-svelte'; // UI
  import { onMount } from 'svelte'; // ciclo de vida
  import api from '$lib/api'; // API backend
  import type { ApiFieldError, ApiResponse } from '$lib/api';
  import { goto } from '$app/navigation'; // navegação
  import { ArrowLeftOutline, FloppyDiskAltOutline, EyeSlashSolid, EyeSolid } from 'flowbite-svelte-icons'; // ícones
  import type { User, UserFormData } from '$lib/models/User';
  import { getToken, getCurrentUser } from "$lib/auth";
  import { login as authLogin } from "$lib/auth";
  

  export let id: number | null = null; // id do usuário

  let user: UserFormData = { id: 0, login: '', email: '', senha: '', role: 'jogador' }; // dados do form
  
  // Opções de roles
  const roleOptions = [
    { value: 'jogador', name: 'Jogador' },
    { value: 'admin', name: 'Administrador' }
  ];
  
  let loading = false;
  let error = '';
  let fieldErrors: ApiFieldError[] = [];
  let hasToken = false;
  let confirmarSenha = '';
  let senhaVisivel = false;
  let componenteAtivo = EyeSlashSolid;
  let user_me: User;

  function olhoeSenha(){
    mudaOlho();
    mostrarSenha();
  }

  function mudaOlho() {
    componenteAtivo = componenteAtivo === EyeSlashSolid ? EyeSolid : EyeSlashSolid;
  }

  function mostrarSenha(){
    if (senhaVisivel){
      senhaVisivel = false;
    }
    else{
      senhaVisivel = true;
    }
  }


  function errorOf(field: string): string | null {
    return fieldErrors.find((item) => item.field === field)?.message ?? null;
  }

  

  // Carrega usuário se for edição
  onMount(async () => {
    if (hasToken){
      user_me = await getCurrentUser();
    }
    if (id !== null) {
      loading = true;
      try {
        const res = await api.get(`/users/${id}`);
        const body = res.data as ApiResponse<User>;
        if (body.success && body.data) {
          user = { ...body.data, senha: '' }; // não carrega senha na edição
        } else {
          error = body.message;
        }
      } catch (e: any) {
        const body = e.response?.data as ApiResponse<User> | undefined;
        error = body?.message || 'Erro ao carregar usuário.';
      } finally {
        loading = false;
      }
    } 
  });

  async function handleLogin() {
    if (!user.login || !user.senha) {
      error = 'Por favor, preencha todos os campos';
      return;
    }

    loading = true;
    error = '';

    try {
      let login = user.login;
      let password = user.senha;
      const result = await authLogin({ login, password });
      
      if (result.success) {
        await goto('/');
      } else {
        error = result.message || 'Credenciais inválidas';
      }
    } catch (err) {
      error = 'Erro interno do servidor';
      console.error('Erro no login:', err);
    } finally {
      loading = false;
    }
  }

  

  // Submissão do formulário
  async function handleSubmit() {
    fieldErrors = [];

    // Validação de senha
    if (id === null && (!user.senha || user.senha.length < 6)) {
      fieldErrors = [{ field: 'senha', message: 'Senha deve ter pelo menos 6 caracteres.' }];
      error = 'Senha deve ter pelo menos 6 caracteres.';
      return;
    }
    
    if (user.senha !== confirmarSenha) {
      fieldErrors = [{ field: 'senha', message: 'Senhas precisam ser iguais!' }];
      error = 'Senhas precisam ser iguais!';
      return;
    }

    loading = true;
    error = '';
    try {
      const userData = { ...user };
      if (id !== null && !userData.senha) {
        delete userData.senha;
      }
      
      if (id === null) {
        const res = await api.post('/users', userData);
        const body = res.data as ApiResponse<User>;
        if (!body.success) {
          error = body.message;
          fieldErrors = body.errors;
          return;
        }
        if (!hasToken){
          await handleLogin();
        }
      } else {
        const res = await api.put(`/users/${id}`, userData);
        const body = res.data as ApiResponse<User>;
        if (!body.success) {
          error = body.message;
          fieldErrors = body.errors;
          return;
        }
      }
      goto('/users');
    } catch (e: any) {
      const body = e.response?.data as ApiResponse<User> | undefined;
      error = body?.message || 'Erro ao salvar usuário.';
      fieldErrors = body?.errors || [];
    } finally {
      loading = false;
    }
  }

  function handleCancel() {
    history.back();
  }
  void verificaUser();
  async function verificaUser() {
    hasToken = getToken() !== null;
  }
</script>

<!-- Card do formulário -->
<Card class="max-w-md mx-auto mt-10 p-0 bg-primary-900 overflow-hidden shadow-lg border border-primary-600 rounded-lg">
  <!-- Formulário principal -->
  <form class="flex flex-col gap-6 p-6" on:submit|preventDefault={handleSubmit}>
    <!-- Título -->
    <Heading tag="h3" class="text-4xl mb-2 text-center text-primary-100">
      {id === null ? 'Cadastrar Usuário' : 'Editar Usuário'}
    </Heading>
    <!-- Mensagem de erro -->
    {#if error}
      <div class="text-red-500 text-center">{error}</div>
    {/if}
    <!-- Campo login -->
    <div>
      <Label for="login" class="text-lg text-primary-500">Login</Label>
      <Input id="login" bind:value={user.login} placeholder="Digite o login" required class="mt-1" />
      {#if errorOf('login')}
        <div class="mt-1 text-sm text-red-500">{errorOf('login')}</div>
      {/if}
    </div>
    <!-- Campo email -->
    <div>
      <Label for="email" class="text-lg text-primary-500">Email</Label>
      <Input id="email" type="email" bind:value={user.email} placeholder="Digite o e-mail" required class="mt-1" />
      {#if errorOf('email')}
        <div class="mt-1 text-sm text-red-500">{errorOf('email')}</div>
      {/if}
    </div>
    <!-- Campo senha -->
    <div>
      <Label for="senha" class="text-lg text-primary-500">Senha {id !== null ? '(deixe vazio para manter atual)' : ''}</Label>
      <Input 
        id="senha" 
        type={senhaVisivel ? "text" : "password"}
        bind:value={user.senha} 
        placeholder={id === null ? 'Digite a senha (mínimo 6 caracteres)' : 'Nova senha (opcional)'} 
        required={id === null}
        minlength={6}
        class="mt-1" 
      />
      
        
      {#if errorOf('senha')}
        <div class="mt-1 text-sm text-red-500">{errorOf('senha')}</div>
      {/if}
    </div>

    <div>
      <Label for="confirmarSenha" class="text-lg text-primary-500">Confirme a Senha</Label>
      <Input 
        id ="confirmarSenha"
        type={senhaVisivel ? "text" : "password"}
        bind:value={confirmarSenha} 
        placeholder={id === null ? 'Confirme sua senha' : 'Confirme sua senha (opcional)'}
        required={id === null}
        minlength={6}
        class="mt-1" 
        
      />
      <A type="button" onclick={olhoeSenha} class="text-primary-50 bg-primary-900 transition-colors rounded-lg ml-92 mt-1">
        <svelte:component this={componenteAtivo} class="shrink-0 h-6 w-6"/></A>
    </div>

    <!-- Campo role -->
    <div>
        {#if hasToken && user_me && user_me.role === 'admin'}
          <Label for="role" class="text-lg text-primary-500">Perfil</Label>
          <Select id="role" bind:value={user.role} items={roleOptions} class="mt-1" />

        {:else}
          
          <Select id="role" bind:value={user.role} items={roleOptions} class="mt-1" hidden />
        {/if}
        

      {#if errorOf('role')}
        <div class="mt-1 text-sm text-red-500">{errorOf('role')}</div>
      {/if}
    </div>
    <!-- Botões de ação -->
    
    <div class="text-lg flex gap-4 justify-end mt-4">
      <!-- Botão cancelar/voltar -->
      <Button color="light" type="button" onclick={handleCancel} disabled={loading}>
        <ArrowLeftOutline class="inline w-5 h-5 mr-2 align-text-bottom" />
        {id === null ? 'Voltar' : 'Cancelar'}
      </Button>
      <!-- Botão salvar -->
      <Button type="submit" color="primary" disabled={loading}>
        <FloppyDiskAltOutline class="inline w-5 h-5 mr-2 align-text-bottom" />
        {id === null ? 'Cadastrar' : 'Salvar'}
      </Button> 
    </div>
  </form>
  
</Card>