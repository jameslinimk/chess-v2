import { dev } from "$app/environment"
import type { ClientToServerEvents, ServerToClientEvents } from "$lib/server/socket.js"
import { io, type Socket } from "socket.io-client"

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(dev ? "http://localhost:3000" : "https://chessv2.jamesalin.com")
