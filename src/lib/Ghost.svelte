<script>
	import { onMount } from 'svelte';
	import { spring } from 'svelte/motion';
	import { fade } from 'svelte/transition';

	/** @type {{block: import('$lib/types.js').Block, x: int, y: int}} */
	let { block, x, y, setElement } = $props();
	let element;
	const coords = spring(
		{ x, y },
		{
			stiffness: 0.5,
			damping: 0.25
		}
	);

	requestAnimationFrame(animateCoords);

	function animateCoords() {
		coords.set({ x, y });
		requestAnimationFrame(animateCoords);
	}

	onMount(() => {
		setElement(element);
	});
</script>

<div
	class="fixed left-0 top-0 text-red-600"
	style={`transform: translate(${x}px, ${y}px);`}
	bind:this={element}
	transition:fade={{ duration: 150 }}
>
	<block.icon class="pointer-events-none" />
	{block.name}
</div>
