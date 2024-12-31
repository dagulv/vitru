import Ghost from '$lib/Ghost.svelte';
import { mount, unmount } from 'svelte';
import { crossfade2 } from './transitions.js';
import { getBuilderState, mountNode } from './builder.js';

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
	prev;
	/** @type {BaseNode} */
	next;

	static getType() {
		throw new Error('method must be implemented');
	}

	constructor(nodeKey) {
		this.type = this.constructor.getType();

		if (nodeKey) {
			this.key = nodeKey;
			return;
		}

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

		this.prev.next = node;
		this.prev = node;

		console.log('before', this);

		this.afterInsert();
	}

	/** @param {BaseNode} */
	insertAfter(node) {
		node.next = this.next;
		node.prev = this;

		this.next.prev = node;
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
	first;
	/** @type {BaseNode} */
	last;

	static getType() {
		return 'branchNode';
	}

	constructor(nodeKey) {
		super(nodeKey);
	}

	/** @param {BaseNode} */
	insertIn(node) {
		if (!this.first) {
			return this.first.insertAfter(node);
		}

		this.first = node;
		this.last = node;
		console.log('in', this);

		this.afterInsert();
	}

	createDOM() {
		if (this.first) {
			mountNode(this.element, this.first);
			this.first.createDOM();
		}

		if (this.next) {
			mountNode(this.element, this.next);
			this.next.createDOM();
		}
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

	constructor(nodeKey) {
		super(nodeKey);
	}

	createDOM() {
		if (!this.next) {
			return;
		}

		mountNode(this.element, this.next);
		this.next.createDOM();
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

	constructor(rootElement) {
		super('root');
		this.element = rootElement;
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
		console.log(this.first);

		if (this.first) {
			mountNode(this.element, this.first);
			this.first.createDOM();
		}
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
