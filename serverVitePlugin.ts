import type { PluginOption } from "vite"
import { injectSIO } from "./socketInjector"

export const viteInjector: PluginOption = {
	name: "webSocketServer",
	configureServer(server) {
		injectSIO(server.httpServer)
	},
}
