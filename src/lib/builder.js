import { getContext, mount, setContext } from 'svelte';
import { BaseNode, BranchNode, BuilderState, LeafNode, RootNode } from './state.svelte.js';

const builderKey = Symbol('builder');

/** @type {BuilderState} */
let activeBuilder;

/** @returns {BuilderState} */
export function getBuilderState() {
	return activeBuilder;
}

/** @param {BuilderState} */
export function setBuilderState(builderState) {
	activeBuilder = builderState;
}

/** @param {HTMLElement} root */
export function createBuilder(root) {
	const builder = new BuilderState(root);

	activeBuilder = builder;

	return builder;
}

/**
 * @param {Node} startNode
 * @returns {import('./state.svelte.js').BaseNode|null}
 */
export function findBuilderNode(startNode) {
	let node = startNode;
	while (node !== null) {
		const key = node.dataset.key;
		if (activeBuilder.nodeMap.has(key)) {
			return activeBuilder.nodeMap.get(key);
		}
		node = node.parentElement;
	}

	return null;
}

/**
 * @param {import('./types.js').Block} block
 * @param {import('./state.svelte.js').BaseNode} targetNode
 */
export function createAndPlaceNode(block, targetNode) {
	if (!block) {
		return;
	}

	/** @type {import('./state.svelte.js').BaseNode} */
	let node;

	switch (block?.type) {
		case 'branch':
			node = new BranchNode();
			break;
		case 'leaf':
			node = new LeafNode();
			break;
	}

	if (!node) {
		return;
	}

	node.component = block.component;

	const position = getPosition(node, targetNode);

	switch (position) {
		case 'before':
			targetNode.insertBefore(node);
			break;
		case 'in':
			targetNode.insertIn(node);
			break;
		case 'after':
		default:
			targetNode.insertAfter(node);
	}
}

/**
 * @param {HTMLElement} rootElement
 * @param {import('./state.svelte.js').BaseNode} node
 */
export function mountNode(rootElement, node) {
	mount(node.component, {
		target: rootElement,
		props: { key: node.key }
	});
}

/**
 * @param {import('./state.svelte.js').BaseNode} node
 * @param {import('./state.svelte.js').BaseNode} targetNode
 */
function getPosition(node, targetNode) {
	let nextNode;

	if (targetNode instanceof RootNode) {
	} else if (targetNode instanceof BranchNode) {
		targetNode.insertAfter(node);
	} else if (targetNode instanceof LeafNode) {
		targetNode.insertAfter(node);
	}
}
