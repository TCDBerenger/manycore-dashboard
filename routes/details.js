var express = require('express');
var router = express.Router();

/************************************************/
/* Variables									*/
/************************************************/
/**
	Computed data:
		- timeIDMax						<integer>
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
	profileMap[id].timeIDMax = 0;
	profileRawData[id].forEach(function(element) {
		if (element.program == profileMap[id].program) {

			// Compute time ID
			timeID = element.time - profileMap[id].timeShift;
			timeID = Math.round(timeID / 10000);

			// Check Frame time
			if (! profileData[id].threads.byFrames.hasOwnProperty(timeID)) {
				profileData[id].threads.byFrames[timeID] = {};
			}

			// Check Frame time
			if (! profileData[id].threads.byFrames[timeID].hasOwnProperty(element.tid)) {
				profileData[id].threads.byFrames[timeID][element.tid] = {};
			}

			// Stave state
			profileData[id].threads.byFrames[timeID][element.tid][element.type] = element.value;
			profileMap[id].timeIDMax = Math.max(profileMap[id].timeIDMax, timeID);
		}
	});

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
}

/**
 * Add cycles
 */
function addcycles(output, id) {
	// Init vars
	var data		= treatThreadStatesByFrame(id);
	var profile		= profileMap[id];
	output.cycles	= {
		axis: [],
		cycles: [],
		running: [],
		ready: [],
		runningThreads: [],
		readyThreads: []
	};

	// Count threads availables
	var thread, threadRunning, threadReady;
	var sumCycles, sumRunning, sumReady, countRunning, countReady;
	var StatSumCycles = 0;
	var StatSumRunning = 0;
	var StatSumReady = 0;
	for (var timeID = 0; timeID <= profile.timeIDMax; timeID+= profile.timeStep) {
		output.cycles.axis.push(timeID);

		// If the time frame exists
		if (data.threads.byFrames.hasOwnProperty(timeID)) {

			// Reinit counters
			sumCycles = 0;
			sumRunning = 0;
			sumReady = 0;
			countRunning = 0;
			countReady = 0;

			// Count among all threads
			for (var threadID in data.threads.byFrames[timeID]) {
				if (data.threads.byFrames[timeID].hasOwnProperty(threadID)) {

					// Get data by thread
					thread = data.threads.byFrames[timeID][threadID];
					threadRunning = thread.running + thread.cycles;
					threadReady = thread.ready;

					// Sum cycles by time frame
					sumCycles += thread.cycles;
					sumRunning += thread.running;
					sumReady += thread.ready;

					// Count states by time frame
					if (threadRunning > threadReady && threadRunning > thread.init && threadRunning > thread.standby && threadRunning > thread.terminated && threadRunning > thread.transition && threadRunning > thread.unknown && threadRunning > thread.wait) {
						countRunning++;
					} else if (threadReady > threadRunning && threadReady > thread.init && threadReady > thread.standby && threadReady > thread.terminated && threadReady > thread.transition && threadReady > thread.unknown && threadReady > thread.wait) {
						countReady++;
					}


				}
			}

		} else {
			// Failed counters
			sumCycles = NaN;
			sumRunning = NaN;
			sumReady = NaN;
			countRunning = NaN;
			countReady = NaN;
		}

		// Sum cycles globally
		StatSumCycles += sumCycles;
		StatSumRunning += sumRunning;
		StatSumReady += sumReady;

		// Hack
		if (countRunning > profile.availableCores) {
			countReady += countRunning - profile.availableCores;
			countRunning = profile.availableCores;
		}

		// Output
		output.cycles.cycles.push(sumCycles);
		output.cycles.running.push(sumRunning);
		output.cycles.ready.push(sumReady);
		output.cycles.runningThreads.push(countRunning);
		output.cycles.readyThreads.push(countReady);
	};


	// Stats
	if (! output.hasOwnProperty('stats')) output.stats = {};
	output.stats.timeMax = profile.timeIDMax;
	output.stats.duration = profile.timeIDMax + profile.timeStep;
	output.stats.cycles = StatSumCycles;
	output.stats.cyclesRunning = StatSumRunning;
	output.stats.cyclesReady = StatSumReady;
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
	addcycles(output, id);


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
	addcycles(output, id);

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
