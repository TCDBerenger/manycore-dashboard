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
// Capability
const CAPABILITY_STATE =	0;
const CAPABILITY_SWITCH =	1;
const CAPABILITY_LOCALITY =	2;
const CAPABILITY_LOCK =		3;
const CAPABILITY_MEMORY =	4;
const CAPABILITY_COHERENCY =5;


/************************************************/
/* Functions - common							*/
/************************************************/
/**
 * Format number
 */
function format1(v) { return Math.round(v * 10) / 10;		}
function format2(v) { return Math.round(v * 100) / 100;		}
function format3(v) { return Math.round(v * 1000) / 1000;	}


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
		ha:	data.stats.starts,
		hz:	data.stats.ends,
		
		c:	data.stats.cycles,
		
		p:	data.stats.parallel,
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
 * Add extra stats
 */
function addExtraStats(profile, output) {
	// Data
	var data = profile.data;
	var capabilities = profile.data.info.capability;
	
	// Max
	var max = {
		time:		profile.hardware.data.lcores * data.info.duration,
		locality:	data.locality.stats.ipc + data.locality.stats.tlb + data.locality.stats.l1 + data.locality.stats.l2 + data.locality.stats.l3 + data.locality.stats.hpf,
		eventBase:	data.info.duration * profile.hardware.data.lcores,
		bandwidth:	data.info.duration * profile.hardware.data.bandwidth,
		coherency:	data.stats.l1_miss + data.stats.l2_miss,
	};
	
	// Init output
	output.extra = {};
	
	// Add states based on a simple maximum ratio
	[	{ l: 'b',	 v: data.stats.standby,								m: max.time,			c: CAPABILITY_STATE },
		{ l: 'e',	 v: data.stats.bandwidth,							m: max.bandwidth,		c: CAPABILITY_MEMORY },
	 	{ l: 'i',	 v: data.stats.idle,								m: max.time,			c: CAPABILITY_STATE },
		{ l: 'o',	 v: max.time - data.stats.parallel,					m: max.time,			c: CAPABILITY_STATE },
		{ l: 'p',	 v: data.stats.parallel,							m: max.time,			c: CAPABILITY_STATE },
		{ l: 'r',	 v: data.stats.running,								m: max.time,			c: CAPABILITY_STATE },
	 	{ l: 'w',	 v: data.stats.wait,								m: max.time,			c: CAPABILITY_STATE },
		{ l: 'y',	 v: data.stats.ready,								m: max.time,			c: CAPABILITY_STATE },
		{ l: 'il',	 v: data.stats.l1_invalid + data.stats.l2_invalid,	m: max.coherency,		c: CAPABILITY_COHERENCY },
		{ l: 'il1',	 v: data.stats.l1_invalid,							m: data.stats.l1_miss,	c: CAPABILITY_COHERENCY },
		{ l: 'il2',	 v: data.stats.l2_invalid,							m: data.stats.l2_miss,	c: CAPABILITY_COHERENCY },
		{ l: 'lh',	 v: data.stats.lock_hold,							m: max.time,			c: CAPABILITY_LOCK },
		{ l: 'lw',	 v: data.stats.lock_wait,							m: max.time,			c: CAPABILITY_LOCK },
		{ l: 'qs',	 v: data.info.duration - data.stats.parallel,		m: data.info.duration,	c: CAPABILITY_STATE }, 
		{ l: 'yb',	 v: data.stats.ready + data.stats.standby,			m: max.time,			c: CAPABILITY_STATE },
		{ l: 'ipc',	 v: data.locality.stats.ipc,						m: max.locality,		c: CAPABILITY_LOCALITY },
		{ l: 'tlb',	 v: data.locality.stats.tlb,						m: max.locality,		c: CAPABILITY_LOCALITY },
		{ l: 'l1',	 v: data.locality.stats.l1,							m: max.locality,		c: CAPABILITY_LOCALITY },
		{ l: 'l2',	 v: data.locality.stats.l2,							m: max.locality,		c: CAPABILITY_LOCALITY },
		{ l: 'l3',	 v: data.locality.stats.l3,							m: max.locality,		c: CAPABILITY_LOCALITY },
		{ l: 'hpf',	 v: data.locality.stats.hpf,						m: max.locality,		c: CAPABILITY_LOCALITY },
		{ l: 'miss', v: data.locality.stats.tlb + data.locality.stats.l1 + data.locality.stats.l2 + data.locality.stats.l3 + data.locality.stats.hpf, m: max.locality, c: CAPABILITY_LOCALITY },
	].forEach(function(item) {
		if (capabilities[item.c]) {
			output.extra[item.l] = Math.round(item.v);
			output.extra['percent_' + item.l] = Math.round(100 * item.v / item.m);
		} else {
			output.extra[item.l] = '?';
			output.extra['percent_' + item.l] = '?';
		}
	});
	
	// Add events based
	var calibratedMax;
	[	{ l: 's',	v: data.stats.switches,		m: profile.hardware.calibration.s,	c: CAPABILITY_SWITCH },
		{ l: 'm',	v: data.stats.migrations,	m: profile.hardware.calibration.m,	c: CAPABILITY_SWITCH },
		{ l: 'ls',	v: data.stats.lock_success,	m: profile.hardware.calibration.ls,	c: CAPABILITY_LOCK },
		{ l: 'lf',	v: data.stats.lock_failure,	m: profile.hardware.calibration.lf,	c: CAPABILITY_LOCK },
		{ l: 'lr',	v: data.stats.lock_release,	m: profile.hardware.calibration.ls,	c: CAPABILITY_LOCK },
	].forEach(function(item) {
		if (capabilities[item.c]) {
			calibratedMax = max.eventBase * item.m;
			output.extra[item.l] = item.v;
			output.extra['expected_' + item.l] = format3(calibratedMax);
			output.extra['factor_' + item.l] = format2(item.v / calibratedMax);
			output.extra['rate_' + item.l] = format3(item.v / max.eventBase);
			output.extra['calibration_' + item.l] = item.m;
		}
		else {
			output.extra[item.l] = '?';
			output.extra['expected_' + item.l] = '?';
			output.extra['factor_' + item.l] = '?';
			output.extra['rate_' + item.l] = '?';
			output.extra['calibration_' + item.l] = '?';
		}
	});
	
	// Add simple ratio
	[	{ l: 'h',	v: data.stats.threads,	m: profile.hardware.data.lcores,	c: CAPABILITY_STATE },
	].forEach(function(item) {
		if (capabilities[item.c]) {
			output.extra[item.l] = item.v;
			output.extra['rate_' + item.l] = format3(item.v / item.m);
		}
		else {
			output.extra[item.l] = '?';
			output.extra['rate_' + item.l] = '?';
		}
	});
}



