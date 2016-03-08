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
		start_h:	data.stats.starts,
		stop_h:		data.stats.ends,
		
	    s:	data.stats.switches,
	    m:	data.stats.migrations,
		c:	data.stats.cycles,
		
		p:	data.stats.parallel,

		i:	Math.round(data.stats.idle),
		r:	Math.round(data.stats.running),
		y:	Math.round(data.stats.ready),
		b:	Math.round(data.stats.standby),
		w:	Math.round(data.stats.wait),
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
//	output.strips.ipc = Math.round(100 * data.locality.stats.ipc / max);
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
	
	// Add calibrations - ×
	/*
	[	{ l: 's', v: data.stats.switches, c: profile.hardware.calibration.s, n: 3 },
		{ l: 'm', v: data.stats.switches, c: profile.hardware.calibration.m, n: 3 },
		{ l: 'ls', v: data.stats.lock_success, c: profile.hardware.calibration.ls, n: 4 },
		{ l: 'lf', v: data.stats.lock_failure, c: profile.hardware.calibration.lf, n: 4 },
	].forEach(function(item) {
		max = 	data.info.duration * profile.hardware.data.lcores * item.c;
		output.strips[item.l] = (item.n <= pv) ? Math.round(10 * item.v / max) / 10 : '?';
	});
	*/
}

/**
 * Add switches and migrations
 */
function addSwitches(profile, output) {
	// Data
	var data = profile.data;
	var max;
	
	[	{ l: 's', v: data.stats.switches, c: profile.hardware.calibration.s, t: 'switches' },
		{ l: 'm', v: data.stats.switches, c: profile.hardware.calibration.m, t: 'migrations' },
	].forEach(function(item) {
		if (! (item.t in output)) output[item.t] = {};
		max = data.info.duration * profile.hardware.data.lcores * item.c;
		output[item.t][item.l] = item.v;
		output[item.t]['expected_' + item.l] = max;
		output[item.t]['factor_' + item.l] = Math.round(10 * item.v / max) / 1;
		output[item.t]['rate_' + item.l] = Math.round(1000 * item.v / (data.info.duration * profile.hardware.data.lcores)) / 1;
		output[item.t]['calibration_' + item.l] = item.c;
	});
}

/**
 * Add locks
 */
function addLocks(profile, output) {
	// Data
	var data = profile.data;
	var pv = profile.v;
	var max;
	
	// Init output
	output.locks = {
		lr:	(profile.v >= 4) ? data.stats.lock_release : '?'
	};
	
	[	{ l: 'ls', v: data.stats.lock_success, c: profile.hardware.calibration.ls },
		{ l: 'lf', v: data.stats.lock_failure, c: profile.hardware.calibration.lf },
	].forEach(function(item) {
		max = data.info.duration * profile.hardware.data.lcores * item.c;
		output.locks[item.l] = (4 <= pv) ? item.v : '?';
		output.locks['expected_' + item.l] = format3(max);
		output.locks['factor_' + item.l] = (4 <= pv) ? format2(item.v / max) : '?';
		output.locks['rate_' + item.l] = (4 <= pv) ? format3(item.v / (data.info.duration * profile.hardware.data.lcores)) : '?';
		output.locks['calibration_' + item.l] = item.c;
	});
}


/**
 * Add events
 */
function addTimes(profile, output) {
	// Data
	var data = profile.data;
	var pv = profile.v;
	var max;
	
	// Init output
	output.times = {};
	
	// Add states - by thread duration
	max = profile.hardware.data.lcores * data.info.duration;
	[	{ l: 'r', v: data.stats.running, n: 3 },
		{ l: 'y', v: data.stats.ready, n: 3 },
		{ l: 'b', v: data.stats.standby, n: 3 },
		{ l: 'yb', v: data.stats.ready + data.stats.standby, n: 3 },
		{ l: 'i', v: data.stats.idle, n: 3 },
		{ l: 'w', v: data.stats.wait, n: 3 },
		{ l: 'lw', v: data.stats.lock_wait, n: 4 },
		{ l: 'lh', v: data.stats.lock_hold, n: 4 },
	].forEach(function(item) {
		output.times[item.l] = Math.round(item.v);
		output.times['percent_' + item.l] = (item.n <= pv) ? Math.round(100 * item.v / max) : '?';
	});
}


/**
 * Add data locality
 */
function addLocality(profile, output) {
	// Data
	var data = profile.data;
	var max_miss = data.locality.stats.tlb + data.locality.stats.l1 + data.locality.stats.l2 + data.locality.stats.l3 + data.locality.stats.hpf;
	var max_dl = data.locality.stats.ipc + max_miss;
	
	// Init output
	output.locality = {};
	
	// Add states - by thread duration
	max = profile.hardware.data.lcores * data.info.duration;
	[	{ l: 'miss',	v: max_miss },
		{ l: 'ipc',		v: data.locality.stats.ipc },
		{ l: 'tlb',		v: data.locality.stats.tlb },
		{ l: 'l1',		v: data.locality.stats.l1 },
		{ l: 'l2',		v: data.locality.stats.l2 },
		{ l: 'l3',		v: data.locality.stats.l3 },
		{ l: 'hpf',		v: data.locality.stats.hpf }
	].forEach(function(item) {
		output.locality[item.l] = Math.round(item.v);
		output.locality['percent_' + item.l] = Math.round(100 * item.v / max_dl);
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
		addStrips(profile, output[id]);
		addSwitches(profile, output[id]);
		addLocks(profile, output[id]);
		addTimes(profile, output[id]);
		addLocality(profile, output[id]);

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