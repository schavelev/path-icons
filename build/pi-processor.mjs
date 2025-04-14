#!/usr/bin/env node
import { promises as fs } from 'fs';
import { join, resolve, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import Mustache from 'mustache';

const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose');

// Define file paths and constants
const __dirname = dirname(fileURLToPath(import.meta.url));
const BI_JSON_FILE = join(__dirname, '../src/bi.json');
const OVERRIDE_JSON_FILE = join(__dirname, '../src/bi-override.json');
const DEFAULT_OUTPUT_JSON_FILE = join(__dirname, '../dist/path-icons.json');
const DEFAULT_OUTPUT_CSS_FILE = join(__dirname, '../dist/path-icons.css');
const DEFAULT_OUTPUT_HTML_FILE = join(__dirname, '../dist/path-icons.html');
const CSS_TEMPLATE_FILE = join(__dirname, 'base.css.mustache');
const HTML_TEMPLATE_FILE = join(__dirname, 'preview.html.mustache');

/**
 * Merges base JSON and override JSON, optionally including new icons.
 * @param {string} baseJsonPath - Path to base JSON file.
 * @param {string} overrideJsonPath - Path to override JSON file.
 * @param {boolean} addNew - If true, include new icons from override; if false, only update existing.
 * @returns {Promise<object>} Merged icon data.
 */
async function prepareJson(baseJsonPath, overrideJsonPath, addNew) {
    try {
        // Read base JSON
        const baseData = JSON.parse(await fs.readFile(baseJsonPath, 'utf8'));

        // Read override JSON, default to empty object if not found
        let overrideData = {};
        try {
            overrideData = JSON.parse(await fs.readFile(overrideJsonPath, 'utf8'));
            if (VERBOSE) {
                console.log(`Merging with overrides from ${overrideJsonPath}`);
            }
        } catch (error) {
            console.error(`Error loading ${overrideJsonPath}, using base JSON only.`);
            console.error(error);
        }

        // Merge data
        const merged = {};
        if (addNew) {
            // Merge all icons, preserving fields from base and overriding with override
            const allIconNames = [...new Set([...Object.keys(baseData), ...Object.keys(overrideData)])];
            for (const iconName of allIconNames) {
                merged[iconName] = {
                    ...(baseData[iconName] || {}),
                    ...(overrideData[iconName] || {})
                };
            }
        } else {
            // Only update existing icons
            for (const iconName of Object.keys(baseData)) {
                merged[iconName] = {
                    ...baseData[iconName],
                    ...(overrideData[iconName] || {})
                };
            }
        }
        return merged;
    } catch (error) {
        console.error('Error merging JSON:', error);
        throw error;
    }
}

/**
 * Generates CSS from merged icon data and writes it to output path.
 * @param {object} mergedData - Merged icon data.
 * @param {string} outputCssPath - Path for output CSS file.
 * @returns {Promise<void>}
 */
async function createCSS(mergedData, outputCssPath) {
    console.log('Starting CSS generation...');
    console.time('CSS Generation completed');

    try {
        // Compile CSS template
        const baseCSSTemplate = await fs.readFile(CSS_TEMPLATE_FILE, 'utf8');
        const iconNames = Object.keys(mergedData);
        const iconRules = iconNames
            .map(iconName => {
                const iconData = mergedData[iconName];
                if (VERBOSE) {
                    console.log(`- ${iconName}`);
                }
                if (iconData === null) {
                    return '';
                }
                const rules = [];
                if (iconData.pathBefore) {
                    let beforeRule = `.pi-${iconName}::before { content: ''; clip-path: path("${iconData.pathBefore}"); }`;
                    if (iconData.colorBefore) {
                        beforeRule = `.pi-${iconName}::before { content: ''; clip-path: path("${iconData.pathBefore}"); background-color: ${iconData.colorBefore}; }`;
                    }
                    rules.push(beforeRule);
                }
                if (iconData.pathAfter) {
                    let afterRule = `.pi-${iconName}::after { content: ''; clip-path: path("${iconData.pathAfter}"); }`;
                    if (iconData.colorAfter) {
                        afterRule = `.pi-${iconName}::after { content: ''; clip-path: path("${iconData.pathAfter}"); background-color: ${iconData.colorAfter}; }`;
                    }
                    rules.push(afterRule);
                }
                return rules.join('\n').trim();
            })
            .filter(Boolean)
            .join('\n');

        const finalCSS = Mustache.render(baseCSSTemplate, { iconRules: iconRules });

        // Write CSS output
        await fs.mkdir(dirname(outputCssPath), { recursive: true });
        await fs.writeFile(outputCssPath, finalCSS, 'utf8');

        // Log statistics
        const totalIcons = iconNames.length;
        const validIcons = iconNames.filter(name => mergedData[name] !== null).length;
        const ignoredIcons = totalIcons - validIcons;

        console.log(`\nSuccess! Generated CSS for ${totalIcons} icon${totalIcons === 1 ? '' : 's'} at ${outputCssPath}:`);
        console.log(`- ${validIcons} icon${validIcons === 1 ? '' : 's'} with paths`);
        console.log(`- ${ignoredIcons} ignored icon${ignoredIcons === 1 ? '' : 's'} (no paths)`);
        console.timeEnd('CSS Generation completed');
    } catch (error) {
        console.error('Error generating CSS:', error);
        throw error;
    }
}

/**
 * Generates HTML preview from merged icon data and writes it to output path.
 * @param {object} mergedData - Merged icon data.
 * @param {string} outputHtmlPath - Path for output HTML file.
 * @param {string} cssPath - Relative path to CSS file.
 * @returns {Promise<void>}
 */
async function createHtml(mergedData, outputHtmlPath, cssPath) {
    console.log('Starting HTML generation...');
    console.time('HTML Generation completed');

    try {
        // Extract icon names
        const iconNames = Object.keys(mergedData).filter(name => mergedData[name] !== null);
        if (VERBOSE) {
            iconNames.forEach(name => console.log(`- ${name}`));
        }

        // Load HTML template
        const htmlTemplate = await fs.readFile(HTML_TEMPLATE_FILE, 'utf8');

        // Render template
        const htmlContent = Mustache.render(htmlTemplate, {
            cssPath,
            icons: iconNames
        });

        // Write HTML output
        await fs.mkdir(dirname(outputHtmlPath), { recursive: true });
        await fs.writeFile(outputHtmlPath, htmlContent, 'utf8');

        // Log statistics
        const totalIcons = iconNames.length;
        console.log(`\nSuccess! Generated HTML for ${totalIcons} icon${totalIcons === 1 ? '' : 's'} at ${outputHtmlPath}`);
        console.timeEnd('HTML Generation completed');
    } catch (error) {
        console.error('Error generating HTML:', error);
        throw error;
    }
}

export { prepareJson, createCSS, createHtml };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const JSON_INDEX = args.indexOf('--json');
    const CSS_INDEX = args.indexOf('--css');
    const HTML_INDEX = args.indexOf('--html');

    const outputJsonPath = JSON_INDEX !== -1 ? resolve(args[JSON_INDEX + 1]) : DEFAULT_OUTPUT_JSON_FILE;
    const outputCssPath = CSS_INDEX !== -1 ? resolve(args[CSS_INDEX + 1]) : DEFAULT_OUTPUT_CSS_FILE;
    const outputHtmlPath = HTML_INDEX !== -1 ? resolve(args[HTML_INDEX + 1]) : (args.includes('--html') ? DEFAULT_OUTPUT_HTML_FILE : null);

    (async () => {
        try {
            // Merge icon data
            const mergedData = await prepareJson(BI_JSON_FILE, OVERRIDE_JSON_FILE, true);

            // Write merged JSON data
            await fs.mkdir(dirname(outputJsonPath), { recursive: true });
            await fs.writeFile(outputJsonPath, JSON.stringify(mergedData, null, 2), 'utf8');
            console.log(`Generated JSON data at ${outputJsonPath}`);

            // Generate CSS
            await createCSS(mergedData, outputCssPath);

            // Generate HTML if requested
            if (outputHtmlPath) {
                const cssPath = relative(dirname(outputHtmlPath), outputCssPath);
                await createHtml(mergedData, outputHtmlPath, cssPath);
            }
        } catch (error) {
            console.error('Error:', error);
            process.exit(1);
        }
    })();
}