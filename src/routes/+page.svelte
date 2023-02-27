<script lang="ts">
	import Board from "$lib/board.svelte"
	import { main } from "$lib/main"
	import { onMount } from "svelte"

	onMount(() => {
		main()
	})
</script>

<Board />
