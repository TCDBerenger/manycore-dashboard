/************************************************/
/* Import JS libraries							*/
/************************************************/
var express = require('express');
var router = express.Router();

// Files
var fs = require('fs');
var archiver = require('archiver');


/************************************************/
/* Import profiles								*/
/************************************************/
var profiles = require('./common/profiles.common.js');


/************************************************/
/* Functions - Global							*/
/************************************************/

/**
 * Get CACHE - get all cache versions
 */
router.get('/cache-versions', function(request, response) {
	// Result
	var output = {
		expected: profiles.expected,
		versions: {}
	};

	// Load data
	profiles.all.forEach(function(profile) {
		output.versions[profile.id] = profile.getVersion();
	});

	// Result
	response.json(output);
});

/**
 * Get CACHE - reload caches (all or ID)
 */
router.get('/cache-reload/*', function(request, response) {
	
	var param = request.params[0];
	console.log(param);

	// Check preconditions
	var isProfileID = false;
	profiles.all.forEach(function(profile) {
		isProfileID = isProfileID || profile.id == param;
	});
	if (param != 'all' && ! isProfileID) {
		response.send("Illegal parameter");
		return;
	}

	// Result
	var output = {
		expected: profiles.expected,
		versions: {}
	};
	
	// Reload cache
	if (param == 'all') {
		profiles.all.forEach(function(profile) {
			if (! profile.hasOwnProperty('disabled') || ! profile.disabled) {
				profile.reloadCache();
				output.versions[profile.id] = profile.getVersion();
			}
		});
	} else {
		profiles.reloadCache(param);
		output.versions[param] = profiles.getVersion(param);
	}

	// Result
	response.json(output);
});

/**
 * Get admin data
 */
router.get('/stats', function(request, response) {
	
	var param = request.params[0];


	// Result
	var output = {
		versions: {},
		durations: {},
		s: {},
		m: {},
		ls: {},
		lf: {},
		il1: {},
		il2: {}
	};
	
	// Load data
	profiles.all.forEach(function(profile) {
		profile.loadData(true);
	});

	// Compute
	profiles.all.forEach(function(profile) {
		if (! profile.hasOwnProperty('disabled') || ! profile.disabled) {
			if (! profile.hasOwnProperty('data')) {
				output.s[profile.id] = null;
				output.m[profile.id] = null;
				if (profile.v >= 4) {
					output.ls[profile.id] = null;
					output.lf[profile.id] = null;
				}
				if (profile.v >= 5) {
					output.il1[profile.id] = null;
					output.il2[profile.id] = null;
				}
			} else {
				output.s[profile.id] = profile.data.stats.switches;
				output.m[profile.id] = profile.data.stats.migrations;
				if (profile.v >= 4) {
					output.ls[profile.id] = profile.data.stats.lock_success;
					output.lf[profile.id] = profile.data.stats.lock_failure;
				}
				if (profile.v >= 5) {
					output.il1[profile.id] = profile.data.stats.l1_invalid;
					output.il2[profile.id] = profile.data.stats.l2_invalid;
				}
				output.durations[profile.id] = profile.data.info.timeMax + profile.data.info.timeStep;
			}
			output.versions[profile.id] = profile.getVersion();
		}
	});

	// Result
	response.json(output);

	// Unload data
	profiles.all.forEach(function(profile) {
		profile.unloadData();
	});
});


/**
 * Get XP - list files
 */
router.get('/xp-results', function(request, response) {
	// Vars
	var meta_folder =	'./results/';

	// Result
	var output = {};

	// List the XP folders
	fs.readdir(meta_folder, function(err, folders) {
		if (err) {
			Console.err(err);
			response.err(err);
		} else {
			folders.forEach(function(xpDirectory) {
				output[xpDirectory] = [];
				// List a XP directory
				fs.readdirSync(meta_folder + xpDirectory + '/').forEach(function(xpFile) {
					output[xpDirectory].push({
						t: xpFile.substring(0, xpFile.length - 4),
						p: '/service/admin/xp-result/' + xpDirectory.substring(3, 5) + '-' + xpFile.substring(0, xpFile.length - 4),
						l: fs.statSync(meta_folder + xpDirectory + '/' + xpFile).mtime
					});
				}, this);

			}, this);

			// Result
			response.json(output);
		}
	});
});


/**
 * Get XP - get result file
 */
router.get('/xp-result/*', function(request, response) {
	// Vars
	var meta_file =		request.params[0].split('-');
	var meta_folder =	'./results/';
	var current_date =	new Date();
	var zip_name =		'filename=xp-results-' + meta_file[0] + '_' +
							current_date.getFullYear() + '-' +
							(current_date.getMonth() + 1) + '-' +
							current_date.getDate() + '_' +
							current_date.getHours() + 'h' +
							current_date.getMinutes() + '.zip';

	// Result
	if (meta_file.length == 1) {
		// Send all files for an xp
		// Tell the browser that this is a zip file.
		response.setHeader('content-type', 'application/zip');
		response.setHeader('content-disposition', 'attachment; ' + zip_name);

		var zip = archiver('zip');
		var base_folder = meta_folder + 'xp-' + meta_file[0] + '/';

		// Send the file to the page output.
		zip.pipe(response);

		// Create zip with some files. Two dynamic, one static. Put #2 in a sub folder.
		fs.readdirSync(base_folder).forEach(function(xpFile) {
			console.log('zip file', xpFile, base_folder + xpFile);
			zip.file(base_folder + xpFile, { name: xpFile });
		}, this);
		zip.finalize();

	} else if (meta_file.length == 2) {
		// Send directly the file
		response.download(meta_folder + 'xp-' + meta_file[0] + '/' + meta_file[1] + '.log');
	}
});


module.exports = router;