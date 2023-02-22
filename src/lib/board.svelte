<script lang="ts">
	import type { Board } from "./board.js"

	export let board: Board
</script>

<table class="board">
	{#each board.raw as row}
		{#each row as cell}
			{cell}
		{/each}
	{/each}
</table>

<style>
	.board {
		border-spacing: 0px;
		border-collapse: collapse;
	}
	.board th {
		padding: 0.5em;
	}
	.board th + th {
		border-bottom: 1px solid #000;
	}
	.board th:first-child,
	.board td:last-child {
		border-right: 1px solid #000;
	}
	.board tr:last-child td {
		border-bottom: 1px solid;
	}
	.board th:empty {
		border: none;
	}
	.board td {
		width: 1.5em;
		height: 1.5em;
		text-align: center;
		font-size: 32px;
		line-height: 0;
	}
	.board .light {
		background: #eee;
	}
	.board .dark {
		background: #aaa;
	}
</style>
