import { Config } from "./config.js"
import { Game } from "./game.js"

export const main = () => {
	Config.load()
	const game = new Game()

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	;(window as any).game = game
}
