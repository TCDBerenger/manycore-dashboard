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
	1: { file: 'matmulijk', program: 'MatmulIJK', timeStep: 50, availableCores: 8 },
	2: { file: 'matmulkij', program: 'MatmulKIJ', timeStep: 50, availableCores: 8 },
	3: { file: 'matmulkji', program: 'MatmulKJI', timeStep: 50, availableCores: 8 }
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
	 │	 ├	threads
	 │	 │	 └	byFrames
	 │	 │		 ├	frame<0>			ID
	 │	 │		 │	 ├	thread<0>		ID
	 │	 │		 │	 │	 ├	cycles		<integer>	number of cycles
	 │	 │		 │	 │	 ├	ready		<integer>	duration of ready state
	 │	 │		 │	 │	 ├	running		<integer>	duration of running state
	 │	 │		 │	 │	 ├	standby		<integer>	duration of standby state
	 │	 │		 │	 │	 ├	wait		<integer>	duration of wait state
	 │	 │		 │	 ├	...
	 │	 │		 │	 └	thread<N>
	 │	 │		 ├	...
	 │	 │		 └	frame<?>
	 │	 └	stats
	 │		 └	timeShift				<float>		time before starting measures (i.e. non interesting computation before this time) /!\ in pico seconds (10⁻¹²s) /!\ need to be divided by 10⁹
	 │		 └	switch					<integer>	number of switches for all cores during all run
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
	if (! profileData[id].hasOwnProperty('stats'))				profileData[id].stats = {};
	if (! profileData[id].hasOwnProperty('threads'))			profileData[id].threads = {};
	if (! profileData[id].threads.hasOwnProperty('byFrames'))	profileData[id].threads.byFrames = {};

	// Found time shift
	var timeShift = profileRawData[id][0].time;
	profileMap[id].timeShift = timeShift;				// old
	profileData[id].stats.timeShift = timeShift;		// new

	// Analyse element by element and group them by time
	var timeID = 0;
	var statThreads = {};
	profileMap[id].timeIDMax = 0;
	profileRawData[id].forEach(function(element) {
		if (element.program == profileMap[id].program) {

			// Compute time ID
			timeID = element.time - timeShift;
			timeID = Math.round(timeID / 10000);

			// Auto build structure
			if (! profileData[id].threads.byFrames.hasOwnProperty(timeID)) profileData[id].threads.byFrames[timeID] = {};
			if (! profileData[id].threads.byFrames[timeID].hasOwnProperty(element.tid)) profileData[id].threads.byFrames[timeID][element.tid] = {};

			// Save state
			if (! profileData[id].threads.byFrames[timeID][element.tid].hasOwnProperty(element.type)) profileData[id].threads.byFrames[timeID][element.tid][element.type] = 0;
			profileData[id].threads.byFrames[timeID][element.tid][element.type] += element.value;
			profileMap[id].timeIDMax = Math.max(profileMap[id].timeIDMax, timeID);

			// Count threads
			statThreads[element.tid] = true;

		} else if (element.program == "N/A") {
			profileData[id].stats[element.type] = element.value;
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
	var statSumCycles, sumCycles;

	// Init stats vars
	statSumCycles = 0;
	
	// Count threads availables
	for (var timeID = 0; timeID <= profile.timeIDMax; timeID+= profile.timeStep) {

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
	var data		= treatThreadStatesByFrame(id);
	var profile		= profileMap[id];
	output.time	= [];

	// Loop vars
	var thread;
	var sumRunning, sumStandby, sumWait, sumReady;
	var statSumRunning, statSumStandby, statSumWait, statSumReady;

	// Init stats vars
	statCountThreads = 0;
	statSumRunning = 0; statSumStandby = 0; statSumWait = 0; statSumReady = 0;
	
	// Count threads availables
	for (var timeID = 0; timeID <= profile.timeIDMax; timeID+= profile.timeStep) {

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
		output.time.push({
			t:		timeID,
			run:	sumRunning,
			s:		sumStandby,
			w:		sumWait,
			rea:	sumReady
		});

	};

	// Stats
	output.stats.time = {
		running:	statSumRunning,
		standby:	statSumStandby,
		wait:		statSumWait,
		ready:		statSumReady,
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
	var countRunning, countStandby, countWait, countReady, countUnknown;
	var statCountCycles, statCountRunning, statCountStandby, statCountWait, statCountReady, statCountUnknown;

	// Init stats vars
	statCountThreads = 0;
	statCountRunning = 0; statCountStandby = 0; statCountWait = 0; statCountReady = 0; statCountUnknown = 0;

	
	// Count threads availables
	for (var timeID = 0; timeID <= profile.timeIDMax; timeID+= profile.timeStep) {

		// If the time frame exists
		if (data.threads.byFrames.hasOwnProperty(timeID)) {

			// Reinit counters
			countRunning = 0; countStandby = 0; countWait = 0; countReady = 0; countUnknown = 0;

			// Count among all threads
			for (var threadID in data.threads.byFrames[timeID]) {
				if (data.threads.byFrames[timeID].hasOwnProperty(threadID)) {
					// Get data by thread
					thread = data.threads.byFrames[timeID][threadID];
					threadMaxCycles = Math.max(thread.running, thread.standby, thread.wait, thread.ready);
					countThread++;

					// Count states by time frame
					if (threadMaxCycles == thread.running)
						countRunning++;
					else if (threadMaxCycles == thread.standby)
						countStandby++;
					else if (threadMaxCycles == thread.wait)
						countWait++;
					else if (threadMaxCycles == thread.ready)
						countReady++;
					else
						countUnknown++;
				}
			}

			statCountThreads = Math.max(statCountThreads, countThread);

		} else {
			// Failed counters
			countRunning	= NaN;
			countStandby	= NaN;
			countWait		= NaN;
			countReady		= NaN;
			countUnknown	= NaN;
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
			t:		timeID,
			run:	countRunning,
			s:		countStandby,
			w:		countWait,
			rea:	countReady,
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
		running:	statCountRunning,
		standby:	statCountStandby,
		wait:		statCountWait,
		ready:		statCountReady,
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
