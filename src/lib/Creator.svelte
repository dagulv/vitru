<script>
	import { dnd } from './dnd.svelte.js';

	/** @type {{ blocks: import('$lib/types.js').Block[] }} */
	const { blocks } = $props();
</script>

<ul use:dnd={{ sender: true }} class="h-full w-full">
	{#each blocks as block}
		<li>
			<button data-builder data-block={block.name}>
				<block.icon class="pointer-events-none" />
				{block.name}
			</button>
		</li>
	{/each}
</ul>
