export type State = 'Inside' | 'Outside';
export const StateInside: State = 'Inside';
export const StateOutside: State = 'Outside';

export function isStateType(s: string): s is State {
	switch (s) {
		case StateInside:
		case StateOutside:
			return true;
		default:
			return false;
	}
}
