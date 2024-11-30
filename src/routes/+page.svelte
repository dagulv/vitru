<script>
	import { Container } from '$lib/blocks.js';
	import Builder from '$lib/Builder.svelte';
	import Creator from '$lib/Creator.svelte';

	const blocks = [Container];
</script>

<section class="h-screen w-screen">
	<Builder />
	<Creator {blocks} />
</section>
