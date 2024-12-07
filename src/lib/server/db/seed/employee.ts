const seedData = {
	employee: [
		{ fname: 'John', lname: 'Doe', personalId: '123456781' },
		{ fname: 'Jane', lname: 'Smith', personalId: '123456782' },
		{ fname: 'Alice', lname: 'Johnson', personalId: '123456783' },
		{ fname: 'Bob', lname: 'Brown', personalId: '123456784' },
		{ fname: 'Charlie', lname: 'Davis', personalId: '123456785' }
	],
	employeeEntry: [
		{ employeeId: 1, timestamp: new Date('2024-12-01T08:00:00') },
		{ employeeId: 1, timestamp: new Date('2024-12-01T12:00:00') },
		{ employeeId: 2, timestamp: new Date('2024-12-01T09:00:00') },
		{ employeeId: 3, timestamp: new Date('2024-12-01T08:30:00') },
		{ employeeId: 4, timestamp: new Date('2024-12-01T08:45:00') }
	],
	employeeExit: [
		{ employeeId: 1, timestamp: new Date('2024-12-01T12:00:00') },
		{ employeeId: 2, timestamp: new Date('2024-12-01T17:00:00') },
		{ employeeId: 3, timestamp: new Date('2024-12-01T11:30:00') },
		{ employeeId: 4, timestamp: new Date('2024-12-01T18:15:00') },
		{ employeeId: 1, timestamp: new Date('2024-12-01T18:00:00') }
	]
};

export default seedData;
