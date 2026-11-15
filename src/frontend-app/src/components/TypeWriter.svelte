<!--Para usar esse componente precisa fazer com que o enter além de avançar a cena, finalize o diálogo, para uma cena nao sobrebor a outra-->
<script>
  import { onMount } from 'svelte';
  import { P } from 'flowbite-svelte';

  export let text = "";
  export let speed = 50;

  let displayedText = "";
  let currentIndex = 0;

  onMount(() => {
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        displayedText += text[currentIndex];
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  });


</script>

<P class=" text-xs md:text-base leading-relaxed whitespace-pre-line inline font-normal text-primary-50 dark:text-gray-400 border-r-2 border-primary-500 dark:border-primary-600 pr-1 animate-pulse">
  {displayedText}
</P>