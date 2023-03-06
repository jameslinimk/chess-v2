import { db } from "$lib/server/database"
import type { Handle } from "@sveltejs/kit"

export const handle: Handle = async ({ event, resolve }) => {
	// Not logged in
	const session = event.cookies.get("session")
	if (!session) return await resolve(event)

	// Logged in
	const user = await db.user.findUnique({ where: { authToken: session } })
	if (user) event.locals.user = user

	return await resolve(event)
}
