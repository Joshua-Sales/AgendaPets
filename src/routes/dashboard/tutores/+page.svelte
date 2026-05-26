<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.js';
	import { apiFetch } from '$lib/api.js';
	import type { Tutor } from '$lib/types.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Users } from 'lucide-svelte';

	let tutores = $state<Tutor[]>([]);
	let loading = $state(true);
	let erro = $state('');

	onMount(async () => {
		if ($authStore?.role !== 'veterinario') {
			goto('/dashboard');
			return;
		}
		loading = true;
		try {
			const res = await apiFetch('/api/tutores');
			tutores = await res.json();
		} catch {
			erro = 'Erro ao carregar tutores';
		} finally {
			loading = false;
		}
	});
</script>

<div class="space-y-4">
	<div>
		<div class="flex items-center gap-2">
			<Users class="h-6 w-6 text-muted-foreground" />
			<h2 class="text-2xl font-bold tracking-tight">Tutores</h2>
		</div>
		<p class="text-muted-foreground">Tutores cadastrados no sistema</p>
	</div>

	{#if erro}
		<p class="text-sm text-destructive">{erro}</p>
	{/if}

	{#if loading}
		<p class="text-sm text-muted-foreground">Carregando...</p>
	{:else}
		<div class="rounded-md border">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Nome</Table.Head>
						<Table.Head>E-mail</Table.Head>
						<Table.Head>Telefone</Table.Head>
						<Table.Head>Cadastrado em</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if tutores.length === 0}
						<Table.Row>
							<Table.Cell colspan={4} class="h-24 text-center text-muted-foreground">
								Nenhum tutor cadastrado
							</Table.Cell>
						</Table.Row>
					{:else}
						{#each tutores as t}
							<Table.Row>
								<Table.Cell class="font-medium">{t.nome}</Table.Cell>
								<Table.Cell>{t.email}</Table.Cell>
								<Table.Cell>{t.telefone}</Table.Cell>
								<Table.Cell>
									{t.criadoEm ? new Date(String(t.criadoEm)).toLocaleDateString('pt-BR') : '—'}
								</Table.Cell>
							</Table.Row>
						{/each}
					{/if}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</div>
