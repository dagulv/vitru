<script>
	/** @type {{ element: import('svelte/elements').SvelteHTMLElements }} */
	let { element = 'p', key = '' } = $props();
</script>

<svelte:element this={element} data-key={key}> test </svelte:element>
