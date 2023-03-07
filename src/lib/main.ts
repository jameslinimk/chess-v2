import { dev } from "$app/environment"
import { get } from "svelte/store"
import { Config } from "./config"
import { game } from "./game"

export const main = () => {
	Config.load()
	if (!dev && !window.game) window.game = get(game)
}
