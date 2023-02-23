<script lang="ts">
	import { boardWritable } from "./board.js"
	import { configWritable } from "./config.js"
	import { loc, type Loc } from "./util.js"
	import { ValueSet } from "./ValueSet.js"

	export let squareSize = 50
	const sqColor = (x: number, y: number) => ((x + y) % 2 === 0 ? "white" : "black")

	let highlights = new ValueSet<Loc>()
	let arrows = new ValueSet<[Loc, Loc]>()

	const onClick = (event: MouseEvent, pos: Loc) => {
		console.log("Test", pos)
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

{#if $boardWritable}
	<div
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
					class="{sqColor(x, y)} {cell === null ? '' : 'pieceSquare'} {highlights.has(loc(x, y)) ? 'highlight' : ''}"
					style={cell === null ? "" : `--piece-image: url(${cell.image})`}
					on:click={(e) => onClick(e, loc(x, y))}
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
</style>
