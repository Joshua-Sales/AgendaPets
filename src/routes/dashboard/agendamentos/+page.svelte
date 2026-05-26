<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth.js';
	import { apiFetch } from '$lib/api.js';
	import type { Agendamento } from '$lib/types.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { CalendarDays, Plus, Pencil, Trash2 } from 'lucide-svelte';

	let agendamentos = $state<Agendamento[]>([]);
	let loading = $state(true);
	let erro = $state('');

	// Sheet: novo agendamento (vet)
	let newSheetOpen = $state(false);
	let tutores = $state<{ id: number; nome: string }[]>([]);
	let pets = $state<{ id: number; nome: string; tipo: string }[]>([]);
	let selectedTutorId = $state('');
	let selectedPetId = $state('');
	let selectedData = $state('');
	let selectedHora = $state('');
	let newLoading = $state(false);
	let newErro = $state('');

	// Sheet: editar agendamento
	let editSheetOpen = $state(false);
	let editTarget = $state<Agendamento | null>(null);
	let editData = $state('');
	let editHora = $state('');
	let editStatus = $state('');
	let editLoading = $state(false);
	let editErro = $state('');

	async function carregarAgendamentos() {
		loading = true;
		erro = '';
		try {
			const res = await apiFetch('/api/agendamentos');
			agendamentos = await res.json();
		} catch {
			erro = 'Erro ao carregar agendamentos';
		} finally {
			loading = false;
		}
	}

	async function carregarPets(tutorId: string) {
		pets = [];
		selectedPetId = '';
		if (!tutorId) return;
		const res = await apiFetch(`/api/pets?tutor_id=${tutorId}`);
		pets = await res.json();
	}

	async function atualizarStatus(id: number, status: string) {
		await apiFetch(`/api/agendamentos/${id}/status`, {
			method: 'PATCH',
			body: JSON.stringify({ status })
		});
		await carregarAgendamentos();
	}

	async function criarAgendamento() {
		newErro = '';
		newLoading = true;
		try {
			const res = await apiFetch('/api/agendamentos', {
				method: 'POST',
				body: JSON.stringify({ pet_id: parseInt(selectedPetId), data: selectedData, hora: selectedHora })
			});
			const data = await res.json();
			if (!res.ok) { newErro = data.erro ?? 'Erro ao criar agendamento'; return; }
			newSheetOpen = false;
			selectedTutorId = '';
			selectedPetId = '';
			selectedData = '';
			selectedHora = '';
			await carregarAgendamentos();
		} catch {
			newErro = 'Erro de conexão';
		} finally {
			newLoading = false;
		}
	}

	function abrirEdicao(a: Agendamento) {
		editTarget = a;
		editData = a.data;
		editHora = a.hora;
		editStatus = a.status;
		editErro = '';
		editSheetOpen = true;
	}

	async function salvarEdicao() {
		if (!editTarget) return;
		editErro = '';
		editLoading = true;
		try {
			const res = await apiFetch(`/api/agendamentos/${editTarget.id}`, {
				method: 'PUT',
				body: JSON.stringify({ data: editData, hora: editHora, status: editStatus })
			});
			const data = await res.json();
			if (!res.ok) { editErro = data.erro ?? 'Erro ao salvar'; return; }
			editSheetOpen = false;
			await carregarAgendamentos();
		} catch {
			editErro = 'Erro de conexão';
		} finally {
			editLoading = false;
		}
	}

	async function deletarAgendamento(id: number) {
		await apiFetch(`/api/agendamentos/${id}`, { method: 'DELETE' });
		await carregarAgendamentos();
	}

	const badgeVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
		pendente: 'secondary',
		confirmado: 'default',
		cancelado: 'destructive'
	};

	onMount(async () => {
		await carregarAgendamentos();
		if ($authStore?.role === 'veterinario') {
			const res = await apiFetch('/api/tutores');
			tutores = await res.json();
		}
	});
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div>
			<div class="flex items-center gap-2">
				<CalendarDays class="h-6 w-6 text-muted-foreground" />
				<h2 class="text-2xl font-bold tracking-tight">Agendamentos</h2>
			</div>
			<p class="text-muted-foreground">Consultas marcadas</p>
		</div>
		{#if $authStore?.role === 'veterinario'}
			<Sheet.Root bind:open={newSheetOpen}>
				<Sheet.Trigger>
					<Button onclick={() => (newSheetOpen = true)} class="gap-2">
						<Plus class="h-4 w-4" />
						Nova Consulta
					</Button>
				</Sheet.Trigger>
				<Sheet.Content side="right" class="w-[400px]">
					<Sheet.Header>
						<Sheet.Title>Agendar Consulta</Sheet.Title>
						<Sheet.Description>Selecione tutor, pet e horário</Sheet.Description>
					</Sheet.Header>
					<div class="space-y-4 py-4">
						{#if newErro}
							<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{newErro}</p>
						{/if}
						<div class="space-y-2">
							<Label>Tutor</Label>
							<Select.Root type="single" bind:value={selectedTutorId} onValueChange={carregarPets}>
								<Select.Trigger class="w-full">
									{tutores.find((t) => String(t.id) === selectedTutorId)?.nome ?? 'Selecione...'}
								</Select.Trigger>
								<Select.Content>
									{#each tutores as t}
										<Select.Item value={String(t.id)}>{t.nome}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
						<div class="space-y-2">
							<Label>Pet</Label>
							<Select.Root type="single" bind:value={selectedPetId} disabled={!pets.length}>
								<Select.Trigger class="w-full">
									{pets.find((p) => String(p.id) === selectedPetId)?.nome ?? 'Selecione...'}
								</Select.Trigger>
								<Select.Content>
									{#each pets as p}
										<Select.Item value={String(p.id)}>{p.nome} ({p.tipo})</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
						<div class="space-y-2">
							<Label>Data</Label>
							<Input type="date" bind:value={selectedData} />
						</div>
						<div class="space-y-2">
							<Label>Hora</Label>
							<Input type="time" bind:value={selectedHora} />
						</div>
					</div>
					<Sheet.Footer>
						<Button
							class="w-full"
							onclick={criarAgendamento}
							disabled={newLoading || !selectedPetId || !selectedData || !selectedHora}
						>
							{newLoading ? 'Agendando...' : 'Confirmar Agendamento'}
						</Button>
					</Sheet.Footer>
				</Sheet.Content>
			</Sheet.Root>
		{/if}
	</div>

	{#if erro}
		<p class="text-sm text-destructive">{erro}</p>
	{/if}

	<!-- Edit sheet -->
	<Sheet.Root bind:open={editSheetOpen}>
		<Sheet.Content side="right" class="w-[400px]">
			<Sheet.Header>
				<Sheet.Title>Editar Agendamento</Sheet.Title>
				<Sheet.Description>Altere data, hora ou status</Sheet.Description>
			</Sheet.Header>
			<div class="space-y-4 py-4">
				{#if editErro}
					<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{editErro}</p>
				{/if}
				<div class="space-y-2">
					<Label>Data</Label>
					<Input type="date" bind:value={editData} />
				</div>
				<div class="space-y-2">
					<Label>Hora</Label>
					<Input type="time" bind:value={editHora} />
				</div>
				<div class="space-y-2">
					<Label>Status</Label>
					<Select.Root type="single" bind:value={editStatus}>
						<Select.Trigger class="w-full">
							{editStatus || 'Selecione...'}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="pendente">pendente</Select.Item>
							<Select.Item value="confirmado">confirmado</Select.Item>
							<Select.Item value="cancelado">cancelado</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			</div>
			<Sheet.Footer>
				<Button class="w-full" onclick={salvarEdicao} disabled={editLoading}>
					{editLoading ? 'Salvando...' : 'Salvar Alterações'}
				</Button>
			</Sheet.Footer>
		</Sheet.Content>
	</Sheet.Root>

	{#if loading}
		<p class="text-sm text-muted-foreground">Carregando...</p>
	{:else}
		<div class="rounded-md border">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Data</Table.Head>
						<Table.Head>Hora</Table.Head>
						<Table.Head>Pet</Table.Head>
						<Table.Head>{$authStore?.role === 'veterinario' ? 'Tutor' : 'Veterinário'}</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Ações</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if agendamentos.length === 0}
						<Table.Row>
							<Table.Cell colspan={6} class="h-24 text-center text-muted-foreground">
								Nenhum agendamento encontrado
							</Table.Cell>
						</Table.Row>
					{:else}
						{#each agendamentos as a}
							<Table.Row>
								<Table.Cell>{a.data}</Table.Cell>
								<Table.Cell>{a.hora}</Table.Cell>
								<Table.Cell class="font-medium">{a.petNome ?? '—'}</Table.Cell>
								<Table.Cell>
									{$authStore?.role === 'veterinario' ? (a.tutorNome ?? '—') : (a.veterinarioNome ?? '—')}
								</Table.Cell>
								<Table.Cell>
									<Badge variant={badgeVariant[a.status] ?? 'secondary'}>{a.status}</Badge>
								</Table.Cell>
								<Table.Cell>
									<div class="flex items-center gap-2">
										{#if a.status === 'pendente'}
											<Button size="sm" onclick={() => atualizarStatus(a.id, 'confirmado')}>
												Confirmar
											</Button>
											<Button size="sm" variant="secondary" onclick={() => atualizarStatus(a.id, 'cancelado')}>
												Cancelar
											</Button>
										{/if}
										<Button
											size="sm"
											variant="ghost"
											class="h-8 w-8 p-0"
											onclick={() => abrirEdicao(a)}
											title="Editar"
										>
											<Pencil class="h-4 w-4" />
										</Button>
										<Button
											size="sm"
											variant="ghost"
											class="h-8 w-8 p-0 text-destructive hover:text-destructive"
											onclick={() => deletarAgendamento(a.id)}
											title="Excluir"
										>
											<Trash2 class="h-4 w-4" />
										</Button>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					{/if}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</div>
