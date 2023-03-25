import { Board, MoveData, WALL, type RawType } from "$lib/chess/board"
import { Color, Piece } from "$lib/chess/piece"
import { Loc, loc, locA, oc } from "$lib/chess/util"
import chalk from "chalk"

export function get(this: Board, loc: Loc) {
	if (!this.valid(loc)) return null
	return this.raw[loc.y][loc.x]
}

export function set(this: Board, loc: Loc, piece: RawType) {
	this.raw[loc.y][loc.x] = piece
}

export function valid(this: Board, loc: Loc) {
	return loc.x >= 0 && loc.x < this.width && loc.y >= 0 && loc.y < this.height
}

export function isWall(this: Board, loc: Loc) {
	return this.get(loc) === WALL
}

export function print(this: Board) {
	const print: string[] = []
	this.raw.forEach((row, y) => {
		const printRow: string[] = []
		row.forEach((cell, x) => {
			const color = (x + y) % 2 === 0 ? chalk.bgWhite : chalk.bgBlack
			if (cell === null) {
				printRow.push(color(" "))
			} else if (cell === WALL) {
				printRow.push(color("X"))
			} else {
				printRow.push(color(cell.symbol))
			}
		})
		print.push(printRow.join(""))
	})
	console.log(print.join("\n"))
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
	board.turn = turn === "w" ? Color.White : Color.Black

	// Set castle rights
	if (castle.includes("K")) board.whiteCastle[0] = true
	if (castle.includes("Q")) board.whiteCastle[1] = true
	if (castle.includes("k")) board.blackCastle[0] = true
	if (castle.includes("q")) board.blackCastle[1] = true

	// Set half move
	board.halfMoveClock = parseInt(halfMove)

	// Set full move
	let fullMoves = parseInt(fullMove) * 2
	if (board.turn === Color.Black) fullMoves--
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
		targetSquare.y += board.turn === Color.White ? -1 : 1
		const newMove = new MoveData({
			piece: Piece.newPawn(oc(board.turn), targetSquare),
			to: targetSquare,
		})
		if (board.moveHistory.length === 0) {
			board.moveHistory.push(newMove)
		} else {
			board.moveHistory[board.moveHistory.length - 1] = newMove
		}
	}

	board.update()
	return board
}

export function toJson(this: Board): string {
	return JSON.stringify(this.raw)
}

export function fromJson(json: string): Board {
	const board: Board = JSON.parse(json)
	Object.setPrototypeOf(board, Board.prototype)
	return board
}
