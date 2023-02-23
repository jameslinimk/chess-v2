import { Board, boardWritable } from "./board.js"
import type { Loc } from "./util.js"

export class Game {
	selectedPiece: Loc | null = null

	constructor() {
		boardWritable.set(Board.defaultBoard())
	}
}
