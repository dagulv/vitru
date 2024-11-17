<script>
    /** @type {{ blocks: import('$lib/types.js').Block[] }} */
    const { blocks } = $props();
</script>

<ul>
    {#each blocks as block}
    <li><block.icon /> {block.name}</li>
    {/each}
</ul>