<script lang="ts">
	import { boardWritable } from "./board.js"
	import { configWritable } from "./config.js"

	export let squareSize = 50

	const boardWidth = ($boardWritable?.width ?? 0) * squareSize
	const boardHeight = ($boardWritable?.height ?? 0) * squareSize

	const sqColor = (x: number, y: number) => ((x + y) % 2 === 0 ? "white" : "black")
</script>

{#if $boardWritable}
	<div
		class="board"
		style={`
			--board-width: ${boardWidth}px;
			--board-height: ${boardHeight}px;
			--square-size: ${squareSize}px;
			--white-color: ${$configWritable.white};
			--black-color: ${$configWritable.black};
		`}
	>
		{#each $boardWritable.raw as row, y}
			{#each row as cell, x}
				{#if cell === null}
					<div class={sqColor(x, y)} />
				{:else}
					<div class="{sqColor(x, y)} pieceSquare" style="--piece-image: {cell.image}" />
				{/if}
			{/each}
		{/each}
	</div>
{/if}

<style lang="scss">
	.board {
		width: var(--board-width);
		height: var(--board-height);
		display: grid;
		grid-template-columns: repeat(var(--board-width), var(--square-size));
		grid-template-rows: repeat(var(--board-height), var(--square-size));
	}

	.square {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.black {
		@extend .square;
		background-color: var(--black-color);
	}

	.white {
		@extend .square;
		background-color: var(--white-color);
	}

	.pieceSquare {
		background-image: var(--piece-image);
		background-position: center;
		background-repeat: no-repeat;
		background-size: 80%;
	}
</style>
