import path from "path";
import fs from "fs";

import { FileImport } from "./FileImport.js";
import { Settings } from "./Settings.js";

/**
 * A regular expression that detects import statements of the form:
 * `import a from "b"`.
 *
 * @type {RegExp}
 * @private
 */

const importRegExp = /import\s*(\w*)\s*from\s*["'](.*)["']/ig;

/**
 * Reads the given file.
 *
 * @private
 * @param {String} file - A file path.
 * @param {String} encoding - The file encoding.
 * @return {Promise} A promise.
 */

function readFile(file, encoding) {

	return new Promise((resolve, reject) => {

		fs.readFile(file, encoding, (error, data) => error ? reject(error) : resolve(data));

	});

}

/**
 * Parses the file for import statements.
 *
 * @private
 * @param {String} data - The file contents.
 * @param {String} file - The path of the source file.
 * @param {Object} extensions - Extensions of imports that shall be inlined.
 * @return {Promise} A promise.
 */

function parseImports(data, file, extensions) {

	const imports = [];

	let result = importRegExp.exec(data);
	let encoding;

	while(result !== null) {

		encoding = extensions[path.extname(result[2])];

		// Filter irrelevant imports.
		if(encoding !== undefined) {

			imports.push(new FileImport(
				result.index,
				importRegExp.lastIndex,
				result[1],
				path.resolve(path.dirname(file), result[2]),
				encoding
			));

		}

		result = importRegExp.exec(data);

	}

	return Promise.resolve([imports, data]);

}

/**
 * Reads the contents of the imported files.
 *
 * @private
 * @param {FileImport[]} imports - A list of relevant import statements.
 * @param {String} data - The file contents.
 * @return {Promise} A promise.
 */

function readImports(imports, data) {

	return (imports.length === 0) ? Promise.resolve([imports, data]) : new Promise((resolve, reject) => {

		let i = 0;

		(function proceed(error, importData) {

			if(importData) {

				imports[i++].data = importData;

			}

			if(error) {

				reject(error);

			} else if(i === imports.length) {

				resolve([imports, data]);

			} else {

				fs.readFile(imports[i].path, imports[i].encoding, proceed);

			}

		}());

	});

}

/**
 * Replaces the affected import statements with the actual file contents.
 *
 * @private
 * @param {FileImport[]} imports - A list of all relevant imports.
 * @param {String} data - The original file contents.
 * @param {String} declaration - The import variable declaration.
 * @return {Promise} A promise.
 */

function inlineImports(imports, data, declaration) {

	let modified = imports.length > 0;
	let i, item;

	// Inline the imports in reverse order to keep the indices intact.
	for(i = imports.length - 1; i >= 0; --i) {

		item = imports[i];

		data = data.substring(0, item.start) +
			declaration + " " + item.name + " = " + JSON.stringify(item.data) +
			data.substring(item.end);

	}

	return Promise.resolve([modified, data]);

}

/**
 * Applies the changes by overwriting the original file.
 *
 * @private
 * @param {Boolean} modified - Indicates whether the file contents have been modified.
 * @param {String} data - The modified file contents.
 * @param {String} file - The file path.
 * @return {Promise} A promise.
 */

function writeFile(modified, data, file) {

	return !modified ? Promise.resolve("Nothing changed") : new Promise((resolve, reject) => {

		fs.writeFile(file, data, (error) => {

			error ? reject(error) : resolve("Success");

		});

	});

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
	 * @return {Promise} A promise.
	 */

	static transform(file, options = {}) {

		const settings = new Settings(options.encoding, options.extensions, options.useVar);

		return readFile(file, settings.encoding)
			.then(result => parseImports(result, file, settings.extensions))
			.then(result => readImports(...result))
			.then(result => inlineImports(...result, settings.declaration))
			.then(result => writeFile(...result, file));

	}

}
