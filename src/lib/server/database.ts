import type { MoveData } from "$lib/board.js"
import type { Color } from "$lib/piece.js"
import { hash } from "bcrypt"
import { v4 } from "uuid"

export class Game {
	constructor(public players: Partial<Record<Color, PlayerID>>, public winner: Color, public moves: MoveData[], public time: number) {}
}

export type PlayerID = string
export class Player {
	constructor(public id: PlayerID, public username: string, public hash: string, public games: Game[]) {}

	static new = async (username: string, password: string): Promise<Player> => {
		const passHash = await hash(password, 7)
		return new Player(v4(), username, passHash, [])
	}
}
