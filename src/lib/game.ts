import { writable } from "svelte/store"
import { Board } from "$lib/chess/board"
import { Color } from "$lib/chess/piece"

export class Game {
	color = Color.White
	active = true
	board = Board.defaultBoard()

	get moving() {
		return this.board.turn === this.color
	}
}

export const game = writable(new Game())
