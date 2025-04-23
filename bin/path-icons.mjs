#!/usr/bin/env node
import { promises as fs } from 'fs';
import { resolve, dirname, relative, basename, extname, join, normalize } from 'path';
import { fileURLToPath } from 'url';
import { prepareJson, createCSS, createHtml, createCSharp } from '../build/pi-processor.mjs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

const __dirname = dirname(fileURLToPath(import.meta.url));
const PI_JSON_FILE_PATH = resolve(__dirname, '../dist/path-icons.json');
const DEFAULT_CONFIG_FILE = 'path-icons.config.json';
const DEFAULT_CSHARP_FILE = 'BootstrapSymbol.cs';
const DEFAULT_OUT_DIR = 'dist';

// Function to load and parse config file
async function loadConfig(configPath, inputArg) {
    try {
        const data = await fs.readFile(configPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // If file not found and inputArg is provided, return default config
            if (inputArg) {
                return {
                    outDir: 'dist',
                    json: false,
                    css: true,
                    html: true
                };
            }
            return {}; // File not found, return empty config
        }
        throw new Error(`Failed to load config file ${configPath}: ${error.message}`);
    }
}

// Function to build options from parsed args and config
function buildOptions({ config, inputArg, verboseArg }) {
    function prepareFileName(configValue, subDir, defaultName) {
        var fileName = typeof configValue === 'string'
            ? configValue
            : configValue === true
                ? defaultName
                : null;

        if (fileName) {
            fileName = normalize(fileName);
            return dirname(fileName) !== '.' ? fileName : join(subDir, fileName);
        }
        return fileName;
    }

    // Validate required input
    const inputFile = inputArg || config.input;
    if (!inputFile) {
        throw new Error(
            'Input file is required. Specify it via --input or in path-icons.config.json'
        );
    }

    // Validate output file types
    for (const key of ['json', 'css', 'html', 'csharp']) {
        if (config[key] && config[key] !== true && config[key] !== false && typeof config[key] !== 'string') {
            throw new Error(`Config error: "${key}" must be a boolean or string`);
        }
    }

    const inputBaseName = basename(inputFile, extname(inputFile));
    const outDir = config.outDir || DEFAULT_OUT_DIR;

    // Merge config with CLI arguments
    const opts = {
        input: inputFile,
        outDir: outDir,
        verbose: verboseArg || config.verbose || false,
        json: prepareFileName(config.json, outDir, `${inputBaseName}.json`),
        css: prepareFileName(config.css, outDir, `${inputBaseName}.css`),
        html: prepareFileName(config.html, outDir, `${inputBaseName}.html`),
        csharp: prepareFileName(config.csharp, outDir, DEFAULT_CSHARP_FILE),
    };

    return opts;
}

// Main logic
(async () => {
    try {
        const args = process.argv.slice(2);

        // Show version and exit
        if (args.includes('--version') || args.includes('-v')) {
            console.log(`path-icons v${version}`);
            process.exit(0);
        }

        // Parse arguments
        const CONFIG_INDEX = args.indexOf('--config');
        const INPUT_INDEX = args.indexOf('--input');
        const inputArg = INPUT_INDEX !== -1 && INPUT_INDEX + 1 < args.length ? args[INPUT_INDEX + 1] : null;
        const configArg =
            CONFIG_INDEX !== -1 && CONFIG_INDEX + 1 < args.length ? args[CONFIG_INDEX + 1] : null;
        const verboseArg = args.includes('--verbose');

        // Load config
        let config = {};
        if (configArg) {
            // Load user-specified config file
            const configPath = resolve(configArg);
            config = await loadConfig(configPath, inputArg);
        } else {
            // Try to load default config file
            config = await loadConfig(resolve(DEFAULT_CONFIG_FILE), inputArg);
        }

        // Build options
        const opts = buildOptions({ config, inputArg, verboseArg });
        console.log('Starting processing...');
        console.time('Processing completed');

        // Merge icon data
        if (opts.verbose) {
            console.log('\nStarting JSON merge...');
        }
        const mergedData = await prepareJson(resolve(opts.input), PI_JSON_FILE_PATH, false);

        // Log merged icons
        if (opts.verbose) {
            const iconNames = Object.keys(mergedData);
            iconNames.forEach(name => console.log(`- ${name}`));
        }
        if (opts.verbose) {
            console.log(`Success! Generated JSON for ${Object.keys(mergedData).length} icon${Object.keys(mergedData).length === 1 ? '' : 's'}`);
        }

        // Write merged JSON data
        if (opts.json) {
            const jsonFilePath = resolve(opts.json);
            await fs.mkdir(dirname(jsonFilePath), { recursive: true });
            await fs.writeFile(jsonFilePath, JSON.stringify(mergedData, null, 2), 'utf8');
            if (opts.verbose) {
                console.log(`Generated JSON saved at ${jsonFilePath}`);
            }
        }

        // Generate CSS if requested
        if (opts.css) {
            const cssFilePath = resolve(opts.css);
            await fs.mkdir(dirname(cssFilePath), { recursive: true });
            await createCSS(mergedData, cssFilePath);
            if (opts.verbose) {
                console.log(`Generated CSS at ${cssFilePath}`);
            }
        }

        // Generate HTML if requested
        if (opts.html) {
            const htmlFilePath = resolve(opts.html);
            await fs.mkdir(dirname(htmlFilePath), { recursive: true });
            await createHtml(mergedData, htmlFilePath);
            if (opts.verbose) {
                console.log(`Generated HTML at ${htmlFilePath}`);
            }
        }

        // Generate C# if requested
        if (opts.csharp) {
            const csharpPath = resolve(opts.csharp);
            await fs.mkdir(dirname(csharpPath), { recursive: true });
            await createCSharp(mergedData, csharpPath, opts);
            if (opts.verbose) {
                console.log(`Generated C# at ${csharpPath}`);
            }
        }

        if (opts.verbose) {
            console.log();
        }
        console.timeEnd('Processing completed');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
})();