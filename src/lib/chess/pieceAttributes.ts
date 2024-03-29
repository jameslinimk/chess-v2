import { MoveData, WALL, type Board } from "$lib/chess/board"
import type { Name, Piece } from "$lib/chess/piece"
import { ct, loc, type Loc } from "$lib/chess/util"
import type { ValueSet } from "$lib/util/valueSet"

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
	ThresholdMove = 3,
	/**
	 * **!! EN PASSANT !!**
	 *
	 * Piece can capture the last moved pieces if it is `(x, y)` squares away from it and it the piece is a certain type
	 *
	 * IE: Pawns can capture an enemy pawn if it is 1 square away diagonally
	 */
	EnPassant = 4,
	/**
	 * Castling will move the king 2 squares in either direction and move the piece in the corner to the other side of the king
	 */
	Castle = 5,
	/**
	 * Protected pieces cannot move into a square attacked by an enemy piece
	 *
	 * IE: The King
	 */
	Protected = 100,
}

export class Sliding implements PieceAttribute {
	kind = Attribute.Sliding
	constructor(public direction: Loc) {}

	getMoves(moves: MoveData[], board: Board, piece: Piece): MoveData[] {
		const pos = piece.pos
		for (;;) {
			if (!board.valid(pos) || board.isWall(pos)) break

			const enemy = board.get(pos)
			if (enemy !== null && enemy !== WALL) {
				if (enemy.color === piece.color) break
				else {
					moves.push(new MoveData({ piece, capture: enemy }))
					break
				}
			}

			moves.push(new MoveData({ piece, to: pos }))
		}

		return moves
	}

	getAttacks(attacks: ValueSet<Loc>, board: Board, piece: Piece): ValueSet<Loc> {
		const atks = this.getMoves([], board, piece)
		for (const atk of atks) attacks.add(atk.abTo)
		return attacks
	}
}

export class Jumping implements PieceAttribute {
	kind = Attribute.Jumping
	constructor(public direction: Loc) {}

	getMoves(moves: MoveData[], board: Board, piece: Piece): MoveData[] {
		const pos = piece.pos.add(this.direction)
		if (!board.valid(pos) || board.isWall(pos)) return moves

		const enemy = board.get(pos)
		if (enemy !== null && enemy !== WALL) {
			if (enemy.color === piece.color) return moves
			else {
				moves.push(new MoveData({ piece, capture: enemy }))
				return moves
			}
		}

		moves.push(new MoveData({ piece, to: pos }))
		return moves
	}

	getAttacks(attacks: ValueSet<Loc>): ValueSet<Loc> {
		return attacks
	}
}

export class Capture implements PieceAttribute {
	kind = Attribute.Capture
	constructor(public direction: Loc) {}

	getMoves(moves: MoveData[], board: Board, piece: Piece): MoveData[] {
		const pos = piece.pos.add(this.direction)
		if (!board.valid(pos) || board.isWall(pos)) return moves

		const enemy = board.get(pos)
		if (enemy === null || enemy === WALL || enemy.color === piece.color) return moves

		moves.push(new MoveData({ piece, capture: enemy }))
		return moves
	}

	getAttacks(attacks: ValueSet<Loc>, _board: Board, piece: Piece): ValueSet<Loc> {
		attacks.add(piece.pos.add(this.direction))
		return attacks
	}
}

export class ThresholdMove implements PieceAttribute {
	kind = Attribute.ThresholdMove
	constructor(public direction: Loc, public y_threshold: number) {}

	getMoves(moves: MoveData[], board: Board, piece: Piece): MoveData[] {
		if (piece.pos.y !== this.y_threshold) return moves
		return new Jumping(this.direction).getMoves(moves, board, piece)
	}

	getAttacks(attacks: ValueSet<Loc>): ValueSet<Loc> {
		return attacks
	}
}

export class EnPassant implements PieceAttribute {
	kind = Attribute.EnPassant
	constructor(public direction: Loc, public name: Name) {}

	getMoves(moves: MoveData[], board: Board, piece: Piece): MoveData[] {
		const lastMove = board.lastMove
		if (lastMove === null) return moves

		if (lastMove.piece.name !== this.name) return moves
		if (!piece.pos.sub(lastMove.abTo).equals(this.direction)) return moves

		moves.push(new MoveData({ piece, capture: lastMove.piece }))
		return moves
	}

	/**
	 * **! Note, this does not check if the piece matches `this.name` !**
	 */
	getAttacks(attacks: ValueSet<Loc>, _: Board, piece: Piece): ValueSet<Loc> {
		attacks.add(piece.pos.add(this.direction))
		return attacks
	}
}

/**
 * Creates a list of attributes for a piece given a list of directions
 */
export const direction_expander = <T>(kind: new (dir: Loc) => T, directions: Loc[]): T[] => {
	return directions.map((dir) => new kind(dir))
}

/**
 * Creates a list of attributes for a piece given a list of directions and extra arguments
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const direction_expander_ea = <T>(kind: new (...args: any[]) => T, directions: Loc[], ...extra: any[]): T[] => {
	return directions.map((dir) => new kind(dir, ...extra))
}

export class Protected implements PieceAttribute {
	kind = Attribute.Protected
	getMoves(moves: MoveData[], board: Board, piece: Piece): MoveData[] {
		const attacks = ct(piece.color, board.blackAttacks, board.whiteAttacks)
		return moves.filter((move) => {
			if (attacks.has(move.abTo)) return false
			return true
		})
	}

	getAttacks(attacks: ValueSet<Loc>): ValueSet<Loc> {
		return attacks
	}
}

export class Castle implements PieceAttribute {
	kind = Attribute.Castle

	getMoves(moves: MoveData[], board: Board, piece: Piece): MoveData[] {
		const [kingSide, queenSide] = ct(piece.color, board.whiteCastle, board.blackCastle)
		if (!kingSide && !queenSide) return moves

		const dirs = []
		if (kingSide) dirs.push(1)
		if (queenSide) dirs.push(-1)

		dirs.forEach((dir) => {
			for (let i = 1; i <= 2; i++) {
				const attacks = ct(piece.color, board.whiteAttacks, board.blackAttacks)
				if (attacks.has(piece.pos.add(loc(dir * i, 0)))) return
			}

			moves.push(new MoveData({ piece, to: piece.pos.add(loc(dir * 2, 0)) }))
		})

		return moves
	}

	getAttacks(attacks: ValueSet<Loc>): ValueSet<Loc> {
		return attacks
	}
}

/**
 * An attribute that a piece can have, such as sliding, jumping, capture, etc. A piece consists of a list of attributes
 */
export interface PieceAttribute {
	/**
	 * The priority of which the attribute will be applied, also what attribute it is
	 */
	kind: Attribute

	/**
	 * Returns a list of moves that the piece can make
	 */
	getMoves(moves: MoveData[], board: Board, piece: Piece): MoveData[]

	/**
	 * Returns a list of squares that the piece can attack
	 * - Note: EnPassant does not check if the piece matches `name`
	 */
	getAttacks(attacks: ValueSet<Loc>, board: Board, piece: Piece): ValueSet<Loc>
}
