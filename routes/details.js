var express = require('express');
var router = express.Router();

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
	1: { file: 'matmulijk', program: 'MatmulIJK', timeShift: 635573757342822588, timeStep: 50, availableCores: 8 },
	2: { file: 'matmulkij', program: 'MatmulKIJ', timeShift: 635573791209358810, timeStep: 50, availableCores: 8 },
	3: { file: 'matmulkji', program: 'MatmulKJI', timeShift: 635573758954791791, timeStep: 50, availableCores: 8 }
};



/************************************************/
/* Functions - Raw data							*/
/************************************************/
var profileRawData = {};

/**
 * Load raw data
 */
function loadData(id) {
	if (! profileRawData[id]) {
		profileRawData[id] = require('../data/' + profileMap[id].file + '.json');
	}
}



/************************************************/
/* Functions - Computed data					*/
/************************************************/
var profileData = {};
/**
	profileData
	 ├	profile<0>
	 │	 └	threads
	 │	  	 └	byFrames
	 │			 ├	frame<0>			ID
	 │			 │	 ├	thread<0>		ID
	 │			 │	 │	 ├	cycles		<integer>
	 │			 │	 │	 ├	init		<integer>
	 │			 │	 │	 ├	running		<integer>
	 │			 │	 │	 ├	standby		<integer>
	 │			 │	 │	 ├	wait		<integer>
	 │			 │	 │	 ├	ready		<integer>
	 │			 │	 │	 ├	transition	<integer>
	 │			 │	 │	 ├	terminated	<integer>
	 │			 │	 │	 └	unknown		<integer>
	 │			 │	 ├	...
	 │			 │	 └	thread<N>
	 │			 ├	...
	 │			 └	frame<?>
	 ├	...
	 └	profile<?>
 */
/**
 * Filter threads states
 */
