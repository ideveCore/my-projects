<script lang="ts">
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<section
	class="flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100"
>
	Seja bem vindo ao meu projeto!
</section>
