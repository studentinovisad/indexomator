import type { State } from './state';

export type PersonType = 'student' | 'employee';
export const Student: PersonType = 'student';
export const Employee: PersonType = 'employee';

export type Person = {
	type: PersonType;
	id: number;
	index: string | null;
	email: string | null;
	fname: string;
	lname: string;
	state: State;
};
