<script lang="ts">
	import { onMount } from "svelte"
	import { main } from "../lib/main.js"

	let board: HTMLDivElement
	onMount(() => {
		main(board)
	})
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<div bind:this={board} />
