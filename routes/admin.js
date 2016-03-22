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



module.exports = router;













