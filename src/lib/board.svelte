<script lang="ts">
	import type { MoveData } from "./chess/board"
	import { loc, type Loc } from "./chess/util"
	import { config } from "./config"
	import { game } from "./game"
	import { moveArrowHeads } from "./math"
	import { ValueSet } from "./valueSet"

	let squareSize = 50
	const sqColor = (x: number, y: number) => ((x + y) % 2 === 0 ? "white" : "black")

	let boardElm: HTMLDivElement
	let boardOffset: [x: number, y: number] = [0, 0]
	$: if (boardElm) boardOffset = [boardElm.offsetLeft, boardElm.offsetTop]

	let highlights = new ValueSet<Loc>()
	let arrows: [Loc, Loc][] = []

	let mousePos: [x: number, y: number] = [0, 0]
	const onMousemove = (event: MouseEvent) => {
		mousePos = [event.clientX - boardOffset[0], event.clientY - boardOffset[1]]
	}

	let arrowStart: Loc | null = null
	let previewArrow: [Loc, Loc] | null = null

	$: {
		if (arrowStart) previewArrow = [arrowStart, loc(ltp(mousePos[0]), ltp(mousePos[1])).maxClamp(loc($game.board.width - 1, $game.board.height - 1))]
		else previewArrow = null
	}

	let dragging: Loc | null = null
	let draggingImg: string | null = null
	$: if (dragging !== null) draggingImg = $game.board.get(dragging)?.image ?? null

	let showMoves: Loc | null = null
	$: {
		if (dragging) showMoves = dragging
		else if (selected) showMoves = selected
		else showMoves = null
	}
	let moves: MoveData[] = []
	$: {
		if (showMoves !== null) moves = $game.board.pieceMoves(showMoves) ?? []
		else moves = []
	}

	let showPreviewMoves: Loc | null = null
	let previewMoves: MoveData[] = []
	$: {
		if (showPreviewMoves !== null) previewMoves = $game.board.pieceMoves(showPreviewMoves) ?? []
		else previewMoves = []
	}

	let selected: Loc | null = null

	const globalOnMouseUp = (event: MouseEvent) => {
		if (dragging !== null) selected = null
		dragging = null
	}

	const onPieceMouseDown = (event: MouseEvent, pos: Loc) => {
		switch (event.button) {
			case 0: {
				const contains = moves.some((m) => m.abTo.equals(pos))
				if (!contains) dragging = pos

				highlights = new ValueSet<Loc>()
				arrows = []
				break
			}
			case 2: {
				arrowStart = pos
				break
			}
		}
	}

	const findMove = (start: Loc, pos: Loc) => {
		const move = moves.find((m) => m.abTo.equals(pos))
		if (move !== undefined) {
			move.playSound()
			$game.board.move(start, move)
			return
		}
	}

	const onPieceClick = (event: MouseEvent, pos: Loc) => {
		switch (event.button) {
			case 0: {
				if (selected === null) return
				findMove(selected, pos)
				break
			}
		}
	}

	const onPieceMouseUp = (event: MouseEvent, pos: Loc) => {
		switch (event.button) {
			case 0: {
				if (dragging) {
					if (pos.equals(dragging)) {
						if (selected?.equals(pos)) {
							selected = null
						} else {
							selected = pos
						}
						dragging = null
						return
					}

					findMove(dragging, pos)
				}
				break
			}
			case 2: {
				if (arrowStart !== null && previewArrow !== null) {
					// Highlight
					if (arrowStart.equals(pos)) {
						if (highlights.has(pos)) {
							highlights.delete(pos)
							highlights = highlights
							arrowStart = null
							return
						}

						highlights.add(pos)
						highlights = highlights
						arrowStart = null
						return
					}

					// Arrows
					for (const [from, to] of arrows) {
						if (from.equals(arrowStart) && to.equals(pos)) {
							arrows = arrows.filter(([f, t]) => !(f.equals(from) && t.equals(to)))
							arrowStart = null
							return
						}
					}

					arrows.push([arrowStart, pos])
					arrows = arrows
				}
				arrowStart = null
				break
			}
		}
	}

	/**
	 * Convert a location to a pixel location
	 */
	const ptl = (v: number): number => v * squareSize + squareSize / 2
	/**
	 * Convert a location to a pixel location
	 */
	const ptll = (v: Loc): [x: number, y: number] => [ptl(v.x), ptl(v.y)]
	/**
	 * Convert a pixel location to a location
	 */
	const ltp = (v: number): number => Math.floor(v / squareSize)
	/**
	 * Convert a pixel location to a location
	 */
	const ltpl = (v: [x: number, y: number]): Loc => loc(ltp(v[0]), ltp(v[1]))
</script>

