/**
 * @param {Element} from_node
 * @param {Element} node
 * @param {CrossfadeParams} params
 * @returns {TransitionConfig}
 */
export function crossfade(from_node, node) {
	const duration = /** @param {number} d */ (d) => Math.sqrt(d) * 30;
	const from = from_node.getBoundingClientRect();
	const to = node.getBoundingClientRect();

	const dx = from.left - to.left;
	const dy = from.top - to.top;
	const scale = from.scale || 1;
	const dw = from.width / to.width;
	const dh = from.height / to.height;
	const d = Math.sqrt(dx * dx + dy * dy);
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;
	const opacity = +style.opacity;

	const animation = node.animate(
		[
			{
				transform: `${style.transform} translate(${from.left}px,${from.top}px) scale(${scale})`,
				opacity: 1
			},
			{
				transform: `${transform} translate(${dx}px,${dy}px) scale(${dw}, ${dh})`,
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
 * @param {Element} from_node
 * @param {Element} node
 * @param {CrossfadeParams} params
 * @returns {TransitionConfig}
 */
export function crossfade2(from_node, node) {
	const duration = /** @param {number} d */ (d) => Math.sqrt(d) * 30;
	const from = from_node.getBoundingClientRect();
	const to = node.getBoundingClientRect();

	const dx = to.left - from.left;
	const dy = to.top - from.top;
	const scale = from.scale || 1;
	const dw = from.width / to.width;
	const dh = from.height / to.height;
	const d = Math.sqrt(dx * dx + dy * dy);
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;
	const opacity = +style.opacity;

	const animation = from_node.animate(
		[
			{
				transform: `${style.transform} translate(${from.left}px,${from.top}px) scale(${scale})`,
				opacity: 1
			},
			{
				transform: `${transform} translate(${to.left}px,${to.top}px) scale(${dw}, ${dh})`,
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
