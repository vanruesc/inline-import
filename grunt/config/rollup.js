const resolve = require("rollup-plugin-node-resolve");
const babel = require("rollup-plugin-babel");

module.exports = function(grunt) {

	return {

		options: {
			external: [
				"async-waterfall",
				"path",
				"fs"
			],
			plugins: [
				resolve({
					jsnext: true
				}),
				babel()
			]
		},

		lib: {
			options: {
				format: "cjs",
				banner: "<%= banner %>"
			},
			src: "src/index.js",
			dest: "build/<%= package.name %>.js"
		}

	};

};
