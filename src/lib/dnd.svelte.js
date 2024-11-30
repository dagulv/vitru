import { Container } from './blocks.js';
import { GhostState } from './state.svelte.js';

/** @type {Map<string, import('$lib/types.js').Block>} */
const blocks = new Map([[Container.name, Container]]);

/** @type {import('svelte/action').Action<HTMLElement, import('$lib/types.js').BuilderOpts>} */
export function dnd(node, opts) {
	let sender = false;
	let receiver = false;

	const ghost = new GhostState(node);

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
	}

	$effect(() => {
		if (typeof opts.sender === 'boolean') {
			sender = opts.sender;
		}
		if (typeof opts.receiver === 'boolean') {
			receiver = opts.receiver;
		}

		node.addEventListener('pointerdown', onPointerDown);
		return () => {
			document.body.removeEventListener('pointerdown', onPointerDown);
			node.removeEventListener('pointerup', onPointerUp);
		};
	});
}
