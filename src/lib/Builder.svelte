<script>
	import { onMount } from 'svelte';
	import { dnd } from './dnd.svelte.js';
	import { getBuilderState } from './builder.js';

	let test = $state(0);
	/** @type {import('$lib/state.svelte.js').BuilderState} */
	let builderState = $state();

	onMount(() => {
		builderState = getBuilderState();
	});
</script>

<article class="h-full w-full" use:dnd={{ builder: true }}>
	{builderState?.getRoot()?.createDOM()}
</article>
