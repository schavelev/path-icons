#!/usr/bin/env node
import { promises as fs } from 'fs';
import { join, resolve, dirname, relative, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import Mustache from 'mustache';

const args = process.argv.slice(2);

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
    try {
        // Compile CSS template
        const baseCSSTemplate = await fs.readFile(CSS_TEMPLATE_FILE, 'utf8');
        const iconNames = Object.keys(mergedData);
        const iconRules = iconNames
            .map(iconName => {
                const iconData = mergedData[iconName];
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
    try {
        // Extract icon names
        const iconNames = Object.keys(mergedData).filter(name => mergedData[name] !== null);

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
    } catch (error) {
        console.error('Error generating HTML:', error);
        throw error;
    }
}

/**
 * Generates C# enum from merged icon data and writes it to output path.
 * @param {object} mergedData - Merged icon data.
 * @param {string} outputCsharpPath - Path for output C# file.
 * @param {object} options - Configuration options.
 * @param {string} [options.namespace="SharedLib.Bootstrap"] - Namespace for the enum.
 * @param {string} [options.enumName="BootstrapSymbol"] - Name of the enum.
 * @param {string} [options.attrName="SymbolPath"] - Name of the attribute for symbol paths.
 * @returns {Promise<void>}
 */
async function createCSharp(mergedData, outputCsharpPath, options = {}) {
    const csharpOptions = options.csharpOptions || {};
    const enumName = basename(outputCsharpPath, extname(outputCsharpPath));
    try {
        // Default options
        const {
            namespace = 'SharedLib.Bootstrap',
            attrName = 'SymbolPath'
        } = csharpOptions;

        // Load C# template
        const csharpTemplate = await fs.readFile(join(__dirname, 'csharp.mustache'), 'utf8');

        // Process icon data
        const iconDefinitions = Object.keys(mergedData)
            .filter(iconName => mergedData[iconName] !== null)
            .map(iconName => {
                const iconData = mergedData[iconName];
                const pascalCaseName = iconName
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join('');

                // Prepare attributes for SymbolPath
                const attributes = [];

                // Handle pathBefore
                if (iconData.pathBefore) {
                    let colorValue = '0';
                    if (iconData.colorBefore) {
                        if (iconData.colorBefore.startsWith('#')) {
                            // Convert HEX to ARGB (add 0xff for full opacity)
                            colorValue = `0xff${iconData.colorBefore.slice(1).toLowerCase()}`;
                        } else {
                            // Use KnownColor for named colors
                            colorValue = `KnownColor.${iconData.colorBefore}`;
                        }
                    }
                    attributes.push(`[${attrName}("${iconData.pathBefore}", ${colorValue})]`);
                }

                // Handle pathAfter
                if (iconData.pathAfter) {
                    let colorValue = '0';
                    if (iconData.colorAfter) {
                        if (iconData.colorAfter.startsWith('#')) {
                            colorValue = `0xff${iconData.colorAfter.slice(1).toLowerCase()}`;
                        } else {
                            colorValue = `KnownColor.${iconData.colorAfter}`;
                        }
                    }
                    attributes.push(`[${attrName}("${iconData.pathAfter}", ${colorValue})]`);
                }

                return {
                    comment: iconData.header ? `${iconData.header}, ${iconName}` : iconName,
                    name: pascalCaseName,
                    attributes: attributes.join('\n    ')
                };
            });

        // Render C# template
        const csharpContent = Mustache.render(csharpTemplate, {
            namespace,
            enumName,
            icons: iconDefinitions
        });

        // Write C# output
        await fs.mkdir(dirname(outputCsharpPath), { recursive: true });
        await fs.writeFile(outputCsharpPath, csharpContent, 'utf8');
    } catch (error) {
        console.error('Error generating C#:', error);
        throw error;
    }
}
export { prepareJson, createCSS, createHtml, createCSharp };

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