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
	moveHistory: MoveData[] = []

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

		return board
	}
}
