import { mount, unmount } from 'svelte';
import { Container } from './blocks.js';
import Ghost from './Ghost.svelte';
import { crossfade } from './transitions.js';

let ghostProps = $state({
	component: null,
	element: null,
	block: null,
	x: 0,
	y: 0,
	builderOffset: {
		x: 0,
		y: 0
	},
	setCoords(x, y) {
		console.log(this.builderOffset.x);

		this.x = x - this.builderOffset.x;
		this.y = y - this.builderOffset.y;
	},
	setElement(element) {
		// start custom crossfade transition here and in pointerup
		this.element = element;
	},
	reset() {
		this.component = null;
		this.element = null;
		this.block = null;
		this.x = 0;
		this.y = 0;
		this.builderOffset.x = 0;
		this.builderOffset.y = 0;
	}
});

/** @type {HTMLElement} */
let builderElement;

let sender = false;
let receiver = false;

/** @type {Map<string, import('$lib/types.js').Block>} */
const blocks = new Map([[Container.name, Container]]);

/** @type {import('svelte/action').Action<HTMLElement, import('$lib/types.js').BuilderOpts>} */
export function dnd(node, opts) {
	/** @type {import('svelte/elements').PointerEventHandler<HTMLElement>} */
	function onPointerDown(e) {
		if (e.target.dataset.builder === undefined || ghostProps.component) {
			return;
		}

		builderElement = e.target;
		document.body.addEventListener('pointermove', onPointerMove);
		document.body.addEventListener('pointerup', onPointerUp);
		ghostProps.block = blocks.get(e.target.dataset.block);

		const rect = builderElement.getBoundingClientRect();
		console.log(rect);

		ghostProps.builderOffset.x = rect.x + rect.width / 2 - e.clientX;
		ghostProps.builderOffset.y = rect.y + rect.height / 2 - e.clientY;
		ghostProps.setCoords(e.clientX, e.clientY);
		createGhost();
	}

	/** @type {import('svelte/elements').PointerEventHandler<HTMLElement>} */
	async function onPointerUp() {
		//Release and drop or return to start
		document.body.removeEventListener('pointermove', onPointerMove);
		document.body.removeEventListener('pointerdown', onPointerDown);
		if (ghostProps.component) {
			await crossfade(builderElement, ghostProps.element);
			unmount(ghostProps.ghost);
			ghostProps.reset();
		}
	}

	/** @type {import('svelte/elements').PointerEventHandler<HTMLElement>} */
	function onPointerMove(e) {
		//Create ghost element and follow cursor
		ghostProps.setCoords(e.clientX, e.clientY);

		//Display if element can be dropped
	}

	function createGhost() {
		ghostProps.component = mount(Ghost, { target: node, props: ghostProps });
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
