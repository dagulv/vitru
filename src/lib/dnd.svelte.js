import { Container, Text } from '$lib/blocks.js';
import {
	createAndPlaceNode,
	createBuilder,
	findBuilderNode,
	getPosition,
	setBuilderState
} from '$lib/builder.svelte.js';
import { GhostState, HoverState } from '$lib/state.svelte.js';

/** @type {Map<string, import('$lib/types.js').Block>} */
const blocks = new Map([
	[Container.name, Container],
	[Text.name, Text]
]);

/** @type {import('svelte/action').Action<HTMLElement, import('$lib/types.js').BuilderOpts>} */
export function dnd(node, opts) {
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
		node.dataset.key = 'root';
	}

	const ghost = new GhostState(node);
	/** @type {import('$lib/state.svelte.js').BaseNode} */
	let targetNode;

	/** @type {HoverState} */
	let hoverState = null;

	/** @type {HTMLElement} */
	let cachedElement;

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
		if (hoverState) {
			hoverState.destroy();
		}
		hoverState = null;
		cachedElement = null;
	}

	/** @type {import('svelte/elements').PointerEventHandler<HTMLElement>} */
	async function onPointerMove(e) {
		//Create ghost element and follow cursor
		ghost.setCoords(e.clientX, e.clientY);

		if (!creator) {
			return;
		}

		if (e.target === cachedElement) {
			return;
		}

		//Display if element can be dropped
		targetNode = findBuilderNode(e.target);

		if (targetNode === null) {
			cachedElement = null;
			if (hoverState) {
				hoverState.destroy();
			}
			hoverState = null;
			return;
		}
		cachedElement = e.target;

		const position = getPosition(e, targetNode);

		if (!hoverState) {
			hoverState = new HoverState();
		}

		await hoverState.transform(position, targetNode);
	}

	$effect(() => {
		node.addEventListener('pointerdown', onPointerDown);
		return () => {
			document.body.removeEventListener('pointerdown', onPointerDown);
			node.removeEventListener('pointerup', onPointerUp);
		};
	});
}
