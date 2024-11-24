import { mount, unmount } from 'svelte';
import { Container } from './blocks.js';
import Ghost from './Ghost.svelte';

let ghost;
let ghostProps = $state({
	block: null,
	x: 0,
	y: 0
});

let sender = false;
let receiver = false;

/** @type {Map<string, import('$lib/types.js').Block>} */
const blocks = new Map([[Container.name, Container]]);

/** @type {import('svelte/action').Action<HTMLElement, import('$lib/types.js').BuilderOpts>} */
export function dnd(node, opts) {
	/** @type {import('svelte/elements').PointerEventHandler<HTMLElement>} */
	function onPointerDown(e) {
		if (e.target.dataset.builder === undefined) {
			return;
		}

		node.addEventListener('pointermove', onPointerMove);
		ghostProps.block = blocks.get(e.target.dataset.block);
		ghostProps.x = e.clientX;
		ghostProps.y = e.clientY;
		createGhost();
	}

	/** @type {import('svelte/elements').PointerEventHandler<HTMLElement>} */
	function onPointerUp() {
		//Release and drop or return to start
		node.removeEventListener('pointermove', onPointerMove);
		if (ghost) {
			unmount(ghost);
			ghost = null;
		}
	}

	/** @type {import('svelte/elements').PointerEventHandler<HTMLElement>} */
	function onPointerMove(e) {
		//Create ghost element and follow cursor
		ghostProps.x = e.clientX;
		ghostProps.y = e.clientY;

		//Display if element can be dropped
	}

	function createGhost() {
		ghost = mount(Ghost, { target: node, props: ghostProps });
	}

	$effect(() => {
		if (typeof opts.sender === 'boolean') {
			sender = opts.sender;
		}
		if (typeof opts.receiver === 'boolean') {
			receiver = opts.receiver;
		}

		node.addEventListener('pointerdown', onPointerDown);
		node.addEventListener('pointerup', onPointerUp);
		return () => {
			node.removeEventListener('pointerdown', onPointerDown);
			node.removeEventListener('pointerup', onPointerUp);
		};
	});
}
