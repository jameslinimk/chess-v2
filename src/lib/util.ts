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

	/**
	 * Converts `this` to a string
	 */
	toString(): string {
		return `(${this.x}, ${this.y})`
	}

	/**
	 * Creates a loc from a string
	 */
	static fromString(str: string): Loc {
		const [x, y] = str
			.slice(1, -1)
			.split(", ")
			.map((n) => parseInt(n))
		return loc(x, y)
	}

	/**
	 * Converts `this` to a chess notation
	 */
	toNotation(): string {
		return `${String.fromCharCode(this.x + 97)}${8 - this.y}`
	}

	/**
	 * Creates a loc from a chess notation
	 */
	static fromNotation(notation: string): Loc {
		const x = notation.charCodeAt(0) - 97
		const y = 8 - parseInt(notation[1])
		return loc(x, y)
	}
}

/**
 * Shorthand for creating a loc given `x` and `y`
 */
export const loc = (x: number, y: number): Loc => new Loc(x, y)

/**
 * Shorthand for creating a loc given a chess notation
 */
export const locA = (notation: string): Loc => Loc.fromNotation(notation)

/**
 * Color ternary operator, returns `white` if `color` is `Color.White`, otherwise returns `black`
 */
export const ct = <T>(color: Color, white: T, black: T): T => (color === Color.White ? white : black)

/**
 * Other color ternary operator, returns a color that isn't `color`
 */
export const oc = (color: Color): Color => {
	const colorValues = Object.values(Color) as Color[]
	const index = colorValues.indexOf(color)
	const i = (index + 1) % colorValues.length
	return colorValues[i]
}