function treatThreadStatesByFrame(id) {
	// Do treatment only once
	if (profileData.hasOwnProperty(id) && profileData[id].hasOwnProperty('treatThreadStatesByFrame') && profileData[id].treatThreadStatesByFrame) {
		return profileData[id];
	}

	// Auto-create structure
	if (! profileData.hasOwnProperty(id))						profileData[id] = {};
	if (! profileData[id].hasOwnProperty('threads'))			profileData[id].threads = {};
	if (! profileData[id].threads.hasOwnProperty('byFrames'))	profileData[id].threads.byFrames = {};

	// Analyse element by element and group them by time
	var timeID = 0;
	var statThreads = {};
	profileMap[id].timeIDMax = 0;
	profileRawData[id].forEach(function(element) {
		if (element.program == profileMap[id].program) {

			// Compute time ID
			timeID = element.time - profileMap[id].timeShift;
			timeID = Math.round(timeID / 10000);

			// Auto build structure
			if (! profileData[id].threads.byFrames.hasOwnProperty(timeID)) profileData[id].threads.byFrames[timeID] = {};
			if (! profileData[id].threads.byFrames[timeID].hasOwnProperty(element.tid)) profileData[id].threads.byFrames[timeID][element.tid] = {};

			// Save state
			profileData[id].threads.byFrames[timeID][element.tid][element.type] = element.value;
			profileMap[id].timeIDMax = Math.max(profileMap[id].timeIDMax, timeID);

			// Count threads
			statThreads[element.tid] = true;
		}
	});

	// Count threads
	var countThreads = 0;
	for (var t in statThreads) { if (statThreads.hasOwnProperty(t) && t) countThreads++; };
	profileMap[id].threadCount = countThreads;

	// computation done
	profileData[id].treatThreadStatesByFrame = true;
	return profileData[id];
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
	 │	 │	 ├	c				<integer>	number of cycles
	 │	 │	 ├	crun			<integer>	number of cycles for running state
	 │	 │	 ├	crea			<integer>	number of cycles for ready state
	 │	 │	 ├	trun			<integer>	number of threads in running state
	 │	 │	 └	trea			<integer>	number of threads in ready state
	 │	 │	...
	 │	 └	<timeMax>
	 └	stats
	 	 ├	duration			<integer>	how long is the run
	 	 ├	timeShift			<integer>	time before starting measures (i.e. non interesting computation before this time) /!\ in pico seconds (10⁻¹²s) /!\ need to be divided by 10⁹
	 	 ├	timeMax				<integer>	last time frame in ms (10⁻³s)
	 	 ├	timeStep			<integer>	time between each frame in ms (10⁻³s) (probably: 50 ms)
	 	 ├	availableCores		<integer>	number of cores (not physically in hyper threading case)
		 ├	cycles				<integer>	number of cycles
		 ├	cyclesRunning		<integer>	number of cycles for running state
		 └	cyclesReady			<integer>	number of cycles for ready state
 */
/**
 * Add common stats
 */
function addCommon(output, id) {
	// Init vars
	var profile		= profileMap[id];

	// Stats
	if (! output.hasOwnProperty('stats')) output.stats = {};
	output.stats.timeShift = profile.timeShift;
	output.stats.timeStep = profile.timeStep;
	output.stats.availableCores = profile.availableCores;
	output.stats.threadCount = profile.threadCount;
}

/**
 * Add cycles
 */
function addCycles(output, id) {
	// Init vars
	var data		= treatThreadStatesByFrame(id);
	var profile		= profileMap[id];
	output.cycles	= [];

	// Loop vars
	var thread, statCountThreads, countThread;
	var sumCycles, sumInit, sumRunning, sumStandby, sumWait, sumReady, sumTransition, sumTerminated, sumUnknown;
	var statSumCycles, statSumInit, statSumRunning, statSumStandby, statSumWait, statSumReady, statSumTransition, statSumTerminated, statSumUnknown;

	// Init stats vars
	statCountThreads = 0;
	statSumCycles = 0;	statSumInit = 0;		statSumRunning = 0;		statSumStandby = 0;	statSumWait = 0;
	statSumReady = 0;	statSumTransition = 0;	statSumTerminated = 0;	statSumUnknown = 0;
	
	// Count threads availables
	for (var timeID = 0; timeID <= profile.timeIDMax; timeID+= profile.timeStep) {

		// If the time frame exists
		if (data.threads.byFrames.hasOwnProperty(timeID)) {

			// Reinit counters
			sumCycles = 0;	sumInit = 0;		sumRunning = 0;		sumStandby = 0;		sumWait = 0;
			sumReady = 0;	sumTransition = 0;	sumTerminated = 0;	sumUnknown = 0;
			countThread = 0;

			// Count among all threads
			for (var threadID in data.threads.byFrames[timeID]) {
				if (data.threads.byFrames[timeID].hasOwnProperty(threadID)) {
					// Get data by thread
					thread = data.threads.byFrames[timeID][threadID];
					countThread++;

					// Sum cycles by time frame
					sumCycles		+= thread.cycles;
					sumInit			+= thread.init;
					sumRunning		+= thread.running;
					sumStandby		+= thread.standby;
					sumWait			+= thread.wait;
					sumReady		+= thread.ready;
					sumTransition	+= thread.transition;
					sumTerminated	+= thread.terminated;
					sumUnknown		+= thread.unknown;
				}
			}

			statCountThreads = Math.max(statCountThreads, countThread);

		} else {
			// Failed sums
			sumCycles		= NaN;
			sumInit			= NaN;
			sumRunning		= NaN;
			sumStandby		= NaN;
			sumWait			= NaN;
			sumReady		= NaN;
			sumTransition	= NaN;
			sumTerminated	= NaN;
			sumUnknown		= NaN;
		}

		// Sum cycles globally
		statSumCycles		+= sumCycles;
		statSumInit			+= sumInit;
		statSumRunning		+= sumRunning;
		statSumStandby		+= sumStandby;
		statSumWait			+= sumWait;
		statSumReady		+= sumReady;
		statSumTransition	+= sumTransition;
		statSumTerminated	+= sumTerminated;
		statSumUnknown		+= sumUnknown;

		// Output
		output.cycles.push({
			t:		timeID,
			c:		sumCycles,
			i:		sumInit,
			run:	sumRunning,
			s:		sumStandby,
			w:		sumWait,
			rea:	sumReady,
			tra:	sumTransition,
			ter:	sumTerminated,
			u:		sumUnknown,
		});

	};


	// Stats
	if (! output.hasOwnProperty('stats')) output.stats = {};
	output.stats.timeMax = profile.timeIDMax;
	output.stats.duration = profile.timeIDMax + profile.timeStep;
	output.stats.threadsMax = statCountThreads;

	// Stats - cycles
	output.stats.cycles = {
		cycles:		statSumCycles,
		init:		statSumInit,
		running:	statSumRunning,
		standby:	statSumStandby,
		wait:		statSumWait,
		ready:		statSumReady,
		transition:	statSumTransition,
		terminated:	statSumTerminated,
		unknown:	statSumUnknown
	};
}

/**
 * Add thread states
 */
function addStates(output, id) {
	// Init vars
	var data		= treatThreadStatesByFrame(id);
	var profile		= profileMap[id];
	output.states	= [];


	// Loop vars
	var thread, threadMaxCycles;
	var countThread, statCountThreads;
	var countCycles, countInit, countRunning, countStandby, countWait, countReady, countTransition, countTerminated, countUnknown;
	var statCountCycles, statCountInit, statCountRunning, statCountStandby, statCountWait, statCountReady, statCountTransition, statCountTerminated, statCountUnknown;

	// Init stats vars
	statCountThreads = 0;
	statCountCycles = 0;	statCountInit = 0;			statCountRunning = 0;		statCountStandby = 0;	statCountWait = 0;
	statCountReady = 0;		statCountTransition = 0;	statCountTerminated = 0;	statCountUnknown = 0;

	
	// Count threads availables
	for (var timeID = 0; timeID <= profile.timeIDMax; timeID+= profile.timeStep) {

		// If the time frame exists
		if (data.threads.byFrames.hasOwnProperty(timeID)) {

			// Reinit counters
			countThread = 0;
			countCycles = 0;	countInit = 0;		countRunning = 0;		countStandby = 0;		countWait = 0;
			countReady = 0;	countTransition = 0;	countTerminated = 0;	countUnknown = 0;

			// Count among all threads
			for (var threadID in data.threads.byFrames[timeID]) {
				if (data.threads.byFrames[timeID].hasOwnProperty(threadID)) {
					// Get data by thread
					thread = data.threads.byFrames[timeID][threadID];
					threadMaxCycles = Math.max(thread.cycles, thread.init, thread.running, thread.standby, thread.wait, thread.ready, thread.transition, thread.terminated, thread.unknown);
					countThread++;

					// Count states by time frame
					if (threadMaxCycles == thread.cycles)
						countCycles++;
					else if (threadMaxCycles == thread.init)
						countInit++;
					else if (threadMaxCycles == thread.running)
						countRunning++;
					else if (threadMaxCycles == thread.standby)
						countStandby++;
					else if (threadMaxCycles == thread.wait)
						countWait++;
					else if (threadMaxCycles == thread.ready)
						countReady++;
					else if (threadMaxCycles == thread.transition)
						countTransition++;
					else if (threadMaxCycles == thread.terminated)
						countTerminated++;
					else
						countUnknown++;
				}
			}

			statCountThreads = Math.max(statCountThreads, countThread);

		} else {
			// Failed counters
			countCycles		= NaN;
			countInit		= NaN;
			countRunning	= NaN;
			countStandby	= NaN;
			countWait		= NaN;
			countReady		= NaN;
			countTransition	= NaN;
			countTerminated	= NaN;
			countUnknown	= NaN;
		}


		// Hack
		if (countCycles > profile.availableCores) {
			countReady += countCycles - profile.availableCores;
			countCycles = profile.availableCores;
		}

		// Sum cycles globally
		statCountCycles		+= countCycles;
		statCountInit		+= countInit;
		statCountRunning	+= countRunning;
		statCountStandby	+= countStandby;
		statCountWait		+= countWait;
		statCountReady		+= countReady;
		statCountTransition	+= countTransition;
		statCountTerminated	+= countTerminated;
		statCountUnknown	+= countUnknown;

		// Output
		output.states.push({
			t:		timeID,
			c:		countCycles,
			i:		countInit,
			run:	countRunning,
			s:		countStandby,
			w:		countWait,
			rea:	countReady,
			tra:	countTransition,
			ter:	countTerminated,
			u:		countUnknown
		});

	};


	// Stats
	if (! output.hasOwnProperty('stats')) output.stats = {};
	output.stats.timeMax = profile.timeIDMax;
	output.stats.duration = profile.timeIDMax + profile.timeStep;
	output.stats.threadsMax = statCountThreads;

	// Stats - states
	output.stats.states = {
		cycles:		statCountCycles,
		init:		statCountInit,
		running:	statCountRunning,
		standby:	statCountStandby,
		wait:		statCountWait,
		ready:		statCountReady,
		transition:	statCountTransition,
		terminated:	statCountTerminated,
		unknown:	statCountUnknown
	};
}

/**
 * Add frames
 */
/*
function addFrames(output, id) {
	// Init vars
	output.frames = [];
	var data		= treatThreadStatesByFrame(id);
	var profile		= profileMap[id];

	// Count threads availables
	var thread, threadRunning, threadReady;
	var sumCycles, sumRunning, sumReady, countRunning, countReady;
	var timeMax = 0;
	var superSumCycles = 0;
	var superSumRunning = 0;
	var superSumReady = 0;
	for (var frameID in data.threads.byFrames) {
		if (data.threads.byFrames.hasOwnProperty(frameID)) {
			// Reinit counters
			sumCycles = 0;
			sumRunning = 0;
			sumReady = 0;
			countRunning = 0;
			countReady = 0;

			// Count among all threads
			for (var threadID in data.threads.byFrames[frameID]) {
				if (data.threads.byFrames[frameID].hasOwnProperty(threadID)) {
					thread = data.threads.byFrames[frameID][threadID];
					threadRunning = thread.running + thread.cycles;
					threadReady = thread.ready;
					sumCycles += thread.cycles;
					sumRunning += thread.running;
					sumReady += thread.ready;
					if (threadRunning > threadReady && threadRunning > thread.init && threadRunning > thread.standby && threadRunning > thread.terminated && threadRunning > thread.transition && threadRunning > thread.unknown && threadRunning > thread.wait) {
						countRunning++;
					} else if (threadReady > threadRunning && threadReady > thread.init && threadReady > thread.standby && threadReady > thread.terminated && threadReady > thread.transition && threadReady > thread.unknown && threadReady > thread.wait) {
						countReady++;
					}
				}
			}

			// Super sums
			superSumCycles += sumCycles;
			superSumRunning += sumRunning;
			superSumReady += sumReady;

			// Hack
			if (countRunning > profile.availableCores) {
				countReady += countRunning - profile.availableCores;
				countRunning = profile.availableCores;
			}

			// Build response
			output.frames.push({
				timeRelative: frameID,
				sumCycles : sumCycles,
				sumRunning : sumRunning,
				sumReady: sumReady,
				countRunning : countRunning,
				countReady: countReady
			});
			timeMax = Math.max(timeMax, frameID); 
		}
	}

	// Stats
	if (! output.hasOwnProperty('stats')) output.stats = {};
	output.stats.duration = timeMax + 50;
	output.stats.timeMax = timeMax;
	output.stats.cycles = superSumCycles;
	output.stats.cyclesRunning = superSumRunning;
	output.stats.cyclesReady = superSumReady;
}
*/


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
	addCycles(output, id);
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
	addCycles(output, id);
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
	var output = { c: { timeStart: 0} };
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
		output.c.timeMax = Math.max(output[id].stats.timeMax, output.c.timeMax | 0);
		output.c.durationMax = Math.max(output[id].stats.duration, output.c.durationMax | 0);
	});
	response.json(output);
});

module.exports = router;
