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
	 */
	EnPassant = 4,
	/**
	 * Protected pieces cannot move into a square attacked by an enemy piece
	 *
	 * IE: The King
	 */
	Protected = 10,
}

export interface Sliding {
	kind: Attribute.Sliding
	direction: Loc
}

export interface Jumping {
	kind: Attribute.Jumping
	direction: Loc
}

export interface Capture {
	kind: Attribute.Capture
	direction: Loc
}

export interface ThresholdMove {
	kind: Attribute.DoubleMove
	direction: Loc
	y_threshold: number
}

export interface EnPassant {
	kind: Attribute.EnPassant
}

/**
 * Creates a list of attributes for a piece given a list of directions
 */
export const direction_expander = (kind: Attribute, directions: Loc[]): PieceAttribute[] => {
	return directions.map(
		(dir) =>
			<PieceAttribute>{
				kind,
				direction: dir,
			}
	)
}

export interface Protected {
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
		if (board.valid(pos) && board.get(pos) === null) {
			moves.push(pos)
		}
	} else if (isProtected(attr)) {
	} else if (isCapture(attr)) {
		const dir = attr.direction
		const pos = piece.pos.add(dir)
		if (board.valid(pos) && board.get(pos)?.color !== piece.color) {
			moves.push(pos)
		}
	} else if (isThresholdMove(attr)) {
		const dir = attr.direction
		const pos = piece.pos.add(dir)
		if (board.valid(pos) && board.get(pos) === null && piece.pos.y === attr.y_threshold) {
			moves.push(pos)
		}
	} else if (isEnPassant(attr)) {
		const lastMove = board.moveHistory[board.moveHistory.length - 1]
		if (lastMove === undefined) return moves
	}
	return moves
}

export const isSliding = (piece: PieceAttribute): piece is Sliding => piece.kind === Attribute.Sliding
export const isStepping = (piece: PieceAttribute): piece is Jumping => piece.kind === Attribute.Jumping
export const isProtected = (piece: PieceAttribute): piece is Protected => piece.kind === Attribute.Protected
export const isCapture = (piece: PieceAttribute): piece is Capture => piece.kind === Attribute.Capture
export const isThresholdMove = (piece: PieceAttribute): piece is ThresholdMove => piece.kind === Attribute.DoubleMove
export const isEnPassant = (piece: PieceAttribute): piece is EnPassant => piece.kind === Attribute.EnPassant

export type PieceAttribute = Sliding | Jumping | Protected | Capture | ThresholdMove | EnPassant
