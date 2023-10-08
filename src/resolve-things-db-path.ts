import { promisify } from "util";
import { homedir } from "os";
import { join } from "path";
import { readdir } from "fs";

let readDir = promisify(readdir);

export const resolveThingsDBPath = async () => {
	let containerDirPath = [
		homedir(),
		"Library",
		"Group Containers",
		"JLMPQHK86H.com.culturedcode.ThingsMac",
	];
	let containerContents = await readDir(join(...containerDirPath));

	let dbDir = containerContents.find((file) => file.includes("ThingsData"));

	return join(
		...containerDirPath,
		dbDir || "",
		"Things Database.thingsdatabase",
		"main.sqlite"
	);
};
