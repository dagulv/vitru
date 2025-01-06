<script>
	import { createRawSnippet, flushSync, mount, onMount, unmount } from 'svelte';
	import { dnd } from './dnd.svelte.js';
	import { getBuilderState } from './builder.svelte.js';
	import Container from './blocks/Container.svelte';

	let { class: className } = $props();

	/** @type {import('$lib/state.svelte.js').BuilderState} */
	let builderState = $state();

	// const snippet = createRawSnippet(() => ({
	// 	render: () => '<div></div>',
	// 	setup: (target) => {
	// 		const mounted = mount(Container, {
	// 			target,
	// 			props: { key: 'test' }
	// 		});
	// 		flushSync(() => {
	// 			console.log(target.children[0]);
	// 		});

	// 		return () => unmount(mounted);
	// 	}
	// }));

	onMount(() => {
		builderState = getBuilderState();
	});
</script>

<article class={`${className}`} use:dnd={{ builder: true }}>
	{#if builderState}
		{#each builderState?.getRoot()?.createDOM() as dom}
			{@render dom()}
		{/each}
	{/if}
</article>
