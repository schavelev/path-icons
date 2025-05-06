import { promises as fs } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import Mustache from 'mustache';

// Define file paths and constants
const __dirname = dirname(fileURLToPath(import.meta.url));
const CSS_TEMPLATE_FILE = join(__dirname, 'base.css.mustache');
const HTML_TEMPLATE_FILE = join(__dirname, 'preview.html.mustache');


// Helper function to convert 'string value' to object { d: 'string value' }
function _toPathObject(item) {
    if (typeof item === 'string') return { d: item };
    return typeof item === 'object' ? item || {} : {};
}

// Helper function to convert object { d: 'string value' } without `fill` to 'string value'.
function _fromPathObject(item = {}) {
    if (typeof item !== 'object') return null;
    const { d, fill } = item;
    return typeof d === 'string' && d && !fill ? d : item;
}

// Merges data for a single icon
function _mergeIconData(baseData, sourceData, iconName) {
    const baseIconData = baseData[iconName];
    const sourceIconData = sourceData[iconName];

    // If no base data for this icon, use source data if available, otherwise empty array
    if (!baseIconData) {
        return Array.isArray(sourceIconData) ? sourceIconData : [];
    }

    // If base data is already in the new array format
    if (Array.isArray(baseIconData)) {
        // Check if base array contains any path ('d') after conversion.
        const baseHasPath = baseIconData.some(item => _toPathObject(item).d);
        // If base has any path OR source is not array, return base data directly.
        if (baseHasPath || !Array.isArray(sourceIconData)) {
            return baseIconData;
        }

        // Get base fills (up to 2)
        const baseFill0 = baseIconData.length > 0 ? _toPathObject(baseIconData[0]).fill : undefined;
        const baseFill1 = baseIconData.length > 1 ? _toPathObject(baseIconData[1]).fill : undefined;
        // Apply base fill to source[0]
        if (typeof baseFill0 === 'string' && baseFill0 && sourceIconData.length > 0) {
            sourceIconData[0] = Object.assign(_toPathObject(sourceIconData[0]), { fill: baseFill0 });
        }
        // Apply base fill to source[1]
        if (typeof baseFill1 === 'string' && baseFill1 && sourceIconData.length > 1) {
            sourceIconData[1] = Object.assign(_toPathObject(sourceIconData[1]), { fill: baseFill1 });
        }

        // Return the modified sourceIconData array
        return sourceIconData;
    }

    // LEGACY format
    if (baseIconData && typeof baseIconData === 'object' && !Array.isArray(baseIconData) && Array.isArray(sourceIconData)) {
        const newFormatArray = [];
        // Handle pathBefore/colorBefore, using source's first element as fallback
        if (baseIconData.pathBefore || baseIconData.colorBefore) {
            const srcItem = sourceIconData.length > 0 ? _toPathObject(sourceIconData[0]) : {};
            const baseItem = {
                d: baseIconData.pathBefore || srcItem.d,
                fill: baseIconData.colorBefore || srcItem.fill
            };
            const resultItem = _fromPathObject(baseItem);
            if (resultItem)
                newFormatArray.push(resultItem);
        }
        // Handle pathAfter/colorAfter, using source's second element as fallback
        if (baseIconData.pathAfter || baseIconData.colorAfter) {
            const srcItem = sourceIconData.length > 1 ? _toPathObject(sourceIconData[1]) : {};
            const baseItem = {
                d: baseIconData.pathAfter|| srcItem.d,
                fill: baseIconData.colorAfter || srcItem.fill
            };
            const resultItem = _fromPathObject(baseItem);
            if (resultItem)
                newFormatArray.push(resultItem);
        }

        return newFormatArray;
    }

    // If neither source nor base has valid data in expected formats, return null
    return null;
}


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

        // Determine which icon names to process
        const baseIconNames = Object.keys(baseData);
        const sourceIconNames = Object.keys(sourceData);
        const iconNames = addSource ? [...new Set([...baseIconNames, ...sourceIconNames])] : baseIconNames;

        // Merge data for each icon
        const merged = {};
        for (const iconName of iconNames) {
            const mergedIcon = _mergeIconData(baseData, sourceData, iconName);
            if (Array.isArray(mergedIcon) && mergedIcon.length !== 0) {
                merged[iconName] = mergedIcon;
            }
            else {
                console.warn(`  WARN: No source data for icon "${iconName}".`);
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
                if (!Array.isArray(iconData) || iconData.length === 0) {
                    return '';
                }

                const rules = [];

                const firstItem = _toPathObject(iconData[0]);
                if (firstItem.d) {
                    const beforeRule = firstItem.fill
                        ? `.pi-${iconName}::before { content: ''; clip-path: path("${firstItem.d}"); background-color: ${firstItem.fill}; }`
                        : `.pi-${iconName}::before { content: ''; clip-path: path("${firstItem.d}"); }`;
                    rules.push(beforeRule);
                }

                if (iconData.length > 1) {
                    const secondItem = _toPathObject(iconData[1]);
                    if (secondItem.d) {
                        const pathAfter = iconData.slice(1)
                            .map(item => _toPathObject(item).d)
                            .join(' ');
                        const afterRule = secondItem.fill
                            ? `.pi-${iconName}::after { content: ''; clip-path: path("${pathAfter}"); background-color: ${secondItem.fill}; }`
                            : `.pi-${iconName}::after { content: ''; clip-path: path("${pathAfter}"); }`;
                        rules.push(afterRule);
                    }
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
            .filter(([name, data]) => Array.isArray(data) && data.length !== 0)
            .map(([name, data]) => ({
                name,
                header: data[0].header || name
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

        // Process icon data for C# enum
        const iconDefinitions = Object.keys(mergedData)
            .filter(iconName => Array.isArray(mergedData[iconName]) && mergedData[iconName].length > 0)
            .map(iconName => {
                const iconDataArray = mergedData[iconName];
                // Convert icon name to PascalCase for C# enum member
                const pascalCaseName = iconName
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join('');

                // Prepare attributes for SymbolPath
                const attributes = [];

                // Iterate through each path/color item in the array to create SymbolPath attributes
                for (const item of iconDataArray) {
                    const pathItem = _toPathObject(item);
                    const path = pathItem.d;
                    const color = pathItem.fill;

                    if (path) {
                        if (color) {
                            let colorValue = '0';
                            if (color.startsWith('#')) {
                                // Convert HEX to ARGB (add 0xff for full opacity)
                                colorValue = `0xff${color.slice(1).toLowerCase()}`;
                            } else {
                                // Use KnownColor for named colors (requires System.Drawing)
                                colorValue = `KnownColor.${color}`;
                            }
                            attributes.push(`[${attrName}("${path}", ${colorValue})]`);
                        }
                        else {
                            attributes.push(`[${attrName}("${path}")]`);
                        }
                    }
                }

                return {
                    comment: iconName,
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