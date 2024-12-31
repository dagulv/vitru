import { Container, Text } from '$lib/blocks.js';
import {
	createAndPlaceNode,
	createBuilder,
	findBuilderNode,
	setBuilderState
} from '$lib/builder.js';
import { GhostState } from '$lib/state.svelte.js';

/** @type {Map<string, import('$lib/types.js').Block>} */
const blocks = new Map([
	[Container.name, Container],
	[Text.name, Text]
]);

/** @type {import('svelte/action').Action<HTMLElement, import('$lib/types.js').BuilderOpts>} */
export function dnd(node, opts) {
	node.dataset.key = 'root';

	let creator = false;
	let builder = false;

	if (typeof opts.creator === 'boolean') {
		creator = opts.creator;
	}
	if (typeof opts.builder === 'boolean') {
		builder = opts.builder;
	}

	if (builder) {
		setBuilderState(createBuilder(node));
	}

	const ghost = new GhostState(node);
	/** @type {import('$lib/state.svelte.js').BaseNode} */
	let targetNode;

	/** @type {import('svelte/elements').PointerEventHandler<HTMLElement>} */
	function onPointerDown(e) {
		if (e.target.dataset.builder === undefined || ghost.component) {
			return;
		}

		document.body.addEventListener('pointermove', onPointerMove);
		document.body.addEventListener('pointerup', onPointerUp);

		ghost.create(e.target, blocks.get(e.target.dataset.block), e.clientX, e.clientY);
	}

	/** @type {import('svelte/elements').PointerEventHandler<HTMLElement>} */
	async function onPointerUp() {
		if (targetNode) {
			createAndPlaceNode(ghost.props.block, targetNode);
		}

		//Release and drop or return to start
		document.body.removeEventListener('pointermove', onPointerMove);
		document.body.removeEventListener('pointerdown', onPointerDown);
		ghost.destroy();
	}

	/** @type {import('svelte/elements').PointerEventHandler<HTMLElement>} */
	function onPointerMove(e) {
		//Create ghost element and follow cursor
		ghost.setCoords(e.clientX, e.clientY);

		//Display if element can be dropped
		targetNode = findBuilderNode(e.target);

		if (targetNode === null) {
			return;
		}

		targetNode.state = 'hover';
	}

	$effect(() => {
		node.addEventListener('pointerdown', onPointerDown);
		return () => {
			document.body.removeEventListener('pointerdown', onPointerDown);
			node.removeEventListener('pointerup', onPointerUp);
		};
	});
}
