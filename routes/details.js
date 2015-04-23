var express = require('express');
var router = express.Router();

/************************************************/
/* Variables									*/
/************************************************/
var profileMap = {
	1: { file: 'matmulijk', program: 'MatmulIJK', timeShift: 635573757342822588, timeStep: 50, availableCores: 8 }
};
var profileRawData = {};

/**
	profileData
	 └	threads
	  	 └	byFrames
			 ├	frame<0>			ID
			 │	 ├	thread<0>		ID
			 │	 │	 ├	cycles		<integer>
			 │	 │	 ├	init		<integer>
			 │	 │	 ├	running		<integer>
			 │	 │	 ├	standby		<integer>
			 │	 │	 ├	wait		<integer>
			 │	 │	 ├	ready		<integer>
			 │	 │	 ├	transition	<integer>
			 │	 │	 ├	terminated	<integer>
			 │	 │	 └	unknown		<integer>
			 │	 ├	...
			 │	 └	thread<N>
			 ├	...
			 └	frame<N>
 */
var profileData = {
	threads: {
		byFrames: {}
	},
};


/************************************************/
/* Functions - Common							*/
/************************************************/
/**
 * Load raw data
 */
function loadData(id) {
	if (! profileRawData[id]) {
		profileRawData[id] = require('../data/' + profileMap[id].file + '.json');
	}
}

/**
 * Filter threads states
 */
function treatThreadStatesByFrame(id) {
	var timeID = 0;
	profileRawData[id].forEach(function(element) {
		if (element.program == profileMap[id].program) {

			// Compute time ID
			timeID = element.time - profileMap[id].timeShift;
			timeID = Math.round(timeID / 10000);

			// Check Frame time
			if (! profileData.threads.byFrames.hasOwnProperty(timeID)) {
				profileData.threads.byFrames[timeID] = {};
			}

			// Check Frame time
			if (! profileData.threads.byFrames[timeID].hasOwnProperty(element.tid)) {
				profileData.threads.byFrames[timeID][element.tid] = {};
			}

			// Stave state
			profileData.threads.byFrames[timeID][element.tid][element.type] = element.value;
		}
	});
}


/************************************************/
/* Functions - Add								*/
/************************************************/
/**
	output
	 ├	frames
	 │	 ├	frame<0>			<integer>	time in ms (10⁻³s) from zero to timeMax by timeStep steps
	 │	 │	 ├	timeRelative	<integer>	time in ms (10⁻³s), identiral to frame<id>
	 │	 │	 ├	sumCycles		<integer>	number of cycles
	 │	 │	 ├	sumRunning		<integer>	number of cycles for running state
	 │	 │	 ├	sumReady		<integer>	number of cycles for ready state
	 │	 │	 ├	countRunning	<integer>	number of threads in running state
	 │	 │	 └	countReady		<integer>	number of threads in ready state
	 │	 │	...
	 │	 └	frame<timeMax>
	 └	stats
	 	 ├	duration			<integer>	how long is the run
	 	 ├	timeShift			<integer>	time before starting measures (i.e. we don't care before this time) /!\ in pico seconds (10⁻¹²s) /!\ need to be divided by 10⁹
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
	// Stats
	if (! output.hasOwnProperty('stats')) output.stats = {};
	output.stats.timeShift = profileMap[id].timeShift;
	output.stats.timeShift = profileMap[id].timeStep;
	output.stats.availableCores = profileMap[id].availableCores;
}

/**
 * Add cycles
 */
function addCycles(output, id) {
	// Init vars
	output.frames = {};

	// Count threads availables
	var thread, threadRunning, threadReady;
	var sumCycles, sumRunning, sumReady, countRunning, countReady;
	var timeMax = 0;
	var superSumCycles = 0;
	var superSumRunning = 0;
	var superSumReady = 0;
	for (var frameID in profileData.threads.byFrames) {
		if (profileData.threads.byFrames.hasOwnProperty(frameID)) {
			// Reinit counters
			sumCycles = 0;
			sumRunning = 0;
			sumReady = 0;
			countRunning = 0;
			countReady = 0;

			// Count among all threads
			for (var threadID in profileData.threads.byFrames[frameID]) {
				if (profileData.threads.byFrames[frameID].hasOwnProperty(threadID)) {
					thread = profileData.threads.byFrames[frameID][threadID];
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
			if (countRunning > profileMap[id].maxThreads) {
				countReady += countRunning - profileMap[id].maxThreads;
				countRunning = profileMap[id].maxThreads;
			}

			// Build response
			output.frames[frameID] = {
				timeRelative: frameID,
				sumCycles : sumCycles,
				sumRunning : sumRunning,
				sumReady: sumReady,
				countRunning : countRunning,
				countReady: countReady
			};
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


/************************************************/
/* Functions - For each category				*/
/************************************************/
/**
 * Task granularity
 */
function jsonTG(id) {
	var output = {};

	treatThreadStatesByFrame(id);

	output.id = id;
	output.cat = 'tg';

	// Common
	addCommon(output, id);

	// for potential parallelism
	addCycles(output, id);


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

	treatThreadStatesByFrame(id);

	output.id = id;
	output.cat = 'lb';

	// Common
	addCommon(output, id);

	// for potential parallelism
	addCycles(output, id);

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
	var output = {};
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
	});
	response.json(output);
});

module.exports = router;
