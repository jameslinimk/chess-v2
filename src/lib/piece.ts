import type { Board, MoveData } from "./board.js"
import {
	Capture,
	EnPassant,
	Jumping,
	Protected,
	ThresholdMove,
	direction_expander,
	direction_expander_ea,
	type PieceAttribute,
} from "./pieceAttributes.js"
import { ct, loc, type Loc } from "./util.js"

/**
 * The color of a piece, such as `White` or `Black`
 */
export enum Color {
	White,
	Black,
	Green,
	Red,
	Yellow,
}

/**
 * The default order of the turns of the colors
 */
export const ColorOrder = [Color.White, Color.Black, Color.Green, Color.Red, Color.Yellow]

/**
 * Name of the a piece, such as `Pawn`, `Rook`, `Knight`, `Bishop`, `Queen`, or `King`
 * - Shifted by 1 to allow for `0` to be used as a empty value
 */
export enum Name {
	Pawn = 1,
	Rook = 2,
	Knight = 3,
	Bishop = 4,
	Queen = 5,
	King = 6,
}

/**
 * Map of piece names to piece symbols
 */
export const pieceSymbols: Record<Name, string> = {
	[Name.Pawn]: "p",
	[Name.Rook]: "r",
	[Name.Knight]: "n",
	[Name.Bishop]: "b",
	[Name.Queen]: "q",
	[Name.King]: "k",
}

/**
 * Map of piece symbols to piece names, inverse of `pieceSymbols`
 */
export const symbolPieces: Record<string, Name> = Object.entries(pieceSymbols).reduce((acc, [key, value]) => ({ ...acc, [value]: key }), {})

/**
 * Class to represent a piece on the board
 */
export class Piece {
	/**
	 * The attributes of the piece, such as `Jumping`, `Capture`, etc.
	 */
	attributes: PieceAttribute[]
	constructor(public name: Name, public pos: Loc, attributes: PieceAttribute[], public color: Color) {
		this.attributes = attributes.sort((a, b) => a.kind - b.kind)
	}

	/**
	 * Path to the image of the piece (svg)
	 */
	get image(): string {
		const colorPrefix = {
			[Color.White]: "w",
			[Color.Black]: "b",
			[Color.Green]: "g",
			[Color.Red]: "r",
			[Color.Yellow]: "y",
		}

		return `./pieces/${colorPrefix[this.color]}${pieceSymbols[this.name]}.svg`
	}

	/**
	 * The value of the piece
	 */
	get value(): number {
		return {
			[Name.Pawn]: 1,
			[Name.Knight]: 3,
			[Name.Bishop]: 3,
			[Name.Rook]: 5,
			[Name.Queen]: 9,
			[Name.King]: 0,
		}[this.name]
	}

	/**
	 * Get a list of legal moves for the piece
	 */
	getMoves(board: Board): MoveData[] {
		return this.attributes.reduce((acc, attr) => {
			attr.getMoves(acc, board, this)
			return acc
		}, [])
	}

	/**
	 * Create a new piece from a FEN string
	 */
	static fromFen(fen: string, pos: Loc): Piece {
		const constructor = this.pieceConstructors[symbolPieces[fen.toLowerCase()]]
		return constructor(fen === fen.toUpperCase() ? Color.White : Color.Black, pos)
	}

	/**
	 * Creates a new pawn with the given color and position
	 */
	static newPawn(color: Color, pos: Loc): Piece {
		const y_dir = ct(color, -1, 1)
		return new Piece(
			Name.Pawn,
			pos,
			[
				new ThresholdMove(loc(0, y_dir * 2), ct(color, 6, 1)),
				new Jumping(loc(0, y_dir)),
				...direction_expander_ea(EnPassant, [loc(1, 0), loc(-1, 0)], Name.Pawn),
				...direction_expander(Capture, [loc(1, y_dir), loc(-1, y_dir)]),
			],
			color
		)
	}

	/**
	 * Creates a new knight with the given color and position
	 */
	static newKnight(color: Color, pos: Loc): Piece {
		return new Piece(
			Name.Knight,
			pos,
			direction_expander(Jumping, [loc(1, 2), loc(2, 1), loc(2, -1), loc(1, -2), loc(-1, -2), loc(-2, -1), loc(-2, 1), loc(-1, 2)]),
			color
		)
	}

	/**
	 * Creates a new bishop with the given color and position
	 */
	static newBishop(color: Color, pos: Loc): Piece {
		return new Piece(Name.Bishop, pos, direction_expander(Jumping, [loc(1, 1), loc(1, -1), loc(-1, -1), loc(-1, 1)]), color)
	}

	/**
	 * Creates a new rook with the given color and position
	 */
	static newRook(color: Color, pos: Loc): Piece {
		return new Piece(Name.Rook, pos, direction_expander(Jumping, [loc(1, 0), loc(0, 1), loc(-1, 0), loc(0, -1)]), color)
	}

	/**
	 * Creates a new queen with the given color and position
	 */
	static newQueen(color: Color, pos: Loc): Piece {
		return new Piece(
			Name.Queen,
			pos,
			direction_expander(Jumping, [loc(1, 1), loc(1, -1), loc(-1, -1), loc(-1, 1), loc(1, 0), loc(0, 1), loc(-1, 0), loc(0, -1)]),
			color
		)
	}

	/**
	 * Creates a new king with the given color and position
	 */
	static newKing(color: Color, pos: Loc): Piece {
		return new Piece(
			Name.King,
			pos,
			[
				new Protected(),
				...direction_expander(Jumping, [loc(1, 1), loc(1, -1), loc(-1, -1), loc(-1, 1), loc(1, 0), loc(0, 1), loc(-1, 0), loc(0, -1)]),
			],
			color
		)
	}

	/**
	 * Map of piece names to piece constructors
	 */
	static pieceConstructors: Record<Name, (color: Color, pos: Loc) => Piece> = {
		[Name.Pawn]: Piece.newPawn,
		[Name.Rook]: Piece.newRook,
		[Name.Knight]: Piece.newKnight,
		[Name.Bishop]: Piece.newBishop,
		[Name.Queen]: Piece.newQueen,
		[Name.King]: Piece.newKing,
	}
}
