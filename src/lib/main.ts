import { dev } from "$app/environment"
import { Config } from "$lib/config"
import { game } from "$lib/game"
import { get } from "svelte/store"

export const main = () => {
	Config.load()
	if (!dev && !window.game) window.game = get(game)
}
