import type { MoveData } from "$lib/board.js"
import type { Color } from "$lib/piece.js"
import { hash } from "bcrypt"
import { randomUUID } from "crypto"
import { QuickDB } from "quick.db"

export class Game {
	constructor(public players: Partial<Record<Color, string>>, public winner: Color, public moves: MoveData[], public time: number) {}
}

export class Player {
	constructor(public authToken: string, public username: string, public hash: string, public games: Game[], public createdAt: number) {}

	static async new(username: string, password: string): Promise<Player> {
		const passHash = await hash(password, 7)
		return new Player(randomUUID(), username, passHash, [], Date.now())
	}
}

export class Database {
	private static db = new QuickDB()

	static async getPlayers(): Promise<Record<string, Player>> {
		const users: Record<string, Player> = (await this.db.get("users")) ?? {}
		return users
	}

	static async getPlayer(username: string): Promise<Player | null> {
		return (await this.db.get(`users.${username}`)) ?? null
	}

	static async setPlayer(player: Player): Promise<void> {
		await this.db.set(`users.${player.username}`, player)
	}

	static async hasPlayer(username: string): Promise<boolean> {
		return await this.db.has(`users.${username}`)
	}
}
