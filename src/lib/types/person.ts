import type { State } from './state';

export type PersonType = 'student' | 'employee';
export const Student: PersonType = 'student';
export const Employee: PersonType = 'employee';

export type Person = {
	id: number;
	type: PersonType;
	identifier: string;
	fname: string;
	lname: string;
	state: State;
};
