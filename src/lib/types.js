/** @type {import('svelte').Component<import('lucide-svelte').Icon>} Icon */

/**
 * @typedef Structure
 * @property {HTMLElementTagNameMap} element
 * @property {Structure[]} structure
 */

/**
 * @typedef Block
 * @property {Icon} icon
 * @property {string} name
 * @property {Structure} structure
 */

/**
 * @typedef BuilderOpts
 * @property {bool} sender
 * @property {bool} receiver
 */

/** @type {Block} block */
const block = {
    icon: null,
    sender: null,
};

const test = block;