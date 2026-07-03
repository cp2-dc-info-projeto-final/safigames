<script lang="ts">
    import Menu from '../../components/Menu.svelte';
    import { UserEditOutline, TrashBinOutline } from 'flowbite-svelte-icons'; // ícones
    import ConfirmModal from '../../components/ConfirmModal.svelte'; // modal de confirmação
    import { Card, P, Heading } from "flowbite-svelte";
    import type { User } from '$lib/models/User';
    import api from '$lib/api'; // API backend
    import type { ApiFieldError, ApiResponse } from '$lib/api';
    import { goto } from '$app/navigation'; // navegação

    let error = '';
    let user: User;
    let loading = true;
    let deletingId: number | null = null; // id em deleção
    let confirmOpen = false; // modal aberto?
    let confirmTargetId: number | null = null; // id alvo do modal

    async function carregaUser () {
      try {
        const res = await api.get(`/users/me`);
        const body = res.data as ApiResponse<User>;
        if (body.success && body.data) {
          user = { ...body.data }; // não carrega senha na edição
        } else {
          error = body.message;
        }
      } catch (e: any) {
        const body = e.response?.data as ApiResponse<User> | undefined;
        error = body?.message || 'Erro ao carregar usuário.';
      } finally {
    } 
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
    <Heading tag="h1" class="text-primary-200">Seu Perfil</Heading>
</div>
<Card class="max-w-md mx-auto mt-10 p-0 bg-primary-900 overflow-hidden shadow-lg border border-primary-600 rounded-lg">

<P class="text-primary-50 text-2xl border border-primary-500 px-3">Nome: {user ? user.login : "Carregando usuário..."}</P>
<P class="text-primary-50 text-2xl border border-primary-500 px-3">Email: {user ? user.email : "Carregando email..."}</P>
<div class="flex gap-1 justify-center">
<button
    title="Remover"
    class="p-2 transition bg-transparent"
    on:click={() => openConfirm(user.id)}>
    <TrashBinOutline class="w-6 h-6 text-red-400" />
</button>
<button
    class="p-2 transition bg-transparent"
    title="Editar"
    on:click={() => goto(`/auto_edit/${user.id}`)}>
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