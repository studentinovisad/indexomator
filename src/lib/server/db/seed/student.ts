const seedData = {
	student: [
		{ fname: 'Emma', lname: 'Johnson', index: '1/01' },
		{ fname: 'Liam', lname: 'Williams', index: '12m/1001' },
		{ fname: 'Sophia', lname: 'Brown', index: '2/01' },
		{ fname: 'Noah', lname: 'Jones', index: '3/0001' },
		{ fname: 'Olivia', lname: 'Garcia', index: '405/1000' }
	],
	studentEntry: [
		{ studentId: 1, timestamp: new Date('2024-12-01T09:00:00') },
		{ studentId: 2, timestamp: new Date('2024-12-01T09:30:00') },
		{ studentId: 3, timestamp: new Date('2024-12-01T10:00:00') },
		{ studentId: 4, timestamp: new Date('2024-12-01T10:30:00') },
		{ studentId: 5, timestamp: new Date('2024-12-01T11:00:00') }
	],
	studentExit: [
		{ studentId: 1, timestamp: new Date('2024-12-01T15:00:00') },
		{ studentId: 2, timestamp: new Date('2024-12-01T14:30:00') },
		{ studentId: 3, timestamp: new Date('2024-12-01T16:00:00') },
		{ studentId: 4, timestamp: new Date('2024-12-01T15:30:00') },
		{ studentId: 5, timestamp: new Date('2024-12-01T17:00:00') }
	]
};

export default seedData;
