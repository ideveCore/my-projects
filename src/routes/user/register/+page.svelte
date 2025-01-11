<script lang="ts">
	import { Section, Register } from 'flowbite-svelte-blocks';
	import { Alert, Button, Helper, Input, Label, Popover } from 'flowbite-svelte';
	import { EnvelopeSolid, CheckOutline, CloseOutline } from 'flowbite-svelte-icons';
	import { validate } from '../../../utils';
	import { Request } from '$lib';

	type FormInput = {
		value: string;
	};

	let password_details = $state(
		// @ts-ignore
		validate.password_test.validate('', { details: true }).reduce((acc, item) => {
			acc[item.validation] = item;
			return acc;
		}, {})
	);
	let user_name: FormInput = $state({
		value: ''
	});
	let user_email: FormInput = $state({
		value: ''
	});
	let user_password: FormInput = $state({
		value: ''
	});
	let user_password_confirm: FormInput = $state({
		value: ''
	});

	let messages: { error: string; success: string } = $state({
		error: '',
		success: ''
	});

	$effect(() => {
		password_details = validate.password_test
			.validate(user_password.value, { details: true })
			// @ts-ignore
			.reduce((acc, item) => {
				acc[item.validation] = item;
				return acc;
			}, {});
	});

	const do_register = async (event: SubmitEvent) => {
		event.preventDefault();
		if (user_name.value.trim().length <= 3 || user_name.value.trim().length > 30) {
			messages.error = 'The name should contain between 4 and 30 characters';
			return;
		}
		if (!validate.email(user_email.value)) {
			messages.error = 'The email is not valid';
			return;
		}
		if (!validate.password(user_password.value)) {
			messages.error = 'The password does not follow the necessary rules';
			return;
		}
		if (user_password_confirm.value != user_password.value) {
			messages.error = 'Password not match';
			return;
		}

		const response = await new Request({ url: '?/register' }).form(event.target!);
		const message = response.data ? JSON.parse(response.data) : 'Success login';

		if (typeof message == 'object') {
			messages.error = message[1];
		} else {
			window.location.href = response.location;
		}
	};
</script>

<section class="flex h-dvh w-full items-center justify-center">
	<main class="w-11/12 sm:w-2/3 md:w-2/4 lg:w-2/5">
		<Section name="login">
			<Register href="/">
				<svelte:fragment slot="top">
					<img class="mr-2 h-8 w-8" src="/idevecore.svg" alt="Ideve Core" />
					Ideve Core
				</svelte:fragment>
				<div class="space-y-4 p-6 sm:p-8 md:space-y-2">
					<form
						method="post"
						action="?/register"
						class="flex flex-col space-y-2"
						onsubmit={(event) => do_register(event)}
					>
						<h3 class="p-0 text-xl font-medium text-gray-900 dark:text-white">Sign-up</h3>
						<Label class="space-y-1">
							<span>Your name</span>
							<Input
								type="text"
								name="name"
								placeholder="Your name"
								bind:value={user_name.value}
								required
							/>
							{#if user_name.value.trim() != '' && (user_name.value.trim().length <= 3 || user_name.value.trim().length > 30)}
								<Helper color="red"
									><span class="font-medium"
										>The name should contain between 4 and 30 characters</span
									>
								</Helper>
							{/if}
						</Label>
						<Label for="input-group-1" class="mb-2 block">Your Email</Label>
						<Input
							id="email"
							type="email"
							name="email"
							placeholder="youremail@provider.com"
							color={validate.email(user_email.value) ? 'green' : 'base'}
							required
							bind:value={user_email.value}
						>
							<EnvelopeSolid slot="left" class="h-5 w-5 text-gray-500 dark:text-gray-400" />
						</Input>
						{#if user_email.value.trim() != '' && !validate.email(user_email.value)}
							<Helper color="red"><span class="font-medium">The email is not valid</span></Helper>
						{/if}
						<Label class="space-y-1">
							<span>Your password</span>
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
									><span class="font-medium">The password does not follow the necessary rules</span>
								</Helper>
							{/if}
						</Label>
						<Label class="space-y-1">
							<span>Confirm password</span>
							<Input
								type="password"
								color={user_password_confirm.value == user_password.value &&
								validate.password(user_password_confirm.value)
									? 'green'
									: 'base'}
								name="confirm_password"
								placeholder="•••••••"
								required
								bind:value={user_password_confirm.value}
							/>
							{#if user_password_confirm.value !== user_password.value}
								<Helper class="mt-2" color="red"
									><span class="font-medium">Password not match</span>
								</Helper>
							{/if}
						</Label>
						<Button type="submit" class="w-full1">Sign up</Button>
						<p class="text-sm font-light text-gray-500 dark:text-gray-400">
							Already have account?
							<a
								href="/user/login"
								class="font-medium text-primary-600 hover:underline dark:text-primary-500"
							>
								Sign-in
							</a>
						</p>
					</form>
					{#if messages.error}
						<Alert border color="red" onclick={() => (messages.error = '')}>
							<span class="font-medium">{messages.error}</span>
						</Alert>
					{/if}
					<Popover class="text-sm" triggeredBy="#password" placement="bottom">
						<h3 class="font-semibold text-gray-900 dark:text-white">
							Must have at least 8 characters
						</h3>
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
	</main>
</section>
