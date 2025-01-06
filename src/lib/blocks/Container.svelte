<script>
	/** @type {{ type: import('svelte/elements').SvelteHTMLElements, children: import('svelte').Snippet }} */
	let { type = 'div', key = '', children } = $props();
</script>

<!-- <svelte:element this={element} data-key={key}>
	{@render children()}
</svelte:element> -->

<svelte:element this={type} class="h-4 bg-red-100" data-key={key} />
