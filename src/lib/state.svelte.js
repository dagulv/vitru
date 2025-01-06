import Ghost from '$lib/Ghost.svelte';
import { mount, unmount } from 'svelte';
import { crossfade2 } from './transitions.js';
import { findBuilderNode, getBuilderState, mountNode } from './builder.svelte.js';

/**
 * @class BaseNode
 */
export class BaseNode {
	key = '';
	type = '';
	/** @type {import('$lib/types.js').NodeState} */
	state = null;
	/** @type {import('$lib/types.js').NodeStatePosition} */
	position = null;
	/** @type {import('svelte').Component} */
	component = null;
	/** @type {HTMLElement} */
	element = null;
	/** @type {BaseNode} */
	prev = null;
	/** @type {BaseNode} */
	next = null;

	static getType() {
		throw new Error('method must be implemented');
	}

	constructor(block, nodeKey = null) {
		this.type = this.constructor.getType();
		this.component = block?.component;

		if (nodeKey) {
			this.key = nodeKey;
			return;
		}
		//TODO add component
		const builder = getBuilderState();
		this.key = crypto.randomUUID();
		builder.nodeMap.set(this.key, this);
	}

	getType() {
		return this.type;
	}

	/** @param {BaseNode} */
	insertBefore(node) {
		node.prev = this.prev;
		node.next = this;

		if (this.prev) {
			this.prev.next = node;
		}

		this.prev = node;

		console.log('before', this);

		this.afterInsert();
	}

	/** @param {BaseNode} */
	insertAfter(node) {
		node.next = this.next;
		node.prev = this;

		if (this.next) {
			this.next.prev = node;
		}

		this.next = node;

		console.log('after', this);

		this.afterInsert();
	}

	afterInsert() {
		this.createDOM();
	}

	/** @param {BaseNode} */
	insertIn(node) {
		throw new Error('cant insert in baseNode');
	}

	isAvailable() {}

	/** @returns {import('svelte').Snippet<[]>} */
	createDOM() {
		throw Error('createDOM needs to be implemented by class');
	}

	exportJSON() {}

	importJSON() {}
}

/**
 * @class BranchNode
 * @extends BaseNode
 */
export class BranchNode extends BaseNode {
	/** @type {BaseNode} */
	first = null;
	/** @type {BaseNode} */
	last = null;
	/** @type {import('$lib/types.js').Alignment} */
	alignment = 'vertical';

	static getType() {
		return 'branchNode';
	}

	constructor(block, nodeKey = null) {
		super(block, nodeKey);
	}

	/** @param {BaseNode} */
	insertIn(node) {
		if (this.first) {
			return this.first.insertAfter(node);
		}

		this.first = node;
		this.last = node;
		console.log('in', this);

		this.afterInsert();
	}

	createDOM() {
		let child = this.first;

		const dom = [];
		while (child != null) {
			dom.push(child.createDOM());
			child = child.next;
		}
		return mountNode(this, dom);

		// if (this.first) {
		// 	const childRootElement = mountNode(rootElement, this.first);
		// 	this.first.createDOM(childRootElement);
		// }

		// if (this.next) {
		// 	const childRootElement = mountNode(rootElement, this.next);
		// 	this.next.createDOM(childRootElement);
		// }
	}
}

/**
 * @class LeafNode
 * @extends BaseNode
 */
export class LeafNode extends BaseNode {
	static getType() {
		return 'leafNode';
	}

	constructor(block, nodeKey = null) {
		super(block, nodeKey);
	}

	createDOM() {
		return mountNode(this);
	}
}

/**
 * @class RootNode
 * @extends BranchNode
 */
export class RootNode extends BranchNode {
	static getType() {
		return 'rootNode';
	}

	constructor(element) {
		super(null, 'root');
		this.element = element;
	}

	/** @param {BaseNode} */
	insertBefore(node) {
		throw new Error('cant insert before root');
	}

