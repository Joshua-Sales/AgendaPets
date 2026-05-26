<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth.js';
	import { apiFetch } from '$lib/api.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';

	let profile = $state<{ nome: string; email: string; telefone: string } | null>(null);
	let loading = $state(true);
	let erro = $state('');
	let editNome = $state('');
	let editTelefone = $state('');
	let saveLoading = $state(false);
	let saveMsg = $state('');

	async function carregarPerfil() {
		loading = true;
		erro = '';
		try {
			const endpoint =
				$authStore?.role === 'veterinario' ? '/api/veterinarios/me' : '/api/tutores/me';
			const res = await apiFetch(endpoint);
			profile = await res.json();
			if (profile) {
				editNome = profile.nome;
				editTelefone = profile.telefone;
			}
		} catch {
			erro = 'Erro ao carregar perfil';
		} finally {
			loading = false;
		}
	}

	async function salvarPerfil() {
		saveMsg = '';
		saveLoading = true;
		try {
			const endpoint =
				$authStore?.role === 'veterinario' ? '/api/veterinarios/me' : '/api/tutores/me';
			const res = await apiFetch(endpoint, {
				method: 'PUT',
				body: JSON.stringify({ nome: editNome, telefone: editTelefone })
			});
			const data = await res.json();
			if (!res.ok) {
				erro = data.erro ?? 'Erro ao salvar';
				return;
			}
			saveMsg = 'Perfil atualizado com sucesso';
			await carregarPerfil();
		} catch {
			erro = 'Erro de conexão';
		} finally {
			saveLoading = false;
		}
	}

	onMount(carregarPerfil);
</script>

<div class="max-w-md space-y-4">
	<div>
		<h2 class="text-2xl font-bold tracking-tight">Perfil</h2>
		<p class="text-muted-foreground">Suas informações de conta</p>
	</div>

	{#if loading}
		<p class="text-sm text-muted-foreground">Carregando...</p>
	{:else if erro}
		<p class="text-sm text-destructive">{erro}</p>
	{:else if profile}
		<Card.Root>
			<Card.Header>
				<Card.Title>{profile.nome}</Card.Title>
				<Card.Description>{$authStore?.role === 'veterinario' ? 'Veterinário' : 'Tutor'}</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<Separator />
				{#if saveMsg}
					<p class="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600">{saveMsg}</p>
				{/if}
				<div class="space-y-2">
					<Label>Nome</Label>
					<Input bind:value={editNome} />
				</div>
				<div class="space-y-2">
					<Label>E-mail</Label>
					<Input value={profile.email} disabled />
				</div>
				<div class="space-y-2">
					<Label>Telefone</Label>
					<Input bind:value={editTelefone} />
				</div>
			</Card.Content>
			<Card.Footer>
				<Button onclick={salvarPerfil} disabled={saveLoading}>
					{saveLoading ? 'Salvando...' : 'Salvar alterações'}
				</Button>
			</Card.Footer>
		</Card.Root>
	{/if}
</div>
