import { compare } from "bcrypt"
import { QuickDB } from "quick.db"
import { Database, Player } from "./database.js"

export const db = new QuickDB()

export enum Error {
	UsernameTaken = "UsernameTaken",
	UsernameInvalid = "UsernameInvalid",
	UsernameTooLong = "UsernameTooLong",
	PasswordTooShort = "PasswordTooShort",
	NoAccount = "NoAccount",
	InvalidPassword = "InvalidPassword",
	BadRequest = "BadRequest",
}

type Response<T> = [Error | null, T | null]

export const register = async (username: string, password: string): Promise<Response<Player>> => {
	if (username.length > 32) return [Error.UsernameTooLong, null]
	if (username.length < 3) return [Error.UsernameInvalid, null]
	if (password.length < 8) return [Error.PasswordTooShort, null]
	if (await Database.hasPlayer(username)) return [Error.UsernameTaken, null]

	const player = await Player.new(username, password)
	Database.setPlayer(player)

	return [null, player]
}

export const login = async (username: string, password: string): Promise<Response<Player>> => {
	const player = await Database.getPlayer(username)
	if (!player) return [Error.NoAccount, null]

	if (!(await compare(password, player.hash))) return [Error.InvalidPassword, null]
	return [null, player]
}
