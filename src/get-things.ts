import spawn from "spawn-promise";
import memoize from "lodash.memoize";

import { resolveThingsDBPath } from "./resolve-things-db-path";

let memoizedResolveThingsDBPath = memoize(resolveThingsDBPath);

const query = `SELECT
		task.uuid, task.type, task.title, task.start, task.startDate, task.rt1_nextInstanceStartDate, project.title as project, area.title as area
		FROM TMTask task
		LEFT OUTER JOIN TMTask project ON TASK.project = project.uuid
		LEFT OUTER JOIN TMArea area ON TASK.area = area.uuid
		LEFT OUTER JOIN TMTask heading ON TASK.heading = heading.uuid
		WHERE task.trashed = 0 AND task.status = 0
		ORDER BY task.userModificationDate DESC`;

const getThings = async (): Promise<string> => {
	let dbPath = await memoizedResolveThingsDBPath();
	try {
		const buffer = await spawn("sqlite3", [
			dbPath,
			"-json",
			"-readonly",
			query,
		]);
		return buffer.toString();
	} catch (e) {
		console.error(e);
	}
};

export default getThings;
