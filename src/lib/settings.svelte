<script lang="ts">
	import ColorPicker from "svelte-awesome-color-picker"
	import { config } from "./config"

	interface Setting {
		type: "color" | "text"
		display: string
		/**
		 * The name of the setting in the config object
		 */
		name: string
		value?: string
	}

	const settings: Setting[] = [
		{
			type: "color",
			display: "White squares color",
			name: "white",
			value: $config.white,
		},
		{
			type: "color",
			display: "Black squares color",
			name: "black",
			value: $config.black,
		},
	]

	let saveCallback: NodeJS.Timeout | null = null

	$: settings.forEach((setting) => {
		;($config as any)[setting.name] = setting.value

		if (saveCallback) clearTimeout(saveCallback)
		saveCallback = setTimeout(() => $config.save(), 500)
	})
</script>

{#each settings as setting, i}
	{#if setting.type === "color"}
		<ColorPicker bind:hex={setting.value} label={setting.display} />
	{:else}
		<div>
			<label for={`${i}`}>{setting.display}</label>
			<input id={`${i}`} name={`${i}`} type="text" bind:value={setting.value} />
		</div>
	{/if}
{/each}
