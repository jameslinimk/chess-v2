import { Color, Piece } from "./piece.js"
import { loc, type Loc } from "./util.js"

/**
 * Create a record with all colors as keys and `init` as values
 */
const emptyColorInit = <T>(init: T): Record<Color, T> => {
	return Object.keys(Color).reduce((acc, color) => {
		acc[color as unknown as Color] = init
		return acc
	}, {} as Record<Color, T>)
}

export interface MoveData {
	from: Loc
	to: Loc
	piece: Piece

	capture?: Piece
	castle?: "king" | "queen"
	enPassant?: boolean
	promote?: Piece
}

export class Board {
	raw: (Piece | null)[][]
	currentMove = Color.White
	moveHistory: MoveData[] = []
	halfMoveClock = 0

	attacks: Record<Color, Loc[]> = emptyColorInit([])
	moves: Record<Color, Loc[]> = emptyColorInit([])

	/**
	 * Castle rights for each color, in the form `[kingSide, queenSide]`
	 */
	castleRights: Record<Color, [boolean, boolean]> = emptyColorInit([true, true])

	constructor(public width: number, public height: number) {
		this.raw = Array.from(Array(width), () => Array.from(Array(height), () => null))
	}

	static defaultBoard(): Board {
		const board = new Board(8, 8)
		board.set(loc(0, 6), Piece.newPawn(Color.White, loc(0, 6)))
		return board
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
		if (!this.valid(loc)) return null
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

		// Set pieces
		pieces.split("/").forEach((row, y) => {
			let x = 0
			row.split("").forEach((char) => {
				if (char.match(/\d/)) {
					x += parseInt(char)
					return
				}

				board.set(loc(x, y), Piece.fromFen(char, loc(x, y)))
				x++
			})
		})

		// Set turn
		board.currentMove = turn === "w" ? Color.White : Color.Black

		// Set castle rights
		if (castle.includes("K")) board.castleRights[Color.White][0] = true
		if (castle.includes("Q")) board.castleRights[Color.White][1] = true
		if (castle.includes("k")) board.castleRights[Color.Black][0] = true
		if (castle.includes("q")) board.castleRights[Color.Black][1] = true

		// Set en passant TODO

		// Set half move
		board.halfMoveClock = parseInt(halfMove)

		// Set full move
		let fullMoves = parseInt(fullMove) * 2
		if (board.currentMove === Color.Black) fullMoves--
		for (let i = 0; i < fullMoves; i++) {
			board.moveHistory.push({
				from: loc(0, 0),
				to: loc(0, 0),
				piece: Piece.newPawn(Color.White, loc(0, 0)),
			})
		}

		return board
	}
}
