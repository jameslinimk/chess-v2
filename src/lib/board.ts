import { Color, Piece } from "./piece.js"
import { loc, locA, oc, type Loc } from "./util.js"

/**
 * Create a record with all colors as keys and `init` as values
 */
const emptyColorInit = <T>(init: T): Record<Color, T> => {
	return Object.keys(Color).reduce((acc, color) => {
		acc[color as unknown as Color] = init
		return acc
	}, {} as Record<Color, T>)
}

interface MoveDataConfig {
	piece: Piece
	to?: Loc
	capture?: Piece

	castle?: "king" | "queen"
	enPassant?: boolean
	promote?: Piece
}

export class MoveData implements MoveDataConfig {
	/**
	 * The piece that is moving
	 */
	piece: Piece
	/**
	 * The location that the piece is moving to, if not a capture
	 */
	to?: Loc
	/**
	 * The piece that is being captured, if any
	 */
	capture?: Piece

	/**
	 * The type of castle, if any
	 */
	castle?: "king" | "queen"
	/**
	 * Whether this move is an en passant capture
	 */
	enPassant?: boolean
	/**
	 * The piece that this pawn is being promoted to, if any
	 */
	promote?: Piece

	constructor(config: MoveDataConfig) {
		this.piece = config.piece
		this.to = config.to
		this.capture = config.capture

		this.castle = config.castle
		this.enPassant = config.enPassant
		this.promote = config.promote

		if (this.to === undefined && this.capture === undefined) {
			throw new Error("MoveData must have either a `to` or `capture`")
		}
	}

	/**
	 * Gets the location that the piece is moving to
	 */
	get abTo() {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.to ?? this.capture!.pos
	}
}

/**
 * A class representing a chess board
 */
export class Board {
	/**
	 * The raw board data, with the pieces or null
	 */
	raw: (Piece | null)[][]
	/**
	 * The current player to move
	 */
	currentMove = Color.White
	/**
	 * The previous moves that have been played
	 */
	moveHistory: MoveData[] = []
	/**
	 * The number of half moves since the last capture or pawn move
	 */
	halfMoveClock = 0

	/**
	 * Squares that are attacked by each color
	 */
	attacks: Record<Color, Set<Loc>> = emptyColorInit(new Set())
	/**
	 * Available moves for each color
	 */
	moves: Record<Color, Set<Loc>> = emptyColorInit(new Set())

	/**
	 * Get a combined set of all attacks by all colors except `color`
	 */
	otherAttacks(color: Color): Set<Loc> {
		const moves = new Set<Loc>()
		const colors = Object.keys(this.attacks) as unknown as Color[]
		colors.forEach((col) => {
			if (col === color) return
			for (const move of this.attacks[col]) moves.add(move)
		})
		return moves
	}

	/**
	 * Castle rights for each color, in the form `[kingSide, queenSide]`
	 */
	castleRights: Record<Color, [boolean, boolean]> = emptyColorInit([true, true])

	constructor(public width: number, public height: number) {
		this.raw = Array.from(Array(width), () => Array.from(Array(height), () => null))
	}

	/**
	 * Create a new board with the default starting position
	 */
	static defaultBoard(): Board {
		return Board.fromFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
	}

	/**
	 * The number of full moves that have been played
	 */
	get fullMoves() {
		return Math.floor(this.moveHistory.length / 2) + 1
	}

	/**
	 * The last move that was played, or null if no moves have been played
	 */
	get lastMove(): MoveData | null {
		if (this.moveHistory.length === 0) return null
		return this.moveHistory[this.moveHistory.length - 1]
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

	/**
	 * Creates a board from a FEN string
	 */
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

		// Set half move
		board.halfMoveClock = parseInt(halfMove)

		// Set full move
		let fullMoves = parseInt(fullMove) * 2
		if (board.currentMove === Color.Black) fullMoves--
		for (let i = 0; i < fullMoves; i++) {
			board.moveHistory.push(
				new MoveData({
					piece: Piece.newPawn(Color.White, loc(0, 0)),
					to: loc(0, 0),
				})
			)
		}

		// Set en passant
		if (enPassant !== "-") {
			const targetSquare = locA(enPassant)
			targetSquare.y += board.currentMove === Color.White ? -1 : 1
			const newMove = new MoveData({
				piece: Piece.newPawn(oc(board.currentMove), targetSquare),
				to: targetSquare,
			})
			if (board.moveHistory.length === 0) {
				board.moveHistory.push(newMove)
			} else {
				board.moveHistory[board.moveHistory.length - 1] = newMove
			}
		}

		return board
	}
}
