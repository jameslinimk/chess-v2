<script>
	import { main } from "$lib/main"
	import { onMount } from "svelte"
	import "../app.css"

	onMount(() => {
		main()
	})
</script>

<slot />
