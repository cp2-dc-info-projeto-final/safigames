<script lang="ts">
  import Menu from '../../components/Menu.svelte';
  import { UserEditOutline, TrashBinOutline } from 'flowbite-svelte-icons'; // ícones
  import ConfirmModal from '../../components/ConfirmModal.svelte'; // modal de confirmação
  import { Card, P, Heading } from "flowbite-svelte";
  import type { User } from '$lib/models/User';
  import { logout } from '$lib/auth'; // função de logout
  import api from '$lib/api'; // API backend
  import type { ApiFieldError, ApiResponse } from '$lib/api';
  import { goto } from '$app/navigation'; // navegação
  import { onMount } from 'svelte';
  import { getCurrentUser } from '$lib/auth';

  let isAdmin = false;
  let error = '';
  let user: User | null = null;
  let authRequestId = 0;
  let hasToken: boolean;
  let loadingUser: boolean;
  let deletingId: number | null = null; // id em deleção
  let confirmOpen = false; // modal aberto?
  let confirmTargetId: number | null = null; // id alvo do modal

  onMount(async () => {
    const user = await getCurrentUser();
    isAdmin = user?.role === 'admin';
  });

  async function carregaUser () {
    try {
      const res = await api.get(`/users/me`);
      const body = res.data as ApiResponse<User>;
      if (body.success && body.data) {
        user = { ...body.data }; // não carrega senha na edição
      } else {
        error = body.message ?? 'Erro ao carregar usuário.';
      }
    } catch (e: any) {
      const body = e.response?.data as ApiResponse<User> | undefined;
      error = body?.message || 'Erro ao carregar usuário.';
    } finally {} 
  };

  // Abre modal de confirmação
  function openConfirm(id: number) {
    confirmTargetId = id;
    confirmOpen = true;
  }
  // Fecha modal
  function closeConfirm() {
    console.log("Ta entrando")
    confirmOpen = false;
    confirmTargetId = null;
  }

    // Confirma remoção
    function handleConfirm() {
    if (confirmTargetId !== null) {
      handleDelete(confirmTargetId);
    }
    closeConfirm();
  }

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

  // Cancela remoção
  function handleCancel() {
    closeConfirm();
  }

  async function handleDelete(id: number) {
    deletingId = id;
    error = '';
    try {
      const res = await api.delete(`/users/${id}`);
      const body = res.data as ApiResponse<null>;
      await handleLogout();
      goto("/")
      if (!body.success) {
        error = body.message;
        return;
      }
    } catch (e: any) {
      console.error('Erro ao deletar usuário:', e);
      const body = e.response?.data as ApiResponse<null> | undefined;
      error = body?.message || 'Erro ao remover usuário.';
    } finally {
      deletingId = null;
    }
  }

  carregaUser()
</script>
<Menu />
<div class="text-center">
    <Heading tag="h1" class={[!isAdmin ? 'text-primary-200' : 'text-secondary-200']}>
      Seu Perfil
    </Heading>
</div>
<Card 
  class={
    ['max-w-md mx-auto mt-10 p-0 bg-primary-900 overflow-hidden shadow-lg border rounded-lg', 
    !isAdmin 
      ? 'border-primary-600' 
      : 'border-secondary-600']
    .join(' ')
  }>
  <P class={['text-primary-50 text-2xl border px-3', !isAdmin ? 'border-primary-500' : 'border-secondary-500']}>
    Nome: {user ? user.login : "Carregando usuário..."}
  </P>
  <P class={['text-primary-50 text-2xl border px-3', !isAdmin ? 'border-primary-500' : 'border-secondary-500']}>
    Email: {user ? user.email : "Carregando email..."}
  </P>
  <div class="flex gap-1 justify-center">
    <button
        title="Remover"
        class="p-2 transition bg-transparent"
        disabled={!user}
        on:click={() => user && openConfirm(user.id)}>
        <TrashBinOutline class="w-6 h-6 text-red-400" />
    </button>
    <button
        class="p-2 transition bg-transparent"
        title="Editar"
        disabled={!user}
        on:click={() => user && goto(`/auto_edit/${user.id}`)}>
        <UserEditOutline class="w-6 h-6 text-primary-500 justify-right" />
    </button>
  </div>
</Card>

<!-- Modal de confirmação -->
<ConfirmModal
  open={confirmOpen}
  message="Tem certeza que deseja remover este usuário?"
  confirmText="Remover"
  cancelText="Cancelar"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>