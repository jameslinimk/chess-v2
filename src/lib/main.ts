import { dev } from "$app/environment"
import { get } from "svelte/store"
import { Config } from "./config"
import { Game, game } from "./game"

declare global {
	interface Window {
		game: Game
	}
}

export const main = () => {
	Config.load()
	if (!dev && !window.game) window.game = get(game)
}
