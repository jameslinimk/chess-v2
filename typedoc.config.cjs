const { readdirSync } = require("fs")
const { join } = require("path")

const dirs = (source) =>
	readdirSync(join(__dirname, source), { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name)

/** @type {import("typedoc").TypeDocOptions} */
module.exports = {
	entryPoints: dirs("src/lib").map((dir) => `./src/lib/${dir}/*.ts`),
	out: "./docs",
}
