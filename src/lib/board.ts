import type { Piece } from "./piece.js"

export class Board {
	raw: (Piece | null)[][]

	constructor(public width: number, public height: number) {
		this.raw = Array.from(Array(width), () => Array.from(Array(height), () => null))
	}
}
