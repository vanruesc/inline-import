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
 * Deletes the backup directory.
 *
 * @param {Object} config - A configuration.
 * @return {Promise} A promise that returns the given configuration.
 */

function deleteBackup(config) {

	return new Promise((resolve, reject) => {

		const backupPath = path.join(process.cwd(), (config.backup !== undefined) ? config.backup : ".backup");

		fs.remove(backupPath, (error) => {

			(error === null) ? resolve(config) : reject(error);

		});

	});

}

/**
 * Copies files from one path to another.
 *
 * @param {String} src - The source path.
 * @param {String} dest - The destination path.
 * @return {Promise} A promise.
 */

function copy(src, dest) {

	return new Promise((resolve, reject) => {

		fs.copy(src, dest, (error) => {

			(error === undefined || error === null) ? resolve() : reject(error);

		});

	});

}

/**
 * Copies files into a backup directory.
 *
 * @param {Object} config - A configuration.
 * @return {Promise} A promise that returns the given configuration.
 */

function createBackup(config) {

	return new Promise((resolve, reject) => {

		const backupPath = path.join(process.cwd(), (config.backup !== undefined) ? config.backup : ".backup");
		const src = config.src;

		let sourcePath;
		let basename;
		let index;
		let i = 0;

		(function proceed(error, files) {

			if(error !== undefined && error !== null) {

				reject(error);

			} else if(i === src.length) {

				resolve(config);

			} else {

				sourcePath = src[i++];
				index = sourcePath.indexOf("*");

				if(index >= 0) {

					sourcePath = sourcePath.substring(0, index);

				}

				basename = (path.extname(sourcePath) !== "") ?
					path.join(path.basename(path.dirname(sourcePath)), path.basename(sourcePath)) :
					path.basename(sourcePath);

				copy(path.join(process.cwd(), sourcePath), path.join(backupPath, basename)).then(proceed).catch(reject);

			}

		}());

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
		const src = config.src;

		let sourcePath;
		let basename;
		let index;
		let i = 0;

		(function proceed(error, files) {

			if(error !== undefined && error !== null) {

				reject(error);

			} else if(i === src.length) {

				resolve(config);

			} else {

				sourcePath = src[i++];
				index = sourcePath.indexOf("*");

				if(index >= 0) {

					sourcePath = sourcePath.substring(0, index);

				}

				basename = (path.extname(sourcePath) !== "") ?
					path.join(path.basename(path.dirname(sourcePath)), path.basename(sourcePath)) :
					path.basename(sourcePath);

				copy(path.join(backupPath, basename), path.join(process.cwd(), sourcePath)).then(proceed).catch(reject);

			}

		}());

	});

}

/**
 * Inlines the given files.
 *
 * @param {Object} config - A configuration.
 * @param {String[]} files - The files.
 * @return {Promise} A promise that returns an info message.
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
 * Gathers files that will be modified.
 *
 * @type {Object} config - A configuration.
 * @return {Promise} A promise that returns an array containing the given configuration and the identified files.
 */

function getFiles(config) {

	return new Promise((resolve, reject) => {

		const src = config.src;

		let i = 0;

		(function proceed(error, files) {

			if(error !== undefined && error !== null) {

				reject(error);

			} else if(i === src.length) {

				resolve([config, files]);

			} else {

				glob(src[i++], proceed);

			}

		}());

	});

}

/**
 * Verifies a given configuration.
 *
 * @param {Object} A configuration.
 * @return {Promise} A promise that returns the given configuration.
 */

function verifyConfig(config) {

	return new Promise((resolve, reject) => {

		if(config.src !== undefined) {

			if(!Array.isArray(config.src)) {

				config.src = [config.src];

			}

			resolve(config);

		} else {

			reject("No source path specified");

		}

	});

}

/**
 * Loads the configuration.
 *
 * @return {Promise} A promise that returns the configuration.
 */

function readConfig() {

	return new Promise((resolve, reject) => {

		// Check if the package file contains a configuration.
		fs.readFile(path.join(process.cwd(), "package.json"), (error, data) => {

			let config;

			if(error === null) {

				try {

					config = JSON.parse(data).inlineImport;

				} catch(error) {

					reject(error);

				}

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

						try {

							resolve(JSON.parse(data));

						} catch(error) {

							reject(error);

						}

					}

				});

			}

		});

	});

}

// Program entry point.
const configPromise = readConfig().then(verifyConfig);

argv.backup ? configPromise.then(deleteBackup).then(createBackup).then(() => console.log("Backup created")).catch(console.error) :
	argv.restore ? configPromise.then(restore).then(deleteBackup).then(() => console.log("Files restored")).catch(console.error) :
		configPromise.then(deleteBackup).then(createBackup).then(getFiles).then(result => inline(...result)).then(console.log).catch(console.error);
