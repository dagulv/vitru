<script>
	import { spring } from 'svelte/motion';

	/** @type {{block: import('$lib/types.js').Block, x: int, y: int}} */
	const { block, x, y } = $props();

	const coords = spring(
		{ x, y },
		{
			stiffness: 0.5,
			damping: 0.25
		}
	);

	$effect(() => {
		console.log(x, y);

		coords.set({ x, y });
	});
</script>

<div class="fixed left-0 top-0" style={`transform: translate(${x}px, ${y}px);`}>
	<block.icon class="pointer-events-none" />
	{block.name}
</div>
