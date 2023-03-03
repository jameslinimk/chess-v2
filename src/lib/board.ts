import { fromFen, get, set, valid } from "./board_utils"
import { Color, Piece } from "./piece"
import type { Loc } from "./util"
import { ValueSet } from "./valueSet"

/**
 * Create a record with all colors as keys and `init` as values
 */
const emptyColorInit = <T>(init: T): Record<Color, T> => {
	const clone = () => {
		if (ValueSet.isValueSet(init)) return init.clone()
		if (typeof init === "object") return JSON.parse(JSON.stringify(init))

		return init
	}

	return Object.keys(Color).reduce((acc, color) => {
		acc[color as unknown as Color] = clone()
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
	 * Play the sound for this move
	 */
	playSound() {
		const audio = document.getElementById(this.capture ? "captureSound" : "moveSound") as HTMLAudioElement
		if (audio) audio.play()
	}

	/**
	 * Gets the location that the piece is moving to
	 */
	get abTo() {
		return this.to ?? this.capture!.pos
	}

	/**
	 * Gets the color of the piece that is moving
	 */
	get color() {
		return this.piece.color
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
	turn = Color.White
	/**
	 * The previous moves that have been played
	 */
	moveHistory: MoveData[] = []
	/**
	 * The hash's of the previous positions that have been played
	 */
	hashHistory = new Map<number, number>()
	/**
	 * The number of half moves since the last capture or pawn move
	 */
	halfMoveClock = 0

	/**
	 * The hash of the current position
	 */
	hash = 0

	/**
	 * Squares that are attacked by each color. Each key represents the color that **is being attacked**
	 */
	attacks: Record<Color, ValueSet<Loc>> = emptyColorInit(new ValueSet())
	/**
	 * Available moves for each color
	 */
	moves: Record<Color, MoveData[]> = emptyColorInit([])
	/**
	 * Castle rights for each color, in the form `[kingSide, queenSide]`
	 */
	castleRights: Record<Color, [boolean, boolean]> = emptyColorInit([true, true])

	/**
	 * Get a combined set of all sets in `record` except `color`
	 */
	other<T>(record: Record<Color, ValueSet<T>>, color: Color): ValueSet<T> {
		const moves = new ValueSet<T>()
		const colors = Object.keys(record) as unknown as Color[]
		colors.forEach((col) => {
			if (col === color) return
			for (const move of record[col]) moves.add(move)
		})
		return moves
	}

	/**
	 * Sets `this.hash` to the hash of the current position
	 */
	updateHash() {
		const p = 31
		const m = 1e9 + 9

		let hash = 0
		this.raw.forEach((row) => {
			row.forEach((pi) => {
				const piece = pi?.name ?? 0
				hash = (hash * p + piece) % m
			})
		})

		this.hash = hash
	}

	updateMoves() {
		this.moves = emptyColorInit([])
		this.raw.flat().forEach((piece) => {
			if (piece === null) return
			this.moves[piece.color].push(...piece.getMoves(this))
		})
	}

	updateAttacks() {
		this.attacks = emptyColorInit(new ValueSet())
		this.raw.flat().forEach((piece) => {
			if (piece === null) return
			this.attacks[piece.color].addSet(piece.getAttacks(this))
		})
	}

	update() {
		this.updateHash()
		this.updateMoves()
		this.updateAttacks()
	}

	/**
	 * Gets all legal moves for a piece
	 */
	pieceMoves(piece: Loc): MoveData[] {
		const p = this.get(piece)
		if (p === null) return []
		return this.moves[p.color].filter((m) => m.piece.pos.equals(piece))
	}

	move(from: Loc, move: MoveData) {
		console.log("move", from.toString(), move)
	}

	constructor(public width: number, public height: number, public players: number) {
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
	get = get
	/**
	 * Set the piece at a given location
	 */
	set = set
	/**
	 * Check if a location is valid (on the board)
	 */
	valid = valid
	/**
	 * Creates a board from a FEN string
	 */
	static fromFen = fromFen
}
