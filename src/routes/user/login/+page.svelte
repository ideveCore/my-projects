<script lang="ts">
	import { Section, Register } from 'flowbite-svelte-blocks';
	import { Button, Label, Input, Alert } from 'flowbite-svelte';
	import { EnvelopeSolid } from 'flowbite-svelte-icons';
	import { Request } from '../../../request';

	let remember = $state(1);
	let login_message: { error: string; success: string } = $state({
		error: '',
		success: ''
	});

	const do_login = async (event: SubmitEvent) => {
		event.preventDefault();
		const response = await new Request({ url: '?/login' }).form(event.target);
		const message = response.data ? JSON.parse(response.data) : 'Success login';
		login_message.error =
			typeof message == 'object' ? message[1] : (window.location.href = response.location);
	};
</script>

<section class="flex h-full w-full items-center justify-center">
	<main class="w-full sm:w-2/3 md:w-2/4 lg:w-1/3">
		<Section name="login">
			<Register href="/">
				<svelte:fragment slot="top">
					<img class="mr-2 h-8 w-8" src="/idevecore.svg" alt="Ideve Core" />
					Ideve Core
				</svelte:fragment>
				<div class="space-y-4 p-4 sm:p-8 md:space-y-6">
					<form method="post" action="?/login" class="flex flex-col space-y-3" onsubmit={do_login}>
						<input type="hidden" name="remember" bind:value={remember} />
						<h3 class="p-0 text-2xl font-bold text-gray-900 dark:text-white">Sign-in</h3>
						<Label class="space-y-2">
							<span>Your email</span>
							<Input type="email" name="email" placeholder="name@company.com" required>
								<EnvelopeSolid slot="left" class="h-5 w-5 text-gray-500 dark:text-gray-400" />
							</Input>
						</Label>
						<Label class="space-y-2">
							<span>Your password</span>
							<Input type="password" name="password" placeholder="••••••••" required />
						</Label>
						<Button type="submit" class="w-full1">Sign in</Button>
						<p class="text-sm font-light text-gray-500 dark:text-gray-400">
							Don’t have an account yet?
							<a
								href="/user/register"
								class="font-medium text-primary-600 hover:underline dark:text-primary-500"
							>
								Sign up
							</a>
						</p>
					</form>
					{#if login_message.error}
						<Alert color="red">
							<span class="font-medium">{login_message.error}</span>
						</Alert>
					{/if}
				</div>
			</Register>
		</Section>
	</main>
</section>
