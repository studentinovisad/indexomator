import { getEmployees } from "../../lib/server/db/employee";
import { getStudents } from "../../lib/server/db/student";

export const load: PageServerLoad = async ({params}) => {
    console.log(params);
    const students = await getStudents(params)
    const employees = await getEmployees({lname: 'Johnbon'});
    return {students, employees}
};