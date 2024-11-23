<script>
    /** @type {{ blocks: import('$lib/types.js').Block[] }} */
    const { blocks } = $props();
</script>

<ul use:dnd={{sender: true}}>
    {#each blocks as block}
        <li>
            <button>
                <block.icon />
                {block.name}
            </button>
        </li>
    {/each}
</ul>