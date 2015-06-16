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
	 ├	frames					<array>		list of time frames
	 │	 ├	0
	 │	 │	 ├	timeRelative	<integer>	time in ms (10⁻³s), identiral to frame<id>
	 │	 │	 ├	sumCycles		<integer>	number of cycles
	 │	 │	 ├	sumRunning		<integer>	number of cycles for running state
	 │	 │	 ├	sumReady		<integer>	number of cycles for ready state
	 │	 │	 ├	countRunning	<integer>	number of threads in running state
	 │	 │	 └	countReady		<integer>	number of threads in ready state
	 │	 │	...
	 │	 └	<timeMax>
	 ├	cycles					<array>		list of cycles by frams
	 │	 ├	0
	 │	 │	 ├	t				<integer>	time in ms (10⁻³s), identiral to frame<id>
	 │	 │	 └	c				<integer>	number of cycles
	 │	 │	...
	 │	 └	<timeMax>
	 ├	lifetimes
	 │	 ├	list				<array>		list of migrations, ordered by start time
	 │	 │	 ├	0
	 │	 │	 │	 └	h			ID	thread ID
	 │	 │	 │	 └	s			<integer>	start time in ms (10⁻³s), real time, not a time frame
	 │	 │	 │	 └	m			[]			array of time migrations, ordered by time, real time, not a time frame
	 │	 │	 │	 └	e			<integer>	end time in ms (10⁻³s), real time, not a time frame
	 │	 │	 │	...
	 │	 │	 └	<info.threadCount * 2>
	 ├	migrations
	 │	 └	list				<array>		list of migrations
	 │		 ├	0
	 │		 │	 └	t			<integer>	time in ms (10⁻³s), real time, not a frame time
	 │		 │	...
	 │		 └	<stats.migrations.m>
	 ├	states					<array>		list of states by frams
	 │	 ├	0
	 │	 │	 ├	t				<integer>	time in ms (10⁻³s), identiral to frame<id>
	 │	 │	 ├	r				<integer>	number of threads in running state
	 │	 │	 └	yb				<integer>	number of threads in ready or standby state /!\ false state /!\
	 │	 │	...
	 │	 └	<timeMax>
	 ├	switches
	 │	 ├	frames				<array>		switches by frames, ordered by start time
	 │	 │	 ├	0
	 │	 │	 │	 ├	t				<integer>	time in ms (10⁻³s), identiral to frame<id>
	 │	 │	 │	 └	s				<integer>	number of switches
	 │	 │	 │	...
	 │	 │	 └	<timeMax>
	 │	 └	list				<array>		list of switches
	 │		 ├	0
	 │		 │	 └	t			<integer>	time in ms (10⁻³s), real time, not a frame time
	 │		 │	...
	 │		 └	<stats.migrations.m>
	 ├	times					<array>		list of state times by frams
	 │	 ├	0
	 │	 │	 ├	t				<integer>	time in ms (10⁻³s), identiral to frame<id>
	 │	 │	 ├	r				<integer>	duration in ms for running state
	 │	 │	 └	yb				<integer>	duration in ms for ready and standby state
	 │	 │	...
	 │	 └	<timeMax>
	 ├	info
	 │	 ├	cores				<integer>	number of cores (not physically in hyper threading case)
	 │	 ├	timeShift			<integer>	time before starting measures (i.e. non interesting computation before this time) /!\ in pico seconds (10⁻¹²s) /!\ need to be divided by 10⁹
	 │	 ├	timeStep			<integer>	time between each frame in ms (10⁻³s) (probably: 50 ms)
	 │	 ├	timeMin				<integer>	first time frame in ms (10⁻³s)
	 │	 ├	timeMax				<integer>	last time frame in ms (10⁻³s)
	 │	 ├	duration			<integer>	how long is the run
	 │	 └	threadCount			<integer>	number of (unique) threads
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
		 ├	times
		 │	 ├	r				<integer>	duration in ms for running state
		 │	 ├	y				<integer>	duration in ms for ready state
		 │	 ├	w				<integer>	duration in ms for waiting state
		 │	 ├	b				<integer>	duration in ms for standby state
		 │	 └	yb				<integer>	duration in ms for ready or standby state /!\ false state /!\
		 └	states
			 ├	r				<integer>	number of cycles for running state
			 ├	y				<integer>	number of cycles for ready state
			 ├	w				<integer>	number of cycles for waiting state
			 └	b				<integer>	number of cycles for standby state
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

	// Calibration
	output.calibration = {};

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
	// Init vars
	var data		= profiles[id].data;
	output.switches	= {
		list: data.timelist.switches,
		frames: []
	};

	// calib
	output.calibration.switches = profiles[id].hardware.calibration.switches;

	// Build frame in the right order
	for (var timeID = 0; timeID <= data.info.timeMax; timeID+= data.info.timeStep) {

		// Output
		output.switches.frames.push({
			t:	timeID,
			s:	(data.frames.hasOwnProperty(timeID)) ? data.frames[timeID].switches : NaN
		});
	}

	// Stats
	output.stats.switches = {
		s: data.stats.switches
	};
}

