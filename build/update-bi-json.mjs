// update-bi-json.mjs
import { XMLParser } from 'fast-xml-parser';
import { promises as fs } from 'fs';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import pLimit from 'p-limit';

// Equivalent of __dirname in ESM
const __dirname = dirname(fileURLToPath(import.meta.url));

const ICONS_DIR = join(__dirname, '../node_modules/bootstrap-icons/icons');
const OUTPUT_FILE = join(__dirname, '../src/bi.json');
const VERBOSE = process.argv.includes('--verbose');

/**
 * Processes a single SVG file to extract path data, validating dimensions and content.
 * Skips files that are not 16x16, do not have a '0 0 16 16' viewBox,
 * contain elements other than <path>, or have no <path> elements with a 'd' attribute.
 * @param {string} file - The filename of the SVG icon (e.g., 'alarm.svg').
 * @param {string} iconsDir - Absolute path to the directory with icons.
 * @param {XMLParser} parser - Configured XMLParser instance.
 * @returns {Promise<{iconName: string, data: string[]|null, error?: boolean}>} - An object containing the icon name and its path data as an array of strings, or null if skipped, or an error flag.
 */
async function processFile(file, iconsDir, parser) {
    const filePath = join(iconsDir, file);
    const iconName = basename(file, '.svg');

    try {
        const svgContent = await fs.readFile(filePath, 'utf8');
        const result = parser.parse(svgContent);

        // Basic SVG structure check
        if (!result.svg) {
            if (VERBOSE) console.warn(`  WARN: Invalid SVG structure in ${file}.`);
            return { iconName, data: null };
        }

        const svgAttributes = result.svg.$;
        const expectedWidth = '16';
        const expectedHeight = '16';
        const expectedViewBox = '0 0 16 16';

        // Validate dimensions and viewBox
        const isValidSize =
            svgAttributes?.width === expectedWidth &&
            svgAttributes?.height === expectedHeight &&
            svgAttributes?.viewBox === expectedViewBox;

        if (!isValidSize) {
            if (VERBOSE) {
                console.warn(
                    `  WARN: Skipping ${file}. Expected width="${expectedWidth}", height="${expectedHeight}", viewBox="${expectedViewBox}". ` +
                    `Found: width="${svgAttributes?.width}", height="${svgAttributes?.height}", viewBox="${svgAttributes?.viewBox}".`
                );
            }
            return { iconName, data: null };
        }

        // Check for disallowed elements
        const allowedKeys = ['$','path'];
        let containsOnlyAllowedElements = true;
        for (const key of Object.keys(result.svg)) {
            if (!allowedKeys.includes(key)) {
                containsOnlyAllowedElements = false;
                if (VERBOSE) console.warn(`  WARN: Skipping ${file}. Contains disallowed element type: <${key}>.`);
                break;
            }
        }

        if (!containsOnlyAllowedElements) {
            return { iconName, data: null };
        }

        // Use parser's isArray option to ensure paths is always an array
        const paths = result.svg.path || [];

        // Extract 'd' attribute from each path, trim whitespace, and filter out empty ones
        const pathValues = paths
            .map(p => p?.$?.d?.trim())
            .filter(Boolean);

        // Check if there are any valid paths
        if (!pathValues.length) {
            if (VERBOSE) console.log(`  INFO: No valid <path d="..."> found (or only disallowed elements were present) in ${file}.`);
            return { iconName, data: null };
        }

        // Return the icon name and the array of path 'd' attribute strings
        return {
            iconName,
            data: pathValues,
        };
    } catch (error) {
        console.error(`\nERROR processing file ${file}:`, error.message);
        if (VERBOSE && error.stack) console.error(error.stack);
        return { iconName, data: null, error: true };
    }
}

/**
 * Main function to build the JSON file from Bootstrap Icons SVG files.
 */
async function buildIcons() {
    console.log('Starting Bootstrap Icons JSON build...');
    console.time('Build completed');

    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
        attributesGroupName: '$',
        // Ensure 'path' is always an array for easier handling
        isArray: (tagName) => tagName === 'path'
    });

    const limit = pLimit(50);

    try {
        await fs.access(ICONS_DIR);
    } catch (error) {
        console.error(`\nError: Bootstrap Icons directory not found at ${ICONS_DIR}`);
        console.error('Run `npm install` or ensure the path is correct.');
        process.exit(1);
    }

    try {
        const files = await fs.readdir(ICONS_DIR);
        const svgFiles = files.filter(file => file.endsWith('.svg'));
        const totalFiles = svgFiles.length;

        if (totalFiles === 0) {
            console.warn(`No SVG files found in ${ICONS_DIR}`);
            console.timeEnd('Build completed');
            return;
        }

        console.log(`Found ${totalFiles} SVG file(s) to process from ${ICONS_DIR}`);

        const iconsData = {};
        let processedCount = 0;
        let skippedCount = 0;
        const pathCounts = {};

        const results = await Promise.all(
            svgFiles.map(file => limit(() => processFile(file, ICONS_DIR, parser)))
        );

        // Build the final object, count outcomes, and collect path statistics
        for (const result of results) {
            if (result.data && !result.error) {
                processedCount++;
                iconsData[result.iconName] = result.data;

                // Collect path count statistics
                const numPaths = result.data.length;
                pathCounts[numPaths] = (pathCounts[numPaths] || 0) + 1;

            } else {
                skippedCount++;
            }
        }

        await fs.mkdir(dirname(OUTPUT_FILE), { recursive: true });
        await fs.writeFile(OUTPUT_FILE, JSON.stringify(iconsData, null, 2), 'utf8');

        // Display summary statistics
        console.log(`\n--- Build Summary ---`);
        console.log(`Total SVG files found: ${totalFiles}`);
        console.log(`- ${processedCount} successfully processed and included`);
        console.log(`- ${skippedCount} skipped (invalid size/content/no paths/error)`);

        // Display path count distribution only if VERBOSE is enabled
        if (VERBOSE) {
            const sortedPathKeys = Object.keys(pathCounts).map(Number).sort((a, b) => a - b);
            if (sortedPathKeys.length > 0) {
                 console.log('\nPath Count Distribution (for processed icons):');
                 for (const numPaths of sortedPathKeys) {
                     const count = pathCounts[numPaths];
                     const pathLabel = numPaths === 1 ? 'path' : 'paths'; // Handle pluralization
                     console.log(`- ${count} icon(s) with ${numPaths} ${pathLabel}`);
                 }
            } else if (processedCount > 0) {
                 // This case should generally not happen if processedCount > 0
                 console.log('\nPath Count Distribution: No path counts recorded.');
            }
        }

        console.log(`\nOutput JSON written to: ${OUTPUT_FILE}`);
        console.timeEnd('Build completed');
    } catch (error) {
        console.error('\nFATAL ERROR during build process:', error);
        process.exit(1);
    }
}

// Execute the build process
buildIcons();