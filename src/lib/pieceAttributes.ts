import type { Board } from "./board.js"
import type { Piece } from "./piece.js"
import type { Loc } from "./util.js"

/**
 * Key is the priority of which the attribute will be applied
 */
export enum Attribute {
	/**
	 * Sliding pieces can move any number of squares given a direction `(x, y)`, stopping when they reach an piece
	 *
	 * IE: A rook, queen, or bishop
	 */
	Sliding = 0,
	/**
	 * Stepping pieces can move `(x, y)` squares from itself, but only if the square is empty
	 *
	 * IE: The way a knight moves
	 */
	Jumping = 1,
	/**
	 * Capture can only move `(x, y)` squares from itself if it is capturing an enemy piece
	 *
	 * IE: Pawns can only move diagonally if they are capturing an enemy piece
	 */
	Capture = 2,
	/**
	 * SpecialJump can move `(x, y)` squares from itself, but only if its current positions y is a certain value
	 *
	 * IE: Pawns can only move 2 squares forward on their first move
	 */
	DoubleMove = 3,
	/**
	 * **!! EN PASSANT !!**
	 *
	 * Piece can capture the last moved pieces if it is `(x, y)` squares away from it
	 *
	 * IE: Pawns can capture an enemy pawn if it is 1 square away diagonally
	 */
	EnPassant = 4,
	/**
	 * Protected pieces cannot move into a square attacked by an enemy piece
	 *
	 * IE: The King
	 */
	Protected = 10,
}

export class Sliding implements PieceAttribute {
	kind = Attribute.Sliding
	constructor(public direction: Loc) {}

	getMoves(moves: Loc[], board: Board, piece: Piece): Loc[] {
		const dir = this.direction
		const start = piece.pos

		let pos = start
		for (;;) {
			pos = pos.add(dir)
			if (!board.valid(pos) || board.get(pos) !== null) break
			moves.push(pos)
		}
		return moves
	}

	getAttacks(captures: Loc[], board: Board, piece: Piece): Loc[] {
		const dir = this.direction
		const start = piece.pos

		let pos = start
		for (;;) {
			pos = pos.add(dir)
			if (!board.valid(pos) || board.get(pos) !== null) break
			captures.push(pos)
			break
		}
		return captures
	}
}

export class Jumping implements PieceAttribute {
	kind = Attribute.Jumping
	constructor(public direction: Loc) {}

	getMoves(moves: Loc[], board: Board, piece: Piece): Loc[] {
		const pos = piece.pos.add(this.direction)
		if (board.valid(pos) && board.get(pos) === null) moves.push(pos)
		return moves
	}

	getAttacks(captures: Loc[], board: Board, piece: Piece): Loc[] {
		const pos = piece.pos.add(this.direction)
		if (board.valid(pos) && board.get(pos) !== null) captures.push(pos)
		return captures
	}
}

export class Capture implements PieceAttribute {
	kind = Attribute.Capture
	constructor(public direction: Loc) {}

	getMoves(moves: Loc[], board: Board, piece: Piece): Loc[] {
		return moves
	}

	getAttacks(captures: Loc[], board: Board, piece: Piece): Loc[] {
		const pos = piece.pos.add(this.direction)
		if (board.valid(pos) && board.get(pos)?.color !== piece.color) captures.push(pos)
		return captures
	}
}

export class ThresholdMove implements PieceAttribute {
	kind = Attribute.DoubleMove
	constructor(public direction: Loc, public y_threshold: number) {}

	getMoves(moves: Loc[], board: Board, piece: Piece): Loc[] {
		const pos = piece.pos.add(this.direction)
		if (board.valid(pos) && board.get(pos) === null && piece.pos.y === this.y_threshold) moves.push(pos)
		return moves
	}

	getAttacks(captures: Loc[], board: Board, piece: Piece): Loc[] {
		return captures
	}
}

export class EnPassant implements PieceAttribute {
	kind = Attribute.EnPassant
	constructor(public direction: Loc) {}

	getMoves(moves: Loc[], board: Board, piece: Piece): Loc[] {
		return moves
	}

	getAttacks(captures: Loc[], board: Board, piece: Piece): Loc[] {
		return captures
	}
}

/**
 * Creates a list of attributes for a piece given a list of directions
 */
export const direction_expander = <T>(kind: new (dir: Loc) => T, directions: Loc[]): T[] => {
	return directions.map((dir) => new kind(dir))
}

export class Protected implements PieceAttribute {
	kind = Attribute.Protected

	getMoves(moves: Loc[], board: Board, piece: Piece): Loc[] {
		return moves
		// return moves.filter((move) => !board.isAttacked(move, piece.color))
	}

	getAttacks(captures: Loc[], board: Board, piece: Piece): Loc[] {
		return captures
		// return captures.filter((move) => !board.isAttacked(move, piece.color))
	}
}

export interface PieceAttribute {
	kind: Attribute

	getMoves(moves: Loc[], board: Board, piece: Piece): Loc[]
	getAttacks(moves: Loc[], board: Board, piece: Piece): Loc[]
}
