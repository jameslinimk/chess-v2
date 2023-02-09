import { Color } from "./piece.js"

export class Loc {
	constructor(public x: number, public y: number) {}

	add(other: Loc): Loc {
		return loc(this.x + other.x, this.y + other.y)
	}
}

/**
 * Shorthand for creating a loc given `x` and `y`
 */
export const loc = (x: number, y: number): Loc => new Loc(x, y)

export const ct = <T>(color: Color, white: T, black: T): T => (color === Color.White ? white : black)
