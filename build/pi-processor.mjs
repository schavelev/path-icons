import { promises as fs } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import Mustache from 'mustache';

// Define file paths and constants
const __dirname = dirname(fileURLToPath(import.meta.url));
const CSS_TEMPLATE_FILE = join(__dirname, 'base.css.mustache');
const HTML_TEMPLATE_FILE = join(__dirname, 'preview.html.mustache');

/**
 * Merges base JSON and override JSON, optionally including new icons.
 * @param {string} baseJsonPath - Path to base JSON file.
 * @param {string} sourceJsonPath - Path to source JSON file.
 * @param {object} options - Configuration options.
 * @param {boolean} [options.addSource] - If true, include new icons from source; if false, only update existing.
 * @returns {Promise<object>} Merged icon data.
 */
async function prepareJson(baseJsonPath, sourceJsonPath, options = {}) {
    const jsonOptions = options.jsonOptions || {};    
    try {
        const {
            addSource = false
        } = jsonOptions;

        // Read base JSON
        const baseData = JSON.parse(await fs.readFile(baseJsonPath, 'utf8'));

        // Read override JSON, default to empty object if not found
        let sourceData = {};
        try {
            sourceData = JSON.parse(await fs.readFile(sourceJsonPath, 'utf8'));
        } catch (error) {
            console.error(`Error loading ${sourceJsonPath}, using base JSON only.`);
            console.error(error);
        }

        // Merge data
        const merged = {};
        if (addSource) {
            // Merge all icons, preserving fields from base and overriding with override
            const allIconNames = [...new Set([...Object.keys(baseData), ...Object.keys(sourceData)])];
            for (const iconName of allIconNames) {
                merged[iconName] = {
                    ...(baseData[iconName] || {}),
                    ...(sourceData[iconName] || {})
                };
            }
        } else {
            // Only update existing icons
            for (const iconName of Object.keys(baseData)) {
                merged[iconName] = {
                    ...baseData[iconName],
                    ...(sourceData[iconName] || {})
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
 * Generates the raw CSS content string from merged icon data.
 * @param {object} mergedData - Merged icon data.
 * @returns {Promise<string>} The generated CSS content string.
 */
async function generateCssContent(mergedData) {
    try {
        // Load CSS template
        const baseCSSTemplate = await fs.readFile(CSS_TEMPLATE_FILE, 'utf8');

        // Generate icon rules
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

        // Render the final CSS string
        const finalCSS = Mustache.render(baseCSSTemplate, { iconRules: iconRules });

        return finalCSS; // Return the generated string

    } catch (error) {
        console.error('Error generating CSS content:', error);
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
        const finalCSS = await generateCssContent(mergedData);

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
async function createHtml(mergedData, outputHtmlPath) {
    try {
        // Extract icon data with names and headers
        const iconsData = Object.entries(mergedData)
            .filter(([name, data]) => data !== null)
            .map(([name, data]) => ({
                name,
                header: data.header || name
            }));

        // Load HTML template
        const htmlTemplate = await fs.readFile(HTML_TEMPLATE_FILE, 'utf8');

        // Prepare CSS content
        const cssContent = await generateCssContent(mergedData);

        // Render template
        const htmlContent = Mustache.render(htmlTemplate, {
            cssContent: cssContent,
            icons: iconsData
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