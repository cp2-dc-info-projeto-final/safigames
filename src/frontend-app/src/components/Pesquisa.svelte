<script lang="ts">
import { Label, Input } from 'flowbite-svelte';
export let filtro = ''

</script>

<Input 
    id="filtro" 
    bind:value={filtro} 
    placeholder="Pesquise por login"
    class="mt-1 bg-primary-100 border-primary-900"
/>