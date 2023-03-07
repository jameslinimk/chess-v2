<script lang="ts">
	import Board from "$lib/board.svelte"
	import { main } from "$lib/main"
	import { tags } from "$lib/meta.js"
	import { onMount } from "svelte"
	import { MetaTags } from "svelte-meta-tags"

	onMount(() => {
		main()
	})
</script>

<MetaTags {...tags("Home", "ChessV2 is TODO", "")} />

<Board />
