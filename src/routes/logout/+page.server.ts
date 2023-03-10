import { redirect } from "@sveltejs/kit"
import type { Actions, PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ cookies }) => {
	cookies.delete("session")
	throw redirect(302, "/")
}

export const actions: Actions = {
	default({ cookies }) {
		cookies.delete("session")
		throw redirect(302, "/login")
	},
}
