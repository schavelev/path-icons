import { XMLParser } from 'fast-xml-parser';
import { promises as fs } from 'fs';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import pLimit from 'p-limit';

// Эквивалент __dirname в ESM
const __dirname = dirname(fileURLToPath(import.meta.url));

const ICONS_DIR = join(__dirname, '../node_modules/bootstrap-icons/icons');
const OUTPUT_FILE = join(__dirname, '../src/bi.json');
const VERBOSE = process.argv.includes('--verbose');

/**
 * Processes a single SVG file to extract path data, validating dimensions.
 * @param {string} file - The filename of the SVG icon (e.g., 'alarm.svg').
 * @param {string} iconsDir - Absolute path to the directory with icons.
 * @param {XMLParser} parser - Configured XMLParser instance.
 * @returns {Promise<{iconName: string, data: object|null, error?: boolean}>} - An object containing the icon name and its path data, or null if skipped/no paths/invalid size, or an error flag.
 */
async function processFile(file, iconsDir, parser) {
    const filePath = join(iconsDir, file);
    const iconName = basename(file, '.svg');

    if (VERBOSE) {
        console.log(`- Processing: ${iconName}`);
    }

    try {
        const svgContent = await fs.readFile(filePath, 'utf8');
        const result = parser.parse(svgContent);

        if (!result.svg) {
            if (VERBOSE) console.warn(`  WARN: Invalid SVG structure in ${file}.`);
            return { iconName, data: null };
        }

        const svgAttributes = result.svg.$;
        const expectedWidth = '16';
        const expectedHeight = '16';
        const expectedViewBox = '0 0 16 16';

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

        const paths = Array.isArray(result.svg.path)
            ? result.svg.path
            : result.svg.path
                ? [result.svg.path]
                : [];
        const pathValues = paths
            .map(p => p?.$?.d?.trim())
            .filter(Boolean);

        if (!pathValues.length) {
            if (VERBOSE) console.log(`  INFO: No valid <path d="..."> in ${file}.`);
            return { iconName, data: null };
        }

        if (VERBOSE) console.log(`  OK: Found ${pathValues.length} path(s) in ${file}.`);
        return {
            iconName,
            data:
                pathValues.length === 2
                    ? { pathBefore: pathValues[0], pathAfter: pathValues[1] }
                    : { pathBefore: pathValues.join(' ') },
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

    // Создаем парсер один раз
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
        attributesGroupName: '$',
    });

    // Ограничиваем параллелизм
    const limit = pLimit(50);

    try {
        // Check if the icons directory exists
        await fs.access(ICONS_DIR);
    } catch (error) {
        console.error(`\nError: Bootstrap Icons directory not found at ${ICONS_DIR}`);
        console.error('Run `npm install` to install dependencies.');
        process.exit(1);
    }

    try {
        // Read all files in the icons directory
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

        // Process all files with p-limit
        const results = await Promise.all(
            svgFiles.map(file => limit(() => processFile(file, ICONS_DIR, parser)))
        );

        // Build the final object and count outcomes
        for (const result of results) {
            if (result.error || result.data === null) {
                skippedCount++;
                iconsData[result.iconName] = null;
            } else {
                processedCount++;
                iconsData[result.iconName] = result.data;
            }
        }

        // Ensure output directory exists
        await fs.mkdir(dirname(OUTPUT_FILE), { recursive: true });

        // Write the result to src/bi.json
        await fs.writeFile(OUTPUT_FILE, JSON.stringify(iconsData, null, 2), 'utf8');

        // Display statistics
        console.log(`\n--- Build Summary ---`);
        console.log(`Total SVG files processed: ${totalFiles}`);
        console.log(`- ${processedCount} successfully`);
        console.log(`- ${skippedCount} skipped (no paths/error/invalid size)`);
        console.log(`Output JSON written to: ${OUTPUT_FILE}`);
        console.timeEnd('Build completed');
    } catch (error) {
        console.error('\nFATAL ERROR during build process:', error);
        process.exit(1);
    }
}

// Execute the build process
buildIcons();