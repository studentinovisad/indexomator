const employees = [
	{ id: 1, fname: 'John', lname: 'Doe', personalId: '123456781' },
	{ id: 2, fname: 'Jane', lname: 'Smith', personalId: '123456782' },
	{ id: 3, fname: 'Alice', lname: 'Johnson', personalId: '123456783' },
	{ id: 4, fname: 'Bob', lname: 'Brown', personalId: '123456784' },
	{ id: 5, fname: 'Charlie', lname: 'Davis', personalId: '123456785' }
];
const midpoint = Math.floor(employees.length / 2);
const seedData = {
	employee: employees,
	employeeEntry: employees.map((e) => {
		return { employeeId: e.id };
	}),
	employeeExit: employees.slice(midpoint).map((e) => {
		return { employeeId: e.id };
	})
};

export default seedData;
