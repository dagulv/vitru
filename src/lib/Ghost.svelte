<script>
	import { onDestroy, onMount } from 'svelte';
	import { spring } from 'svelte/motion';
	import { fade } from 'svelte/transition';

	/** @type {{block: import('$lib/types.js').Block, x: int, y: int, setElement: (element) => {}}} */
	let { block, x, y, setElement } = $props();
	let element;
	let raf;
	const coords = spring(
		{ x, y },
		{
			stiffness: 0.9,
			damping: 0.9
		}
	);

	raf = requestAnimationFrame(animateCoords);

	function animateCoords() {
		coords.set({ x, y });
		raf = requestAnimationFrame(animateCoords);
	}

	onMount(() => {
		if (typeof setElement === 'function') {
			setElement(element);
		}
	});

	onDestroy(() => {
		cancelAnimationFrame(raf);
	});
</script>

<div
	class="pointer-events-none fixed left-0 top-0 cursor-move select-none text-red-600"
	style={`transform: translate(${$coords.x}px, ${$coords.y}px);`}
	bind:this={element}
	transition:fade={{ duration: 150 }}
>
	<block.icon />
	{block.name}
</div>
