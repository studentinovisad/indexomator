export type State = 'Inside' | 'Outside';
export const StateInside: State = 'Inside';
export const StateOutside: State = 'Outside';

export function isStateType(value: string): value is State {
	return value === StateInside || value === StateOutside;
}
