var express = require('express');
var router = express.Router();
var fs = require('fs');
var VERSION = 4;

/************************************************/
/* Variables									*/
/************************************************/
/**
	Computed data:
		- timeIDMax						<integer>
		- threadCount					<integer>	Count all threads
	Flags from functions: (to avoid duplicate treatments)
		- treatThreadStatesByFrame		<boolean>
*/
var profileMap = {
	1: { file: 'matmulijk', program: 'MatmulIJK', timeStep: 50, availableCores: 8 },
	2: { file: 'matmulkij', program: 'MatmulKIJ', timeStep: 50, availableCores: 8 },
	3: { file: 'matmulkji', program: 'MatmulKJI', timeStep: 50, availableCores: 8 }
};


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
	 ├	threads
	 │	 └	byFrames
	 │		 ├	frame<0>			ID
	 │		 │	 ├	thread<0>		ID
	 │		 │	 │	 ├	cycles		<integer>	number of cycles
	 │		 │	 │	 ├	ready		<integer>	duration of ready state
	 │		 │	 │	 ├	running		<integer>	duration of running state
	 │		 │	 │	 ├	standby		<integer>	duration of standby state
	 │		 │	 │	 ├	wait		<integer>	duration of wait state
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
function loadData(id) {
	// Check if data are already loaded
	if (profileData.hasOwnProperty(id)) {
		return;
	}

	// Vars
	var filenameRaw1 = 'data/' + profileMap[id].file + '.states.json';
	var filenameRaw2 = 'data/' + profileMap[id].file + '.switches.json';
	var filenameCache = 'data/' + profileMap[id].file + '.cache.json';

	// Load data from cache
	try {
		// Load cache
		profileData[id] = JSON.parse(fs.readFileSync(filenameCache, 'utf8'));
		console.log("[" + id + "] " + profileMap[id].file + " cache opened");

		// Check old version
		if (profileData[id].info.version != VERSION) {

			// Delete file
			fs.unlinkSync(filenameCache);
			console.log("[" + id + "] " + profileMap[id].file + " cache invalidated");

			// Start over
			delete profileData[id];
		}

	} catch (e) { }

	// Load from raw data
	if (! profileData.hasOwnProperty(id)) {

		// Load raw
		var raw1 = JSON.parse(fs.readFileSync(filenameRaw1, 'utf8'));
		var raw2 = JSON.parse(fs.readFileSync(filenameRaw2, 'utf8'));
		console.log("[" + id + "] " + profileMap[id].file + " raw data loaded");

		// Compute
		profileData[id] = computeData(id, raw1, raw2, profileMap[id]);
		console.log("[" + id + "] " + profileMap[id].file + " raw data computed");

		// Save to cache
		fs.writeFileSync(filenameCache, JSON.stringify(profileData[id]));
		console.log("[" + id + "] " + profileMap[id].file + " raw data cached");
	}
}

/**
 * Compute data
 */
function computeData(id, raw1, raw2, profile) {

	// Create structure
	var data = {
		info: {
			version:		VERSION,
			program:		profile.program,
			cores:			profile.availableCores,
			timeShift:		raw1[0].time,
			timeStep:		profile.timeStep,
			timeMin:		0,
			timeMax:		0,
			threadCount:	NaN
		},
		stats: {},
		threads: {
			byFrames: {}
		}
	};

	// Analyse element by element and group them by time
	var timeID = 0;
	var statThreads = {};
	raw1.forEach(function(element) {
		if (element.program == profile.program) {

			// Compute time ID
			timeID = element.time - data.info.timeShift;
			timeID = Math.round(timeID / 10000);

			// Auto build structure
			if (! data.threads.byFrames.hasOwnProperty(timeID)) data.threads.byFrames[timeID] = {};
			if (! data.threads.byFrames[timeID].hasOwnProperty(element.tid)) data.threads.byFrames[timeID][element.tid] = {};

			// Save state
			if (! data.threads.byFrames[timeID][element.tid].hasOwnProperty(element.type)) data.threads.byFrames[timeID][element.tid][element.type] = 0;
			data.threads.byFrames[timeID][element.tid][element.type] += element.value;
			data.info.timeMax = Math.max(data.info.timeMax, timeID);

			// Count threads
			statThreads[element.tid] = true;

		} else if (element.program == "N/A") {
			data.stats[element.type] = element.value;
		}
	});

	// Count threads
	var countThreads = 0;
	for (var t in statThreads) { if (statThreads.hasOwnProperty(t) && t) countThreads++; };
	data.info.threadCount = countThreads;

	// computation done
	return data;
}