/**
 * Add migrations
 */
function addMigrations(output, id) {
	// Init vars
	var data			= profiles[id].data;
	output.migrations	= {
		list: data.timelist.migrations
	};

	// calib
	output.calibration.migrations = profiles[id].hardware.calibration.migrations;

	// Stats
	output.stats.migrations = {
		m: data.stats.migrations
	};
}

/**
 * Add lifetimes
 */
function addLifetimes(output, id) {
	// Init vars
	var data			= profiles[id].data;
	output.lifetimes	= {
		list: []
	};

	var m_complete;
	for(var h in data.lifecycle) {
		m_complete = data.lifecycle[h].m.slice(0);
		// Remove start
		if (m_complete[0] ==  data.lifecycle[h].s)						m_complete.shift();
		// Remove end
		if (m_complete[m_complete.length - 1] ==  data.lifecycle[h].e)	m_complete.pop();

		// Add start
		// if (m_complete[0] !=  data.lifecycle[h].s)						m_complete.unshift(data.lifecycle[h].s);
		// Add end
		// if (m_complete[m_complete.length - 1] !=  data.lifecycle[h].e)	m_complete.push(data.lifecycle[h].e);

		output.lifetimes.list.push({
			h: +h,
			s: data.lifecycle[h].s,
			m: m_complete,
			e: data.lifecycle[h].e,
		});
	};

	// Sort - by start time
	output.lifetimes.list.sort(function(a, b){return a.s - b.s});

	// Stats
	output.stats.lifetimes = {
	};
}

/**
 * Add cycles
 */
function addCycles(output, id) {
	// Init vars
	var data		= profiles[id].data;
	output.cycles	= [];

	// Loop vars
	var statSumCycles, sumCycles;

	// Init stats vars
	statSumCycles = 0;
	
	// Count threads availables
	for (var timeID = 0; timeID <= data.info.timeMax; timeID+= data.info.timeStep) {

		// If the time frame exists
		if (data.threads.byFrames.hasOwnProperty(timeID)) {

			// Reinit counters
			sumCycles = 0;

			// Count among all threads
			for (var threadID in data.threads.byFrames[timeID]) {
				if (data.threads.byFrames[timeID].hasOwnProperty(threadID)) {
					// Sum cycles by time frame
					sumCycles += data.threads.byFrames[timeID][threadID].cycles;
				}
			}

		} else {
			// Failed sums
			sumCycles = NaN;
		}

		// Sum cycles globally
		statSumCycles += sumCycles;

		// Output
		output.cycles.push({
			t:		timeID,
			c:		sumCycles,
		});

	};

	// Stats
	output.stats.cycles = {
		cycles:		statSumCycles,
	};
}

/**
 * Add cycles
 */
