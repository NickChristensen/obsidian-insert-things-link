import { Plugin } from "obsidian";

import ThingsSettingTab from "./settings-tab";
import ThingsSuggest from "./suggest";

interface PluginSettings {
	triggerString: string;
	trailingSpace: boolean;
}

const DEFAULT_SETTINGS: PluginSettings = {
	triggerString: "/",
	trailingSpace: true,
};

export default class InsertThingsLink extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new ThingsSettingTab(this.app, this));
		this.registerEditorSuggest(new ThingsSuggest(this.app, this));
	}

	// onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}