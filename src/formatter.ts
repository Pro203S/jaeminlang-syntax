// Parse.GetArguments preserves argument whitespace. Trimming it can rename
// variables or change values, so normalize only the command field.
const command = /^[\t ]*(안산|재민|그램|러스트|엘릭서|음\.\.\.|콜라|팝콘|샤갈|해선|저런|메가커피)[\t ]*(?=,|$)/;

export function formatLine(line: string): string {
    if (/^\s*$/.test(line)) {
        return '';
    }
    if (/^[\t ]*어이쿠/.test(line)) {
        return line.trimStart();
    }
    // The provider preserves line endings and counts: 러스트 uses line numbers.
    return line.replace(command, '$1');
}
