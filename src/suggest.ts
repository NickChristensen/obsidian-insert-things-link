import {
	App,
	Editor,
	EditorSuggest,
	EditorPosition,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	MarkdownView,
} from "obsidian";
import memoize from "lodash.memoize";

import InsertThingsLink from "./main";
import getThings from "./get-things";
import staticSections from "./static-sections";
import Regular from "../img/Checkbox-Regular.png";
import RegularDark from "../img/Checkbox-Regular-Dark.png";
import Someday from "../img/Checkbox-Later.png";
import SomedayDark from "../img/Checkbox-Later-Dark.png";
// Need to fix this icon, it's too bright
import Repeating from "../img/Checkbox-Repeating.png";
import RepeatingDark from "../img/Checkbox-Repeating-Dark.png";

interface ThingsCompletion {
	uuid: string;
	title: string;
	type: 0 | 1 | 2;
	project: string;
	area: string;
}

// Cache the result of this slow (~1s) call, only run every minute
const memoizedGetThings = memoize(getThings, () => new Date().getMinutes());

export default class ThingsSuggest extends EditorSuggest<ThingsCompletion> {
	plugin: InsertThingsLink;
	app: App;
	limit: number;

	constructor(app: App, plugin: InsertThingsLink) {
		super(app);
		this.plugin = plugin;
		this.app = app;
		// this.limit = 5;
	}

	onTrigger(
		cursor: EditorPosition,
		editor: Editor
	): EditorSuggestTriggerInfo {
		const triggerPhrase = this.plugin?.settings?.triggerString;
		const startPos = this.context?.start || {
			line: cursor.line,
			ch: cursor.ch - triggerPhrase.length,
		};

		if (!editor.getRange(startPos, cursor).startsWith(triggerPhrase)) {
			return null;
		}

		const precedingChar = editor.getRange(
			{
				line: startPos.line,
				ch: startPos.ch - 1,
			},
			startPos
		);

		if (precedingChar && !/[\s]/.test(precedingChar)) {
			return null;
		}

		return {
			start: startPos,
			end: cursor,
			query: editor
				.getRange(startPos, cursor)
				.substring(triggerPhrase.length),
		};
	}

	async getSuggestions(
		context: EditorSuggestContext
	): Promise<ThingsCompletion[]> {
		let json = await memoizedGetThings();
		let suggestions = JSON.parse(json);

		// Replace this with a smarter filter like https://github.com/kentcdodds/match-sorter
		return [...suggestions, ...staticSections].filter(
			(option: ThingsCompletion) =>
				option.title.toLowerCase().contains(context.query.toLowerCase())
		);
	}

	selectSuggestion(suggestion: ThingsCompletion) {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) {
			return;
		}

		activeView.editor.replaceRange(
			`[${suggestion.title}](things:///show?id=${suggestion.uuid})${
				this.plugin?.settings?.trailingSpace ? " " : ""
			}`,
			this.context.start,
			this.context.end
		);
	}

	renderSuggestion(suggestion: ThingsCompletion, el: HTMLElement) {
		let parent = suggestion.project || suggestion.area;
		let hasParent = suggestion.type === 0 && parent;
		let isDarkMode = this.app.getTheme() == "obsidian";
		let isDynamic = typeof suggestion.type === "number";
		let isRepeating =
			suggestion.start === 2 && suggestion.instanceCreationStartDate;
		let isSomeDay =
			suggestion.start === 2 &&
			!suggestion.instanceCreationStartDate &&
			!suggestion.startDate;

		// Dynamic result won't have icons yet
		if (isDynamic) {
			if (isRepeating) {
				suggestion.lightIcon = Repeating;
				suggestion.darkIcon = RepeatingDark;
			} else if (isSomeDay) {
				suggestion.lightIcon = Someday;
				suggestion.darkIcon = SomedayDark;
			} else {
				suggestion.lightIcon = Regular;
				suggestion.darkIcon = RegularDark;
			}
		}

		let icon = isDarkMode ? suggestion.darkIcon : suggestion.lightIcon;

		el.classList.add("itl-suggestion-item");

		el.innerHTML = `<div class="itl-item-icon">${
			icon ? `<img src="${icon}">` : ""
		}</div><div class="itl-item-info"><div>${suggestion.title}</div>${
			hasParent ? `<div class="itl-item-parent">${parent}</div>` : ""
		}</div>`;
	}
}
