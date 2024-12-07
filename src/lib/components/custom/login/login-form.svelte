<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
</script>

<Card.Root class="mx-auto max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Login</Card.Title>
		<Card.Description>Enter your credentials to login to the dashboard</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="grid gap-4">
			<div class="grid gap-2">
				<Label for="user">Username</Label>
				<Input id="user" type="text" placeholder="Faculty" required />
			</div>
			<div class="grid gap-2">
				<div class="flex items-center">
					<Label for="pass">Password</Label>
					<!--
					<a href="##" class="ml-auto inline-block text-sm underline">
						Forgot your password?
					</a>
					-->
				</div>
				<Input id="pass" type="password" required />
			</div>
			<Button type="submit" class="w-full">Login</Button>
			<!--
			<Button variant="outline" class="w-full">Login with Google</Button>
			-->
		</div>
		<!--
		<div class="mt-4 text-center text-sm">
			Don't have an account?
			<a href="##" class="underline"> Sign up </a>
		</div>
		-->
	</Card.Content>
</Card.Root>
