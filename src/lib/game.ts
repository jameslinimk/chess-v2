import { Board, board } from "./board.js"
import type { Loc } from "./util.js"

export class Game {
	selectedPiece: Loc | null = null

	constructor() {
		board.set(Board.defaultBoard())
	}
}