/************************************************/
/* Functions - Add								*/
/************************************************/
/**
	output
	 ├	frames					<array>		list of time frames
	 │	 ├	<0>
	 │	 │	 ├	timeRelative	<integer>	time in ms (10⁻³s), identiral to frame<id>
	 │	 │	 ├	sumCycles		<integer>	number of cycles
	 │	 │	 ├	sumRunning		<integer>	number of cycles for running state
	 │	 │	 ├	sumReady		<integer>	number of cycles for ready state
	 │	 │	 ├	countRunning	<integer>	number of threads in running state
	 │	 │	 └	countReady		<integer>	number of threads in ready state
	 │	 │	...
	 │	 └	<timeMax>
	 ├	cycles					<array>		list of time frames
	 │	 ├	<0>
	 │	 │	 ├	t				<integer>	time in ms (10⁻³s), identiral to frame<id>
	 │	 │	 └	c				<integer>	number of cycles
	 │	 │	...
	 │	 └	<timeMax>
	 ├	time					<array>		list of time frames
	 │	 ├	<0>
	 │	 │	 ├	t				<integer>	time in ms (10⁻³s), identiral to frame<id>
	 │	 │	 ├	run				<integer>	duration in ms for running state
	 │	 │	 ├	rea				<integer>	duration in ms for ready state
	 │	 │	 ├	w				<integer>	duration in ms for waiting state
	 │	 │	 └	s				<integer>	duration in ms for standby state
	 │	 │	...
	 │	 └	<timeMax>
	 ├	states					<array>		list of time frames
	 │	 ├	<0>
	 │	 │	 ├	t				<integer>	time in ms (10⁻³s), identiral to frame<id>
	 │	 │	 ├	r				<integer>	number of threads in running state
	 │	 │	 ├	y				<integer>	number of threads in ready state
	 │	 │	 ├	s				<integer>	number of threads in standby state
	 │	 │	 ├	ys				<integer>	number of threads in ready or standby state /!\ false state /!\
	 │	 │	 ├	w				<integer>	number of threads in waiting state
	 │	 │	 └	u				<integer>	number of threads in unknow state
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
		 ├	cycles
		 │	 └	cycles			<integer>	number of cycles
		 ├	times
		 │	 ├	running			<integer>	duration in ms for running state
		 │	 ├	ready			<integer>	duration in ms for ready state
		 │	 ├	wait			<integer>	duration in ms for waiting state
		 │	 ├	standby			<integer>	duration in ms for standby state
		 │	 └	readystandby	<integer>	duration in ms for ready or standby state /!\ false state /!\
		 └	states
			 ├	running			<integer>	number of cycles for running state
			 ├	ready			<integer>	number of cycles for ready state
			 ├	wait			<integer>	number of cycles for waiting state
			 └	standby			<integer>	number of cycles for standby state
 */
/**
 * Add common stats
 */
function addCommon(output, id) {
	// Init vars
	var data = profileData[id];

	// Stats
	output.info = {
		cores:			data.info.cores,
		timeShift:		data.info.timeShift,
		timeStep:		data.info.timeStep,
		timeMin:		data.info.timeMin,
		timeMax:		data.info.timeMax,
		duration:		data.info.timeMax + data.info.timeStep,
		threadCount:	data.info.threadCount
	};
	output.stats = {};
}

/**
 * Add cycles
 */
function addCycles(output, id) {
	// Init vars
	var data		= profileData[id];
	// var profile		= profileMap[id];
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
	var data		= profileData[id];
	//var profile		= profileMap[id];
	output.times	= [];

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
		output.times.push({
			t:	timeID,
			r:	sumRunning,
			ys:	sumReady + sumStandby
		});

	};

	// Stats
	output.stats.times = {
		r:	statSumRunning,
		s:	statSumStandby,
		w:	statSumWait,
		y:	statSumReady,
		ys:	statSumReady + statSumStandby
	};
}

