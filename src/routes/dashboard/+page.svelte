<script lang="ts">
	import { authStore } from '$lib/stores/auth.js';
	import * as Card from '$lib/components/ui/card/index.js';
</script>

<div class="space-y-4">
	<div>
		<h2 class="text-2xl font-bold tracking-tight">Início</h2>
		<p class="text-muted-foreground">
			Bem-vindo, {$authStore?.email}
		</p>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title>Agendamentos</Card.Title>
				<Card.Description>Visualize e gerencie consultas</Card.Description>
			</Card.Header>
			<Card.Footer>
				<a href="/dashboard/agendamentos" class="text-sm font-medium underline underline-offset-4">
					Ver agendamentos →
				</a>
			</Card.Footer>
		</Card.Root>

		{#if $authStore?.role === 'tutor'}
			<Card.Root>
				<Card.Header>
					<Card.Title>Meus Pets</Card.Title>
					<Card.Description>Cadastre e gerencie seus pets</Card.Description>
				</Card.Header>
				<Card.Footer>
					<a href="/dashboard/pets" class="text-sm font-medium underline underline-offset-4">
						Ver pets →
					</a>
				</Card.Footer>
			</Card.Root>
		{/if}

		{#if $authStore?.role === 'veterinario'}
			<Card.Root>
				<Card.Header>
					<Card.Title>Tutores</Card.Title>
					<Card.Description>Lista de tutores cadastrados</Card.Description>
				</Card.Header>
				<Card.Footer>
					<a href="/dashboard/tutores" class="text-sm font-medium underline underline-offset-4">
						Ver tutores →
					</a>
				</Card.Footer>
			</Card.Root>
		{/if}
	</div>
</div>
