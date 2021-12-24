import {
	App,
	Editor,
	EditorSuggest,
	EditorPosition,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	MarkdownView,
} from "obsidian";

import InsertThingsLink from "./main";
import getThings from "./get-things";

interface ThingsCompletion {
	uuid: string;
	title: string;
	type: 0 | 1 | 2;
	project: string;
	area: string;
}

export default class ThingsSuggest extends EditorSuggest<ThingsCompletion> {
	plugin: InsertThingsLink;
	app: App;

	constructor(app: App, plugin: InsertThingsLink) {
		super(app);
		this.plugin = plugin;
		this.app = app;
	}

	onTrigger(
		cursor: EditorPosition,
		editor: Editor
		// file: TFile
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
		console.log("getSuggestions");
		let options = await getThings();
		// Replace this with a smarter filter like https://github.com/kentcdodds/match-sorter
		return options.filter((option: ThingsCompletion) =>
			option.title.toLowerCase().contains(context.query.toLowerCase())
		);
	}

	selectSuggestion(
		suggestion: ThingsCompletion,
		event: KeyboardEvent | MouseEvent
	) {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) {
			return;
		}

		// const includeAlias = event.shiftKey;

		console.log(suggestion);

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
		let context = suggestion.project || suggestion.area;

		if (suggestion.type === 0 && context) {
			el.innerHTML =
				el.innerHTML +
				`<div style="color: var(--text-muted); font-size: 80%">${context}</div>`;
		}
	}
}
