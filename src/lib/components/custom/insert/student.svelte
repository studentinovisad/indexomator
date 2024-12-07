<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Insert a student</Card.Title>
		<Card.Description>Insert a student who wants to enter the building.</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="grid gap-4">
			<div class="grid gap-2">
				<Label for="first_name">First Name</Label>
				<Input id="first_name" type="text" placeholder="Douglas" name="fname" required />
			</div>
			<div class="grid gap-2">
				<Label for="last_name">Last Name</Label>
				<Input id="last_name" type="text" placeholder="Peterson" name="lname" required />
			</div>
			<div class="grid gap-2">
				<Label for="student_id">Student ID</Label>
				<Input id="student_id" type="text" placeholder="100/24" name="index" required />
			</div>
			<Button type="submit" class="w-full">Insert</Button>
		</div>
	</Card.Content>
</Card.Root>
