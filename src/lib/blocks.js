import { Cuboid, Pilcrow } from 'svelte-lucide';
import { default as ContainerComponent } from './blocks/Container.svelte';
import { default as TextComponent } from './blocks/Text.svelte';

/** @typedef  */

//TODO change to like in lexical
export const Container = {
	icon: Cuboid,
	label: 'Container',
	name: 'container',
	type: 'branch',
	component: ContainerComponent
};

export const Text = {
	icon: Pilcrow,
	label: 'Text',
	name: 'text',
	type: 'leaf',
	component: TextComponent
};
