<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { authStore } from '$lib/stores/auth.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Home,
		CalendarDays,
		PawPrint,
		Users,
		UserCircle,
		LogOut,
		Stethoscope
	} from 'lucide-svelte';

	let { children } = $props();

	function logout() {
		authStore.logout();
		goto('/login');
	}

	const navLinks = $derived([
		{ href: '/dashboard',              label: 'Início',         icon: Home,         roles: ['tutor', 'veterinario'] },
		{ href: '/dashboard/agendamentos', label: 'Agendamentos',   icon: CalendarDays, roles: ['tutor', 'veterinario'] },
		{ href: '/dashboard/pets',         label: 'Meus Pets',      icon: PawPrint,     roles: ['tutor'] },
		{ href: '/dashboard/tutores',      label: 'Tutores',        icon: Users,        roles: ['veterinario'] },
		{ href: '/dashboard/profile',      label: 'Perfil',         icon: UserCircle,   roles: ['tutor', 'veterinario'] }
	]);
</script>

<div class="flex h-screen overflow-hidden bg-background">
	<!-- Sidebar -->
	<aside class="flex w-60 flex-col border-r border-border bg-sidebar">
		<!-- Logo -->
		<div class="flex items-center gap-2 px-5 py-5">
			<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
				<Stethoscope class="h-4 w-4 text-primary-foreground" />
			</div>
			<div>
				<p class="text-sm font-semibold text-sidebar-foreground">AgendaPets</p>
				{#if $authStore}
					<p class="max-w-[140px] truncate text-xs text-muted-foreground">{$authStore.email}</p>
				{/if}
			</div>
		</div>

		<Separator />

		<nav class="flex flex-1 flex-col gap-0.5 p-3">
			{#each navLinks as link}
				{#if $authStore && link.roles.includes($authStore.role)}
					{@const active = $page.url.pathname === link.href}
					{@const Icon = link.icon}
					<a
						href={link.href}
						class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
							{active
							? 'bg-sidebar-primary text-sidebar-primary-foreground'
							: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}"
					>
						<Icon class="h-4 w-4 shrink-0" />
						{link.label}
					</a>
				{/if}
			{/each}
		</nav>

		<Separator />

		<div class="p-3">
			<Button
				variant="ghost"
				class="w-full justify-start gap-3 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
				onclick={logout}
			>
				<LogOut class="h-4 w-4 shrink-0" />
				Sair
			</Button>
		</div>
	</aside>

	<!-- Main content -->
	<main class="flex-1 overflow-auto">
		<div class="p-6">
			{@render children()}
		</div>
	</main>
</div>
