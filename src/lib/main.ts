import { Config } from "./config.js"
import { Game } from "./game.js"

export const main = (board: HTMLDivElement) => {
	Config.load()
	const game = new Game()
	game.initDraw(board)
}
