import type { Board } from "./board.js"
import type { Piece } from "./piece.js"
import type { Loc } from "./util.js"

/**
 * Key is the priority of which the attribute will be applied
 */
export enum Attribute {
	/**
	 * Sliding pieces can move any number of squares given a direction `(x, y)`, stopping when they reach an piece
	 */
	Sliding = 0,
	/**
	 * Stepping pieces can move `(x, y)` squares, but only if the square is empty
	 */
	Stepping = 1,
	/**
	 * Protected pieces cannot move into a square attacked by an enemy piece
	 */
	Protected = 10,
}

interface Sliding {
	kind: Attribute.Sliding
	direction: Loc
}

interface Stepping {
	kind: Attribute.Stepping
	direction: Loc
}

interface Protected {
	kind: Attribute.Protected
}

export const calculateMoves = (attr: PieceAttribute, moves: Loc[], board: Board, piece: Piece): Loc[] => {
	if (isSliding(attr)) {
		const dir = attr.direction
		const start = piece.pos

		let pos = start
		while (true) {
			pos = pos.add(dir)
			if (!board.valid(pos) || board.get(pos) !== null) break
			moves.push(pos)
		}
	} else if (isStepping(attr)) {
		const dir = attr.direction
		const pos = piece.pos.add(dir)
		if (board.valid(pos) && board.get(pos) === null) moves.push(pos)
	} else if (isProtected(attr)) {
	}
	return moves
}

export const isSliding = (piece: PieceAttribute): piece is Sliding => piece.kind === Attribute.Sliding
export const isStepping = (piece: PieceAttribute): piece is Stepping => piece.kind === Attribute.Stepping
export const isProtected = (piece: PieceAttribute): piece is Protected => piece.kind === Attribute.Protected

export type PieceAttribute = Sliding | Stepping | Protected
