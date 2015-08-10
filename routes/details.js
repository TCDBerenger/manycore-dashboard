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
/* Functions - Add								*/
/************************************************/
/**
	output
	 ├	info
	 │	 ├	cores				<integer>	number of cores
	 │	 ├	threads				<integer>	number of threads handlable by CPU (i.e. in hyperthreading: twice cores)
	 │	 ├	timeStep			<integer>	time between each frame in ms (10⁻³s) (probably: 50 ms)
	 │	 ├	timeMin				<integer>	first time frame in ms (10⁻³s)
	 │	 ├	timeMax				<integer>	last time frame in ms (10⁻³s)
	 │	 └	duration			<integer>	how long is the run
	 ├	times					<array>		list of time frames
	 │	 ├	0
	 │	 │	 ├	r				<integer>	time (in ms) spending in state running
	 │	 │	 ├	yb				<integer>	time (in ms) spending in states ready and standby
	 │	 │	 ├	w				<integer>	time (in ms) spending in state waiting (all reasons)
	 │	 │	 ├	lw				<integer>	time (in ms) spending in state waiting for a lock aquisition
	 │	 │	 ├	uu				<integer>	time (in ms) idle (cores)
	 │	 │	 └	sys				<integer>	time (in ms) keeping by the OS
	 │	 │	...
	 │	 └	<timeMax>
	 ├	switches				<array>		list of switch event times (in ms)
	 ├	migrations				<array>		list of migration event times (in ms)
	 ├	states					<array>		list of states by frams
	 │	 ├	0
	 │	 │	 ├	t				<integer>	time in ms (10⁻³s), identiral to frame<id>
	 │	 │	 ├	r				<integer>	number of threads in running state
	 │	 │	 └	yb				<integer>	number of threads in ready or standby state /!\ false state /!\
	 │	 │	...
	 │	 └	<timeMax>
	 ├	threads
	 │	 ├	info
	 │	 │	 ├	0
	 │	 │	 │	 ├ h			<integer>	thread id
	 │	 │	 │	 ├ s			<integer>	time (in ms) thread starts
	 │	 │	 │	 └ e			<integer>	time (in ms) thread ends
	 │	 │	 │	...
	 │	 │	 └	<thread max>
	 │	 │	...
	 │	 ├	ticks
	 │	 │	 ├	<h>				<integer>	thread id
	 │	 │	 │	 ├ m			<array>		list of migration event times (in ms)
	 │	 │	 │	 ├ ls			<array>		list of lock acquisition success event times (in ms)
	 │	 │	 │	 └ lf			<array>		list of lock acquisition failure event times (in ms)
	 │	 │	 │	...
	 │	 │	 └	<thread max>
	 │	 └	periods
	 │		 ├	<h>				<integer>	thread id
	 │		 │	 ├ m			<array>		list of migration periods (core attachment)
	 │		 │	 │	 ├ s		<integer>	time (in ms) thread starts
	 │		 │	 │	 ├ c		<integer>	color id (core id)
	 │		 │	 │	 └ e		<integer>	time (in ms) thread ends
	 │		 │	 └ lw			<array>		list of lock acquisition waiting periods
	 │		 │		 ├ s		<integer>	time (in ms) thread starts
	 │		 │		 └ e		<integer>	time (in ms) thread ends
	 │		 │	...
	 │		 └	<thread max>
	 └	stats
		 ├	
		 ├	s					<interger>	number of switches
		 ├	m					<interger>	number of migrations
		 ├	c					<interger>	number of cycles
		 ├	r					<interger>	duration in ms for running state
		 ├	y					<interger>	duration in ms for ready state
		 ├	b					<interger>	duration in ms for standby state
		 ├	w					<interger>	duration in ms for waiting state
		 ├	cycles
		 │	 └	c				<integer>	number of cycles
		 ├	migrations
		 │	 └	m				<integer>	number of migrations
		 ├	switches
		 │	 └	s				<integer>	number of switches
		 └	times
		 	 ├	r				<integer>	duration in ms for running state
		 	 ├	y				<integer>	duration in ms for ready state
		 	 ├	w				<integer>	duration in ms for waiting state
		 	 ├	b				<integer>	duration in ms for standby state
		 	 └	yb				<integer>	duration in ms for ready or standby state /!\ false state /!\
 */


/**
 * Add common stats
 */
