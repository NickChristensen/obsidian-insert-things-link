import { promises as fs } from "fs";
import { homedir } from "os";
import * as path from "path";
import initSqlJs from "sql.js";

const getThings = async () => {
	const dbPath = path.join(
		homedir(),
		"Library",
		"Group Containers",
		"JLMPQHK86H.com.culturedcode.ThingsMac",
		"Things.sqlite3"
	);

	console.time("db");

	const dbFile = await fs.readFile(dbPath);
	// Breaks with error:
	// sql-wasm.js:166 Fetch API cannot load app://obsidian.md/Applications/Obsidian.app/Contents/Resources/electron.asar/renderer/sql-wasm.wasm. URL scheme "app" is not supported.
	const SQL = initSqlJs({});
	const db = new SQL.Database(dbFile);

	console.timeEnd("db");

	// let db = await open({
	// 	filename: dbPath,
	// 	driver: Database,
	// 	mode: OPEN_READONLY,
	// });

	// let things = await db.all(`
	// 	SELECT
	// 		CASE
	// 			WHEN AREA.title IS NOT NULL THEN AREA.title
	// 			WHEN PROJECT.title IS NOT NULL THEN PROJECT.title
	// 			WHEN HEADING.title IS NOT NULL THEN HEADING.title
	// 			ELSE "(No Context)"
	// 		END,
	// 	TASK.title
	// 	FROM TMTask TASK
	// 	LEFT OUTER JOIN TMTask PROJECT ON TASK.project = PROJECT.uuid
	// 	LEFT OUTER JOIN TMArea AREA ON TASK.area = AREA.uuid
	// 	LEFT OUTER JOIN TMTask HEADING ON TASK.actionGroup = HEADING.uuid
	// 	WHERE TASK.trashed = 0 AND TASK.status = 0 AND TASK.type = 0
	// 	ORDER BY TASK.creationDate
	// 	LIMIT all
	// `);

	return [
		{ label: "Google", url: "https://google.com" },
		{ label: "Apple", url: "https://apple.com" },
		{ label: "Microsoft", url: "https://microsoft.com" },
	];
};

export default getThings;
