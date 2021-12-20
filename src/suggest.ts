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

interface ThingsCompletion {
	label: string;
	url: string;
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

		console.log({
			start: startPos,
			end: cursor,
			query: editor
				.getRange(startPos, cursor)
				.substring(triggerPhrase.length),
		});

		return {
			start: startPos,
			end: cursor,
			query: editor
				.getRange(startPos, cursor)
				.substring(triggerPhrase.length),
		};
	}

	getSuggestions(context: EditorSuggestContext): ThingsCompletion[] {
		console.log("How often is this called?");
		let options = [
			{ label: "Google", url: "https://google.com" },
			{ label: "Apple", url: "https://apple.com" },
			{ label: "Microsoft", url: "https://microsoft.com" },
		];
		return options.filter((option) => option.label.contains(context.query));
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

		activeView.editor.replaceRange(
			`[${suggestion.label}](${suggestion.url})${
				this.plugin?.settings?.trailingSpace ? " " : ""
			}`,
			this.context.start,
			this.context.end
		);
	}

	renderSuggestion(suggestion: ThingsCompletion, el: HTMLElement) {
		el.setText(suggestion.label);
	}
}
