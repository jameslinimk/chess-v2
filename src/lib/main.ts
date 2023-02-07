import { Board } from "./board.js"
import { Config } from "./config.js"

export const main = (svg: SVGElement) => {
	Config.load()
	const board = Board.defaultBoard()
	board.initDraw(svg)
}
