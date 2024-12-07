<script lang="ts">
	import OpenBook from 'lucide-svelte/icons/book-open-text';
	import Briefcase from 'lucide-svelte/icons/briefcase-business';
	import Clipboard from 'lucide-svelte/icons/clipboard-list';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	// Menu items.
	const items = [
		{
			title: 'Insert Student',
			url: '/dashboard/insert_student',
			icon: OpenBook
		},
		{
			title: 'Insert Employee',
			url: '/dashboard/insert_employee',
			icon: Briefcase
		},
		{
			title: 'Database Search',
			url: '/dashboard/database_search',
			icon: Clipboard
		}
	];
</script>

<Sidebar.Root>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel><a href='/dashboard'>Indexomator</a></Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
</Sidebar.Root>