function addCommon(output, id) {
	// Init vars
	var data = profiles[id].data;

	// Stats
	output.stats = {
		h:	data.stats.threads,
		
	    s:	data.stats.switches,
	    m:	data.stats.migrations,
		c:	data.stats.cycles,

		r:	Math.round(data.stats.running),
		y:	Math.round(data.stats.ready),
		b:	Math.round(data.stats.standby),
		w:	Math.round(data.stats.wait),

		l1:		data.stats.l1miss,
		l2:		data.stats.l2miss,
		l3:		data.stats.l3miss,
		tlb:	data.stats.tlbmiss,
		dzf:	data.stats.dzf,
		hpf:	data.stats.hpf
	};

	// Threads
	output.threads = {info: []};
	for(var h in data.lifecycle) {
		output.threads.info.push({
			h: +h,
			s: data.lifecycle[h].s,
			e: data.lifecycle[h].e,
		});
	};

	// Sort - by start time
	output.threads.info.sort(function(a, b){return a.s - b.s});
}

/**
 * Add switches
 */
function addSwitches(output, id) {
	// Data
	output.switches = profiles[id].data.events.s;

	// Stats
	output.stats.switches = {
		s: profiles[id].data.stats.switches
	};
}

/**
 * Add migrations
 */
function addMigrations(output, id) {
	// Data
	output.migrations = profiles[id].data.events.m;

	// Stats
	output.stats.migrations = {
		m: profiles[id].data.stats.migrations
	};
}


/**
 * Add times spending in thread of core states
 */
function addTimes(output, id, properties) {
	// Init vars
	var max;
	var data =	profiles[id].data;
	var isR =	properties.indexOf('r') >= 0;
	var isYB =	properties.indexOf('yb') >= 0;
	var isW =	properties.indexOf('w') >= 0;
	var isLW =	properties.indexOf('lw') >= 0;
	var isUU =	properties.indexOf('uu') >= 0;
	var isSYS =	properties.indexOf('sys') >= 0;
	
	// Init return
	output.times = {};

	// Add times
	max = data.info.threads * data.info.timeStep;
	for (var timeID = 0; timeID <= data.info.timeMax; timeID+= data.info.timeStep) {
		output.times[timeID] = {};
		if (isR)	output.times[timeID].r =	Math.round(data.frames[timeID].running);
		if (isYB)	output.times[timeID].yb =	Math.round(data.frames[timeID].ready + data.frames[timeID].standby);
		if (isW)	output.times[timeID].w =	Math.round(data.frames[timeID].wait);
		if (isLW)	output.times[timeID].lw =	Math.round(data.frames[timeID].lock_wait);
		if (isUU)	output.times[timeID].uu =	Math.round(data.frames[timeID].idle);
		if (isSYS)	output.times[timeID].sys =	Math.round(max - data.frames[timeID].running - data.frames[timeID].idle);
	}

	// Stats
	max = data.info.threads * (data.info.timeMax + data.info.timeStep);
	output.stats.times = {
		r:		Math.round(data.stats.running),
		y:		Math.round(data.stats.ready),
		b:		Math.round(data.stats.standby),
		yb:		Math.round(data.stats.ready + data.stats.standby),
		w:		Math.round(data.stats.wait),
		lw:		data.stats.lock_wait,
		uu:		Math.round(data.stats.idle),
		sys:	Math.round(max - data.stats.running - data.stats.idle)
	};
}

/**
 * Add data-locality data
 */
function addLocality(output, id, simplified) {
	// Init vars
	var data		= profiles[id].data;
	output.locality	= {};

	// Data
	var max;
	for (var frameID in data.locality.byFrames) {
		if (data.locality.byFrames.hasOwnProperty(frameID)) {
			max = data.locality.byFrames[frameID].ipc + data.locality.byFrames[frameID].tlb + data.locality.byFrames[frameID].l1 + data.locality.byFrames[frameID].l2 + data.locality.byFrames[frameID].l3 + data.locality.byFrames[frameID].hpf
			if (simplified)
				output.locality[data.locality.byFrames[frameID].t] = {
					ipc:	Math.round(100 * data.locality.byFrames[frameID].ipc / max),
					miss:	100 - Math.round(100 * data.locality.byFrames[frameID].ipc / max)
				};
			else
				output.locality[data.locality.byFrames[frameID].t] = {
					ipc:	(100 * data.locality.byFrames[frameID].ipc / max),
					tlb:	(100 * data.locality.byFrames[frameID].tlb / max),
					l1:		(100 * data.locality.byFrames[frameID].l1 / max),
					l2:		(100 * data.locality.byFrames[frameID].l2 / max),
					l3:		(100 * data.locality.byFrames[frameID].l3 / max),
					hpf:	(100 * data.locality.byFrames[frameID].hpf / max)
				};
		}
	}

	// Stats
	output.stats.locality = data.locality.stats;
}

/**
 * Add Locks
 */
