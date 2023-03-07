import { writable } from "svelte/store"

/**
 * The configuration for the game
 */
export class Config {
	static loaded = false

	white = "#f0d9b5"
	black = "#b58863"
	whiteHighlight = "rgba(255, 255, 0, 0.5)"
	blackHighlight = "rgba(255, 0, 0, 0.5)"
	arrowPreview = "rgba(0, 0, 0, 0.5)"
	arrow = "#000000"

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
		if (this.loaded) return
		this.loaded = true

		const conf = JSON.parse(localStorage.getItem("config") || "null")
		if (conf !== null) {
			const c = new Config()
			for (const [key, value] of Object.entries(conf)) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				if (key in c) (c as any)[key] = value
			}

			c.save()
			config.set(c)
			return
		}
	}
}

/**
 * The global configuration for the game
 */
export const config = writable(new Config())
