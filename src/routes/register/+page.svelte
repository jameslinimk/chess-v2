<script lang="ts">
	import { enhance } from "$app/forms"
	import { tags } from "$lib/meta"
	import { MetaTags } from "svelte-meta-tags"
	import type { ActionData } from "./$types"

	export let form: ActionData

	let submitting = false
	const onSubmit = () => (submitting = true)

	let previousForm: ActionData | null
	$: if (form) {
		if (form !== previousForm) {
			previousForm = form
			submitting = false
		}
	}
</script>

<MetaTags {...tags("Register", "ChessV2 is TODO", "")} />

<h1>Register</h1>

<form action="?/register" method="POST" use:enhance on:submit={onSubmit}>
	<div>
		<label for="username">Username</label>
		<input id="username" name="username" type="text" required />
	</div>

	<div>
		<label for="password">Password</label>
		<input id="password" name="password" type="password" required />
	</div>

	{#if form?.user}
		<p class="error">Username is taken.</p>
	{/if}

	{#if form?.password}
		<p class="error">Password must be at least 8 characters, have 1 letter, 1 number and 1 special character</p>
	{/if}

	<button type="submit" disabled={submitting}>Register</button>
</form>