function addTime(output, id) {
	// Init vars
	var data		= profiles[id].data;
	output.times	= {};
	output.times2	= [];

	// Add times
	for (var timeID = 0; timeID <= data.info.timeMax; timeID+= data.info.timeStep) {
		output.times[timeID] = {
			r:	Math.round(data.frames[timeID].running),
			yb:	Math.round(data.frames[timeID].ready + data.frames[timeID].standby),
		};
	}

	//
	// OLD WAY
	//

	// Loop vars
	var thread;
	var sumRunning, sumStandby, sumWait, sumReady;
	var statSumRunning, statSumStandby, statSumWait, statSumReady;

	// Init stats vars
	statCountThreads = 0;
	statSumRunning = 0; statSumStandby = 0; statSumWait = 0; statSumReady = 0;
	
	// Count threads availables
	for (var timeID = 0; timeID <= data.info.timeMax; timeID+= data.info.timeStep) {

		// If the time frame exists
		if (data.threads.byFrames.hasOwnProperty(timeID)) {

			// Reinit counters
			sumRunning = 0; sumStandby = 0; sumWait = 0; sumReady = 0;
			countThread = 0;

			// Count among all threads
			for (var threadID in data.threads.byFrames[timeID]) {
				if (data.threads.byFrames[timeID].hasOwnProperty(threadID)) {
					// Get data by thread
					thread = data.threads.byFrames[timeID][threadID];
					countThread++;

					// Sum cycles by time frame
					sumRunning		+= thread.running;
					sumStandby		+= thread.standby;
					sumWait			+= thread.wait;
					sumReady		+= thread.ready;
				}
			}

			statCountThreads = Math.max(statCountThreads, countThread);

		} else {
			// Failed sums
			sumRunning		= NaN;
			sumStandby		= NaN;
			sumWait			= NaN;
			sumReady		= NaN;
		}

		// Sum time globally
		statSumRunning		+= sumRunning;
		statSumStandby		+= sumStandby;
		statSumWait			+= sumWait;
		statSumReady		+= sumReady;

		// Output
		output.times2.push({
			t:	timeID,
			r:	sumRunning,
			yb:	sumReady + sumStandby
		});

	};

	// Stats
	output.stats.times = {
		r:	statSumRunning,
		b:	statSumStandby,
		w:	statSumWait,
		y:	statSumReady,
		yb:	statSumReady + statSumStandby
	};
}

/**
 * Add thread states
 */
function addStates(output, id) {
	// Init vars
	var data		= profiles[id].data;
	output.states	= [];


	// Loop vars
	var thread, threadMaxDuration;
	var countRunning, countStandby, countWait, countReady, countUnknown, countYB;
	var statCountRunning, statCountStandby, statCountWait, statCountReady, statCountUnknown;

	// Init stats vars
	statCountRunning = 0; statCountStandby = 0; statCountWait = 0; statCountReady = 0; statCountUnknown = 0;

	
	// Count threads availables
	for (var timeID = 0; timeID <= data.info.timeMax; timeID+= data.info.timeStep) {

		// If the time frame exists
		if (data.threads.byFrames.hasOwnProperty(timeID)) {

			// Reinit counters
			countRunning = 0; countStandby = 0; countWait = 0; countReady = 0; countUnknown = 0; countYB = 0;

			// Count among all threads
			for (var threadID in data.threads.byFrames[timeID]) {
				if (data.threads.byFrames[timeID].hasOwnProperty(threadID)) {
					// Get data by thread
					thread = data.threads.byFrames[timeID][threadID];
					threadMaxDuration = Math.max(thread.running, thread.wait, thread.ready + thread.standby);

					// Count states by time frame
					if (threadMaxDuration == thread.running) {
						countRunning++;

					} else if (threadMaxDuration == thread.standby + thread.ready) {
						countYB++;
						if (thread.ready >= thread.standby) {
							countReady++;
						} else {
							countStandby++;
						}

					} else if (threadMaxDuration == thread.wait) {
						countWait++;

					} else
						countUnknown++;
				}
			}

		} else {
			// Failed counters
			countRunning	= NaN;
			countStandby	= NaN;
			countWait		= NaN;
			countReady		= NaN;
			countUnknown	= NaN;
			countYB			= NaN;
		}


		// Hack
		/*
		if (countRunning > profile.hardware.data.cores) {
			countReady += countRunning - profile.hardware.data.cores;
			countRunning = profile.hardware.data.cores;
		}
		*/

		// Sum cycles globally
		statCountRunning	+= countRunning;
		statCountStandby	+= countStandby;
		statCountWait		+= countWait;
		statCountReady		+= countReady;
		statCountUnknown	+= countUnknown;

		// Output
		output.states.push({
			t:	timeID,
			r:	countRunning,
			yb:	countYB
		});

	};


	// Stats
	output.stats.states = {
		r:	statCountRunning,
		b:	statCountStandby,
		w:	statCountWait,
		r:	statCountReady
	};
}

