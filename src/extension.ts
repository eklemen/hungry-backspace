'use strict';
import {
    ExtensionContext,
    Selection,
    TextEditor,
    Uri,
    Range,
    WorkspaceEdit,
    commands,
    window,
    workspace
} from 'vscode';

// This method gets called when backspaceLeft key is pressed.
// The second param is our function that runs on activation.
export function activate(context: ExtensionContext) {
    context.subscriptions.push(commands.registerCommand('jrieken.backspaceLeft', backspace));
}

function deleteFactory(uri: Uri, coords: Range) : Thenable<Boolean> {
    const workspaceEdit = new WorkspaceEdit();
    const range = new Range(coords.start, coords.end);
    workspaceEdit.delete(uri, range);
    return workspace.applyEdit(workspaceEdit);
}

function selectionFactory(editor: TextEditor) : Selection {
    const position = editor.selection.active;
    const newPosition = position.with(position.line, 0);
    return new Selection(newPosition, newPosition);
}

export function backspace() : Thenable<Boolean> {

    const editor = window.activeTextEditor;
    const {document, selections} = editor;
    if (!editor) {
        return;
    }
    const newSelections = selections.map(selection => {
        // If the line isn't empty(with whitespace) do nothing.
        if (!selection.isEmpty) {
            return selection;
        }

        const line = document.lineAt(selection.start);
        if (line.isEmptyOrWhitespace) {
            deleteFactory(document.uri, line.range)
            selection = selectionFactory(editor);
            return selection;
        }
    });

    return commands.executeCommand('deleteLeft');
}