<script lang="ts">
	import '../app.css';
	import Menu from '../components/Menu.svelte';
	let { children } = $props();
</script>

<main class="flex flex-col items-center justify-center min-h-screen w-full bg-primary-900 dark:bg-gray-800">
  <Menu />
  <div class="w-full max-w-3xl px-4 md:px-8">
    {@render children()}
  </div>
</main>
