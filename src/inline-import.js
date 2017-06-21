import waterfall from "async-waterfall";
import path from "path";
import fs from "fs";

import { FileImport } from "./file-import.js";
import { Settings } from "./settings.js";

/**
 * A regular expression that detects import statements.
 *
 * @type {RegExp}
 * @private
 */

const importRegExp = /import\s*(\w*)\s*from\s*["'](.*)["']/ig;

/**
 * The current inlining settings.
 *
 * @type {Settings}
 */

let settings = null;

/**
 * Checks if the given file exists.
 *
 * @private
 * @param {Function} next - A callback.
 */

function checkFile(next) {

	fs.access(settings.file, (fs.R_OK | fs.W_OK), next);

}

/**
 * Reads the given file.
 *
 * @private
 * @param {Function} next - A callback.
 */

function readFile(next) {

	fs.readFile(settings.file, settings.encoding, next);

}

/**
 * Parses the file for import statements.
 *
 * @private
 * @param {String} data - The file contents.
 * @param {Function} next - A callback.
 */

function parseImports(data, next) {

	const imports = [];

	let result = importRegExp.exec(data);

	while(result !== null) {

		imports.push(new FileImport(
			result.index,
			importRegExp.lastIndex,
			result[1],
			path.resolve(path.dirname(settings.file), result[2]),
			settings.extensions[path.extname(result[2])]
		));

		result = importRegExp.exec(data);

	}

	// The file might have no imports at all.
	next(null, imports, data);

}

/**
 * Filters imports.
 *
 * @private
 * @param {FileImport[]} imports - A list of all identified import statements.
 * @param {String} data - The file contents.
 * @param {Function} next - A callback.
 */

function filterImports(imports, data, next) {

	const filteredImports = [];

	let i, l;

	for(i = 0, l = imports.length; i < l; ++i) {

		if(imports[i].encoding !== undefined) {

			filteredImports.push(imports[i]);

		}

	}

	// Might end up with no imports.
	next(null, filteredImports, data);

}

/**
 * Checks if the remaining imports are valid. If only one import is invalid, the
 * entire inlining process will be cancelled.
 *
 * @private
 * @param {FileImport[]} imports - A list of all relevant import statements.
 * @param {String} data - The file contents.
 * @param {Function} next - A callback.
 */

function checkImports(imports, data, next) {

	let i = 0;
	let l = imports.length;

	(function proceed(error) {

		if(error || i === l) {

			next(error, imports, data);

		} else {

			fs.access(imports[i++].path, (fs.R_OK | fs.W_OK), proceed);

		}

	}());

}

/**
 * Reads the contents of the imported files.
 *
 * @private
 * @param {FileImport[]} imports - A list of all relevant and valid import statements.
 * @param {String} data - The file contents.
 * @param {Function} next - A callback.
 */

function readImports(imports, data, next) {

	let j;
	let i = -1;
	let l = imports.length;

	(function proceed(error, importData) {

		j = i;

		if(error || ++i === l) {

			// Check if there are any imports.
			if(l > 0) {

				// If so, don't forget to pick up the one that was read last.
				imports[j].data = importData;

			}

			next(error, imports, data);

		} else {

			// Skip this during the first run.
			if(i > 0) {

				// Collect the data. The index i is one step ahead of j.
				imports[j].data = importData;

			}

			fs.readFile(imports[i].path, imports[i].encoding, proceed);

		}

	}());

}

/**
 * Replaces the affected import statements with the actual file contents.
 *
 * @private
 * @param {FileImport[]} imports - A list of all relevant imports.
 * @param {String} data - The original file contents.
 * @param {Function} next - A callback.
 */

function inlineImports(imports, data, next) {

	let modified = imports.length > 0;
	let i;

	// Inline the imports in reverse order to keep the indices intact.
	while(imports.length > 0) {

		i = imports.pop();

		data = data.substring(0, i.start) +
			settings.declaration + " " + i.name + " = " + JSON.stringify(i.data) +
			data.substring(i.end);

	}

	next(null, modified, data);

}

/**
 * Applies the changes by overwriting the original file.
 *
 * @private
 * @param {Boolean} modified - Indicates whether the file contents have been modified.
 * @param {String} data - The modified file contents.
 * @param {Function} next - A callback.
 */

function writeFile(modified, data, next) {

	if(modified) {

		fs.writeFile(settings.file, data, next);

	} else {

		next(null);

	}

}


/**
 * Inlines file imports.
 */

export class InlineImport {

	/**
	 * Transforms the given file by replacing custom file imports with the actual
	 * file contents.
	 *
	 * @param {String} file - A source file.
	 * @param {Object} [options] - The options.
	 * @param {String} [options.encoding] - The encoding of the given file.
	 * @param {Object} [options.extensions] - The import file extensions to consider. Each extension must define an encoding.
	 * @param {Boolean} [options.useVar] - Whether the var declaration should be used instead of const.
	 * @param {Function} [done] - An optional callback function with one argument (any value other than null indicates an error).
	 */

	static transform(file, options, done) {

		settings = new Settings(file, options);

		waterfall([
			checkFile,
			readFile,
			parseImports,
			filterImports,
			checkImports,
			readImports,
			inlineImports,
			writeFile
		], done);

	}

}
