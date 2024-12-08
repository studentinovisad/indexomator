<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
</script>

<Card.Root class="mx-auto max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Register</Card.Title>
		<Card.Description>Enter your credentials to register the new user</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="grid gap-4">
			<div class="grid gap-2">
				<Label for="user">Username</Label>
				<Input id="user" type="text" name="username" required />
			</div>
			<div class="grid gap-2">
				<div class="flex items-center">
					<Label for="pass">Password</Label>
				</div>
				<Input id="pass" type="password" name="password" required />
			</div>
			<div class="grid gap-2">
				<div class="flex items-center">
					<Label for="secret">Secret</Label>
				</div>
				<Input id="secret" type="password" name="secret" required />
			</div>
			<Button type="submit" class="w-full">Register</Button>
		</div>
	</Card.Content>
</Card.Root>
