/**
 * Inlining settings.
 *
 * @class Settings
 * @constructor
 * @param {String} file - A source file.
 * @param {Object} options - The options.
 * @param {String} [options.encoding] - The encoding of the given file.
 * @param {Object} [options.extensions] - The import file extensions to consider. Each extension must define an encoding.
 * @param {Boolean} [options.useVar] - Whether the var declaration should be used instead of const.
 */

export class Settings {

	constructor(file, options = {}) {

		/**
		 * A source file.
		 *
		 * @property file
		 * @type String
		 */

		this.file = file;

		/**
		 * The encoding of the source file.
		 *
		 * @property encoding
		 * @type String
		 * @default "utf8"
		 */

		this.encoding = (options.encoding !== undefined) ? options.encoding : "utf8";

		/**
		 * The import file extensions to consider. Each extension must define an encoding.
		 *
		 * @property extensions
		 * @type Object
		 * @default null
		 */

		this.extensions = (options.extensions !== undefined) ? options.extensions : null;

		/**
		 * The preferred variable declaration.
		 *
		 * @property declaration
		 * @type String
		 * @default "const"
		 */

		this.declaration = (options.useVar !== undefined && options.useVar) ? "var" : "const";

	}

}
