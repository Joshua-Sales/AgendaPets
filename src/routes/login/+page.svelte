<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';

	let showRegister = $state(false);
	let loading = $state(false);
	let erro = $state('');

	// Login state
	let loginEmail = $state('');
	let loginSenha = $state('');

	// Register state
	let regNome = $state('');
	let regEmail = $state('');
	let regTelefone = $state('');
	let regSenha = $state('');
	let regRole = $state('tutor');

	async function handleLogin() {
		erro = '';
		loading = true;
		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: loginEmail, senha: loginSenha })
			});
			const data = await res.json();
			if (!res.ok) {
				erro = data.erro ?? 'Erro ao fazer login';
				return;
			}
			authStore.login({ id: data.id ?? 0, email: data.email, role: data.role, token: data.token });
			goto('/dashboard');
		} catch {
			erro = 'Erro de conexão';
		} finally {
			loading = false;
		}
	}

	async function handleRegister() {
		erro = '';
		loading = true;
		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					nome: regNome,
					email: regEmail,
					telefone: regTelefone,
					senha: regSenha,
					role: regRole
				})
			});
			const data = await res.json();
			if (!res.ok) {
				erro = data.erro ?? 'Erro ao cadastrar';
				return;
			}
			// Pre-fill login form with registration data
			loginEmail = regEmail;
			loginSenha = regSenha;
			showRegister = false;
			erro = '';
		} catch {
			erro = 'Erro de conexão';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-background px-4">
	<div class="w-full max-w-md">
		{#if !showRegister}
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-2xl">AgendaPets</Card.Title>
					<Card.Description>Entre com sua conta para continuar</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					{#if erro}
						<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{erro}</p>
					{/if}
					<div class="space-y-2">
						<Label for="email">E-mail</Label>
						<Input id="email" type="email" bind:value={loginEmail} placeholder="seu@email.com" />
					</div>
					<div class="space-y-2">
						<Label for="senha">Senha</Label>
						<Input id="senha" type="password" bind:value={loginSenha} placeholder="••••••••" />
					</div>
				</Card.Content>
				<Card.Footer class="flex flex-col gap-2">
					<Button class="w-full" onclick={handleLogin} disabled={loading}>
						{loading ? 'Entrando...' : 'Entrar'}
					</Button>
					<Button variant="ghost" class="w-full" onclick={() => { showRegister = true; erro = ''; }}>
						Criar conta
					</Button>
				</Card.Footer>
			</Card.Root>
		{:else}
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-2xl">Criar conta</Card.Title>
					<Card.Description>Preencha seus dados para se cadastrar</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					{#if erro}
						<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{erro}</p>
					{/if}
					<div class="space-y-2">
						<Label for="nome">Nome</Label>
						<Input id="nome" bind:value={regNome} placeholder="Seu nome completo" />
					</div>
					<div class="space-y-2">
						<Label for="reg-email">E-mail</Label>
						<Input id="reg-email" type="email" bind:value={regEmail} placeholder="seu@email.com" />
					</div>
					<div class="space-y-2">
						<Label for="telefone">Telefone</Label>
						<Input id="telefone" bind:value={regTelefone} placeholder="(11) 99999-9999" />
					</div>
					<div class="space-y-2">
						<Label for="reg-senha">Senha</Label>
						<Input id="reg-senha" type="password" bind:value={regSenha} placeholder="••••••••" />
					</div>
					<div class="space-y-2">
						<Label for="role">Tipo de conta</Label>
						<Select.Root type="single" bind:value={regRole}>
							<Select.Trigger id="role" class="w-full">
								{regRole === 'veterinario' ? 'Veterinário' : 'Tutor (dono do pet)'}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="tutor">Tutor (dono do pet)</Select.Item>
								<Select.Item value="veterinario">Veterinário</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
				</Card.Content>
				<Card.Footer class="flex flex-col gap-2">
					<Button class="w-full" onclick={handleRegister} disabled={loading}>
						{loading ? 'Cadastrando...' : 'Cadastrar'}
					</Button>
					<Button variant="ghost" class="w-full" onclick={() => { showRegister = false; erro = ''; }}>
						Já tenho conta
					</Button>
				</Card.Footer>
			</Card.Root>
		{/if}
	</div>
</div>
