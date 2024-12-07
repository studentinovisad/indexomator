import { getStudents } from "../../lib/server/db/student";

export const load: PageServerLoad = async ({params}) => {
    console.log(params);
    const students = await getStudents(params)
    return {students}
};