import babel from "rollup-plugin-babel";
import minify from "rollup-plugin-babel-minify";
import resolve from "rollup-plugin-node-resolve";

const pkg = require("./package.json");
const date = (new Date()).toDateString();

const banner = `/**
 * ${pkg.name} v${pkg.version} build ${date}
 * ${pkg.homepage}
 * Copyright ${date.slice(-4)} ${pkg.author.name}, ${pkg.license}
 */`;

const lib = {

	input: pkg.module,
	output: {
		file: "build/" + pkg.name + ".js",
		format: "cjs",
		name: pkg.name.replace(/-/g, "").toUpperCase(),
		banner: banner,
		globals: {
			fs: "fs",
			path: "path"
		}
	},

	external: ["fs", "path"],

	plugins: [resolve()].concat(process.env.BABEL_ENV === "production" ?
		[babel(), minify({
			bannerNewLine: true,
			sourceMap: false,
			comments: false
		})] : []
	)

};

const bin = {

	input: "src/bin/cli.js",
	output: {
		file: "bin/cli.js",
		format: "cjs"
	},

	external: ["glob", "fs", "fs-extra", "path", "yargs-parser"],

	plugins: [resolve()].concat(process.env.BABEL_ENV === "production" ?
		[babel(), minify({
			sourceMap: false,
			comments: false
		})] : []
	)

};

export default [lib, bin];
