<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth.js';
	import { apiFetch } from '$lib/api.js';
	import type { Pet } from '$lib/types.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { PawPrint, Plus } from 'lucide-svelte';

	let pets = $state<Pet[]>([]);
	let loading = $state(true);
	let erro = $state('');

	let dialogOpen = $state(false);
	let petNome = $state('');
	let petTipo = $state('');
	let petRaca = $state('');
	let petLoading = $state(false);
	let petErro = $state('');

	async function carregarPets() {
		loading = true;
		erro = '';
		try {
			const res = await apiFetch('/api/pets');
			pets = await res.json();
		} catch {
			erro = 'Erro ao carregar pets';
		} finally {
			loading = false;
		}
	}

	async function cadastrarPet() {
		petErro = '';
		if (!petNome || !petTipo) {
			petErro = 'Nome e tipo são obrigatórios';
			return;
		}
		petLoading = true;
		try {
			const res = await apiFetch('/api/pets', {
				method: 'POST',
				body: JSON.stringify({ nome: petNome, tipo: petTipo, raca: petRaca })
			});
			const data = await res.json();
			if (!res.ok) {
				petErro = data.erro ?? 'Erro ao cadastrar pet';
				return;
			}
			dialogOpen = false;
			petNome = '';
			petTipo = '';
			petRaca = '';
			await carregarPets();
		} catch {
			petErro = 'Erro de conexão';
		} finally {
			petLoading = false;
		}
	}

	onMount(carregarPets);
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div>
			<div class="flex items-center gap-2">
				<PawPrint class="h-6 w-6 text-muted-foreground" />
				<h2 class="text-2xl font-bold tracking-tight">Meus Pets</h2>
			</div>
			<p class="text-muted-foreground">Pets cadastrados na sua conta</p>
		</div>
		{#if $authStore?.role === 'tutor'}
			<Dialog.Root bind:open={dialogOpen}>
				<Dialog.Trigger>
					<Button onclick={() => (dialogOpen = true)} class="gap-2">
					<Plus class="h-4 w-4" />
					Novo Pet
				</Button>
				</Dialog.Trigger>
				<Dialog.Content class="sm:max-w-md">
					<Dialog.Header>
						<Dialog.Title>Cadastrar Pet</Dialog.Title>
						<Dialog.Description>Informe os dados do seu pet</Dialog.Description>
					</Dialog.Header>
					<div class="space-y-4 py-2">
						{#if petErro}
							<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
								{petErro}
							</p>
						{/if}
						<div class="space-y-2">
							<Label>Nome</Label>
							<Input bind:value={petNome} placeholder="Ex: Rex" />
						</div>
						<div class="space-y-2">
							<Label>Tipo / Espécie</Label>
							<Input bind:value={petTipo} placeholder="Ex: Cachorro, Gato" />
						</div>
						<div class="space-y-2">
							<Label>Raça</Label>
							<Input bind:value={petRaca} placeholder="Ex: Labrador (opcional)" />
						</div>
					</div>
					<Dialog.Footer>
						<Button class="w-full" onclick={cadastrarPet} disabled={petLoading}>
							{petLoading ? 'Salvando...' : 'Salvar'}
						</Button>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		{/if}
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
						<Table.Head>Tipo</Table.Head>
						<Table.Head>Raça</Table.Head>
						<Table.Head>Cadastrado em</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if pets.length === 0}
						<Table.Row>
							<Table.Cell colspan={4} class="h-24 text-center text-muted-foreground">
								Nenhum pet cadastrado
							</Table.Cell>
						</Table.Row>
					{:else}
						{#each pets as pet}
							<Table.Row>
								<Table.Cell class="font-medium">{pet.nome}</Table.Cell>
								<Table.Cell>{pet.tipo}</Table.Cell>
								<Table.Cell>{pet.raca || '—'}</Table.Cell>
								<Table.Cell>
									{pet.criadoEm
										? new Date(String(pet.criadoEm)).toLocaleDateString('pt-BR')
										: '—'}
								</Table.Cell>
							</Table.Row>
						{/each}
					{/if}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</div>
