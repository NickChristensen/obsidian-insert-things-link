import { homedir } from "os";
import * as path from "path";
import spawn from "spawn-promise";

const getThings = async (): Promise<any> => {
	const dbPath = path.join(
		homedir(),
		"Library",
		"Group Containers",
		"JLMPQHK86H.com.culturedcode.ThingsMac",
		"Things Database.thingsdatabase",
		"main.sqlite"
	);

	const query = `SELECT
		task.uuid, task.type, task.title, project.title as project, area.title as area
		FROM TMTask task
		LEFT OUTER JOIN TMTask project ON TASK.project = project.uuid
		LEFT OUTER JOIN TMArea area ON TASK.area = area.uuid
		LEFT OUTER JOIN TMTask heading ON TASK.actionGroup = heading.uuid
		WHERE task.trashed = 0 AND task.status = 0
		ORDER BY task.creationDate`;

	try {
		const buffer = await spawn("sqlite3", [
			dbPath,
			"-json",
			"-readonly",
			query,
		]);
		return JSON.parse(buffer.toString());
	} catch (e) {
		console.error(e);
	}
};

export default getThings;
