import type { State } from './state';

export type PersonType = 'Student' | 'Employee';
export const Student: PersonType = 'Student';
export const Employee: PersonType = 'Employee';

export function isPersonType(s: string): s is PersonType {
	switch (s) {
		case Student:
		case Employee:
			return true;
		default:
			return false;
	}
}

export type Person = {
	id: number;
	type: PersonType;
	identifier: string;
	fname: string;
	lname: string;
	department: string;
	building: string | null;
	state: State;
};
