/** @typedef {import('svelte').Component<import('lucide-svelte').Icon>} Icon */

/**
 * @typedef Structure
 * @property {HTMLElementTagNameMap} element
 * @property {Structure[]} structure
 */

/**
 * @typedef Block
 * @property {Icon} icon
 * @property {string} name
 * @property {string} label
 * @property {'leaf' | 'branch'} type
 * @property {import('svelte').Component} component
 */

/**
 * @typedef BuilderOpts
 * @property {bool} creator
 * @property {bool} builder
 */

/** @typedef {'hover' | 'select' | null} NodeState */
/** @typedef {'before' | 'after' | 'in' | null} NodeStatePosition */

/** @typedef {'root' | `${string}-${string}-${string}-${string}-${string}`} NodeKey */

/** @typedef {'horizontal', 'vertical'} Alignment */
