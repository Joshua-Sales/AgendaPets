<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.js';
	import { get } from 'svelte/store';

	onMount(() => {
		const session = get(authStore);
		goto(session ? '/dashboard' : '/login');
	});
</script>
