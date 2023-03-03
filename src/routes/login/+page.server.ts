import { Error, login } from "$lib/server/auth.js"
import { error } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async (params) => {
	const username = params.url.searchParams.get("username")
	const password = params.url.searchParams.get("password")

	if (!username || !password) throw error(400, Error.BadRequest)

	const [err, player] = await login(username, password)
	if (err) throw error(400, err)

	params.cookies.set("authToken", player!.authToken)
	return {
		success: true,
		player: player,
	}
}
