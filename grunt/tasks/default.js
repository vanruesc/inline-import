module.exports = function(grunt) {

	grunt.registerTask("default", grunt.option("production") ?
		["build", "test", "uglify"] :
		["build", "test"]
	);

};
