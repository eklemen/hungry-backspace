'use strict';
import {
    ExtensionContext,
    Selection,
    Range,
    Position,
    WorkspaceEdit,
    TextEdit,
    commands,
    window,
    workspace
} from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
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
        // If the line isn't empty(with whitespace) do nothing
        if (!selection.isEmpty) {
            return selection;
        }
        function positionFactory(line, char) {
            return new Position(line, char);
        }

        function rangeFactory(start, end) {
            return new Range(start, end);
        }

        function textEditFactory(range, content) {
            return new TextEdit(range, content);
        }

        function editFactory(coords, content) {
            const {start, end} = coords;
            const startPosition = positionFactory(start.line, start.char);
            const endPosition = positionFactory(end.line, end.char);
            const range = rangeFactory(startPosition, endPosition);
            return textEditFactory(range, content);
        }

        function setEditFactory(uri, coords, content) {
            const workspaceEdit = new WorkspaceEdit();
            const range = rangeFactory(coords.start, coords.end);
            workspaceEdit.delete(uri, range);
            return workspaceEdit;
        }
        function applyEdit (coords, content){
            const edit = setEditFactory(document.uri, coords, content);
            workspace.applyEdit(edit);
        }

        const line = document.lineAt(selection.start);
        if (line.isEmptyOrWhitespace) {
            applyEdit(line.range, "")
            const position = editor.selection.active;
            var newPosition = position.with(position.line, 0);
            editor.selection = new Selection(newPosition, newPosition);
            // editor.selection = newSelection
            return editor.selection;
        }
    });

    return commands.executeCommand('deleteLeft');
}