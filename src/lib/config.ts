import { writable } from "svelte/store"

/**
 * The configuration for the game
 */
export class Config {
	white = "#f0d9b5"
	black = "#b58863"
	whiteHighlight = "rgba(255, 255, 0, 0.5)"
	blackHighlight = "rgba(255, 0, 0, 0.5)"

	/**
	 * Saves the configuration to local storage
	 */
	save() {
		localStorage.setItem("config", JSON.stringify(this))
	}

	/**
	 * Loads the configuration from local storage and sets the global config variable
	 */
	static load() {
		const conf = JSON.parse(localStorage.getItem("config") || "null")
		if (conf !== null) {
			configWritable.set(conf)
			return
		}
	}
}

/**
 * The global configuration for the game
 */
export const configWritable = writable(new Config())
