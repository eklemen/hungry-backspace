//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';
import {
    ExtensionContext,
    Selection,
    Range,
    WorkspaceEdit,
    Position,
    commands,
    window,
    workspace
} from 'vscode';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {

    // Defines a Mocha unit test
    test("Something 1", () => {
        assert.equal(-1, [1, 2, 3].indexOf(5));
        assert.equal(-1, [1, 2, 3].indexOf(0));
    });
    async function InsertSampleText(sampleText: string): Promise<void> {
        let editor = window.activeTextEditor;
        let result = await editor.edit(editorBuilder => {
            let position = new Position(0, 0);
            editorBuilder.insert(position, sampleText);
        });
        assert.ok(result);
    }

    function getTextByRange(range: Range): string {
        var document = window.activeTextEditor.document;
        if (document.validateRange(range)) {
            return document.getText(range);
        }
    }

    function createSelections(selections: Array<any>): any {
        return selections.map( selection => {
            let a = selection.line;
            let b = selection.column;
            return new Selection(new Position(a, b), new Position(a, b))
        });
    }

    function getText(sline: number, scol: number, eline: number, ecol: number) {
        let start = new Position(sline, scol);
        let end = new Position(eline, ecol);
        return getTextByRange(new Range(start, end));
    }

    async function ExecuteHungryBackspace(title) {
        let r = await myExtension.backspace();
        if (!r && title) {
            console.log("execute command failed for: " + title);
        }
    }

    setup(() => {
        let sampleText =
            "var foo = {\n"
            + "     bar: 'baz'\n"
            + "     \n"
            + "     fiz: 'buz'\n"
            + "     \n"
            + "}";
        return InsertSampleText(sampleText);
    });

    test("Assert Sample Text", async () => {
        let firstLine = getText(0, 0, 0, 11);
        assert.equal(firstLine, "var foo = {");

        let secondLine = getText(1, 5, 1, 16);
        assert.equal(secondLine, "bar: 'baz'");

        let fourthLine = getText(5, 0, 5, 1);
        assert.equal(fourthLine, "}");
    });

    test("Should remove single empty line", async () => {
        let editor = window.activeTextEditor;
        let points = [{line: 2, column: 5}];
        let selections = createSelections(points);
        editor.selections = selections;
        await ExecuteHungryBackspace("Empty Line");
        let line = getText(1, 0, 1, 16);
        assert.equal(line, "     bar: 'baz'");
        line = getText(2, 0, 2, 16);
        assert.equal(line, "     fiz: 'buz'");
    });

    test("Should remove empty lines for multiple cursors", async () => {
        let editor = window.activeTextEditor;
        let points = [{line: 2, column: 5}, {line: 4, column: 5}];
        editor.selections = createSelections(points);
        await ExecuteHungryBackspace("Empty Line");

        let line = getText(1, 0, 1, 16);
        assert.equal(line, "     bar: 'baz'");
        line = getText(2, 0, 2, 16);
        assert.equal(line, "     fiz: 'buz'");
        line = getText(3, 0, 3, 1);
        assert.equal(line, "}");
    });

    test("Should keep same number of cursors after activation", async () => {
        let editor = window.activeTextEditor;
        let points = [{line: 2, column: 5}, {line: 4, column: 5}];
        editor.selections = createSelections(points);
        await ExecuteHungryBackspace("Empty Line");
        assert.equal(editor.selections.length, 2);
    });

});