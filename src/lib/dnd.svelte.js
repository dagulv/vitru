/** @type {{ blocks: import('$lib/types.js').Block[] }} */
let ghost;
let sender = false;
let receiver = false;

/** @type {import('svelte/action').Action<HTMLElement, import('$lib/types.js').BuilderOpts>} */
export function dnd(node, opts) {
    $effect(() => {
        if (typeof opts.sender === "boolean")
        return () => {

        }
    })
}