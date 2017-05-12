/**
 * A file import.
 *
 * @class FileImport
 * @constructor
 * @param {Number} start - The start position of this import statement.
 * @param {Number} end - The end position of this import statement.
 * @param {String} name - The name of the imported data.
 * @param {String} path - The path of the imported file.
 * @param {String} encoding - The file encoding.
 * @param {String} [data=null] - The contents of the imported file.
 */

export class FileImport {

	constructor(start, end, name, path, encoding, data = null) {

		/**
		 * The start position of this import statement.
		 *
		 * @property start
		 * @type Number
		 */

		this.start = start;

		/**
		 * The end position of this import statement.
		 *
		 * @property end
		 * @type Number
		 */

		this.end = end;

		/**
		 * The name of the imported data.
		 *
		 * @property name
		 * @type String
		 */

		this.name = name;

		/**
		 * The path of the imported file.
		 *
		 * @property path
		 * @type String
		 */

		this.path = path;

		/**
		 * The file encoding.
		 *
		 * @property encoding
		 * @type String
		 */

		this.encoding = encoding;

		/**
		 * The contents of the imported file.
		 *
		 * @property data
		 * @type String
		 * @default null
		 */

		this.data = data;

	}

}
