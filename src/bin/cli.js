import glob from "glob";
import fs from "fs-extra";
import path from "path";
import yargs from "yargs-parser";
import { InlineImport } from "../core/InlineImport.js";

/**
 * The parsed arguments.
 *
 * @type {Object}
 * @private
 */

const argv = Object.assign({

	config: ".inline-import.json",
	backup: false,
	restore: false

}, yargs(process.argv.slice(2), {

	alias: {
		config: ["c"],
		backup: ["b"],
		restore: ["r"]
	}

}));

/**
 * Copies files into a backup directory.
 *
 * @param {Object} config - A configuration.
 * @return {Promise} A promise.
 */

function backup(config) {

	return new Promise((resolve, reject) => {

		const backupPath = path.join(process.cwd(), (config.backup !== undefined) ? config.backup : ".backup");
		const sourcePath = path.join(process.cwd(), config.src.split("*")[0]);
		const sourceBasename = path.basename(sourcePath);

		fs.remove(backupPath, (error) => {

			if(error === null) {

				fs.copy(sourcePath, path.join(backupPath, sourceBasename), (error) => {

					if(error === undefined || error === null) {

						resolve(config);

					} else {

						reject(error);

					}

				});

			} else {

				reject(error);

			}

		});

	});

}

/**
 * Restores files from the backup directory.
 *
 * @param {Object} config - A configuration.
 * @return {Promise} A promise.
 */

function restore(config) {

	return new Promise((resolve, reject) => {

		const backupPath = path.join(process.cwd(), (config.backup !== undefined) ? config.backup : ".backup");
		const sourcePath = path.join(process.cwd(), config.src.split("*")[0]);
		const sourceBasename = path.basename(sourcePath);

		fs.copy(path.join(backupPath, sourceBasename), sourcePath, (error) => {

			if(error === undefined || error === null) {

				fs.remove(backupPath, (error) => {

					if(error === null) {

						resolve();

					} else {

						reject(error);

					}

				});

			} else {

				reject(error);

			}

		});

	});

}

/**
 * Inlines the given files.
 *
 * @param {Object} config - A configuration.
 * @param {String[]} files - The files.
 * @return {Promise} A promise.
 */

function inline(config, files) {

	return new Promise((resolve, reject) => {

		let filesChanged = 0;
		let i = 0;

		(function proceed(result) {

			if(result) {

				filesChanged++;

			}

			if(i === files.length) {

				resolve("Modified " + filesChanged + " files");

			} else {

				InlineImport.transform(files[i++], config.options).then(proceed).catch(reject);

			}

		}());

	});

}

/**
 * Inlines file imports.
 *
 * @type {Object} config - A configuration.
 * @return {Promise} A promise.
 */

function getFiles(config) {

	return new Promise((resolve, reject) => {

		glob(config.src, (error, files) => {

			if(error === null) {

				resolve([config, files]);

			} else {

				reject(error);

			}

		});

	});

}

/**
 * Verifies a given configuration.
 *
 * @param {Object} A configuration.
 * @return {Promise} A promise.
 */

function verifyConfig(config) {

	return new Promise((resolve, reject) => {

		if(config.src !== undefined) {

			resolve(config);

		} else {

			reject("No source path specified");

		}

	});

}

/**
 * Loads the configuration.
 *
 * @return {Promise} A promise.
 */

function readConfig() {

	return new Promise((resolve, reject) => {

		// Check if the package file contains a configuration.
		fs.readFile(path.join(process.cwd(), "package.json"), (error, data) => {

			let config;

			if(error === null) {

				config = JSON.parse(data).inlineImport;

			}

			if(config !== undefined) {

				resolve(config);

			} else {

				// Look for a configuration file.
				fs.readFile(path.join(process.cwd(), argv.config), (error, data) => {

					if(error !== null) {

						if(error.code === "ENOENT") {

							reject("No configuration found");

						} else {

							reject("Failed to read the configuration file (" + error.code + ")");

						}

					} else {

						resolve(JSON.parse(data));

					}

				});

			}

		});

	});

}

// Program entry point.
const configPromise = readConfig().then(verifyConfig);

argv.backup ? configPromise.then(backup).then(() => console.log("Backup created")).catch(console.error) :
	argv.restore ? configPromise.then(restore).then(() => console.log("Files restored")).catch(console.error) :
		configPromise.then(backup).then(getFiles).then(result => inline(...result)).then(console.log).catch(console.error);
