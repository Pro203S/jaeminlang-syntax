const esbuild = require('esbuild');

async function main() {
    const production = process.argv.includes('--production');
    const context = await esbuild.context({
        entryPoints: ['src/extension.ts'],
        bundle: true,
        format: 'cjs',
        platform: 'node',
        outfile: 'dist/extension.js',
        external: ['vscode'],
        sourcemap: !production,
        minify: production,
        logLevel: 'info',
    });
    if (process.argv.includes('--watch')) {
        await context.watch();
    } else {
        try {
            await context.rebuild();
        } finally {
            await context.dispose();
        }
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
