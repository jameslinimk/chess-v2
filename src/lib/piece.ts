import type { Board } from "./board.js"
import { Capture, EnPassant, Jumping, Protected, ThresholdMove, direction_expander, type PieceAttribute } from "./pieceAttributes.js"
import { ct, loc, type Loc } from "./util.js"

export enum Color {
	White,
	Black,
}

/**
 * Name of the a piece, such as `Pawn`, `Rook`, `Knight`, `Bishop`, `Queen`, or `King`
 */
export enum Name {
	Pawn,
	Rook,
	Knight,
	Bishop,
	Queen,
	King,
}

const pieceImages: Record<Name, Record<Color, string>> = {
	[Name.Pawn]: {
		[Color.White]: "standard/pw.svg",
		[Color.Black]: "standard/pb.svg",
	},
	[Name.Rook]: {
		[Color.White]: "standard/rw.svg",
		[Color.Black]: "standard/rb.svg",
	},
	[Name.Knight]: {
		[Color.White]: "standard/nw.svg",
		[Color.Black]: "standard/nb.svg",
	},
	[Name.Bishop]: {
		[Color.White]: "standard/bw.svg",
		[Color.Black]: "standard/bb.svg",
	},
	[Name.Queen]: {
		[Color.White]: "standard/qw.svg",
		[Color.Black]: "standard/qb.svg",
	},
	[Name.King]: {
		[Color.White]: "standard/kw.svg",
		[Color.Black]: "standard/kb.svg",
	},
}

const pieceValues: Record<Name, number> = {
	[Name.Pawn]: 1,
	[Name.Knight]: 3,
	[Name.Bishop]: 3,
	[Name.Rook]: 5,
	[Name.Queen]: 9,
	[Name.King]: 0,
}

const pieceSymbols: Record<Name, string> = {
	[Name.Pawn]: "p",
	[Name.Rook]: "r",
	[Name.Knight]: "n",
	[Name.Bishop]: "b",
	[Name.Queen]: "q",
	[Name.King]: "k",
}

const symbolPieces: Record<string, Name> = Object.entries(pieceSymbols).reduce((acc, [key, value]) => ({ ...acc, [value]: key }), {})

export class Piece {
	attributes: PieceAttribute[]
	constructor(public name: Name, public pos: Loc, attributes: PieceAttribute[], public color: Color) {
		this.attributes = attributes.sort((a, b) => a.kind - b.kind)
	}

	get image(): string {
		return `./pieces/${pieceImages[this.name][this.color]}`
	}

	get value(): number {
		return pieceValues[this.name]
	}

	getMoves(board: Board): Loc[] {
		return this.attributes.reduce((acc, attr) => {
			attr.getMoves(acc, board, this)
			return acc
		}, [])
	}

	static fromFen(fen: string, pos: Loc): Piece {
		const constructor = pieceConstructors[symbolPieces[fen.toLowerCase()]]
		return constructor(fen === fen.toUpperCase() ? Color.White : Color.Black, pos)
	}

	static newPawn(color: Color, pos: Loc): Piece {
		const y_dir = ct(color, 1, -1)
		return new Piece(
			Name.Pawn,
			pos,
			[
				new ThresholdMove(loc(0, y_dir), ct(color, 6, 1)),
				new Jumping(loc(1, y_dir)),
				new EnPassant(),
				...direction_expander(Capture, [loc(1, y_dir), loc(-1, y_dir)]),
			],
			color
		)
	}

	static newKnight(color: Color, pos: Loc): Piece {
		return new Piece(
			Name.Knight,
			pos,
			direction_expander(Jumping, [loc(1, 2), loc(2, 1), loc(2, -1), loc(1, -2), loc(-1, -2), loc(-2, -1), loc(-2, 1), loc(-1, 2)]),
			color
		)
	}

	static newBishop(color: Color, pos: Loc): Piece {
		return new Piece(Name.Bishop, pos, direction_expander(Jumping, [loc(1, 1), loc(1, -1), loc(-1, -1), loc(-1, 1)]), color)
	}

	static newRook(color: Color, pos: Loc): Piece {
		return new Piece(Name.Rook, pos, direction_expander(Jumping, [loc(1, 0), loc(0, 1), loc(-1, 0), loc(0, -1)]), color)
	}

	static newQueen(color: Color, pos: Loc): Piece {
		return new Piece(
			Name.Queen,
			pos,
			direction_expander(Jumping, [loc(1, 1), loc(1, -1), loc(-1, -1), loc(-1, 1), loc(1, 0), loc(0, 1), loc(-1, 0), loc(0, -1)]),
			color
		)
	}

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
}

const pieceConstructors: Record<Name, (color: Color, pos: Loc) => Piece> = {
	[Name.Pawn]: Piece.newPawn,
	[Name.Rook]: Piece.newRook,
	[Name.Knight]: Piece.newKnight,
	[Name.Bishop]: Piece.newBishop,
	[Name.Queen]: Piece.newQueen,
	[Name.King]: Piece.newKing,
}
