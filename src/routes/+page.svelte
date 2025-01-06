<script>
	import { Container, Text } from '$lib/blocks.js';
	import Builder from '$lib/Builder.svelte';
	import Creator from '$lib/Creator.svelte';

	const blocks = [Container, Text];
</script>

<section class="h-[150vh] h-screen w-screen">
	<Builder class="mr-64 h-full bg-slate-500" />
	<section class="fixed bottom-0 right-0 top-0 w-64 p-4">
		<Creator {blocks} />
	</section>
</section>
