import { Board, MoveData } from "./board.js"
import { Color, Piece } from "./piece.js"
import { Loc, loc, locA, oc } from "./util.js"

export function get(this: Board, loc: Loc): Piece | null {
	if (!this.valid(loc)) return null
	return this.raw[loc.y][loc.x]
}

export function set(this: Board, loc: Loc, piece: Piece | null) {
	this.raw[loc.y][loc.x] = piece
}

export function valid(this: Board, loc: Loc): boolean {
	return loc.x >= 0 && loc.x < this.width && loc.y >= 0 && loc.y < this.height
}

export const fromFen = (fen: string): Board => {
	const board = new Board(8, 8, 2)
	const [pieces, turn, castle, enPassant, halfMove, fullMove] = fen.split(" ")

	// Set pieces
	pieces.split("/").forEach((row, y) => {
		let x = 0
		row.split("").forEach((char) => {
			if (char.match(/\d/)) {
				x += parseInt(char)
				return
			}

			board.set(loc(x, y), Piece.fromFen(char, loc(x, y)))
			x++
		})
	})

	// Set turn
	board.currentMove = turn === "w" ? Color.White : Color.Black

	// Set castle rights
	if (castle.includes("K")) board.castleRights[Color.White][0] = true
	if (castle.includes("Q")) board.castleRights[Color.White][1] = true
	if (castle.includes("k")) board.castleRights[Color.Black][0] = true
	if (castle.includes("q")) board.castleRights[Color.Black][1] = true

	// Set half move
	board.halfMoveClock = parseInt(halfMove)

	// Set full move
	let fullMoves = parseInt(fullMove) * 2
	if (board.currentMove === Color.Black) fullMoves--
	for (let i = 0; i < fullMoves; i++) {
		board.moveHistory.push(
			new MoveData({
				piece: Piece.newPawn(Color.White, loc(0, 0)),
				to: loc(0, 0),
			})
		)
	}

	// Set en passant
	if (enPassant !== "-") {
		const targetSquare = locA(enPassant)
		targetSquare.y += board.currentMove === Color.White ? -1 : 1
		const newMove = new MoveData({
			piece: Piece.newPawn(oc(board.currentMove), targetSquare),
			to: targetSquare,
		})
		if (board.moveHistory.length === 0) {
			board.moveHistory.push(newMove)
		} else {
			board.moveHistory[board.moveHistory.length - 1] = newMove
		}
	}

	return board
}
