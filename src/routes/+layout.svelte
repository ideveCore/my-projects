<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	import {
		Navbar,
		NavBrand,
		Avatar,
		Dropdown,
		DropdownItem,
		DropdownHeader,
		DropdownDivider
	} from 'flowbite-svelte';
	import axios from 'axios';
	import { onMount } from 'svelte';

	let { children, data } = $props();
	let dropdown_open = $state(false);

	const set_theme = (theme: string) => {
		document.documentElement.classList.toggle(
			'dark',
			theme === 'dark' ||
				(!(theme != 'auto') && window.matchMedia('(prefers-color-scheme: dark)').matches)
		);
	};

	const upload_theme = async (theme: string) => {
		const params = new URLSearchParams();
		params.append('theme', theme);
		dropdown_open = false;

		await axios.post('/user/preferences?/update_theme=', params, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});
		data.user_preferences.theme = theme;
		set_theme(theme);
	};

	onMount(() => {
		data.user_preferences.theme = data.user_preferences.theme
			? data.user_preferences.theme
			: 'auto';

		set_theme(data.user_preferences.theme);
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
			if (data.user_preferences.theme == 'auto') {
				set_theme(data.user_preferences.theme);
			}
		});
	});
</script>

<section
	class="flex h-dvh w-full flex-col items-center justify-center bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100"
>
	{#if data.user.email}
		<Navbar class="border-b">
			<NavBrand href="/">
				<img src="/idevecore.svg" class="me-3 h-6 sm:h-9" alt="Ideve Core Logo" />
				<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
					>Ideve Core</span
				>
			</NavBrand>
			<div class="flex items-center md:order-2">
				<Avatar id="avatar-menu" border class="cursor-pointer" />
			</div>
			<Dropdown placement="bottom" triggeredBy="#avatar-menu" bind:open={dropdown_open}>
				<DropdownHeader>
					<span class="block text-sm">{data.user?.name}</span>
					<span class="block truncate text-sm font-medium">{data.user?.email}</span>
				</DropdownHeader>
				<li class="flex items-center justify-center gap-2 p-2">
					<button
						class="
						project-theme flex size-14 cursor-pointer items-center
						justify-center rounded-full border-2 {data.user_preferences.theme == 'light'
							? 'border-indigo-600'
							: ''} bg-gray-100 shadow
					"
						onclick={() => upload_theme('light')}
						aria-label="update_theme"
						data-value="light"
					></button>
					<button
						class="
							project-theme flex size-14 cursor-pointer items-center
							justify-center rounded-full border-2 {data.user_preferences.theme == 'dark'
							? 'border-indigo-600'
							: ''} bg-gray-700 shadow
					"
						onclick={() => upload_theme('dark')}
						aria-label="update_theme"
						data-value="dark"
					></button>
					<button
						class="
							project-theme flex size-14 cursor-pointer items-center
							justify-center rounded-full border-2 {data.user_preferences.theme == 'auto'
							? 'border-indigo-600'
							: ''} shadow"
						style="background: rgb(17,24,39);
							background: linear-gradient(-45deg, #374151 50%, #f3f4f6 50%);"
						onclick={() => upload_theme('auto')}
						aria-label="update_theme"
						data-value="auto"
					></button>
				</li>
				<DropdownDivider />
				<DropdownItem href="/user/preferences">Preferences</DropdownItem>
			</Dropdown>
		</Navbar>
	{/if}
	<main class="h-full w-full overflow-auto">
		<ParaglideJS {i18n}>
			{@render children()}
		</ParaglideJS>
	</main>
</section>
