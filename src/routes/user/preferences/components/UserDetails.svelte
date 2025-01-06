<script lang="ts">
	import { Section, Register } from 'flowbite-svelte-blocks';
	import { Alert, Button, Fileupload, Input, Label, P } from 'flowbite-svelte';
	import { Request } from '$lib/request';

	let { data } = $props();
	let user_name: { value: string } = $state({
		value: data.user?.name
	});
	let user_birth_date: { value: Date | null } = $state({
		value: data.user?.birth_date
	});

	let user_avatar: { id: string } = $state({
		id: 'user_avatar'
	});

	let messages: { error: string; success: string } = $state({
		error: '',
		success: ''
	});

	const do_save = async (event: SubmitEvent) => {
		event.preventDefault();
		if (user_name.value.trim().length <= 3 || user_name.value.trim().length > 30) {
			messages.error = 'The name should contain between 4 and 30 characters';
			return;
		}

		const response = await new Request({ url: '/user/register?/register=' }).form(event.target);
		const message = response.data ? JSON.parse(response.data) : 'Success login';
		if (typeof message == 'object') {
			messages.error = message[1];
		} else {
			messages.success = 'Successfully saved';
			console.log(response);
			// window.location.href = response.location;
		}
	};
</script>

<Section name="register">
	<Register href="/user/register?/register">
		<div class="space-y-4 p-6 sm:p-8 md:space-y-6">
			<form
				method="post"
				action="/user/register?/register="
				class="flex flex-col space-y-2"
				onsubmit={(event) => do_save(event)}
			>
				<input type="hidden" name="redirect" value="/user/preferences" />
				<h3 class="p-0 text-xl font-medium text-gray-900 dark:text-white">User details</h3>
				<Label class="space-y-2">
					<span>Email</span>
					<p class="p text-slate-600 dark:text-slate-400">{data.user.email}</p>
				</Label>
				<Label class="space-y-2">
					<span>Your Name</span>
					<Input
						type="text"
						name="name"
						placeholder="Your name"
						class="w-1/2"
						required
						bind:value={user_name.value}
					/>
				</Label>
				<Label class="space-y-2">
					<span>Your Birth Date</span>
					<Input type="date" name="birth_date" bind:value={user_birth_date.value} class="w-1/2" />
				</Label>
				<Label class="space-y-2">
					<span>Your Avatar</span>
					<Fileupload name="avatar" {...user_avatar} class="w-1/2" />
				</Label>
				<Button type="submit" class="w-24">Save</Button>
			</form>
			{#if messages.error}
				<Alert border color="red" onclick={() => (messages.error = '')}>
					<span class="font-medium">{messages.error}</span>
				</Alert>
			{/if}
			{#if messages.success}
				<Alert border color="green" onclick={() => (messages.success = '')}>
					<span class="font-medium">{messages.success}</span>
				</Alert>
			{/if}
		</div>
	</Register>
</Section>
