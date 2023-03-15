import type { ClientToServerEvents, ServerToClientEvents } from "$lib/server/socket.js"
import { io, type Socket } from "socket.io-client"

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io()