/**
 * Add strip data
 */
function addStrips(profile, output) {
	// Data
	var data = profile.data;
	var pv = profile.v;
	var max;
	
	// Init output
	output.strips = {};
	
	// Computation - Cache misses - %
	max = data.locality.stats.ipc + data.locality.stats.tlb + data.locality.stats.l1 + data.locality.stats.l2 + data.locality.stats.l3 + data.locality.stats.hpf;
	output.strips.miss = Math.round(100 * (data.locality.stats.tlb + data.locality.stats.l1 + data.locality.stats.l2 + data.locality.stats.l3 + data.locality.stats.hpf) / max);
	
	// Add states - by thread duration - %
	max = profile.hardware.data.lcores * data.info.duration;
	[	// { l: 'r', v: data.stats.running, n: 3 },
		{ l: 'yb', v: data.stats.ready + data.stats.standby, n: 3 },
		{ l: 'i', v: data.stats.idle, n: 3 },
		{ l: 'lw', v: data.stats.lock_wait, n: 4 }
	].forEach(function(item) {
		output.strips[item.l] = (item.n <= pv) ? Math.round(100 * item.v / max) : '?';
	});
	
	// Add states - by duration - %
	max = data.info.duration;
	[	{ l: 'p', v: data.stats.parallel, n: 3 },
	].forEach(function(item) {
		output.strips[item.l] = (item.n <= pv) ? Math.round(100 * item.v / max) : '?';
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
		addExtraStats(profile, output[id]);
//		addStrips(profile, output[id]);

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