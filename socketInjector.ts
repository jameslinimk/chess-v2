// socketIoHandler.js
import { Server } from "socket.io"

export const injectSIO = (server) => {
	const io = new Server(server)

	io.on("connection", (socket) => {
		console.log("SocketIO connected")

		socket.on("disconnect", () => {
			console.log("SocketIO disconnected")
		})
	})

	console.log("SocketIO injected")
}
