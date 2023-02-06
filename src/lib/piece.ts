import type { Loc } from "./util.js"

/**
 * Key is the priority
 */
export enum PieceAttributes {
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
	kind: PieceAttributes.Sliding
	direction: Loc
}

interface Stepping {
	kind: PieceAttributes.Stepping
	direction: Loc
}

interface Protected {
	kind: PieceAttributes.Protected
}

const calculateMoves = (from: Loc, moves: Loc[]): Loc[] => {
	return moves
}

export const isSliding = (piece: PieceAttribute): piece is Sliding => piece.kind === PieceAttributes.Sliding
export const isStepping = (piece: PieceAttribute): piece is Stepping => piece.kind === PieceAttributes.Stepping
export const isProtected = (piece: PieceAttribute): piece is Protected => piece.kind === PieceAttributes.Protected

export type PieceAttribute = Sliding | Stepping | Protected

export class Piece {
	constructor(public name: string, public attributes: PieceAttribute[], public value: number, public image: string) {}
}
