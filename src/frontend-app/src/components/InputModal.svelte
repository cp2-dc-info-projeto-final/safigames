<script lang="ts">

    import { Modal, Button, Input, Label } from 'flowbite-svelte';
    import { CloseOutline, CheckOutline } from 'flowbite-svelte-icons';

    export let open = false; // controla exibição
    export let message = 'Digite o novo nome do personagem:'; // texto principal
    export let confirmText = 'Confirmar'; // texto botão confirmar
    export let cancelText = 'Cancelar'; // texto botão cancelar
    export let onConfirm: () => void; // ação confirmar
    export let onCancel: () => void; // ação cancelar
    export let nome: string = '';

    function handleClose() {
    if (onCancel) {
      onCancel();
    }
  }

</script>

<Modal bind:open={open} 
    size="sm" 
    class="z-50"
    onclose={handleClose}
>
<Label for="nome_personagem">Nome:</Label>
<Input id="nome_personagem" bind:value={nome} />

<!-- Botão confirmar -->
<Button color="primary" type="button" onclick={onConfirm}>
    <CheckOutline class="w-5 h-5 text-white" /> {confirmText}
</Button>
 <!-- Botão cancelar -->
<Button color="light" type="button" onclick={onCancel}>
    <CloseOutline class="w-5 h-5 text-gray-500" /> {cancelText}
</Button>

</Modal>