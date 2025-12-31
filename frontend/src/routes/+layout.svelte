<script lang="ts">
    import "../app.css";
    import favicon from '$lib/assets/favicon.svg';
    import faviconIco from '$lib/assets/favicon.ico';

    let { children } = $props();
</script>

<svelte:head>
	<title>Acme Support</title>
    <link rel="icon" href={faviconIco} sizes="any" />
    <link rel="icon" href={favicon} type="image/svg+xml" />
</svelte:head>

{@render children()}