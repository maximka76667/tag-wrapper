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

		editor.insertSnippet(new SnippetString("<${1}>${TM_SELECTED_TEXT}</${1}>"));

		const editingPromise = new Promise<[Disposable, Selection]>((resolve, reject) => {
			const listener = window.onDidChangeTextEditorSelection(e => {
				const oldSelections = e.selections;
				const [oldStartingSelection, oldEndSelection] = oldSelections;
				const { start: oldStartingStartPosition, end: oldStartingEndPosition } = oldStartingSelection;
				const { start: oldEndStartPosition, end: oldEndEndPosition } = oldEndSelection;

				const sample = editor.document.getText(new Selection(oldStartingStartPosition.translate(undefined, -1), oldStartingEndPosition));

				console.log(sample.toString());

				const isSpaceInserted = sample.includes(' ', sample.length - 1);

				if (!isSpaceInserted) {
					return;
				}

				editor.edit((editBuilder) => {
					editBuilder.delete(new Selection(oldEndStartPosition.translate(0, -1), oldEndEndPosition));
					resolve([listener, oldStartingSelection]);
				});
			});
		})

		const [windowListener, newSelection] = await editingPromise;

		windowListener.dispose();

		editor.selection = newSelection;
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