/**
 * Add thread states
 */
function addStates(output, id) {
	// Init vars
	var data		= profileData[id];
	//var profile		= profileMap[id];
	output.states	= [];


	// Loop vars
	var thread, threadMaxDuration;
	var countRunning, countStandby, countWait, countReady, countUnknown, countYS;
	var statCountRunning, statCountStandby, statCountWait, statCountReady, statCountUnknown;

	// Init stats vars
	statCountRunning = 0; statCountStandby = 0; statCountWait = 0; statCountReady = 0; statCountUnknown = 0;

	
	// Count threads availables
	for (var timeID = 0; timeID <= data.info.timeMax; timeID+= data.info.timeStep) {

		// If the time frame exists
		if (data.threads.byFrames.hasOwnProperty(timeID)) {

			// Reinit counters
			countRunning = 0; countStandby = 0; countWait = 0; countReady = 0; countUnknown = 0; countYS = 0;

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
						countYS++;
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
			countYS			= NaN;
		}


		// Hack
		/*
		if (countRunning > profile.availableCores) {
			countReady += countRunning - profile.availableCores;
			countRunning = profile.availableCores;
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
			ys:	countYS
		});

	};


	// Stats
	output.stats.states = {
		r:	statCountRunning,
		s:	statCountStandby,
		w:	statCountWait,
		r:	statCountReady
	};
}


/************************************************/
/* Functions - For each category				*/
/************************************************/
/**
 * Task granularity
 */
function jsonTG(id) {
	var output = {};

	output.id = id;
	output.cat = 'tg';

	// Common
	addCommon(output, id);

	// for potential parallelism
	addTime(output, id);
	addStates(output, id);


	return output;
}

/**
 * Synchronisation
 */
function jsonSY(id) {
	var output = {};

	output.id = id;
	output.cat = 'sy';
	output.log = "TODO";

	// Common
	addCommon(output, id);

	return output;
}

/**
 * Data sharing
 */
function jsonDS(id) {
	var output = {};

	output.id = id;
	output.cat = 'ds';
	output.log = "TODO";

	// Common
	addCommon(output, id);

	return output;
}

/**
 * Load balancing
 */
function jsonLB(id) {
	var output = {};

	output.id = id;
	output.cat = 'lb';

	// Common
	addCommon(output, id);

	// for potential parallelism
	addTime(output, id);
	addStates(output, id);

	return output;
}

/**
 * Data locality
 */
function jsonDL(id) {
	var output = {};

	output.id = id;
	output.cat = 'dl';
	output.log = "TODO";

	// Common
	addCommon(output, id);

	return output;
}

/**
 * Resource sharing
 */
function jsonRS(id) {
	var output = {};

	output.id = id;
	output.cat = 'rs';
	output.log = "TODO";

	// Common
	addCommon(output, id);

	return output;
}

/**
 * Input / Outp
 */
function jsonIO(id) {
	var output = {};

	output.id = id;
	output.cat = 'io';
	output.log = "TODO";

	// Common
	addCommon(output, id);

	return output;
}


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
			issueFound = issueFound || isNaN(id) || ! profileMap[id];
		});
		if (issueFound) {
			response.send("Illegal identifiers");
			return;
		}
	}

	// Compute
	var output = { c: {} };
	ids.forEach(function(id) {
		loadData(id);
		switch(cat) {
			case 'tg':	output[id] = jsonTG(id); break;
			case 'sy':	output[id] = jsonSY(id); break;
			case 'ds':	output[id] = jsonDS(id); break;
			case 'lb':	output[id] = jsonLB(id); break;
			case 'dl':	output[id] = jsonDL(id); break;
			case 'rs':	output[id] = jsonRS(id); break;
			case 'io':	output[id] = jsonIO(id); break;
		}
		output.c.timeMin = Math.min(output[id].info.timeMin, output.c.timeMin | 0);
		output.c.timeMax = Math.max(output[id].info.timeMax, output.c.timeMax | 0);
		output.c.duration = Math.max(output[id].info.duration, output.c.duration | 0);
	});
	response.json(output);
});

module.exports = router;
