/************************************************/
/* Import JS libraries							*/
/************************************************/
var express = require('express');
var router = express.Router();


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
router.get('/stats/*', function(request, response) {
	
	var param = request.params[0];

	// Check preconditions
	if (param != 'sm' && param != 'l') {
		response.send("Illegal parameter");
		return;
	}

	// Result
	var output = {
		param: param,
		versions: {}
	};
	
	// Create lists
	var properties;
	if (param == 'sm') {
		output.s = {};
		output.m = {};
	} else if (param == 'l') {
		output.ls = {};
		output.lf = {};
	}

	// Load data
	profiles.all.forEach(function(profile) {
		profile.loadData(true);
	});

	// Compute
	profiles.all.forEach(function(profile) {
		if (! profile.hasOwnProperty('disabled') || ! profile.disabled) {
			if (! profile.hasOwnProperty('data')) {
				if (param == 'sm') {
					output.s[profile.id] = null;
					output.m[profile.id] = null;
				} else if (param == 'l' && profile.v >= 4) {
					output.ls[profile.id] = null;
					output.lf[profile.id] = null;
				}
			} else {
				if (param == 'sm') {
					output.s[profile.id] = profile.data.stats.switches;
					output.m[profile.id] = profile.data.stats.migrations;
				} else if (param == 'l' && profile.v >= 4) {
					output.ls[profile.id] = profile.data.stats.lock_success;
					output.lf[profile.id] = profile.data.stats.lock_failure;
				}
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



module.exports = router;













