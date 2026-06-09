<script lang=ts>
    import { P, A, Heading} from "flowbite-svelte";

    let novoJ = $state("Novo jogo")
    let carregarS = $state("Carregar save")
    let sair = $state("Sair")


</script>
<div class="mb-70 text-center ">
    <img src="/images/titulo_grafite_sem_fundo_pixelado.png" alt="buceta">
</div>
<div class="mb-80 text-center">
    <A class="text-primary-600 hover:text-secondary-50 text-3xl" onmouseenter={() => novoJ = "> Novo jogo <"} onmouseleave={() => novoJ = "Novo jogo"}>{novoJ}</A><br>
    <A class="text-primary-600 mt-6 mb-6 text-3xl hover:text-secondary-50" onmouseenter={() => carregarS = "> Carregar save <"} onmouseleave={() => carregarS = "Carregar Save"} >{carregarS}</A><br>
    <A class="text-primary-600 text-3xl hover:text-secondary-50" href="/" onmouseenter={() => sair= "> Sair <"} onmouseleave={() => sair = "Sair"}>{sair}</A>
</div>