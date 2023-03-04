import { db } from "$lib/server/database"
import { fail, redirect } from "@sveltejs/kit"
import { hash } from "bcrypt"
import { randomUUID } from "crypto"
import type { Actions } from "./$types"

export const actions: Actions = {
	register: async ({ request }) => {
		const data = await request.formData()
		const username = data.get("username")
		const password = data.get("password")

		if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
			return fail(400, { invalid: true })
		}

		const user = await db.user.findUnique({ where: { username } })
		if (user) return fail(400, { user: true })

		await db.user.create({
			data: {
				username,
				passwordHash: await hash(password, 10),
				authToken: randomUUID(),
			},
		})

		throw redirect(303, "/login")
	},
}
