<script lang="ts">
    import { page } from '$app/stores';
    import { get } from 'svelte/store';
    import Menu from '../../../../components/Menu.svelte';

    const { id } = get(page).params;
</script>
<Menu />

