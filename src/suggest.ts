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
import staticSections from "./static-sections.json";

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
		this.limit = 5;
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
		return [...staticSections, ...suggestions].filter(
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
		el.innerHTML = suggestion.title;
		el.classList.add("itl-suggestion-item");
		let parent = suggestion.project || suggestion.area;

		if (suggestion.type === 0 && parent) {
			el.innerHTML =
				el.innerHTML + `<div class="itl-item-parent">${parent}</div>`;
		}
	}
}
