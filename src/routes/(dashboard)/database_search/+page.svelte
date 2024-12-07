<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Search from 'lucide-svelte/icons/search';
</script>

<div>
	<div>
        <div class="hidden sm:flex gap-2 px-4 py-2">
		    <Input id="first_name" placeholder="First Name" class="max-w-xs" />
		    <Input id="last_name" placeholder="Last Name" class="max-w-xs" />
		    <Input id="id" placeholder="ID" class="max-w-xs" />
		    <Button type="submit" variant="outline" size="icon" class="flex-shrink-0"><Search /></Button>
        </div>
        <div class="flex sm:hidden gap-2 px-4 py-2">
            <Drawer.Root class="w-full">
                <Drawer.Trigger class="block w-full sm:hidden"><Button class="w-full">Search</Button></Drawer.Trigger>
                <Drawer.Content>
                    <div class="grid gap-4 p-10">
                        <div class="grid gap-2">
                            <Label for="first_name">First Name</Label>
                            <Input id="first_name" placeholder="First Name" />
                        </div>
                        <div class="grid gap-2">
                            <Label for="last_name">Last Name</Label>
                            <Input id="last_name" placeholder="Last Name" />    
                        </div>
                        <div class="grid gap-2">
                            <Label for="last_name">Last Name</Label>
                            <Input id="id" placeholder="ID" />
                        </div>
                    </div>
                    <Drawer.Footer>
                        <Button>Search</Button>
                        <Drawer.Close><Button variant="destructive" class="w-full">Reset</Button></Drawer.Close>
                    </Drawer.Footer>
                </Drawer.Content>
            </Drawer.Root>
        </div>
	</div>
	<Separator />
</div>
