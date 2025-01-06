import { createRawSnippet, flushSync, getContext, mount, setContext, unmount } from 'svelte';
import { BaseNode, BranchNode, BuilderState, LeafNode, RootNode } from './state.svelte.js';
import { crossfade2 } from './transitions.js';
import Container from './blocks/Container.svelte';

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
 * @param {HTMLElement} startElement
 * @returns {import('./state.svelte.js').BranchNode|null}
 */
export function findBuilderNode(startElement) {
	let element = startElement;
	while (element !== null) {
		const key = element.dataset.key;
		if (activeBuilder.nodeMap.has(key)) {
			return activeBuilder.nodeMap.get(key);
		}
		element = element.parentElement;
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
			node = new BranchNode(block);
			break;
		case 'leaf':
			node = new LeafNode(block);
			break;
	}

	if (!node) {
		return;
	}

	if (targetNode.first) {
		targetNode = targetNode.first;
	}

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
 * @param {import('./state.svelte.js').BaseNode} node
 * @param {import('svelte').Snippet|null} children
 */
export function mountNode(node, children = null) {
	return createRawSnippet(() => ({
		render: () => '<div></div>',
		setup: (target) => {
			console.log('before', target, Container, node.component);

			const mounted = mount(Container, {
				target,
				props: { key: node.key }
			});
			flushSync(() => {
				node.element = target.children[0];
			});

			return () => unmount(mounted);
		}
	}));
}

/**
 * @param {MouseEvent} e
 * @param {import('./state.svelte.js').BaseNode} targetNode
 * @returns {import('./types.js').NodeStatePosition}
 */
export function getPosition(e, targetNode) {
	/** @type {BranchNode} */
	let parentNode = findBuilderNode(targetNode.element);

	if (targetNode instanceof BranchNode && !targetNode.first) {
		parentNode = targetNode;
	}

	if (!parentNode?.first) {
		return 'in';
	}

	const rect = parentNode.element.getBoundingClientRect();

	switch (parentNode.alignment) {
		case 'horizontal':
			return e.clientX > rect.x + rect.width / 2 ? 'after' : 'before';
		case 'vertical':
			return e.clientY > rect.y + rect.height / 2 ? 'after' : 'before';
	}

	return 'after';
}
