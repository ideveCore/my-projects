<script lang="ts">
	import { Section, Register } from 'flowbite-svelte-blocks';
	import { Alert, Button, Helper, Input, Label, Popover } from 'flowbite-svelte';
	import { CheckOutline, CloseOutline } from 'flowbite-svelte-icons';
	import { Request } from '../../../../request';
	import { validate } from '../../../../utils';

	type UserInput = {
		value: string;
	};

	let { data } = $props();

	let old_password: UserInput = $state({
		value: ''
	});
	let user_password: UserInput = $state({
		value: ''
	});
	let password_details = $state(
		validate.password_test.validate('', { details: true }).reduce((acc, item) => {
			acc[item.validation] = item;
			return acc;
		}, {})
	);
	let messages: { error: string; success: string } = $state({
		error: '',
		success: ''
	});

	$effect(() => {
		password_details = validate.password_test
			.validate(user_password.value, { details: true })
			.reduce((acc, item) => {
				acc[item.validation] = item;
				return acc;
			}, {});
	});

	const do_save = async (event: SubmitEvent) => {
		event.preventDefault();
		if (old_password.value && user_password.value) {
			if (!validate.password(user_password.value)) {
				messages.error = 'The password is not in accordance with the rules';
				return;
			}
		} else if (
			(old_password.value.length > 0 && user_password.value.length === 0) ||
			(user_password.value.length > 0 && old_password.value.length == 0)
		) {
			messages.error = 'It is necessary to fill all fields!';
			return;
		}

		const response = await new Request({ url: '/user/register?/register=' }).form(event.target);
		const message = response.data ? JSON.parse(response.data) : 'Success login';
		if (typeof message == 'object') {
			messages.error = message[1];
		} else {
			messages.success = message;
			window.location.href = response.location;
		}
	};
</script>

<Section name="register">
	<Register href="/">
		<div class="space-y-4 p-6 sm:p-8 md:space-y-6">
			<form
				method="post"
				action="/user/register?/register="
				class="flex flex-col space-y-2"
				onsubmit={(event) => do_save(event)}
			>
				<input type="hidden" name="redirect" value="/user/preferences" />
				<h3 class="p-0 text-xl font-medium text-gray-900 dark:text-white">Change Password</h3>
				<Label class="space-y-2">
					<span>Old Password</span>
					<Input
						type="password"
						name="old_password"
						placeholder="•••••••"
						required
						bind:value={old_password.value}
					/>
				</Label>
				<Label class="space-y-1">
					<span>New password</span>
					<Input
						type="password"
						name="password"
						placeholder="•••••••"
						id="password"
						color={validate.password(user_password.value) ? 'green' : 'base'}
						required
						bind:value={user_password.value}
					/>
					{#if user_password.value.trim() != '' && !validate.password(user_password.value)}
						<Helper color="red"
							><span class="font-medium">The password is not in accordance with the rules</span>
						</Helper>
					{/if}
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
			<Popover class="text-sm" triggeredBy="#password" placement="bottom">
				<h3 class="font-semibold text-gray-900 dark:text-white">Must have at least 8 characters</h3>
				<div class="grid grid-cols-4 gap-2">
					<div
						class="h-1 {Object.keys(password_details).length + 1 <= 4
							? `bg-orange-300 dark:bg-orange-400`
							: 'bg-gray-200 dark:bg-gray-600'}"
					></div>
					<div
						class="h-1 {Object.keys(password_details).length + 1 <= 3
							? `bg-orange-300 dark:bg-orange-400`
							: 'bg-gray-200 dark:bg-gray-600'}"
					></div>
					<div
						class="h-1 {Object.keys(password_details).length + 1 <= 2
							? `bg-orange-300 dark:bg-orange-400`
							: 'bg-gray-200 dark:bg-gray-600'}"
					></div>
					<div
						class="h-1 {Object.keys(password_details).length + 1 <= 1
							? `bg-orange-300 dark:bg-orange-400`
							: 'bg-gray-200 dark:bg-gray-600'}"
					></div>
				</div>
				<p class="py-2">It’s better to have:</p>
				<ul>
					{#each validate.password_rules as rule, i}
						<li class="mb-1 flex items-center">
							{#if password_details[rule.validation]}
								<CloseOutline class="me-2 h-4 w-4 text-gray-300 dark:text-gray-400" />
							{:else}
								<CheckOutline class="me-2 h-4 w-4 text-green-400 dark:text-green-500" />
							{/if}
							{rule.message}
						</li>
					{/each}
				</ul>
			</Popover>
		</div>
	</Register>
</Section>
