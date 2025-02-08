// Terms:
//
// date = a date object
// tod = the time of day, hours * 60 + minutes.
// todstr = string representing the time of day, ranging from 00:00 to 24:00.

type ToD = number;

export const todstrRegExp = /^([01][0-9]|2[0-3]):([0-5][0-9])$|^24:00$/;

function hm2tod(hours: number, minutes: number): ToD {
	return hours * 60 + minutes;
}

function date2tod(date: Date): ToD {
	return hm2tod(date.getHours(), date.getMinutes());
}

function todstr2tod(todstr: string): ToD {
	const result = todstrRegExp.exec(todstr);
	if (result === null) {
		throw new Error(`invalid time of day string: ${todstr}`);
	}

	if (result[0] === '24:00') {
		return hm2tod(24, 0);
	}

	const hours = parseInt(result[1], 10);
	const minutes = parseInt(result[2], 10);

	return hm2tod(hours, minutes);
}

function isBetween(tod: ToD, start: ToD, end: ToD): boolean {
	// handle cases like 20:00 to 8:00
	if (end < start) return !isBetween(tod, end, start);

	return start <= tod && tod < end;
}

export function isInSchedule(date: Date, start: string, end: string): boolean {
	return isBetween(date2tod(date), todstr2tod(start), todstr2tod(end));
}

export function isNowInSchedule(start: string, end: string): boolean {
	return isInSchedule(new Date(), start, end);
}
