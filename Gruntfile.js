/*global require*/
module.exports = function (grunt) {
	"use strict";

	// Project configuration.

	//files spec
	var distTarget = "dist/",
		files = [
			//ancestors
			"src/sc.js",
			"src/data/sc.store.js",
			"src/data/sc.normalizer.js",
			"src/data/sc.manager.js",
			"src/sc.static.js"
		],
		specs = [
			"test/**/*.js"
		],
		watch = [
			"src/**/*.js",
			"test/**/*.js"
		],
		gruntFile = [
			"Gruntfile.js"
		],
		distName = "scm";


	//noinspection JSUnresolvedFunction
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),

		//Clean task

		clean: {
			bin: ["bin/**/*.*"],
			dist: [distTarget + "*.*"]
		},

		//Jasmine task

		jasmine: {
			pivotal: {
				src: files,
				options: {
					version: "3.8.0",
					noSandbox: true,
					outfile: "TestsRunner.html",
					specs: specs
				}
			},
			/*coverage: {
				src: files,
				options: {
					outfile: "TestsRunner.html",
					specs: specs,
					template: require("grunt-template-jasmine-istanbul"),
					templateOptions: {
						coverage: "bin/coverage/coverage.json",
						report: {
							type: "html",
							options: {
								dir: "bin/coverage/html"
							}
						}
					}
				}
			},*/
			options: {
				keepRunner: true
			}
		},

		//Concat task

		concat: {
			options: {
				// define a string to put between each file in the concatenated output
				separator: ";"
			},
			dist: {
				// the files to concatenate
				src: files,
				// the location of the resulting JS file
				dest: distTarget + distName + ".js"
			}
		},

		//Uglify task

		uglify: {
			options: {
				banner: '/*! <%= pkg.name %>@<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: distTarget + distName + ".js",
				dest: distTarget + distName + ".min.js"
			}
		},

		//Watch task

		watch: {
			scripts: {
				files: watch,
				tasks: ["jasmine"],
				options: {
					interrupt: true
				}
			},
			grunt: {
				files: gruntFile,
				tasks: ["concat"],
				options: {
					interrupt: true
				}
			}
		}

	});

	// Load the plugins tasks
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-jasmine");

	// Default task(s).
	grunt.registerTask("default", ["clean", "jasmine", "concat", "uglify"]);

};