import * as vscode from 'vscode';
import { formatLine } from './formatter';
import { registerCommaDecorations } from './commaDecorations';
import { legend, semanticTokensProvider } from './semanticTokens';

export function activate(context: vscode.ExtensionContext) {
    registerCommaDecorations(context);
    context.subscriptions.push(
        vscode.languages.registerDocumentSemanticTokensProvider('jaeminlang', semanticTokensProvider, legend),
        vscode.languages.registerDocumentFormattingEditProvider('jaeminlang', {
            provideDocumentFormattingEdits(document, _options, token) {
                const edits: vscode.TextEdit[] = [];
                for (let index = 0; index < document.lineCount; index++) {
                    if (token.isCancellationRequested) {
                        return [];
                    }
                    const line = document.lineAt(index);
                    const formatted = formatLine(line.text);
                    if (formatted !== line.text) {
                        edits.push(vscode.TextEdit.replace(line.range, formatted));
                    }
                }
                return edits;
            },
        }),
    );
}
