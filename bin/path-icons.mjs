#!/usr/bin/env node
import { promises as fs } from 'fs';
import { resolve, dirname, relative, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { prepareJson, createCSS, createHtml } from '../build/pi-processor.mjs';

// Define override JSON path
const __dirname = dirname(fileURLToPath(import.meta.url));
const PI_JSON_FILE = resolve(__dirname, '../dist/path-icons.json');

const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose');

// Parse arguments
const INPUT_INDEX = args.indexOf('--input');
const JSON_INDEX = args.indexOf('--json');
const CSS_INDEX = args.indexOf('--css');
const HTML_INDEX = args.indexOf('--html');

if (INPUT_INDEX === -1 || JSON_INDEX === -1 || INPUT_INDEX + 1 >= args.length || JSON_INDEX + 1 >= args.length) {
    console.error('Error: Both --input and --json arguments are required');
    console.error('Usage: node bin/path-icons.mjs --input <input-json> --json <output-json> [--css [output-css]] [--html [output-html]] [--verbose]');
    process.exit(1);
}

const inputPath = resolve(args[INPUT_INDEX + 1]);
const outputJsonPath = resolve(args[JSON_INDEX + 1]);

// Determine CSS and HTML paths
const jsonBaseName = basename(outputJsonPath, extname(outputJsonPath));
const outputCssPath = CSS_INDEX !== -1 ? (
    args[CSS_INDEX + 1] && !args[CSS_INDEX + 1].startsWith('--') ?
        resolve(args[CSS_INDEX + 1]) :
        resolve(dirname(outputJsonPath), `${jsonBaseName}.css`)
) : null;
const outputHtmlPath = HTML_INDEX !== -1 ? (
    args[HTML_INDEX + 1] && !args[HTML_INDEX + 1].startsWith('--') ?
        resolve(args[HTML_INDEX + 1]) :
        resolve(dirname(outputJsonPath), `${jsonBaseName}.html`)
) : null;

(async () => {
    try {
        // Merge icon data
        console.log('Starting JSON merge...');
        console.time('Processing completed');
        const mergedData = await prepareJson(inputPath, PI_JSON_FILE, false);

        // Log merged icons
        if (VERBOSE) {
            const iconNames = Object.keys(mergedData);
            iconNames.forEach(name => console.log(`- ${name}`));
        }

        // Write merged JSON data
        await fs.mkdir(dirname(outputJsonPath), { recursive: true });
        await fs.writeFile(outputJsonPath, JSON.stringify(mergedData, null, 2), 'utf8');

        // Log JSON statistics
        const totalIcons = Object.keys(mergedData).length;
        console.log(`\nSuccess! Generated JSON for ${totalIcons} icon${totalIcons === 1 ? '' : 's'} at ${outputJsonPath}`);

        // Generate CSS if requested
        if (outputCssPath) {
            await createCSS(mergedData, outputCssPath);
        }

        // Generate HTML if requested
        if (outputHtmlPath) {
            if (!outputCssPath) {
                console.error('Error: --html requires --css to specify a CSS file');
                process.exit(1);
            }
            const cssPath = relative(dirname(outputHtmlPath), outputCssPath);
            await createHtml(mergedData, outputHtmlPath, cssPath);
        }

        console.timeEnd('Processing completed');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
})();
