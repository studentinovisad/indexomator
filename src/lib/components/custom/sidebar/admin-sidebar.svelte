<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import SidebarFooter from '$lib/components/ui/sidebar/sidebar-footer.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { useSidebar } from '$lib/components/ui/sidebar/context.svelte.js';
	import LogoLight from '$lib/assets/images/light.svg';
	import LogoDark from '$lib/assets/images/dark.svg';
	import { Bomb, Building, Cuboid, Github, House, KeyRound, University } from 'lucide-svelte';

	// Menu items.
	const items = [
		{
			title: 'Homepage',
			url: '/',
			icon: House
		},
		{
			title: 'Create Department',
			url: '/admin/create/department',
			icon: Cuboid
		},
		{
			title: 'Create University',
			url: '/admin/create/university',
			icon: University
		},
		{
			title: 'Create Building',
			url: '/admin/create/building',
			icon: Building
		},
		{
			title: 'Nuke Building',
			url: '/admin/nuke',
			icon: Bomb
		},
		{
			title: 'Register User',
			url: '/admin/user/register',
			icon: KeyRound
		}
	];

	const sidebar = useSidebar();
</script>

<Sidebar.Root>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel class="select-none font-bold">
				<img class="mr-2 mt-1 hidden size-7 dark:block" src={LogoLight} alt="Logo Light" />
				<img class="mr-2 mt-1 block size-7 dark:hidden" src={LogoDark} alt="Logo Dark" />
				Indexomator
			</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								onclick={() => {
									sidebar.setOpenMobile(false);
								}}
							>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon />
										<span class="select-none">{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<SidebarFooter>
		<Button variant="link" href="https://github.com/studentinovisad/indexomator">
			<Github />
			<span>Contribute</span>
		</Button>
	</SidebarFooter>
</Sidebar.Root>
