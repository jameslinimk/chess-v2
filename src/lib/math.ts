/**
 * Returns the angle between the two points in radians
 */
export const radians = (p1: [number, number], p2: [number, number]): number => Math.atan2(p2[1] - p1[1], p2[0] - p1[0])

/**
 * Projects the `p` by `distance` at `angle`
 */
export const project = (p: [number, number], radians: number, distance: number): [number, number] => [
	p[0] + Math.cos(radians) * distance,
	p[1] + Math.sin(radians) * distance,
]

/**
 * Pulls back the `head` to the `tail` by `distance` and `tail` to `head` by `reverseDistance`
 */
export const moveArrowHeads = (
	tail: [number, number],
	head: [number, number],
	distance: number,
	reverseDistance: number
): [[number, number], [number, number]] => {
	const r = radians(tail, head)
	return [project(tail, r, reverseDistance), project(head, r, -distance)]
}
