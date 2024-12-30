<script lang="ts">
	import { Section, Register } from 'flowbite-svelte-blocks';
	import { Button, Checkbox, Label, Input, Alert } from 'flowbite-svelte';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let remember = $state(1);
</script>


<section class="w-full h-dvh flex items-center justify-center">
	<main class="w-11/12 sm:w-2/3 md:w-2/4 lg:w-2/5 ">
		<Section name="login">
			<Register href="/">
				<svelte:fragment slot="top">
					<img class="w-8 h-8 mr-2" src="/idevecore.svg" alt="Ideve Core" />
					Ideve Core
				</svelte:fragment>
				<div class="p-6 space-y-4 md:space-y-6 sm:p-8">
					<form method="post" action="?/login" use:enhance class="flex flex-col space-y-6">
						<input type="hidden" name="remember" bind:value={remember} />
						<h3 class="text-xl font-medium text-gray-900 dark:text-white p-0">Sign-in</h3>
						<Label class="space-y-2">
							<span>Your email</span>
							<Input type="email" name="email" placeholder="name@company.com" required />
						</Label>
						<Label class="space-y-2">
							<span>Your password</span>
							<Input type="password" name="password" placeholder="•••••" required />
						</Label>
						<Button type="submit" class="w-full1">Sign in</Button>
						<p class="text-sm font-light text-gray-500 dark:text-gray-400">
							Don’t have an account yet?
							<a
								href="/auth/register"
								class="font-medium text-primary-600 hover:underline dark:text-primary-500"
							>
								Sign up
							</a>
						</p>
					</form>
					<Alert color="red">
						<span class="font-medium">{form?.message ?? ''}</span>
					</Alert>
				</div>
			</Register>
		</Section>
	</main>
</section>