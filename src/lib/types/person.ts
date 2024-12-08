import type { State } from './state';

export type PersonType = 'student' | 'employee';
export const Student: PersonType = 'student';
export const Employee: PersonType = 'employee';

export type Person = {
	type: PersonType;
	id: number;
	fname: string;
	lname: string;
	index: string | null;
	state: State;
};
