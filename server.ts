import express from "express"
import { createServer } from "http"
import { handler } from "./build/handler.js"
import { injectSIO } from "./socketInjector.js"

const app = express()
const server = createServer(app)

injectSIO(app)

app.use(handler)

server.listen(3000, () => {
	console.log("Running on http://localhost:3000")
})
