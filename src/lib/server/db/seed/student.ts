const students = [
	{ id: 1, fname: 'Emma', lname: 'Johnson', index: '1/01' },
	{ id: 2, fname: 'Liam', lname: 'Williams', index: '12m/1001' },
	{ id: 3, fname: 'Sophia', lname: 'Brown', index: '2/01' },
	{ id: 4, fname: 'Noah', lname: 'Jones', index: '3/0001' },
	{ id: 5, fname: 'Olivia', lname: 'Garcia', index: '405/1000' }
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
