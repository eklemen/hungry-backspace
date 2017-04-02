'use strict';
import {
    ExtensionContext,
    Selection,
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
function backspace() {

    const editor = window.activeTextEditor;
    if (!editor) {
        return;
    }
    const {document, selections} = editor;


    const newSelections = selections.map(selection => {
        // If the line isn't empty(with whitespace) do nothing.
        if (!selection.isEmpty) {
            return selection;
        }

        function deleteFactory(uri, coords) {
            const workspaceEdit = new WorkspaceEdit();
            const range = new Range(coords.start, coords.end);
            workspaceEdit.delete(uri, range);
            workspace.applyEdit(workspaceEdit);
        }

        const line = document.lineAt(selection.start);
        if (line.isEmptyOrWhitespace) {
            deleteFactory(document.uri, line.range)
            const position = editor.selection.active;
            const newPosition = position.with(position.line, 0);
            editor.selection = new Selection(newPosition, newPosition);
            return editor.selection;
        }
    });

    return commands.executeCommand('deleteLeft');
}