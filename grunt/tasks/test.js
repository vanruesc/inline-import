module.exports = function(grunt) {

	grunt.registerTask("test", ["backup", "nodeunit", "restore"]);

};
