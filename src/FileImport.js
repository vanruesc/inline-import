/**
 * A file import.
 */

export class FileImport {

	/**
	 * Constructs a new file import.
	 *
	 * @param {Number} start - The start position of this import statement.
	 * @param {Number} end - The end position of this import statement.
	 * @param {String} name - The name of the imported data.
	 * @param {String} path - The path of the imported file.
	 * @param {String} encoding - The file encoding.
	 * @param {String} [data=null] - The contents of the imported file.
	 */

	constructor(start, end, name, path, encoding, data = null) {

		/**
		 * The start position of this import statement.
		 *
		 * @type {Number}
		 */

		this.start = start;

		/**
		 * The end position of this import statement.
		 *
		 * @type {Number}
		 */

		this.end = end;

		/**
		 * The name of the imported data.
		 *
		 * @type {String}
		 */

		this.name = name;

		/**
		 * The path of the imported file.
		 *
		 * @type {String}
		 */

		this.path = path;

		/**
		 * The file encoding.
		 *
		 * @type {String}
		 */

		this.encoding = encoding;

		/**
		 * The contents of the imported file.
		 *
		 * @type {String}
		 * @default null
		 */

		this.data = data;

	}

}
