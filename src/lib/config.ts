export let config: Config

export class Config {
	white: string = "#f0d9b5"
	black: string = "#b58863"

	save() {
		localStorage.setItem("config", JSON.stringify(this))
	}

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
