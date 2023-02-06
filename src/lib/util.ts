export class Loc {
	constructor(public x: number, public y: number) {}

	/**
	 * Converts a chess notation string to a Loc, e.g. `a1 -> (0, 0)`
	 */
	static fromStr(str: string): Loc {
		const x = str.charCodeAt(0) - "a".charCodeAt(0)
		const y = parseInt(str[1]) - 1
		return loc(x, y)
	}

	add(other: Loc): Loc {
		return loc(this.x + other.x, this.y + other.y)
	}
}

/**
 * Shorthand for creating a loc given `x` and `y`
 */
export const loc = (x: number, y: number): Loc => new Loc(x, y)
