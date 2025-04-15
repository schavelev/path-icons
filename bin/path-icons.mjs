#!/usr/bin/env node
import { promises as fs } from 'fs';
import { resolve, dirname, relative, basename, extname, join } from 'path';
import { fileURLToPath } from 'url';
import { prepareJson, createCSS, createHtml, createCSharp } from '../build/pi-processor.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PI_JSON_FILE_PATH = resolve(__dirname, '../dist/path-icons.json');
const DEFAULT_CONFIG_FILE = 'path-icons.config.json';

// Function to load and parse config file
async function loadConfig(configPath) {
    try {
        const data = await fs.readFile(configPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {}; // File not found, return empty config
        }
        throw new Error(`Failed to load config file ${configPath}: ${error.message}`);
    }
}

// Function to build options from parsed args and config
function buildOptions({ config, inputArg, verboseArg }) {
    // Merge config with CLI arguments
    const opts = {
        input: inputArg || config.input,
        outDir: config.outDir || 'dist',
        verbose: verboseArg || config.verbose || false,
        json: config.json === true ? true : config.json || false,
        css: config.css === true ? true : config.css || false,
        html: config.html === true ? true : config.html || false,
        csharp: config.csharp === true ? true : config.csharp || false,
    };

    // Validate required input
    if (!opts.input) {
        throw new Error(
            'Input file is required. Specify it via --input or in path-icons.config.json'
        );
    }

    // Validate output file types
    for (const key of ['json', 'css', 'html', 'csharp']) {
        if (opts[key] !== true && opts[key] !== false && typeof opts[key] !== 'string') {
            throw new Error(`Config error: "${key}" must be a boolean or string`);
        }
    }

    // Resolve input path and base name
    opts.input = resolve(opts.input);
    const inputBaseName = basename(opts.input, extname(opts.input));
    opts.outDir = resolve(opts.outDir);

    // Set output paths
    opts.jsonPath =
        opts.json === true
            ? join(opts.outDir, `${inputBaseName}.json`)
            : opts.json
                ? resolve(opts.json)
                : null;
    opts.cssPath =
        opts.css === true
            ? join(opts.outDir, `${inputBaseName}.css`)
            : opts.css
                ? resolve(opts.css)
                : null;
    opts.htmlPath =
        opts.html === true
            ? join(opts.outDir, `${inputBaseName}.html`)
            : opts.html
                ? resolve(opts.html)
                : null;
    opts.csharpPath =
        opts.csharp === true
            ? join(opts.outDir, `${inputBaseName}.cs`)
            : opts.csharp
                ? resolve(opts.csharp)
                : null;

    return opts;
}

// Main logic
(async () => {
    try {
        // Parse arguments
        const args = process.argv.slice(2);
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
            config = await loadConfig(configPath);
        } else {
            // Try to load default config file
            config = await loadConfig(resolve(DEFAULT_CONFIG_FILE));
        }

        // Build options
        const opts = buildOptions({ config, inputArg, verboseArg });

        console.log('Starting processing...');
        console.time('Processing completed');

        // Merge icon data
        if (opts.verbose) {
            console.log('\nStarting JSON merge...');
        }
        const mergedData = await prepareJson(opts.input, PI_JSON_FILE_PATH, false);

        // Log merged icons
        if (opts.verbose) {
            const iconNames = Object.keys(mergedData);
            iconNames.forEach(name => console.log(`- ${name}`));
        }
        if (opts.verbose) {
            console.log(`Success! Generated JSON for ${Object.keys(mergedData).length} icon${Object.keys(mergedData).length === 1 ? '' : 's'}`);
        }

        // Write merged JSON data
        if (opts.jsonPath) {
            await fs.mkdir(dirname(opts.jsonPath), { recursive: true });
            await fs.writeFile(opts.jsonPath, JSON.stringify(mergedData, null, 2), 'utf8');
            if (opts.verbose) {
                console.log(`Generated JSON saved at ${opts.jsonPath}`);
            }
        }

        // Generate CSS if requested
        if (opts.cssPath) {
            if (opts.verbose) {
                console.log('\nStarting CSS generation...');
            }
            await createCSS(mergedData, opts.cssPath);
            if (opts.verbose) {
                console.log(`Success! Generated CSS at ${opts.cssPath}`);
            }
        }

        // Generate HTML if requested
        if (opts.htmlPath) {
            if (opts.verbose) {
                console.log('\nStarting HTML generation...');
            }
            if (!opts.cssPath) {
                throw new Error('HTML generation requires CSS to be specified');
            }
            const cssPath = relative(dirname(opts.htmlPath), opts.cssPath);
            await createHtml(mergedData, opts.htmlPath, cssPath);
            if (opts.verbose) {
                console.log(`Success! Generated HTML at ${opts.htmlPath}`);
            }
        }

        // Generate C# if requested
        if (opts.csharpPath) {
            await fs.mkdir(dirname(opts.csharpPath), { recursive: true });
            await createCSharp(mergedData, opts.csharpPath, opts);
            if (opts.verbose) {
                console.log(`Success! Generated C# at ${opts.csharpPath}`);
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