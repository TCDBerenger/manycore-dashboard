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
var STRIP_HEIGHT = 50;



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
		h:	data.stats.threads,	// TO MOVE in *.info.threads (actually used for number of logical cores)
		
	    // s:	data.stats.switches,
	    // m:	data.stats.migrations,
		// c:	data.stats.cycles,
		// r:	data.stats.running,
		// y:	data.stats.ready,
		// b:	data.stats.standby,
		// w:	data.stats.wait,

		// locality: data.locality.stats,
	};
}


/**
 * Add profile strip data
 */
function addProfiling(output, profile) {
	// Data
	var data = profile.data;

	// Init vars
	output.profiling = [];
	var timeStep = data.info.timeStep;

	// Data
	var max, f;
	var q_previousTime = 0;
	var q_previousPercentValueByMS = 100 * data.events.sequences[0].c_r / profile.hardware.data.lcores / timeStep | 0;
	
	// Loop
	for (var time = 0; time <= data.info.timeMax; time += timeStep) {
		// Result
		f = { t: time, q: 0 };
		
		if (data.frames.hasOwnProperty(time)) {
		
			// uu 	: unused
			// yb	: ready & standby
			max = data.info.threads * timeStep;
			
			f.r = Math.round(STRIP_HEIGHT * data.frames[time].running / max);
			f.i = Math.round(STRIP_HEIGHT * data.frames[time].idle / max);
			f.yb = Math.min(STRIP_HEIGHT, Math.round(STRIP_HEIGHT * (data.frames[time].ready + data.frames[time].standby) / max));
			f.lw = Math.min(STRIP_HEIGHT, Math.round(STRIP_HEIGHT * data.frames[time].lock_wait / max));
			f.sys = Math.round(STRIP_HEIGHT * (max - data.frames[time].running - data.frames[time].idle) / max);
			
			// miss	: cache misses
			max = data.locality.byFrames[time].ipc + data.locality.byFrames[time].tlb + data.locality.byFrames[time].l1 + data.locality.byFrames[time].l2 + data.locality.byFrames[time].l3 + data.locality.byFrames[time].hpf;
			
			f.miss =	STRIP_HEIGHT - Math.round(STRIP_HEIGHT * data.locality.byFrames[time].ipc / max);
			
		} else {
			f.r = NaN;
			f.i = NaN;
			f.yb = NaN;
			f.lw = NaN;
			f.miss = NaN;
		}
		
		// Sequence
		for (var subTime = Math.max(time, 1); subTime < time + timeStep; subTime++) {
			if (subTime in data.events.sequences) {
				
				// Add previous stat until this new event
				f.q += q_previousPercentValueByMS * (subTime - Math.max(time, q_previousTime));
				
				// Set current stats with found new event stats
				q_previousTime = subTime;
				q_previousPercentValueByMS = 100 * data.events.sequences[subTime].c_r / profile.hardware.data.lcores / timeStep;
			}
		}
		
		// Sequence - end of frame (also empty frame)
		if (q_previousTime < time + timeStep) {
			// Add current stat until the end of the frame
			// NB: if no new stat is found this turn, use previous stat for all the time frame
			f.q += q_previousPercentValueByMS * (time + timeStep - Math.max(time, q_previousTime));
		}
		
		// Sequence post-treatment
		f.q = Math.round(f.q);
		

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
	var pv = profile.v;
	var max;
	
	// Computation - Cache misses
	max = data.locality.stats.ipc + data.locality.stats.tlb + data.locality.stats.l1 + data.locality.stats.l2 + data.locality.stats.l3 + data.locality.stats.hpf;
	var ipc = Math.round(100 * data.locality.stats.ipc / max);
	var miss = Math.round(100 * (data.locality.stats.tlb + data.locality.stats.l1 + data.locality.stats.l2 + data.locality.stats.l3 + data.locality.stats.hpf) / max);
	
	// Stats
	output.gauges = {
		ipc: {	g: ipc,
				l: ipc + '%',
				u: Math.round(data.locality.stats.ipc) },
		miss: {	g: miss,
				l: miss + '%',
				u: Math.round(data.locality.stats.tlb + data.locality.stats.l1 + data.locality.stats.l2 + data.locality.stats.l3 + data.locality.stats.hpf) },
	};
	
	// Add states
	max = data.info.threads * (data.info.timeMax + data.info.timeStep);
	[	{ l: 'r', v: data.stats.running, n: 3 },
		{ l: 'yb', v: data.stats.ready + data.stats.standby, n: 3 },
		{ l: 'i', v: data.stats.idle, n: 3 },
		{ l: 'lw', v: data.stats.lock_wait, n: 4 }
	].forEach(function(item) {
		output.gauges[item.l] = {
			g: Math.round(100 * item.v / max),
			l: (item.n <= pv) ? Math.round(100 * item.v / max) + '%' : '?',
			u: Math.round(item.v)
		};
	});
	
	// Add calibrations
	[	{ l: 's', v: data.stats.switches, c: profile.hardware.calibration.s, n: 3 },
		{ l: 'm', v: data.stats.switches, c: profile.hardware.calibration.m, n: 3 },
		{ l: 'ls', v: data.stats.lock_success, c: profile.hardware.calibration.ls, n: 4 },
		{ l: 'lf', v: data.stats.lock_failure, c: profile.hardware.calibration.lf, n: 4 },
	].forEach(function(item) {
		max = (data.info.timeMax + data.info.timeStep) * data.info.threads * item.c;
		output.gauges[item.l] = {
			g: Math.round(100 * item.v / max),
			l: (item.n <= pv) ? Math.round(10 * item.v / max) / 10 + '×' : '?',
			u: item.v
		};
	});
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
