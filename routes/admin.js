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
 * Get admin data
 */
router.get('/caches', function(request, response) {

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

module.exports = router;













