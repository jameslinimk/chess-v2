import { ValueSet } from "../util/valueSet"
import { fromFen, get, isWall, set, valid } from "./board_utils"
import { Color, Name, Piece } from "./piece"
import { ct, type Loc } from "./util"

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
	 * Whether this move is an en passant capture. If true, `this.capture` will be the pawn being captured
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

export const WALL = 123
export type RawType = Piece | typeof WALL | null

/**
 * A class representing a chess board
 */
export class Board {
	/**
	 * The raw board data, with the pieces or null
	 */
	raw: RawType[][]
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
	 * Squares that are attacked by white
	 */
	whiteAttacks = new ValueSet<Loc>()
	/**
	 * Squares that are attacked by black
	 */
	blackAttacks = new ValueSet<Loc>()

	/**
	 * Available moves for white
	 */
	whiteMoves: MoveData[] = []
	/**
	 * Available moves for black
	 */
	blackMoves: MoveData[] = []

	/**
	 * Castle rights for white, in the form `[kingSide, queenSide]`
	 */
	whiteCastle: [boolean, boolean] = [true, true]
	/**
	 * Castle rights for white, in the form `[kingSide, queenSide]`
	 */
	blackCastle: [boolean, boolean] = [true, true]

	/**
	 * Sets `this.hash` to the hash of the current position
	 */
	updateHash() {
		const p = 31
		const m = 1e9 + 9

		let hash = 0
		this.raw.forEach((row) => {
			row.forEach((pi) => {
				const piece = pi === WALL ? WALL : pi === null ? 0 : pi.name
				hash = (hash * p + piece) % m
			})
		})

		this.hash = hash
	}

	updateMoves() {
		this.whiteMoves = []
		this.blackMoves = []

		this.raw.flat().forEach((piece) => {
			if (piece === null || piece === WALL) return
			const moves = ct(piece.color, this.whiteMoves, this.blackMoves)
			moves.push(...piece.getMoves(this))
		})
	}

	updateAttacks() {
		this.whiteAttacks.clear()
		this.blackAttacks.clear()

		this.raw.flat().forEach((piece) => {
			if (piece === null || piece === WALL) return
			const attacks = ct(piece.color, this.whiteAttacks, this.blackAttacks)
			attacks.addSet(piece.getAttacks(this))
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
		if (p === null || p === WALL) return []
		const moves = ct(p.color, this.whiteMoves, this.blackMoves)
		return moves.filter((m) => m.piece.pos.equals(piece))
	}

	move(move: MoveData) {
		this.moveHistory.push(move)
		if (move.capture) {
			this.halfMoveClock = 0
		}

		this.set(move.piece.pos, null)
		this.set(move.abTo, move.piece)

		if (move.enPassant) {
			if (!move.capture) throw new Error("En passant move must capture")
			this.set(move.capture.pos, null)
		}

		switch (move.piece.name) {
			case Name.Pawn:
				this.halfMoveClock = 0
				this.hashHistory.clear()
				break
		}

		this.update()

		const v = this.hashHistory.get(this.hash) ?? 0
		this.hashHistory.set(this.hash, v + 1)

		if (this.hashHistory.get(this.hash) === 3) {
			throw new Error("Threefold repetition")
		}
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
	 * Check if a location is a wall
	 */
	isWall = isWall
	/**
	 * Creates a board from a FEN string
	 */
	static fromFen = fromFen
}
