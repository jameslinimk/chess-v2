import { config } from "./config.js"
import { Color, type Piece } from "./piece.js"
import type { Loc } from "./util.js"

/**
 * Create a record with all colors as keys and `init` as values
 */
const emptyColorInit = <T>(init: T): Record<Color, T> => {
	return Object.keys(Color).reduce((acc, color) => {
		acc[color as unknown as Color] = init
		return acc
	}, {} as Record<Color, T>)
}

interface MoveData {
	from: Loc
	to: Loc

	castle: boolean
	enPassant: boolean
	promote: Piece | null
}

export class Board {
	raw: (Piece | null)[][]
	currentMove: Color = Color.White
	moveHistory: [Loc, Loc][] = []

	attacks: Record<Color, Loc[]> = emptyColorInit([])
	moves: Record<Color, Loc[]> = emptyColorInit([])

	/**
	 * Castle rights for each color, in the form `[kingSide, queenSide]`
	 */
	castleRights: Record<Color, [boolean, boolean]> = emptyColorInit([true, true])

	svg: SVGElement | null = null

	constructor(public width: number, public height: number) {
		this.raw = Array.from(Array(width), () => Array.from(Array(height), () => null))
	}

	static defaultBoard(): Board {
		const board = new Board(8, 8)
		return board
	}

	initDraw(svg: SVGElement) {
		while (svg.firstChild) svg.removeChild(svg.firstChild)

		svg.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`)
		svg.setAttribute("width", "50%")
		this.raw.forEach((row, y) => {
			row.forEach((piece, x) => {
				const color = (x + y) % 2 === 0 ? config.white : config.black
				const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
				rect.setAttribute("x", `${x}`)
				rect.setAttribute("y", `${y}`)
				rect.setAttribute("width", "1")
				rect.setAttribute("height", "1")
				rect.setAttribute("fill", color)

				rect.setAttribute("highlight", "false")
				rect.addEventListener("click", (event) => {
					if (event.button !== 2) return
					rect.setAttribute("highlight", `${rect.getAttribute("highlight") !== "true"}`)
					if (rect.getAttribute("highlight") === "true") {
						rect.setAttribute("fill", "red")
					} else {
						rect.setAttribute("fill", color)
					}
				})
				svg.appendChild(rect)
			})
		})
	}

	/**
	 * The number of full moves that have been played
	 */
	get fullMoves() {
		return Math.floor(this.moveHistory.length / 2) + 1
	}

	/**
	 * Get the piece at a given location
	 */
	get(loc: Loc): Piece | null {
		return this.raw[loc.y][loc.x]
	}

	/**
	 * Set the piece at a given location
	 */
	set(loc: Loc, piece: Piece | null) {
		this.raw[loc.y][loc.x] = piece
	}

	/**
	 * Check if a location is valid (on the board)
	 */
	valid(loc: Loc): boolean {
		return loc.x >= 0 && loc.x < this.width && loc.y >= 0 && loc.y < this.height
	}

	static fromFen(fen: string): Board {
		const board = new Board(8, 8)
		const [pieces, turn, castle, enPassant, halfMove, fullMove] = fen.split(" ")

		return board
	}
}
