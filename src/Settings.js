/**
 * Inlining settings.
 */

export class Settings {

	/**
	 * Constructs new inlining settings.
	 *
	 * @param {String} [encoding="utf8"] - The encoding of the source file that will be processed.
	 * @param {Object} [extensions={}] - The import file extensions to consider. Each extension must define an encoding.
	 * @param {Boolean} [useVar=false] - Whether the `var` declaration should be used instead of `const`.
	 */

	constructor(encoding = "utf8", extensions = {}, useVar = false) {

		/**
		 * The encoding of the source file.
		 *
		 * @type {String}
		 */

		this.encoding = encoding;

		/**
		 * The import file extensions to consider. Each extension must define an encoding.
		 *
		 * @type {Object}
		 */

		this.extensions = extensions;

		/**
		 * The preferred variable declaration.
		 *
		 * @type {String}
		 */

		this.declaration = useVar ? "var" : "const";

	}

}
