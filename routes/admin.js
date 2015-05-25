var express = require('express');
var router = express.Router();
var fs = require('fs');
var VERSION = 32;

var hardRoman = {
	data: {
		cores: 8
	},
	calib: {
		switches:	35		// number of switches by ms by core
	}
};

/************************************************/
/* Variables									*/
/************************************************/
/**
	Computed data:
*/
var profileList = [
	{ id: 1,	file: 'matmulijk', 	label: 'Matmul IJK' },
	{ id: 2,	file: 'matmulkij', 	label: 'Matmul KIJ' },
	{ id: 3,	file: 'matmulkji', 	label: 'Matmul KJI' },
	{ id: 4,	file: 'particles', 	label: 'Particle S' },
	{ id: 5,	file: 'accountb',	label: 'Account B' },
	{ id: 6,	file: 'computepi',	label: 'Compute Pi' },
	{ id: 7,	file: 'mandelbrot',	label: 'Mandelbrot' },
	{ id: 8,	file: 'nqueens',	label: 'N Queens' },
	{ id: 9,	file: 'raytracer',	label: 'Ray Tracer' },
 	{ id: 10,	file: 'accounta',	label: 'Account A' },
 	{ id: 11,	file: 'mergesortp',	label: 'Merge sort P' },
 	{ id: 12,	file: 'mergesorts',	label: 'Merge sort S' },
 	{ id: 13,	file: 'particlep',	label: 'Particle P' }
];


/************************************************/
/* Functions - Data								*/
/************************************************/
/**
	profileData
	 ├	profile<0>						<profile>
	 ├	...
	 └	profile<N>						<profile>
	 
	 profile
	 ├	version						<integer>	version of the cache
	 ├	frames
	 │	 ├	0
	 │	 │	 ├	t					[]			array of threads
	 │	 │	 │	 ├	0
	 │	 │	 │	 │	 ├	cycles		<integer>	number of cycles
	 │	 │	 │	 │	 ├	ready		<integer>	duration of ready state
	 │	 │	 │	 │	 ├	running		<integer>	duration of running state
	 │	 │	 │	 │	 ├	standby		<integer>	duration of standby state
	 │	 │	 │	 │	 ├	wait		<integer>	duration of wait state
	 │	 │	 │	 ├	...
	 │	 │	 │	 └	<?>
	 │	 │	 ├	c					[]			array of cores
	 │	 │	 │	 ├	0
	 │	 │	 │	 │	 ├	switches	<integer>	number of switches
	 │	 │	 │	 │	 ├	migrations	<integer>	number of migrations
	 │	 │	 │	 │	 ├	cycles		<integer>	number of cycles
	 │	 │	 │	 │	 ├	ready		<integer>	duration of ready state
	 │	 │	 │	 │	 ├	running		<integer>	duration of running state
	 │	 │	 │	 │	 ├	standby		<integer>	duration of standby state
	 │	 │	 │	 │	 ├	wait		<integer>	duration of wait state
	 │	 │	 │	 ├	...
	 │	 │	 │	 └	<?>
	 │	 │	 ├	switches 			<integer>	number of switches
	 │	 │	 ├	migrations 			<integer>	number of migrations
	 │	 │	 ├	starts 				<integer>	number of thread starts
	 │	 │	 ├	ends 				<integer>	number of thread ends
	 │	 │	 ├	cycles				<integer>	number of cycles
	 │	 │	 ├	ready				<integer>	duration of ready state
	 │	 │	 ├	running				<integer>	duration of running state
	 │	 │	 ├	standby				<integer>	duration of standby state
	 │	 │	 └	wait				<integer>	duration of wait state
	 │	 ├	...
	 │	 └	<?>
	 ├	lifecycles					[]			array of thread lifecycle events
	 │	 ├	<thread0>
	 │	 │	 ├	s					<integer>	start time (real, not corresponding to a time frame), could be null
	 │	 │	 ├	m					[]			array of migration /!\ unique /!\ (real) times (only one migration appears for 1 ms, so some migrations are missing)
	 │	 │	 └	e					<char>		start time (real, not corresponding to a time frame), could be null
	 │	 ├	...
	 │	 └	<threadN>
	 ├	lifetimes					[]			array of thread lifecycle events
	 │	 ├	0
	 │	 │	 ├	t					<integer>	time (real, not corresponding to a time frame)
	 │	 │	 ├	h					ID			thread ID
	 │	 │	 └	e					<char>		's' for start, 'e' for end
	 │	 ├	...
	 │	 └	<?>
	 ├	migrations					[]			array of migration events, in the increasing time order
	 │	 ├	0
	 │	 │	 ├	t					<integer>	time (real, not corresponding to a time frame)
	 │	 │	 ├	h					ID			thread ID
	 │	 │	 └	c					ID			new core ID
	 │	 ├	...
	 │	 └	<?>
	 ├	switches					[]			array of switches events, in the increasing time order
	 │	 ├	0
	 │	 │	 ├	t					<integer>	time (real, not corresponding to a time frame)
	 │	 │	 ├	h					ID			thread ID
	 │	 ├	...
	 │	 └	<?>
	 ├	timelist
	 │	 ├	migrations				[]			array of migration event time (real, not corresponding to a time frame), in the increasing time order
	 │	 └	switches				[]			array of switches event time (real, not corresponding to a time frame), in the increasing time order
	 ├	threads
	 │	 └	byFrames
	 │		 ├	frame<0>			ID
	 │		 │	 ├	thread<0>		ID
	 │		 │	 │	 ├	cycles		<integer>	number of cycles
	 │		 │	 │	 ├	ready		<integer>	duration of ready state
	 │		 │	 │	 ├	running		<integer>	duration of running state
	 │		 │	 │	 ├	standby		<integer>	duration of standby state
	 │		 │	 │	 └	wait		<integer>	duration of wait state
	 │		 │	 ├	...
	 │		 │	 └	thread<N>
	 │		 ├	...
	 │		 └	frame<?>
	 └	stats
		 ├	timeShift				<float>		time before starting measures (i.e. non interesting computation before this time) /!\ in pico seconds (10⁻¹²s) /!\ need to be divided by 10⁹
		 └	switch					<integer>	number of switches for all cores during all run
**/
var profileData = {};

/**
 * Load raw data
 */
function loadCache(profile) {
	// Vars
	var filenameCache = 'data/' + profile.file + '.cache.json';

	// Load data from cache
	profileData[profile.id] = JSON.parse(fs.readFileSync(filenameCache, 'utf8'));
	console.log("[" + profile.id + "] " + profile.file + " cache loaded");
}

/**
 * Unload raw data
 */
function unloadCache(profile) {
	delete profileData[profile.id];
}



/************************************************/
/* Functions - For each category				*/
/************************************************/
/**
 * Test
 */
function jsonStats() {
	var output = [];

	var data;
	profileList.forEach(function(profile) {
		data = profileData[profile.id];

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
	profileList.forEach(function(profile) {
		loadCache(profile);
	});

	// Compute
	params.forEach(function(param) {
		if (param == 'stats')
			output.stats = jsonStats();
	});

	// Result
	response.json(output);

	// Unload data
	profileList.forEach(function(profile) {
		unloadCache(profile);
	});
});

module.exports = router;













