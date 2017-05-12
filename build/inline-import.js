/**
 * inline-import v0.0.0 build May 12 2017
 * https://github.com/vanruesc/inline-import
 * Copyright 2017 Raoul van Rüschen, Zlib
 */

'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var waterfall = _interopDefault(require('async-waterfall'));
var path = _interopDefault(require('path'));
var fs = _interopDefault(require('fs'));

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

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
 * @param {Number} [data=null] - The contents of the imported file.
 */

var FileImport = function FileImport(start, end, name, path$$1, encoding) {
		var data = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
		classCallCheck(this, FileImport);


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

		this.path = path$$1;

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
};

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

var Settings = function Settings(file) {
		var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
		classCallCheck(this, Settings);


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

		this.encoding = options.encoding !== undefined ? options.encoding : "utf8";

		/**
   * The import file extensions to consider. Each extension must define an encoding.
   *
   * @property extensions
   * @type Object
   * @default null
   */

		this.extensions = options.extensions !== undefined ? options.extensions : null;

		/**
   * The preferred variable declaration.
   *
   * @property declaration
   * @type String
   * @default "const"
   */

		this.declaration = options.useVar !== undefined && options.useVar ? "var" : "const";
};

/**
 * A regular expression that detects import statements.
 *
 * @property importRegExp
 * @type RegExp
 * @private
 * @static
 * @final
 */

var importRegExp = /import\s*(\w*)\s*from\s*[\"\'](.*)[\"\']/ig;

/**
 * The current inlining settings.
 *
 * @property settings
 * @type Settings
 * @private
 * @static
 */

var settings = null;

/**
 * Checks if the given file exists.
 *
 * @method checkFile
 * @private
 * @static
 * @param {Function} next - A callback.
 */

function checkFile(next) {

	fs.access(settings.file, fs.R_OK | fs.W_OK, next);
}

/**
 * Reads the given file.
 *
 * @method readFile
 * @private
 * @static
 * @param {Function} next - A callback.
 */

function readFile(next) {

	fs.readFile(settings.file, settings.encoding, next);
}

/**
 * Parses the file for import statements.
 *
 * @method parseImports
 * @private
 * @static
 * @param {String} data - The file contents.
 * @param {Function} next - A callback.
 */

function parseImports(data, next) {

	var imports = [];

	var result = importRegExp.exec(data);

	while (result !== null) {

		imports.push(new FileImport(result.index, importRegExp.lastIndex, result[1], path.resolve(path.dirname(settings.file), result[2]), settings.extensions[path.extname(result[2])]));

		result = importRegExp.exec(data);
	}

	// The file might have no imports at all.
	next(null, imports, data);
}

/**
 * Filters imports.
 *
 * @method filterImports
 * @private
 * @static
 * @param {FileImport[]} imports - A list of all identified import statements.
 * @param {String} data - The file contents.
 * @param {Function} next - A callback.
 */

function filterImports(imports, data, next) {

	var filteredImports = [];

	var i = void 0,
	    l = void 0;

	for (i = 0, l = imports.length; i < l; ++i) {

		if (imports[i].encoding !== undefined) {

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
 * @method checkImports
 * @private
 * @static
 * @param {FileImport[]} imports - A list of all relevant import statements.
 * @param {String} data - The file contents.
 * @param {Function} next - A callback.
 */

function checkImports(imports, data, next) {

	var i = 0;
	var l = imports.length;

	(function proceed(error) {

		if (error || i === l) {

			next(error, imports, data);
		} else {

			fs.access(imports[i++].path, fs.R_OK | fs.W_OK, proceed);
		}
	})();
}

/**
 * Reads the contents of the imported files.
 *
 * @method readImports
 * @private
 * @static
 * @param {FileImport[]} imports - A list of all relevant and valid import statements.
 * @param {String} data - The file contents.
 * @param {Function} next - A callback.
 */

function readImports(imports, data, next) {

	var j = void 0;
	var i = -1;
	var l = imports.length;

	(function proceed(error, importData) {

		j = i;

		if (error || ++i === l) {

			// Check if there are any imports.
			if (l > 0) {

				// If so, don't forget to pick up the one that was read last.
				imports[j].data = importData;
			}

			next(error, imports, data);
		} else {

			// Skip this during the first run.
			if (i > 0) {

				// Collect the data. The index i is one step ahead of j.
				imports[j].data = importData;
			}

			fs.readFile(imports[i].path, imports[i].encoding, proceed);
		}
	})();
}

/**
 * Replaces the affected import statements with the actual file contents.
 *
 * @method inlineImports
 * @private
 * @static
 * @param {FileImport[]} imports - A list of all relevant imports.
 * @param {String} data - The original file contents.
 * @param {Function} next - A callback.
 */

function inlineImports(imports, data, next) {

	var modified = imports.length > 0;
	var i = void 0;

	// Inline the imports in reverse order to keep the indices intact.
	while (imports.length > 0) {

		i = imports.pop();

		data = data.substring(0, i.start) + settings.declaration + " " + i.name + " = " + JSON.stringify(i.data) + data.substring(i.end);
	}

	next(null, modified, data);
}

/**
 * Applies the changes by overwriting the original file.
 *
 * @method writeFile
 * @private
 * @static
 * @param {Boolean} modified - Indicates whether the file contents have been modified.
 * @param {String} data - The modified file contents.
 * @param {Function} next - A callback.
 */

function writeFile(modified, data, next) {

	if (modified) {

		fs.writeFile(settings.file, data, next);
	} else {

		next(null);
	}
}

/**
 * Inlines file imports.
 *
 * @class InlineImport
 * @static
 */

var InlineImport = function () {
	function InlineImport() {
		classCallCheck(this, InlineImport);
	}

	createClass(InlineImport, null, [{
		key: "transform",


		/**
   * Transforms the given file by replacing custom file imports with the actual
   * file contents.
   *
   * @method transform
   * @static
   * @param {String} file - A source file.
   * @param {Object} options - The options.
   * @param {String} [options.encoding] - The encoding of the given file.
   * @param {Object} [options.extensions] - The import file extensions to consider. Each extension must define an encoding.
   * @param {Boolean} [options.useVar] - Whether the var declaration should be used instead of const.
   * @param {Function} done - A callback function.
   */

		value: function transform(file, options, done) {

			settings = new Settings(file, options);

			waterfall([checkFile, readFile, parseImports, filterImports, checkImports, readImports, inlineImports, writeFile], done);
		}
	}]);
	return InlineImport;
}();

/**
 * Exposure of the import inlining tool.
 *
 * @module inline-import
 */

module.exports = InlineImport;
