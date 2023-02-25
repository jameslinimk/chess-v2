import { writable } from "svelte/store"
import { Board } from "./board.js"

export class Game {
	board = Board.defaultBoard()

	get moving() {
		return true
	}

	get active() {
		return true
	}
}

export const game = writable(new Game())
