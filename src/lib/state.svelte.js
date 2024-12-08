import Ghost from '$lib/Ghost.svelte';
import { mount, unmount } from 'svelte';
import { crossfade } from './transitions.js';

export class BaseNode {
	key = '';
	type = '';
	isHovered = false;
	isHoveredBefore = false;
	isHoveredAfter = false;
	isSelected = false;

	static getType() {}

	constructor(nodeKey) {
		this.key = nodeKey;
	}

	getType() {
		return this.type;
	}

	insertBefore() {}

	insertAfter() {}

	isAvailable() {}

	createDOM() {}

	exportJSON() {}

	importJSON() {}
}

export class RootNode extends BaseNode {
	constructor() {
		super('root');
	}

	toJSON() {}
}

export class BuilderState {
	nodes;

	constructor() {}
}

export class GhostState {
	root = null;
	component = null;
	originElement = null;
	element = null;
	props = {
		block: null,
		x: 0,
		y: 0,
		setElement: (element) => (this.element = element)
	};
	offsetX = 0;
	offsetY = 0;
	constructor(root) {
		this.root = root;
	}
	create(originElement, block, x, y) {
		this.props.block = block;
		this.originElement = originElement;
		const rect = originElement.getBoundingClientRect();
		this.props.x = x;
		this.props.y = y;
		this.offsetX = x - rect.x;
		this.offsetY = y - rect.y;
		this.setCoords(x, y);
		this.component = mount(Ghost, {
			target: this.root,
			props: this.props
		});
	}
	async destroy() {
		if (this.component) {
			console.log(this.element);

			await crossfade(this.originElement, this.element);
			unmount(this.component);
			this.reset();
		}
	}
	setCoords(x, y) {
		this.props.x = x - this.offsetX;
		this.props.y = y - this.offsetY;
	}
	reset() {
		this.component = null;
		this.element = null;
		this.props.block = null;
		this.props.x = 0;
		this.props.y = 0;
		this.offsetX = 0;
		this.offsetY = 0;
	}
}