<svelte:body on:mousemove={onMousemove} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	bind:this={boardElm}
	draggable="false"
	on:dragstart={(e) => e.preventDefault()}
	on:contextmenu={(e) => e.preventDefault()}
	on:mouseup={globalOnMouseUp}
	class="board"
	style={`
			--square-size: ${squareSize}px;
			--raw-width: ${$game.board.width};
			--raw-height: ${$game.board.height};
			--white-color: ${$config.white};
			--black-color: ${$config.black};
			--white-highlight-color: ${$config.whiteHighlight};
			--black-highlight-color: ${$config.blackHighlight};
		`}
>
	{#each $game.board.raw as row, y}
		{#each row as cell, x}
			<div
				class={sqColor(x, y)}
				class:highlight={highlights.has(loc(x, y))}
				class:pieceSquare={cell !== null}
				class:semi={showMoves?.equals(loc(x, y))}
				style={cell !== null ? `--piece-image: url(${cell.image});` : ""}
				on:mousedown={(e) => onPieceMouseDown(e, loc(x, y))}
				on:mouseup={(e) => onPieceMouseUp(e, loc(x, y))}
				on:click={(e) => onPieceClick(e, loc(x, y))}
				on:contextmenu={(e) => e.preventDefault()}
			/>
		{/each}
	{/each}

	<svg class="arrowsContainer">
		<defs>
			{#each [["", $config.arrow], ["Preview", $config.arrowPreview]] as [suffix, color]}
				<marker
					id={`arrow${suffix}`}
					viewBox="0 0 10 10"
					refX="5"
					refY="5"
					markerWidth={squareSize / 10}
					markerHeight={squareSize / 20}
					orient="auto-start-reverse"
				>
					<path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
				</marker>
			{/each}
		</defs>

		{#each arrows as [from, to]}
			<line
				{...(() => {
					const [f, t] = moveArrowHeads(ptll(from), ptll(to), squareSize / 3, squareSize / 4)
					return {
						x1: f[0],
						y1: f[1],
						x2: t[0],
						y2: t[1],
					}
				})()}
				stroke={$config.arrow}
				stroke-width={squareSize / 6.25}
				marker-end="url(#arrow)"
			/>
		{/each}

		{#if previewArrow !== null && !previewArrow[0].equals(previewArrow[1])}
			<line
				{...(() => {
					const [from, to] = moveArrowHeads(ptll(previewArrow[0]), ptll(previewArrow[1]), squareSize / 3, squareSize / 4)
					return {
						x1: from[0],
						y1: from[1],
						x2: to[0],
						y2: to[1],
					}
				})()}
				stroke={$config.arrowPreview}
				stroke-width={squareSize / 6.25}
				marker-end="url(#arrowPreview)"
			/>
		{/if}

		{#each moves?.map((m) => m.abTo) ?? [] as pos}
			<circle cx={ptl(pos.x)} cy={ptl(pos.y)} r={squareSize / 5} class="moveHighlight" />
		{/each}

		{#each previewMoves?.map((m) => m.abTo) ?? [] as pos}
			<circle cx={ptl(pos.x)} cy={ptl(pos.y)} r={squareSize / 5} class="previewMoveHighlight" />
		{/each}
	</svg>

	{#if dragging !== null && draggingImg !== null}
		<div class="dragging" style="--piece-image: url({draggingImg}); --mouse-x: {mousePos[0]}px; --mouse-y: {mousePos[1]}px;" />
	{/if}
</div>

<audio id="moveSound" src="./sounds/move.mp3" />
<audio id="captureSound" src="./sounds/capture.mp3" />

<style lang="scss">
	$full-width: calc(var(--raw-width) * var(--square-size));
	$full-height: calc(var(--raw-height) * var(--square-size));

	.board {
		position: relative;
		width: $full-width;
		height: $full-height;
		display: grid;
		grid-template-columns: repeat(var(--raw-width), var(--square-size));
		grid-template-rows: repeat(var(--raw-height), var(--square-size));
	}

	.dragging {
		@extend .pieceSquare;
		position: absolute;
		transform: translate(-50%, -50%);
		left: var(--mouse-x);
		top: var(--mouse-y);
		width: var(--square-size);
		height: var(--square-size);
		z-index: 100;
		pointer-events: none;
	}

	.arrowsContainer {
		position: absolute;
		pointer-events: none;
		width: $full-width;
		height: $full-height;
		top: 0px;
		left: 0px;
	}

	.moveHighlight {
		fill: black;
		fill-opacity: 0.5;
	}

	.previewMoveHighlight {
		fill: red;
		fill-opacity: 0.25;
	}

	@mixin square {
		width: var(--square-size);
		height: var(--square-size);
		align-items: center;
		justify-content: center;
	}

	.white {
		@include square;
		background-color: var(--white-color);
	}

	.white.highlight {
		background-color: var(--white-highlight-color);
	}

	.black {
		@include square;
		background-color: var(--black-color);
	}

	.black.highlight {
		background-color: var(--black-highlight-color);
	}

	.pieceSquare {
		background-image: var(--piece-image);
		background-position: center;
		background-repeat: no-repeat;
		background-size: 80%;
	}

	.pieceSquare.semi {
		opacity: 0.75;
	}
</style>
