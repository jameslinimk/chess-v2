<script lang="ts">
	import { board } from "./board.js"
	import { configWritable } from "./config.js"
	import { loc, type Loc } from "./util.js"
	import { ValueSet } from "./valueSet.js"

	export let squareSize = 50
	const sqColor = (x: number, y: number) => ((x + y) % 2 === 0 ? "white" : "black")

	let boardElm: HTMLDivElement
	let boardOffset: [x: number, y: number] = [0, 0]
	$: if (boardElm) boardOffset = [boardElm.offsetLeft, boardElm.offsetTop]

	let highlights = new ValueSet<Loc>()
	let arrows: [Loc, Loc][] = []

	let dragging: Loc | null = null
	let draggingImg: string | null = null
	$: if (dragging !== null) {
		draggingImg = $board?.get(dragging)?.image ?? null
		showMoves = dragging
	}

	let showMoves: Loc | null = null
	let moves: Loc[] = []
	$: if (showMoves !== null) {
		moves = $board?.pieceMoves(showMoves)?.map((m) => m.abTo) ?? []
	}

	let mousePos: [x: number, y: number] = [0, 0]
	const onMousemove = (event: MouseEvent) => (mousePos = [event.clientX - boardOffset[0], event.clientY - boardOffset[1]])

	const onMouseUp = (event: MouseEvent) => (dragging = null)
	const onMouseDown = (event: MouseEvent, pos: Loc) => (dragging = pos)

	const onClick = (event: MouseEvent, pos: Loc) => {
		const piece = $board?.get(pos)
		if (piece === null || piece === undefined) {
			highlights = new ValueSet<Loc>()
			return
		}
	}

	const onContext = (event: MouseEvent, pos: Loc) => {
		event.preventDefault()
		if (highlights.has(pos)) {
			highlights.delete(pos)
			highlights = highlights
			return
		}

		highlights.add(pos)
		highlights = highlights
	}

	const ptl = (v: number): number => v * squareSize + squareSize / 2
</script>

<svelte:body on:mousemove={onMousemove} />

{#if $board}
	<div
		bind:this={boardElm}
		on:mouseup={onMouseUp}
		draggable="false"
		on:dragstart={(e) => e.preventDefault()}
		class="board"
		style={`
			--square-size: ${squareSize}px;
			--raw-width: ${$board.width};
			--raw-height: ${$board.height};
			--white-color: ${$configWritable.white};
			--black-color: ${$configWritable.black};
			--white-highlight-color: ${$configWritable.whiteHighlight};
			--black-highlight-color: ${$configWritable.blackHighlight};
		`}
	>
		{#each $board.raw as row, y}
			{#each row as cell, x}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					class={sqColor(x, y)}
					class:highlight={highlights.has(loc(x, y))}
					class:pieceSquare={cell !== null}
					class:semi={dragging?.x === x && dragging?.y === y}
					style={cell !== null ? `--piece-image: url(${cell.image});` : ""}
					on:click={(e) => onClick(e, loc(x, y))}
					on:mousedown={(e) => onMouseDown(e, loc(x, y))}
					on:contextmenu={(e) => onContext(e, loc(x, y))}
				/>
			{/each}
		{/each}

		<svg class="arrows">
			<defs>
				<marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
					<polygon points="0 0, 10 3.5, 0 7" />
				</marker>
			</defs>

			{#each arrows as [from, to]}
				<line x1={ptl(from.x)} y1={ptl(from.y)} x2={ptl(to.x)} y2={ptl(to.y)} stroke="#000000" stroke-width="8" marker-end="url(#arrowhead)" />
			{/each}

			{#each moves as pos}
				<circle cx={ptl(pos.x)} cy={ptl(pos.y)} r={squareSize / 4.5} class="moveHighlight" />
			{/each}
		</svg>

		{#if dragging !== null && draggingImg !== null}
			<div class="dragging" style="--piece-image: url({draggingImg}); --mouse-x: {mousePos[0]}px; --mouse-y: {mousePos[1]}px;" />
		{/if}
	</div>
{/if}

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
	}

	.arrows {
		position: absolute;
		pointer-events: none;
		width: $full-width;
		height: $full-height;
		top: 0px;
		left: 0px;
	}

	.moveHighlight {
		fill: black;
		fill-opacity: 0.75;
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
