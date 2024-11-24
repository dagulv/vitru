<script>
	import { dnd } from "./dnd.svelte.js";

    let test = $state(0);
</script>

<div use:dnd={{sender: true, receiver: true}}></div>