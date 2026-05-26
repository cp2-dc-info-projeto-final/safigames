<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<main class="flex flex-col items-center justify-center min-h-screen w-full bg-primary-800 dark:bg-gray-800">

  <div class="w-full max-w-3xl px-4 md:px-8">
    {@render children()}
  </div>
</main>
