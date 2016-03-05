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
/* Functions - by category						*/
/************************************************/
/**
 * Add raw data
 */
function addRaw(profile, output) {
	// Init vars
	var data = profile.data;
	
	//
	// Time information
	//
	profile.exportInfo(output);

	//
	// Stats
	//
	output.stats = {
		h:	data.stats.threads,
		
	    s:	data.stats.switches,
	    m:	data.stats.migrations,
		c:	data.stats.cycles,

		r:	Math.round(data.stats.running),
		y:	Math.round(data.stats.ready),
		b:	Math.round(data.stats.standby),
		w:	Math.round(data.stats.wait)
	};

	//
	// Threads
	//
	output.threads = { info: [] };
	for (var h in data.threads.list) {
		output.threads.info.push({
			h: +h,
			s: data.threads.list[h].s,
			e: data.threads.list[h].e,
		});
	};
	output.threads.info.sort(function(a, b){return a.s - b.s});
}



/**
 * Add gauges data
 */
function addGauges(profile, output) {
	// Data
	var data = profile.data;
	var pv = profile.v;
	var max;
	
	// Init output
	output.gauges = {};
	
	// Computation - Cache misses
	max = data.locality.stats.ipc + data.locality.stats.tlb + data.locality.stats.l1 + data.locality.stats.l2 + data.locality.stats.l3 + data.locality.stats.hpf;
	output.gauges.ipc = Math.round(100 * data.locality.stats.ipc / max) + ' %';
	output.gauges.miss = Math.round(100 * (data.locality.stats.tlb + data.locality.stats.l1 + data.locality.stats.l2 + data.locality.stats.l3 + data.locality.stats.hpf) / max) + ' %';
	
	// Add states - by thread duration
	max = profile.hardware.data.lcores * data.info.duration;
	[	{ l: 'r', v: data.stats.running, n: 3 },
		{ l: 'yb', v: data.stats.ready + data.stats.standby, n: 3 },
		{ l: 'i', v: data.stats.idle, n: 3 },
		{ l: 'lw', v: data.stats.lock_wait, n: 4 }
	].forEach(function(item) {
		output.gauges[item.l] = (item.n <= pv) ? Math.round(100 * item.v / max) + ' %' : '?';
	});
	
	// Add states - by duration
	max = data.info.duration;
	[	{ l: 'p', v: data.stats.parallel, n: 3 },
	].forEach(function(item) {
		output.gauges[item.l] = (item.n <= pv) ? Math.round(100 * item.v / max) + ' %' : '?';
	});
	
	// Add calibrations
	[	{ l: 's', v: data.stats.switches, c: profile.hardware.calibration.s, n: 3 },
		{ l: 'm', v: data.stats.switches, c: profile.hardware.calibration.m, n: 3 },
		{ l: 'ls', v: data.stats.lock_success, c: profile.hardware.calibration.ls, n: 4 },
		{ l: 'lf', v: data.stats.lock_failure, c: profile.hardware.calibration.lf, n: 4 },
	].forEach(function(item) {
		max = (data.info.timeMax + data.info.timeStep) * profile.hardware.data.lcores * item.c;
		output.gauges[item.l] = (item.n <= pv) ? Math.round(10 * item.v / max) / 10 + ' ×' : '?';
	});
}



/************************************************/
/* Functions - Global							*/
/************************************************/
/**
 * Get details data
 */
router.get('/*', function(request, response) {
	
	var params = request.params[0].split('/');
	var ids = params[0].split('-');

	// Check preconditions
	if (ids.length == 0 || ids.length > 4) {
		response.send("Illegal number of identifiers");
		return;
	} else {
		var issueFound = false;
		ids.forEach(function(id) {
			issueFound = issueFound || isNaN(id) || ! profiles.hasOwnProperty(id);
		});
		if (issueFound) {
			response.send("Illegal identifiers");
			return;
		}
	}

	// Compute
	var output = { c: {} };
	var profile;
	ids.forEach(function(id) {
		profile = profiles[id];

		// Load data
		profile.loadData();

		// Result
		output[id] = {};
		addRaw(profile, output[id]);
		addGauges(profile, output[id]);

		// Comon result
		output.c.timeMin = Math.min(output[id].info.timeMin, output.c.timeMin | 0);
		output.c.timeMax = Math.max(output[id].info.timeMax, output.c.timeMax | 0);
		output.c.duration = Math.max(output[id].info.duration, output.c.duration | 0);

		// Unload data
		profile.unloadData();
	});
	response.json(output);
});

module.exports = router;