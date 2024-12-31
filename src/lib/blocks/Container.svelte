<script>
	/** @type {{ element: import('svelte/elements').SvelteHTMLElements, children: import('svelte').Snippet }} */
	let { element = 'div', key = '', children } = $props();
</script>

<!-- <svelte:element this={element} data-key={key}>
	{@render children()}
</svelte:element> -->

<svelte:element this={element} class="h-4 bg-red-100" data-key={key} />
