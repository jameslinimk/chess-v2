<script lang="ts">
	import { enhance } from "$app/forms"
	import { tags } from "$lib/meta"
	import { MetaTags } from "svelte-meta-tags"
	import type { ActionData } from "./$types"
	import { avatarMaxSize, avatarMaxSizeMB, imageTypes } from "./config"

	export let form: ActionData

	let submitting = false
	let invalid = false
	const onSubmit = () => (submitting = true)

	const onChange = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
		invalid = false

		const image = (event?.target as any)?.files?.[0] as File
		if (!image) return

		if (!imageTypes.includes(image.type)) {
			form = { type: true }
			invalid = true
			return
		}

		if (image.size > avatarMaxSize) {
			form = { size: true }
			invalid = true
			return
		}
	}

	let previousForm: ActionData | null
	$: if (form) {
		if (form !== previousForm) {
			previousForm = form
			submitting = false
		}
	}

	$: disabled = invalid || submitting
</script>

<MetaTags {...tags("Upload", "ChessV2 is TODO", "")} />

<h1>Upload avatar</h1>

<form action="?/upload" method="POST" use:enhance on:submit={onSubmit}>
	<div>
		<label for="image">Image</label>
		<input id="image" name="image" type="file" accept=".png,.jpg,.jpeg,.webp" on:change={onChange} required />
	</div>

	{#if form?.nsfw}
		<p class="error">Image is NSFW.</p>
	{/if}

	{#if form?.size}
		<p class="error">Image is too large ({avatarMaxSizeMB}mb limit).</p>
	{/if}

	{#if form?.type}
		<p class="error">Image is not a valid type (png, jpg, jpeg, webp).</p>
	{/if}

	<button type="submit" {disabled}>Upload</button>
</form>
