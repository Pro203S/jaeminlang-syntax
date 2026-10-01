import * as vscode from 'vscode';

export const legend = new vscode.SemanticTokensLegend(['function', 'parameter'], []);

interface Argument {
    text: string;
    start: number;
}

// Keep source offsets (UTF-16, as used by VS Code), and honor escaped commas.
function argumentsOf(line: string): Argument[] {
    const result: Argument[] = [];
    let start = 0;
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
        if (line[i] === '\\') {
            i++;
        } else if (line[i] === '"') {
            quoted = !quoted;
        } else if (line[i] === ',' && !quoted) {
            result.push({ text: line.slice(start, i), start });
            start = i + 1;
        }
    }
    result.push({ text: line.slice(start), start });
    return result;
}

export const semanticTokensProvider: vscode.DocumentSemanticTokensProvider = {
    provideDocumentSemanticTokens(document, cancellation) {
        const lines = Array.from({ length: document.lineCount }, (_, i) =>
            argumentsOf(document.lineAt(i).text));
        const functions = new Set<string>();
        const declarations = new Map<number, { end: number; parameters: Set<string> }>();
        let networkMode = false;
        for (let i = 0; i < lines.length; i++) {
            if (cancellation.isCancellationRequested) {
                return;
            }
            const args = lines[i];
            if (args[0].text === '메가커피') {
                networkMode = args[1]?.text === '1';
            }
            if (networkMode || args[0].text !== '엘릭서' || !args[1]?.text || functions.has(args[1].text)) {
                continue;
            }
            const end = lines.findIndex((line, index) => index > i && line[0].text === '음...');
            if (end < 0) {
                continue;
            }
            functions.add(args[1].text);
            declarations.set(i, { end, parameters: new Set(args.slice(2).map(arg => arg.text)) });
            i = end;
        }
        const builder = new vscode.SemanticTokensBuilder(legend);
        let scope: { end: number; parameters: Set<string> } | undefined;
        for (let i = 0; i < lines.length; i++) {
            if (cancellation.isCancellationRequested) {
                return;
            }
            if (scope && i > scope.end) {
                scope = undefined;
            }
            scope = declarations.get(i) ?? scope;
            const args = lines[i];
            const command = args[0].text;
            if (command.startsWith('어이쿠') || command === '팝콘') {
                continue;
            }
            const functionIndex = command === '그램' ? 2
                : ['엘릭서', '안산', '음...'].includes(command) ? 1 : -1;
            for (let j = 1; j < args.length; j++) {
                const arg = args[j];
                if (!arg.text || arg.text.includes('"') || arg.text.includes('\\')) {
                    continue;
                }
                if (j === functionIndex && functions.has(arg.text)) {
                    builder.push(i, arg.start, arg.text.length, 0, 0);
                    continue;
                }
                const operatorLength = /^[+*/^\-]/.test(arg.text) ? 1 : 0;
                const name = arg.text.slice(operatorLength).split('.')[0];
                if (name && scope?.parameters.has(name)) {
                    builder.push(i, arg.start + operatorLength, name.length, 1, 0);
                }
            }
        }
        return builder.build();
    },
};
