import { db } from "$lib/server/database"
import { fail, redirect } from "@sveltejs/kit"
import { compare } from "bcrypt"
import { randomUUID } from "crypto"
import type { Actions } from "./$types"

export const actions: Actions = {
	login: async ({ cookies, request }) => {
		const data = await request.formData()
		const username = data.get("username")
		const password = data.get("password")

		if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
			return fail(400, { invalid: true })
		}

		const user = await db.user.findUnique({ where: { username } })
		if (!user) return fail(400, { credentials: true })

		const userPassword = await compare(password, user.passwordHash)
		if (!userPassword) return fail(400, { credentials: true })

		// generate new auth token just in case
		const authenticatedUser = await db.user.update({
			where: { username: user.username },
			data: { authToken: randomUUID() },
		})

		cookies.set("session", authenticatedUser.authToken, {
			path: "/",
			httpOnly: true,
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production",
			// 1 month
			maxAge: 60 * 60 * 24 * 30,
		})

		throw redirect(302, "/")
	},
}
