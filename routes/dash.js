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
// Dash
const STRIP_HEIGHT = 50;

// Capability
const CAPABILITY_STATE =	0;
const CAPABILITY_SWITCH =	1;
const CAPABILITY_LOCALITY =	2;
const CAPABILITY_LOCK =		3;
const CAPABILITY_MEMORY =	4;
const CAPABILITY_COHERENCY =5;



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
	var f;
	var parallel_threshold = Math.round(profile.hardware.data.lcores / 3 + .33);
	var parallel_max = profile.hardware.data.lcores - parallel_threshold;
	
	// Compute some data
	var max = {
		time:		timeStep * profile.hardware.data.lcores,
		bandwidth:	timeStep * profile.hardware.data.bandwidth,
		locality:	NaN,
		coherency:	NaN,
	};
	
	// Loop
	for (var time = 0; time <= data.info.timeMax; time += timeStep) {
		// Result
		f = { t: time };
		
		if (data.frames.hasOwnProperty(time)) {
			// States
			// yb: ready & standby
			f.i = Math.round(STRIP_HEIGHT * data.frames[time].idle / max.time);
			f.p = Math.round(STRIP_HEIGHT * data.frames[time].parallel / timeStep);
			f.r = Math.round(STRIP_HEIGHT * data.frames[time].running / max.time);
			f.yb = Math.min(STRIP_HEIGHT, Math.round(STRIP_HEIGHT * (data.frames[time].ready + data.frames[time].standby) / max.time));
			f.lw = Math.min(STRIP_HEIGHT, Math.round(STRIP_HEIGHT * data.frames[time].lock_wait / max.time));
			f.sys = Math.round(STRIP_HEIGHT * (max.time - data.frames[time].running - data.frames[time].idle) / max.time);
			
			// Sequential (parallilisation)
			// q: running cores
//			f.q = Math.round(STRIP_HEIGHT * ((data.frames[time].runcores >= parallel_threshold) ? 1 : 0));
			f.q = STRIP_HEIGHT - Math.round(STRIP_HEIGHT * Math.max(0, data.frames[time].runcores - parallel_threshold) / parallel_max);
			
			// Cache misses
			max.locality = data.locality.byFrames[time].ipc + data.locality.byFrames[time].tlb + data.locality.byFrames[time].l1 + data.locality.byFrames[time].l2 + data.locality.byFrames[time].l3 + data.locality.byFrames[time].hpf;
			f.miss = STRIP_HEIGHT - Math.round(STRIP_HEIGHT * data.locality.byFrames[time].ipc / max.locality);
			
			// Memory bandwidth
			f.e = Math.round(STRIP_HEIGHT * data.frames[time].bandwidth / max.bandwidth);
			
			// Cache coherency
			max.coherency = data.frames[time].l1_miss + data.frames[time].l2_miss;
			f.il = Math.round(STRIP_HEIGHT * (data.frames[time].l1_invalid + data.frames[time].l2_invalid) / max.coherency);
			if (f.il >= STRIP_HEIGHT) console.log('admin', time, Math.round(100 * (data.frames[time].l1_invalid + data.frames[time].l2_invalid) / max.coherency), 'l1', data.frames[time].l1_invalid, data.frames[time].l1_miss, 'l2', data.frames[time].l2_invalid, data.frames[time].l2_miss);
			
		} else {
			f.i = NaN;
			f.p = NaN;
			f.r = NaN;
			f.yb = NaN;
			f.lw = NaN;
			f.q = NaN;
			f.miss = NaN;
			f.e = NaN;
			f.il = NaN;
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
	var pv = profile.v;
	var capabilities = profile.data.info.capability;
	var unableGauge = { g: 0, l: '?', u: 0 };
	
	// Outout
	output.gauges = {};
	
	// Max
	var max = {
		time:		profile.hardware.data.lcores * data.info.duration,
		locality:	data.locality.stats.ipc + data.locality.stats.tlb + data.locality.stats.l1 + data.locality.stats.l2 + data.locality.stats.l3 + data.locality.stats.hpf,
		eventBase:	data.info.duration * profile.hardware.data.lcores,
		bandwidth:	data.info.duration * profile.hardware.data.bandwidth,
		coherency:	data.stats.l1_miss + data.stats.l2_miss,
	};
	
	// Add percent
	var roundedValue;
	[	{ l: 'e',	v: data.stats.bandwidth,					m: max.bandwidth,			c: CAPABILITY_MEMORY },
	 	{ l: 'i',	v: data.stats.idle,							m: max.time,				c: CAPABILITY_STATE },
		{ l: 'p',	v: data.stats.parallel,						m: data.info.duration,		c: CAPABILITY_STATE }, 
		{ l: 'r',	v: data.stats.running,						m: max.time,				c: CAPABILITY_STATE },
		{ l: 'il',	v: data.stats.l1_invalid + data.stats.l2_invalid,	m: max.coherency,	c: CAPABILITY_COHERENCY },
		{ l: 'lw',	v: data.stats.lock_wait,					m: max.time,				c: CAPABILITY_LOCK },
		{ l: 'yb',	v: data.stats.ready + data.stats.standby,	m: max.time,				c: CAPABILITY_STATE },
		{ l: 'ipc',	v: data.locality.stats.ipc,					m: max.locality,			c: CAPABILITY_LOCALITY },
		{ l: 'miss',v: data.locality.stats.tlb + data.locality.stats.l1 + data.locality.stats.l2 + data.locality.stats.l3 + data.locality.stats.hpf,	m: max.locality,		c: CAPABILITY_LOCALITY },
	].forEach(function(item) {
		if (capabilities[item.c]) {
			roundedValue = Math.round(100 * item.v / item.m);
			output.gauges[item.l] = {
				g: roundedValue,
				l: roundedValue + '%',
			};
		}
		else
			output.gauges[item.l] = unableGauge;
	});
	
	// Add ratio
	var calibratedMax;
	[	{ l: 's',	v: data.stats.switches,		m: profile.hardware.calibration.s,	c: CAPABILITY_SWITCH },
		{ l: 'm',	v: data.stats.switches,		m: profile.hardware.calibration.m,	c: CAPABILITY_SWITCH },
		{ l: 'ls',	v: data.stats.lock_success,	m: profile.hardware.calibration.ls,	c: CAPABILITY_LOCK },
		{ l: 'lf',	v: data.stats.lock_failure,	m: profile.hardware.calibration.lf,	c: CAPABILITY_LOCK },
	].forEach(function(item) {
		if (capabilities[item.c]) {
			calibratedMax = max.eventBase * item.m;
			output.gauges[item.l] = {
				g: Math.max(Math.round(100 * item.v / calibratedMax - 100), 0),
				l: Math.round(10 * item.v / calibratedMax) / 10 + '×',
			};
		}
		else
			output.gauges[item.l] = unableGauge;
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
