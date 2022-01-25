import { App, PluginSettingTab, Setting } from "obsidian";

import InsertThingsLink from "./main";

export default class ThingsSettingTab extends PluginSettingTab {
	plugin: InsertThingsLink;

	constructor(app: App, plugin: InsertThingsLink) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Trigger character(s)")
			.setDesc(
				"Enter the character(s) you would like to use to insert items"
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.triggerString)
					.onChange(async (value) => {
						this.plugin.settings.triggerString = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Trailing space")
			.setDesc("Include a space after an inserted link?")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.trailingSpace)
					.onChange(async (value) => {
						this.plugin.settings.trailingSpace = value;
						await this.plugin.saveSettings();
					})
			);

		/*
		 * This isn't working. Obsidian (electron?) seems to be making a copy of the db file instead of returning the original
		 * The path returned is /var/folders/0l/q28v0x1s2152jkqz7s4gbzp80000gp/T/md.obsidian/zip_cache/..., which really doesn't help.
		 * References:
		 * - [obsidian-fantasy-calendar/settings.ts](https://github.com/valentine195/obsidian-fantasy-calendar/blob/master/src/settings/settings.ts#L106-L144)
		 * - [electron/file-object.md](https://github.com/electron/electron/blob/main/docs/api/file-object.md)
		 */

		// let dbSetting = new Setting(containerEl).setName("Things database");

		// const input = createEl("input", {
		// 	attr: {
		// 		type: "file",
		// 		name: "db",
		// 		accept: ".thingsdatabase",
		// 		multiple: false,
		// 		style: "display: none;",
		// 	},
		// });

		// input.onchange = async () => {
		// 	const { files } = input;

		// 	debugger;

		// 	if (!files.length) return;
		// 	try {
		// 		this.plugin.settings.dbPath = files[0].path;
		// 		await this.plugin.saveSettings();
		// 	} catch (e) {
		// 		// new Notice(
		// 		// 	`There was an	 error while importing the calendar${
		// 		// 		files.length == 1 ? "" : "s"
		// 		// 	}.`
		// 		// );
		// 		console.error(e);
		// 	}

		// 	input.value = null;
		// };

		// dbSetting.addButton((button) => {
		// 	button.setButtonText("Button!");
		// 	button.buttonEl.insertAdjacentElement("beforebegin", input);
		// 	button.onClick(() => input.click());
		// });

		// dbSetting.addText((text) => {
		// 	text.setValue(this.plugin.settings.dbPath);
		// 	text.inputEl.setAttr("readonly", "true");
		// });
	}
}
