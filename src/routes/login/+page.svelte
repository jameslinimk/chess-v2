<script lang="ts">
	import { enhance } from "$app/forms"
	import { tags } from "$lib/meta.js"
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

<MetaTags {...tags("Login", "ChessV2 is TODO", "")} />

<h1>Login</h1>

<form action="?/login" method="POST" use:enhance on:submit={onSubmit}>
	<div>
		<label for="username">Username</label>
		<input id="username" name="username" type="text" required />
	</div>

	<div>
		<label for="password">Password</label>
		<input id="password" name="password" type="password" required />
	</div>

	{#if form?.invalid}
		<p class="error">Username and password is required.</p>
	{/if}

	{#if form?.credentials}
		<p class="error">You have entered the wrong credentials.</p>
	{/if}

	<button type="submit" disabled={submitting}>Log in</button>
</form>
