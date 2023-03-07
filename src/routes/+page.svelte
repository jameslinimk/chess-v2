<script lang="ts">
	import Board from "$lib/chess/board.svelte"
	import { tags } from "$lib/meta.js"
	import Settings from "$lib/settings.svelte"
	import { MetaTags } from "svelte-meta-tags"
</script>

<MetaTags {...tags("Home", "ChessV2 is TODO", "")} />

<Board />
<Settings />
