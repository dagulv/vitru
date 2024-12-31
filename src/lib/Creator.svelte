<script>
	import { dnd } from './dnd.svelte.js';

	/** @type {{ blocks: import('$lib/types.js').Block[] }} */
	const { blocks } = $props();
</script>

<ul use:dnd={{ creator: true }} class="flex h-full w-full flex-wrap gap-4">
	{#each blocks as block}
		<li>
			<button data-builder data-block={block.name} class="cursor-move">
				<block.icon class="pointer-events-none" />
				{block.name}
			</button>
		</li>
	{/each}
</ul>
