'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {ExtensionContext, TextDocument, Selection, Range, Position, commands, window, TextEdit, WorkspaceEdit, workspace} from 'vscode';

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

    const {document, selections, options} = editor;
    let hasNewSelections = false;

    const newSelections = selections.map(selection => {
        if (!selection.isEmpty) {
            return selection;
        }

        // editor.selection = newSelection;

        const {start, end} = selection; // since it's empty start is the same as 'active'
        if (start.character === 0) {
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
            var start = positionFactory(coords.start.line, coords.start.char);
            var end = positionFactory(coords.end.line, coords.end.char);
            var range = rangeFactory(start, end);
            return textEditFactory(range, content);
        }

        function workspaceEditFactory() {
            return new WorkspaceEdit();
        }

        function setEditFactory(uri, coords, content) {
            var workspaceEdit = workspaceEditFactory();
            var edit = editFactory(coords, content);

            workspaceEdit.delete(uri, rangeFactory(coords.start, coords.end));
            return workspaceEdit;
        }

        const line = document.lineAt(start);
        if (line.isEmptyOrWhitespace) {

            function applyEdit (vsEditor, coords, content){
                
                var edit = setEditFactory(document.uri, coords, content);
                workspace.applyEdit(edit);
            }
            hasNewSelections = true;

            applyEdit(editor, line.range, "")
            // let rangeToDelete = new Range(start.line, start.character, start.line, 0);
            // new TextEdit(rangeToDelete, "");
            const position = editor.selection.active;
            var newPosition = position.with(position.line, 0);
            var newSelection = new Selection(newPosition, newPosition);
            editor.selection = newSelection
            return newSelection;

            // // let match = /^(\s?\t?)*/.exec(line.text.substr(0, start.character));
            
            // return newSelection;
            // let toRemove:any = (match[1].length) || options.tabSize;
            // return new Selection(start.with(void 0, start.character - toRemove), start);
            ////////////////////////////////////////////////
            // let activeLine = (selection.active.line - 1);
            // hasNewSelections = true;
            // // start.line = start.line-1;
            // return new Selection(start.with(void 0, activeLine), start);
        }

        // check for n-space characters preceeding the caret
        // let match = /^(\t?\s?)*/.exec(line.text.substr(0, start.character));
        // if (match) {
        //     hasNewSelections = true;
            // let toRemove = (match[1].length % options.tabSize) || options.tabSize;
            // return new Selection(start.with(void 0, start.character - toRemove), start);
        // }
    });

    // set the new (expanded) selections and run 'deleteLeft'
    if (hasNewSelections) {
        editor.selections = newSelections;
    }

    return commands.executeCommand('deleteLeft');
}