function addLocks(output, id) {
	// Init vars
	var data = profiles[id].data;
	
	// Init return
	output.slocks	= [];
	output.flocks	= [];

	// List lock success
	data.lock_success.forEach(function(lock) {
		output.slocks.push(lock.t);
	});

	// List lock failure
	data.lock_failure.forEach(function(lock) {
		output.flocks.push(lock.t);
	});

	// Stats
	output.stats.locks = {
		ls:	data.stats.lock_success,
		lf:	data.stats.lock_failure,
		lw:	data.stats.lock_wait
	};
}

/**
 * Add thread ticks
 */
function addThreadTicks(output, id, properties) {
	// Init vars
	var data = profiles[id].data;

	// Init output
	output.threads.ticks = {};
	
	// Add lists
	for (var h in data.events.threads) {
		output.threads.ticks[h] = {};
		
		properties.forEach(function(p) {
			output.threads.ticks[h][p] = data.events.threads[h][p];
		});
	}
}

/**
 * Add thread periods
 */
function addThreadPeriods(output, id, properties) {
	// Init vars
	var data = profiles[id].data;

	// Init output
	output.threads.periods = {};
	
	// Add lists
	for (var h in data.periods.threads) {
		output.threads.periods[h] = {};
		
		properties.forEach(function(p) {
			output.threads.periods[h][p] = data.periods.threads[h][p];
		});
	}
}



/************************************************/
/* Functions - For each category				*/
/************************************************/
/**
 * Task granularity
 */
function jsonTG(profile, id) {
	var output = {};

	output.id = id;
	output.cat = 'tg';

	// Common
	profile.exportInfo(output);
	addCommon(output, id);

	// for potential parallelism
	addTimes(output, id, ['r', 'yb', 'sys']);

	// for context switches
	addSwitches(output, id);

	// for migrations
	addMigrations(output, id);

	// for lifetimes
	addThreadTicks(output, id, ['m']);
	addThreadPeriods(output, id, ['m']);

	return output;
}

/**
 * Synchronisation
 */
function jsonSY(profile, id) {
	var output = {};

	output.id = id;
	output.cat = 'sy';

	// Common
	profile.exportInfo(output);
	addCommon(output, id);

	// Add locks
	addLocks(output, id);
	addTimes(output, id, ['r', 'lw', 'sys']);
	
	// Add ticks
	addThreadTicks(output, id, ['ls', 'lf']);
	
	// Add ticks
	addThreadPeriods(output, id, ['lw']);

	return output;
}

/**
 * Data sharing
 */
function jsonDS(profile, id) {
	var output = {};

	output.id = id;
	output.cat = 'ds';

	// Common
	profile.exportInfo(output);
	addCommon(output, id);

	// Add locks
	addLocks(output, id);

	// Add locality
	addLocality(output, id, false);

	return output;
}

/**
 * Load balancing
 */
function jsonLB(profile, id) {
	var output = {};

	output.id = id;
	output.cat = 'lb';

	// Common
	profile.exportInfo(output);
	addCommon(output, id);

	// for migrations
	addMigrations(output, id);

	// for potential parallelism
	addTimes(output, id, ['r', 'yb', 'lw', 'sys']);

	// Add locks
	addLocks(output, id);

	return output;
}

/**
 * Data locality
 */
function jsonDL(profile, id) {
	var output = {};

	output.id = id;
	output.cat = 'dl';

	// Common
	profile.exportInfo(output);
	addCommon(output, id);

	// Data
	addLocality(output, id, false);

	return output;
}

/**
 * Resource sharing
 */
function jsonRS(profile, id) {
	var output = {};

	output.id = id;
	output.cat = 'rs';

	// Common
	profile.exportInfo(output);
	addCommon(output, id);

	return output;
}

/**
 * Input / Outp
 */
function jsonIO(profile, id) {
	var output = {};

	output.id = id;
	output.cat = 'io';

	// Common
	profile.exportInfo(output);
	addCommon(output, id);

	return output;
}



/************************************************/
/* Functions - Global							*/
/************************************************/
/**
 * Get details data
 */
router.get('/*', function(request, response) {
	
	var params = request.params[0].split('/');
	var cat = params[0];
	var ids = params[1].split('-');

	// Check preconditions
	if (cat != 'tg' && cat != 'sy' && cat != 'ds' && cat != 'lb' && cat != 'dl' && cat != 'rs' && cat != 'io') {
		response.send("Illegal category");
		return;
	} else if (ids.length == 0 || ids.length > 4) {
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
		switch(cat) {
			case 'tg':	output[id] = jsonTG(profile, id); break;
			case 'sy':	output[id] = jsonSY(profile, id); break;
			case 'ds':	output[id] = jsonDS(profile, id); break;
			case 'lb':	output[id] = jsonLB(profile, id); break;
			case 'dl':	output[id] = jsonDL(profile, id); break;
			case 'rs':	output[id] = jsonRS(profile, id); break;
			case 'io':	output[id] = jsonIO(profile, id); break;
		}

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
