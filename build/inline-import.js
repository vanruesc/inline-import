/**
 * inline-import v0.1.0 build Dec 09 2017
 * https://github.com/vanruesc/inline-import
 * Copyright 2017 Raoul van Rüschen, Zlib
 */

'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

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









































var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

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

var Settings = function Settings() {
		var encoding = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "utf8";
		var extensions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
		var useVar = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
		classCallCheck(this, Settings);


		this.encoding = encoding;

		this.extensions = extensions;

		this.declaration = useVar ? "var" : "const";
};

var importRegExp = /import\s*(\w*)\s*from\s*["'](.*)["']/ig;

function readFile(file, encoding) {

	return new Promise(function (resolve, reject) {

		fs.readFile(file, encoding, function (error, data) {
			return error ? reject(error) : resolve(data);
		});
	});
}

function parseImports(data, file, extensions) {

	var imports = [];

	var result = importRegExp.exec(data);
	var encoding = void 0;

	while (result !== null) {

		encoding = extensions[path.extname(result[2])];

		if (encoding !== undefined) {

			imports.push(new FileImport(result.index, importRegExp.lastIndex, result[1], path.resolve(path.dirname(file), result[2]), encoding));
		}

		result = importRegExp.exec(data);
	}

	return Promise.resolve([imports, data]);
}

function readImports(imports, data) {

	return imports.length === 0 ? Promise.resolve([imports, data]) : new Promise(function (resolve, reject) {

		var i = 0;

		(function proceed(error, importData) {

			if (importData) {

				imports[i++].data = importData;
			}

			if (error) {

				reject(error);
			} else if (i === imports.length) {

				resolve([imports, data]);
			} else {

				fs.readFile(imports[i].path, imports[i].encoding, proceed);
			}
		})();
	});
}

function inlineImports(imports, data, declaration) {

	var modified = imports.length > 0;
	var i = void 0,
	    item = void 0;

	for (i = imports.length - 1; i >= 0; --i) {

		item = imports[i];

		data = data.substring(0, item.start) + declaration + " " + item.name + " = " + JSON.stringify(item.data) + data.substring(item.end);
	}

	return Promise.resolve([modified, data]);
}

function writeFile(modified, data, file) {

	return !modified ? Promise.resolve() : new Promise(function (resolve, reject) {

		fs.writeFile(file, data, function (error) {

			error ? reject(error) : resolve();
		});
	});
}

var InlineImport = function () {
	function InlineImport() {
		classCallCheck(this, InlineImport);
	}

	createClass(InlineImport, null, [{
		key: "transform",
		value: function transform(file) {
			var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


			var settings = new Settings(options.encoding, options.extensions, options.useVar);

			return readFile(file, settings.encoding).then(function (result) {
				return parseImports(result, file, settings.extensions);
			}).then(function (result) {
				return readImports.apply(undefined, toConsumableArray(result));
			}).then(function (result) {
				return inlineImports.apply(undefined, toConsumableArray(result).concat([settings.declaration]));
			}).then(function (result) {
				return writeFile.apply(undefined, toConsumableArray(result).concat([file]));
			});
		}
	}]);
	return InlineImport;
}();

module.exports = InlineImport;
