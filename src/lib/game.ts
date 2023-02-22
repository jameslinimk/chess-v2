import { Board } from "./board.js"
import { config } from "./config.js"
import { loc, type Loc } from "./util.js"

export class Game {
	board = Board.defaultBoard()
	selectedPiece: Loc | null = null

	draw(parent: HTMLDivElement) {
		while (parent.firstChild) parent.removeChild(parent.firstChild)

		const scale = 1

		const table = document.createElement("table")
		table.style.borderSpacing = "0"
		table.style.borderCollapse = "collapse"

		/* --------------------------------- Header --------------------------------- */
		const header = document.createElement("tr")
		header.appendChild(document.createElement("th")) // Empty corner
		for (let i = 0; i < this.board.width; i++) {
			const th = document.createElement("th")

			th.innerText = String.fromCharCode(65 + i).toLowerCase()
			th.style.fontSize = `${20 * scale}px`
			th.style.padding = ".25em"

			header.appendChild(th)
		}
		table.appendChild(header)

		this.board.raw.forEach((row, y) => {
			const tr = document.createElement("tr")

			// Number
			const flipped: Record<number, number> = {
				0: 8,
				1: 7,
				2: 6,
				3: 5,
				4: 4,
				5: 3,
				6: 2,
				7: 1,
			}
			const th = document.createElement("th")

			th.innerText = `${flipped[y]}`
			th.style.fontSize = `${20 * scale}px`
			th.style.padding = ".25em"

			tr.appendChild(th)

			row.forEach((piece, x) => {
				const color = (x + y) % 2 === 0 ? config.white : config.black
				const td = document.createElement("td")

				td.style.background = color
				td.style.width = `${80 * scale}px`
				td.style.height = `${80 * scale}px`

				td.style.backgroundPosition = "center"
				td.style.backgroundRepeat = "no-repeat"
				td.style.backgroundSize = "70%"

				if (this.selectedPiece === loc(x, y)) td.style.border = `2px solid red`

				if (piece !== null) {
					td.style.backgroundImage = `url("${piece.image}")`
					td.onclick = () => {
						console.log(piece.getMoves(this.board))
						this.selectedPiece = loc(x, y)
						this.draw(parent)
					}
				}

				tr.appendChild(td)
			})
			table.appendChild(tr)
		})

		parent.appendChild(table)
	}
}
