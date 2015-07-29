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
/* Functions - For each category				*/
/************************************************/
/**
 * Test
 */
function jsonStats() {
	var output = [];

	var data;
	profiles.all.forEach(function(profile) {
		data = profiles.data[profile.id];

		output.push({
			version:	data.info.version,
			id:			profile.id,
			label:		profile.label,
			duration:	data.info.timeMax + data.info.timeStep,
			switches:	data.stats.switches,
			migrations:	data.stats.migrations
		});
	});

	return output;
}



/************************************************/
/* Functions - Global							*/
/************************************************/
/**
 * Get admin data
 */
/*
router.get('/*', function(request, response) {
	
	var params = request.params[0].split('/');

	// Check preconditions
	params.forEach(function(param) {
		if (param != 'stats') {
			response.send("Illegal parameter");
			return;
		}
	});

	// Result
	var output = {};

	// Load data
	profiles.all.forEach(function(profile) {
		profile.loadData();
	});

	// Compute
	params.forEach(function(param) {
		if (param == 'stats')
			output.stats = jsonStats();
	});

	// Result
	response.json(output);

	// Unload data
	profiles.all.forEach(function(profile) {
		profile.unloadData();
	});
});
*/

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

module.exports = router;













