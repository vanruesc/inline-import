module.exports = {

	backup: {
		expand: true,
		cwd: "test",
		src: "inline/*/index.js",
		dest: "backup",
		filter: "isFile"
	},

	restore: {
		expand: true,
		cwd: "backup",
		src: "**",
		dest: "test",
		filter: "isFile"
	}

};
