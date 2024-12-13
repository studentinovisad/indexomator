import type { State } from './state';

export type PersonType = 'Student' | 'Employee';
export const Student: PersonType = 'Student';
export const Employee: PersonType = 'Employee';

export type Person = {
	id: number;
	type: PersonType;
	identifier: string;
	fname: string;
	lname: string;
	department: string;
	state: State;
};
