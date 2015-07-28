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
/* Constants									*/
/************************************************/
var STRIP_HEIGHT = 60;



/************************************************/
/* Functions - Add								*/
/************************************************/
/**
 * Add stats
 */
function addStats(output, profile) {
	// Data
	var data = profile.data;

	// Stats
	output.stats = {
		h:	data.stats.threads,
		
	    // s:	data.stats.switches,
	    // m:	data.stats.migrations,
		// c:	data.stats.cycles,
		// r:	data.stats.running,
		// y:	data.stats.ready,
		// b:	data.stats.standby,
		// w:	data.stats.wait,
		
		// l1:		data.stats.l1miss,
		// l2:		data.stats.l2miss,
		// l3:		data.stats.l3miss,
		// tlb:	data.stats.tlbmiss,
		// dzf:	data.stats.dzf,
		// hpf:	data.stats.hpf,

		// locality: data.locality.stats,
	};
}


/**
 * Add data-locality data
 */
function addProfiling(output, profile) {
	// Data
	var data = profile.data;

	// Init vars
	output.profiling = [];

	// Data
	var max, f;
	
	// Loop
	for (var time = 0; time <= data.info.timeMax; time += data.info.timeStep) {
		// Result
		f = { t: time };
		
		if (data.frames.hasOwnProperty(time)) {
		
			// uu 	: unused
			// yb	: ready & standby
			max = data.info.threads * data.info.timeStep;
			
			f.r = Math.round(STRIP_HEIGHT * data.frames[time].running / max);
			f.uu = Math.round(STRIP_HEIGHT * data.frames[time].idle / max);
			f.yb = Math.min(STRIP_HEIGHT, Math.round(STRIP_HEIGHT * (data.frames[time].ready + data.frames[time].standby) / max));
			f.lw = Math.min(STRIP_HEIGHT, Math.round(STRIP_HEIGHT * data.frames[time].lock_wait / max));
			f.sys = Math.round(STRIP_HEIGHT * (max - data.frames[time].running - data.frames[time].idle) / max);
			
			// miss	: cache misses
			max = data.locality.byFrames[time].ipc + data.locality.byFrames[time].tlb + data.locality.byFrames[time].l1 + data.locality.byFrames[time].l2 + data.locality.byFrames[time].l3 + data.locality.byFrames[time].hpf;
			
			f.miss =	STRIP_HEIGHT - Math.round(STRIP_HEIGHT * data.locality.byFrames[time].ipc / max);
			
		} else {
			f.r = NaN;
			f.uu = NaN;
			f.yb = NaN;
			f.lw = NaN;
			f.miss = NaN;
		}

		// Save
		output.profiling.push(f);
	}
}

/**
 * Add gauges data
 */
function addGauges(output, profile) {
	// Data
	var data = profile.data;
	
	// Computation
	var maxStates = data.info.threads * (data.info.timeMax + data.info.timeStep);

	// Stats
	output.gauges = {
	    s:	data.stats.switches,
	    m:	data.stats.migrations,
		
		r:	Math.round(data.stats.running),
		yb:	Math.round(data.stats.ready + data.stats.standby),
		uu: Math.round(data.stats.idle),
		
		ls: data.stats.lock_success,
		lf: data.stats.lock_failure,
		lw: Math.round(data.stats.lock_wait),

		ipc:	Math.round(data.locality.stats.ipc),
		miss:	Math.round(data.locality.stats.tlb + data.locality.stats.l1 + data.locality.stats.l2 + data.locality.stats.l3 + data.locality.stats.hpf),
	};
}


/************************************************/
/* Functions - Global							*/
/************************************************/
/**
 * Get details data
 */
router.get('/*', function(request, response) {

	// Check preconditions
	if (! isFinite(request.params[0]) || ! profiles.hasOwnProperty(request.params[0])) {
		response.send("Illegal identifier");
		return;
	}

	// Get profile
	var profile = profiles[request.params[0]];

	// Load data
	profile.loadData();

	// Compute
	var output = {};
	output.id = profile.id;
	output.tag = 'dash';

	// Common
	profile.exportInfo(output);
	addStats(output, profile);

	// for time profiling
	addProfiling(output, profile);
	
	// for gauges
	addGauges(output, profile);

	// Unload data
	profile.unloadData();

	// Response
	response.json(output);
});

module.exports = router;
