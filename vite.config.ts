import { sveltekit } from "@sveltejs/kit/vite"
import type { UserConfig } from "vite"
import { viteInjector } from "./socketInjector"

const config: UserConfig = {
	plugins: [sveltekit(), viteInjector],
}

export default config
