import { compare } from "bcrypt"
import { QuickDB } from "quick.db"
import { Player } from "./database.js"

const db = new QuickDB()

enum Error {
	UsernameTaken,
	UsernameInvalid,
	UsernameTooLong,
	PasswordTooShort,
	NoAccount,
	InvalidPassword,
}

type Response<T> = [Error | null, T | null]

export const register = async (username: string, password: string): Promise<Response<Player>> => {
	if (username.length > 32) return [Error.UsernameTooLong, null]
	if (username.length < 3) return [Error.UsernameInvalid, null]
	if (password.length < 8) return [Error.PasswordTooShort, null]
	if (await db.has(`users.${username}`)) return [Error.UsernameTaken, null]

	const player = await Player.new(username, password)
	db.set(`users.${username}`, player)
	return [null, player]
}

export const login = async (username: string, password: string): Promise<Response<Player>> => {
	const player: Player | null = await db.get(`users.${username}`)
	if (player === null) return [Error.NoAccount, null]

	if (!(await compare(password, player.hash))) return [Error.InvalidPassword, null]
	return [null, player]
}
