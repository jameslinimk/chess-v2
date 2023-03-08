<script lang="ts">
	import ColorPicker from "svelte-awesome-color-picker"
	import { config } from "./config.js"

	interface Setting {
		type: "color" | "text"
		name: string
		value?: string
	}

	const settings: Setting[] = [
		{
			type: "color",
			name: "White squares color",
			value: $config.white,
		},
		{
			type: "text",
			name: "Test",
			value: "test",
		},
	]

	$: {
		settings.forEach((setting) => {
			if (setting.type === "color") {
				$config[setting.name] = setting.value
			}
		})
	}
</script>

{#each settings as setting, i}
	{#if setting.type === "color"}
		<ColorPicker bind:hex={setting.value} isAlpha={false} label={setting.name} />
	{:else}
		<div>
			<label for={`${i}`}>{setting.name}</label>
			<input id={`${i}`} name={`${i}`} type="text" bind:value={setting.value} />
		</div>
	{/if}
{/each}
