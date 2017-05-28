/**
 * inline-import v0.0.1 build May 28 2017
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

var FileImport = function FileImport(start, end, name, path$$1, encoding) {
		var data = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
		classCallCheck(this, FileImport);


		this.start = start;

		this.end = end;

		this.name = name;

		this.path = path$$1;

		this.encoding = encoding;

		this.data = data;
};

var Settings = function Settings(file) {
		var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
		classCallCheck(this, Settings);


		this.file = file;

		this.encoding = options.encoding !== undefined ? options.encoding : "utf8";

		this.extensions = options.extensions !== undefined ? options.extensions : null;

		this.declaration = options.useVar !== undefined && options.useVar ? "var" : "const";
};

var importRegExp = /import\s*(\w*)\s*from\s*[\"\'](.*)[\"\']/ig;

var settings = null;

function checkFile(next) {

	fs.access(settings.file, fs.R_OK | fs.W_OK, next);
}

function readFile(next) {

	fs.readFile(settings.file, settings.encoding, next);
}

function parseImports(data, next) {

	var imports = [];

	var result = importRegExp.exec(data);

	while (result !== null) {

		imports.push(new FileImport(result.index, importRegExp.lastIndex, result[1], path.resolve(path.dirname(settings.file), result[2]), settings.extensions[path.extname(result[2])]));

		result = importRegExp.exec(data);
	}

	next(null, imports, data);
}

function filterImports(imports, data, next) {

	var filteredImports = [];

	var i = void 0,
	    l = void 0;

	for (i = 0, l = imports.length; i < l; ++i) {

		if (imports[i].encoding !== undefined) {

			filteredImports.push(imports[i]);
		}
	}

	next(null, filteredImports, data);
}

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

function readImports(imports, data, next) {

	var j = void 0;
	var i = -1;
	var l = imports.length;

	(function proceed(error, importData) {

		j = i;

		if (error || ++i === l) {
			if (l > 0) {
				imports[j].data = importData;
			}

			next(error, imports, data);
		} else {
			if (i > 0) {
				imports[j].data = importData;
			}

			fs.readFile(imports[i].path, imports[i].encoding, proceed);
		}
	})();
}

function inlineImports(imports, data, next) {

	var modified = imports.length > 0;
	var i = void 0;

	while (imports.length > 0) {

		i = imports.pop();

		data = data.substring(0, i.start) + settings.declaration + " " + i.name + " = " + JSON.stringify(i.data) + data.substring(i.end);
	}

	next(null, modified, data);
}

function writeFile(modified, data, next) {

	if (modified) {

		fs.writeFile(settings.file, data, next);
	} else {

		next(null);
	}
}

var InlineImport = function () {
	function InlineImport() {
		classCallCheck(this, InlineImport);
	}

	createClass(InlineImport, null, [{
		key: "transform",
		value: function transform(file, options, done) {

			settings = new Settings(file, options);

			waterfall([checkFile, readFile, parseImports, filterImports, checkImports, readImports, inlineImports, writeFile], done);
		}
	}]);
	return InlineImport;
}();

module.exports = InlineImport;
