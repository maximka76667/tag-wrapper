// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { window, ExtensionContext, commands, SnippetString, Selection, Range, Position, Disposable } from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
	console.log('Tag wrapper activated');

	let disposable = commands.registerCommand('tag-wrapper.wrapTag', async () => {
		window.showInformationMessage('Tag wrap from tag-wrapper!');

		const editor = window.activeTextEditor;

		if (!editor) {
			return;
		}

		editor.insertSnippet(new SnippetString("<${1}>\n\t${TM_SELECTED_TEXT}\n</${1}>"));

		// When you push Space, extension should add it only in the first <> and deselect second <>
		// E.g. <p ></p>

		// Code in the promise detects on Space keydown and deletes space in the second </ >
		// Returns windowLListener and selection in the first <>

		const spaceDetectingPromise = new Promise<[Disposable, Selection]>((resolve, reject) => {
			const listener = window.onDidChangeTextEditorSelection(e => {
				const selections = e.selections;


				// TO DO
				// fix bag when you select 2 or more texts
				// do not use first and second and use an array selections

				const [firstSelection, lastSelection] = selections;
				const { start: firstStartPosition, end: firstEndPosition } = firstSelection;
				const { start: secondStartPosition, end: secondEndPosition } = lastSelection;

				// Detect inserting space between first <>
				const sample = editor.document.getText(new Selection(firstStartPosition.translate(undefined, -1), firstEndPosition));
				const isSpaceInserted = sample.includes(' ', sample.length - 1);

				if (!isSpaceInserted) {
					return;
				}

				editor.edit((editBuilder) => {
					// Delete space between second <> which we don't need
					const secondSpaceSelection = new Selection(secondStartPosition.translate(0, -1), secondEndPosition);

					editBuilder.delete(secondSpaceSelection);
					resolve([listener, firstSelection]);
				});
			});
		});

		const [windowListener, newSelection] = await spaceDetectingPromise;

		windowListener.dispose();

		editor.selection = newSelection;
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