/**
 * Add data-locality data
 */
function addLocality(output, id, simplified) {
	// Init vars
	var data		= profiles[id].data;
	output.locality	= [];

	// Data
	var max;
	for (var frameID in data.locality.byFrames) {
		if (data.locality.byFrames.hasOwnProperty(frameID)) {
			max = data.locality.byFrames[frameID].ipc + data.locality.byFrames[frameID].tlb + data.locality.byFrames[frameID].l1 + data.locality.byFrames[frameID].l2 + data.locality.byFrames[frameID].l3 + data.locality.byFrames[frameID].hpf
			if (simplified)
				output.locality.push({
					t:		data.locality.byFrames[frameID].t,
					ipc:	Math.round(100 * data.locality.byFrames[frameID].ipc / max),
					miss:	100 - Math.round(100 * data.locality.byFrames[frameID].ipc / max)
				});
			else
				output.locality.push({
					t:		data.locality.byFrames[frameID].t,
					ipc:	(100 * data.locality.byFrames[frameID].ipc / max),
					tlb:	(100 * data.locality.byFrames[frameID].tlb / max),
					l1:		(100 * data.locality.byFrames[frameID].l1 / max),
					l2:		(100 * data.locality.byFrames[frameID].l2 / max),
					l3:		(100 * data.locality.byFrames[frameID].l3 / max),
					hpf:	(100 * data.locality.byFrames[frameID].hpf / max)
				});
		}
	}
	output.locality.sort(function(a, b){return a.t - b.t});
	

	// Stats
	output.stats.locality = data.locality.stats;
}

/**
 * Add Locks
 */
function addLocks(output, id) {
	// Init vars
	var data		= profiles[id].data;
	output.slocks	= [];
	output.flocks	= [];

	if (! output.hasOwnProperty('times'))
		output.times = {};

	data.lock_success.forEach(function(lock) {
		output.slocks.push(lock.t);
	});

	data.lock_failure.forEach(function(lock) {
		output.flocks.push(lock.t);
	});

	for (var timeID = 0; timeID <= data.info.timeMax; timeID+= data.info.timeStep) {
		output.times[timeID] = {
			r:	Math.round(data.frames[timeID].running),
			w:	Math.round(data.frames[timeID].wait),
			lw:	data.frames[timeID].lock_wait
		};
	}

	// Stats
	output.stats.locks = {
		s:	data.stats.lock_success,
		f:	data.stats.lock_failure,
		w:	data.stats.lock_wait
	};
	// Stats
	output.stats.times = {
		r:	Math.round(data.stats.running),
		uu:	data.info.threads * (data.info.timeMax + data.info.timeStep) - Math.round(data.stats.running),
		w:	Math.round(data.stats.wait),
		lw:	data.stats.lock_wait
	};
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

	// for context switches
	addSwitches(output, id);

	// for migrations
	addMigrations(output, id);

	// for lifetimes
	addLifetimes(output, id);

	// for potential parallelism
	addTime(output, id);
	addStates(output, id);

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
	addTime(output, id);
	addStates(output, id);

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
