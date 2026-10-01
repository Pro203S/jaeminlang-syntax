import * as vscode from 'vscode';

export function registerCommaDecorations(context: vscode.ExtensionContext): void {
    const decoration = vscode.window.createTextEditorDecorationType({ color: '#9a9a9a' });

    function update(editor: vscode.TextEditor): void {
        if (editor.document.languageId !== 'jaeminlang') {
            editor.setDecorations(decoration, []);
            return;
        }
        const ranges: vscode.Range[] = [];
        for (let line = 0; line < editor.document.lineCount; line++) {
            const text = editor.document.lineAt(line).text;
            if (text.startsWith('어이쿠')) {
                continue;
            }
            let inString = false;
            for (let column = 0; column < text.length; column++) {
                if (text[column] === '\\') {
                    column++;
                } else if (text[column] === '"') {
                    inString = !inString;
                } else if (text[column] === ',' && !inString) {
                    ranges.push(new vscode.Range(line, column, line, column + 1));
                }
            }
        }
        editor.setDecorations(decoration, ranges);
    }

    context.subscriptions.push(
        decoration,
        vscode.window.onDidChangeVisibleTextEditors(editors => editors.forEach(update)),
        vscode.workspace.onDidChangeTextDocument(event => {
            vscode.window.visibleTextEditors
                .filter(editor => editor.document === event.document)
                .forEach(update);
        }),
        vscode.workspace.onDidOpenTextDocument(document => {
            vscode.window.visibleTextEditors
                .filter(editor => editor.document === document)
                .forEach(update);
        }),
    );
    vscode.window.visibleTextEditors.forEach(update);
}
