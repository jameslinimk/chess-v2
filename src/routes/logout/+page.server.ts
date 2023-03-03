import { redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async (params) => {
	params.cookies.set("authToken", "")
	throw redirect(302, "/")
}
