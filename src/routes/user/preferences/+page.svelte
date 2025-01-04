<script lang="ts">
	import { Section } from 'flowbite-svelte-blocks';
	import { ChangePassword, UserDetails } from './components/main';

	let { data } = $props();
</script>

<section class="flex flex-col items-stretch justify-start gap-5 pt-5 pb-5">
	<UserDetails {data} />
	<ChangePassword {data} />
</section>
