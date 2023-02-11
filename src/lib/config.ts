/**
 * The global configuration for the game
 */
export let config: Config

/**
 * The configuration for the game
 */
export class Config {
	white = "#f0d9b5"
	black = "#b58863"

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
			config = conf
			return
		}

		config = new Config()
		config.save()
	}
}
