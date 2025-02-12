import type { State } from './state';

export type PersonType = 'Employee' | 'Guest' | 'Student';
export const Employee: PersonType = 'Employee';
export const Guest: PersonType = 'Guest';
export const Student: PersonType = 'Student';

export function isPersonType(s: string): s is PersonType {
	switch (s) {
		case Employee:
		case Guest:
		case Student:
			return true;
		default:
			return false;
	}
}

export type Guarantor = {
	id: number;
	identifier: string;
	fname: string;
	lname: string;
};

export type Guest = {
	id: number;
	identifier: string;
	fname: string;
	lname: string;
	university: string | null;
};

export type Person = {
	id: number;
	type: PersonType;
	identifier: string;
	fname: string;
	lname: string;
	department: string | null;
	university: string | null;
	building: string | null;
	guarantorId: number | null;
	guarantorFname: string | null;
	guarantorLname: string | null;
	guarantorIdentifier: string | null;
	state: State;
	isBanned: boolean;
};
