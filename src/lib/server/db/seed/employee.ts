const employees = [
	{ id: 1, email: 'john.doe@pmf.uns.ac.rs', fname: 'John', lname: 'Doe' },
	{ id: 2, email: 'jane.smith@pmf.uns.ac.rs', fname: 'Jane', lname: 'Smith' },
	{ id: 3, email: 'alice.johnson@pmf.uns.ac.rs', fname: 'Alice', lname: 'Johnson' },
	{ id: 4, email: 'bob.brown@pmf.uns.ac.rs', fname: 'Bob', lname: 'Brown' },
	{ id: 5, email: 'charlie.david@pmf.uns.ac.rs', fname: 'Charlie', lname: 'Davis' }
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
