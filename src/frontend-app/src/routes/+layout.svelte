<script lang="ts">
	import '../app.css';
  import { onMount } from 'svelte';
  import { getCurrentUser } from '$lib/auth';

  let isAdmin = $state(false);
	let { children } = $props();

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

<main class={['flex flex-col items-center justify-center min-h-screen w-full', !isAdmin ? 'bg-primary-800' : 'bg-secondary-800'].join(' ')}>
  <div class="w-full max-w-3xl px-4 md:px-8">
    {@render children()}
  </div>
</main>