	/** @param {BaseNode} */
	insertAfter(node) {
		throw new Error('cant insert after root');
	}
	createDOM() {
		let child = this.first;
		console.log('root', this, child);

		let dom = [];
		while (child != null) {
			dom = dom.push(child.createDOM());
			child = child.next;
		}

		if (!dom.length) {
			return;
		}
		//TODO always return array of snippets
		return mountNode(dom);
		// if (this.first) {
		// 	const dom = this.first.createDOM();
		// 	return mountNode(this.first, dom);
		// }
	}
	toJSON() {}
}

export class BuilderState {
	/** @type {Map<import('$lib/types.js').NodeKey, BaseNode>} */
	nodeMap = new Map();

	constructor(rootElement) {
		this.nodeMap = new Map([['root', new RootNode(rootElement)]]);
	}

	getRoot() {
		return this.nodeMap.get('root');
	}
}

export class HoverState {
	/** @type {HTMLElement} */
	#element = null;
	#x = 0;
	#y = 0;
	#width = 0;
	#height = 0;
	#active = false;

	constructor() {}

	destroy() {
		if (!this.#element) {
			return;
		}

		this.#element.remove();
	}

	#crossfade() {
		const duration = /** @param {number} d */ (d) => Math.sqrt(d) * 30;
		const from = this.#element.getBoundingClientRect();

		const dx = this.#x - from.x;
		const dy = this.#y - from.y;
		const dw = from.width / this.#width;
		const dh = from.height / this.#height;
		const d = Math.sqrt(dx * dx + dy * dy);
		const style = getComputedStyle(this.#element);
		const transform = style.transform === 'none' ? '' : style.transform;
		const opacity = +style.opacity;

		const animation = this.#element.animate(
			[
				{
					transform: `${style.transform} translate(${from.left}px,${from.top}px) scale(${1})`,
					opacity: 1
				},
				{
					transform: `${transform} translate(${this.#x}px,${this.#y}px) scale(${dw}, ${dh})`,
					opacity
				}
			],
			{
				duration: typeof duration === 'function' ? duration(d) : duration,
				easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
				opacity: opacity,
				transformOrigin: 'top left'
			}
		);

		return animation.finished;
	}

	/**
	 * @param {import('./types.js').NodeStatePosition} position
	 * @param {import('./state.svelte.js').BaseNode} targetNode
	 */
	async transform(position, targetNode) {
		const rect = targetNode.element.getBoundingClientRect();

		this.#x = rect.x;
		this.#y = rect.y;

		if (position === 'in') {
			this.#width = rect.width;
			this.#height = rect.height;
		} else {
			const parentNode = findBuilderNode(targetNode.element);

			switch (parentNode.alignment) {
				case 'horizontal':
					this.#width = 1;
					this.#height = rect.height;
					if (position === 'after') {
						this.#x = rect.x + rect.width;
					}
					break;
				case 'vertical':
					this.#width = rect.width;
					this.#height = 1;
					if (position === 'after') {
						this.#y = rect.y + rect.height;
					}
					break;
			}
		}

		if (this.#element) {
			await this.#crossfade();
		} else {
			this.#element = document.createElement('div');
			this.#element.style.position = 'fixed';
			this.#element.style.left = '0px';
			this.#element.style.top = '0px';
			this.#element.style.border = '2px solid red';
			this.#element.style.background = 'transparent';
			this.#element.style.pointerEvents = 'none';
			this.#element.style.transform = `translate(${this.#x}px,${this.#y}px)`;

			document.body.appendChild(this.#element);

			// const animation = this.#element.animate(
			// 	[
			// 		{
			// 			transform: `translate(${this.#x}px,${this.#y}px)`,
			// 			opacity: 0
			// 		},
			// 		{
			// 			transform: `translate(${this.#x}px,${this.#y}px)`,
			// 			opacity: 1
			// 		}
			// 	],
			// 	{
			// 		duration: 150,
			// 		easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
			// 		opacity: 1,
			// 		transformOrigin: 'top left'
			// 	}
			// );

			// await animation.finished;
		}

		this.#element.style.width = this.#width + 'px';
		this.#element.style.height = this.#height + 'px';
	}
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
		if (this.element && this.component) {
			await crossfade2(this.element, this.originElement);
			unmount(this.component);
		}
		this.reset();
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
