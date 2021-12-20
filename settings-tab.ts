import { App, PluginSettingTab, Setting } from "obsidian";

import InsertThingsLink from "./main";

export default class SettingTab extends PluginSettingTab {
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
	}
}
