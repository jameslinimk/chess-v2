import { Config } from "./config.js"
import { Game } from "./game.js"

export const main = (board: HTMLDivElement) => {
	Config.load()
	const game = new Game()
	game.draw(board)

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	;(window as any).game = game
}
