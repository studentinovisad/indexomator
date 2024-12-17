<script lang="ts">
	import House from 'lucide-svelte/icons/house';
	import Building from 'lucide-svelte/icons/building';
	import Cuboid from 'lucide-svelte/icons/cuboid';
	import KeyRound from 'lucide-svelte/icons/key-round';
	import Github from 'lucide-svelte/icons/github';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import SidebarFooter from '$lib/components/ui/sidebar/sidebar-footer.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { useSidebar } from '$lib/components/ui/sidebar/context.svelte.js';
	import LogoLight from '$lib/assets/images/light.svg';
	import LogoDark from '$lib/assets/images/dark.svg';

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
			title: 'Create Building',
			url: '/admin/create/building',
			icon: Building
		},
		{
			title: 'Register User',
			url: '/admin/register',
			icon: KeyRound
		}
	];

	const sidebar = useSidebar();
</script>

<Sidebar.Root>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel class="select-none font-bold">
				<div class="flex items-center">
					<img class="m-2 hidden size-10 dark:block" src={LogoLight} alt="Logo light" />
					<img class="m-2 block size-10 dark:hidden" src={LogoDark} alt="Logo dark" />
					Indexomator
				</div>
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
										<item.icon /> <span class="select-none">{item.title}</span>
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
		<Button variant="link" href="https://github.com/aleksasiriski/indexomator">
			<Github /> <span>Contribute</span>
		</Button>
	</SidebarFooter>
</Sidebar.Root>
