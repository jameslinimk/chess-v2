import { calculateMoves, type PieceAttribute } from "./attributes.js"
import type { Board } from "./board.js"
import type { Loc } from "./util.js"

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
	constructor(public name: Name, public pos: Loc, attributes: PieceAttribute[], public value: number, public color: Color) {
		this.attributes = attributes.sort((a, b) => a.kind - b.kind)
	}

	getImage(): string {
		return pieceImages[this.name][this.color]
	}

	getMoves(board: Board): Loc[] {
		return this.attributes.reduce((acc, attr) => {
			calculateMoves(attr, acc, board, this)
			return acc
		}, [])
	}
}
