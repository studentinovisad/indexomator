const students = [
	{ id: 1, index: '1/01', fname: 'Emma', lname: 'Johnson' },
	{ id: 2, index: '12m/1001', fname: 'Liam', lname: 'Williams' },
	{ id: 3, index: '2/01', fname: 'Sophia', lname: 'Brown' },
	{ id: 4, index: '3/0001', fname: 'Noah', lname: 'Jones' },
	{ id: 5, index: '405/1000', fname: 'Olivia', lname: 'Garcia' }
];
const midpoint = Math.floor(students.length / 2);
const seedData = {
	student: students,
	studentEntry: students.map((s) => {
		return { studentId: s.id };
	}),
	studentExit: students.slice(midpoint).map((s) => {
		return { studentId: s.id };
	})
};

export default seedData;
