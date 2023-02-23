<script lang="ts">
	import { boardWritable } from "./board.js"
	import { configWritable } from "./config.js"
	import { loc, type Loc } from "./util.js"
	import { ValueSet } from "./valueSet.js"

	export let squareSize = 50
	const sqColor = (x: number, y: number) => ((x + y) % 2 === 0 ? "white" : "black")

	let board: HTMLDivElement
	let boardOffset: [x: number, y: number] = [0, 0]
	$: boardOffset = [board?.offsetLeft ?? 0, board?.offsetTop ?? 0]

	let highlights = new ValueSet<Loc>()
	let arrows = new ValueSet<[Loc, Loc]>()

	let dragging: Loc | null = null
	let draggingImg: string | null = null
	$: if (dragging !== null) {
		draggingImg = $boardWritable?.get(dragging)?.image ?? null
	}

	let showMoves: Loc | null = null
	let moves = new ValueSet<Loc>()
	$: if (showMoves !== null) {
		moves = new ValueSet($boardWritable?.pieceMoves(showMoves)?.map((m) => m.abTo) ?? [])
	}

	let mousePos: [x: number, y: number] = [0, 0]
	const onMousemove = (event: MouseEvent) => (mousePos = [event.clientX - boardOffset[0], event.clientY - boardOffset[1]])

	const onMouseUp = (event: MouseEvent) => (dragging = null)
	const onMouseDown = (event: MouseEvent, pos: Loc) => (dragging = pos)

	const onClick = (event: MouseEvent, pos: Loc) => {
		const piece = $boardWritable?.get(pos)
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
</script>

<svelte:body on:mousemove={onMousemove} />

{#if $boardWritable}
	<div
		bind:this={board}
		on:mouseup={onMouseUp}
		draggable="false"
		on:dragstart={(e) => e.preventDefault()}
		class="board"
		style={`
			--square-size: ${squareSize}px;
			--raw-width: ${$boardWritable.width};
			--raw-height: ${$boardWritable.height};
			--white-color: ${$configWritable.white};
			--black-color: ${$configWritable.black};
			--white-highlight-color: ${$configWritable.whiteHighlight};
			--black-highlight-color: ${$configWritable.blackHighlight};
		`}
	>
		{#each $boardWritable.raw as row, y}
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
			<line x1="0" y1="50" x2="250" y2="50" stroke="#000" stroke-width="8" marker-end="url(#arrowhead)" />
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
