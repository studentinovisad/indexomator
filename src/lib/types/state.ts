export type State = 'inside' | 'outside';
export const StateInside: State = 'inside';
export const StateOutside: State = 'outside';

export function isStateType(value: string): value is State {
	return value === StateInside || value === StateOutside;
}
