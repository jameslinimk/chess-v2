import { Color } from "./piece.js"

/**
 * A location on the board
 */
export class Loc {
	constructor(public x: number, public y: number) {}

	/**
	 * Returns a new loc that is the sum of `this` and `other`
	 */
	add(other: Loc): Loc {
		return loc(this.x + other.x, this.y + other.y)
	}

	/**
	 * Returns a new loc that is the difference between `this` and `other`
	 */
	sub(other: Loc): Loc {
		return loc(this.x - other.x, this.y - other.y)
	}

	/**
	 * Returns true if `this` is equal to `other`
	 */
	equals(other: Loc): boolean {
		return this.x === other.x && this.y === other.y
	}

	toHash(): number {
		return this.x * 8 + this.y
	}

	static fromHash(hash: number): Loc {
		return loc(hash % 8, Math.floor(hash / 8))
	}
}

/**
 * Shorthand for creating a loc given `x` and `y`
 */
export const loc = (x: number, y: number): Loc => new Loc(x, y)

/**
 * Shorthand for creating a loc given a chess notation
 */
export const locA = (notation: string): Loc => {
	const x = notation.charCodeAt(0) - 97
	const y = 8 - parseInt(notation[1])
	return loc(x, y)
}

/**
 * Color ternary operator, returns `white` if `color` is `Color.White`, otherwise returns `black`
 */
export const ct = <T>(color: Color, white: T, black: T): T => (color === Color.White ? white : black)

/**
 * Opposite color ternary operator, returns `white` if `color` is `Color.Black`, otherwise returns `black`
 */
export const oc = (color: Color): Color => ct(color, Color.Black, Color.White)
