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
 * Add common stats
 */
function addCommon(output, profile) {
	// Data
	var data = profile.data;

	// Stats
	output.stats = {
	    s:	data.stats.switches,
	    m:	data.stats.migrations,
		c:	data.stats.cycles,
		r:	data.stats.running,
		y:	data.stats.ready,
		b:	data.stats.standby,
		w:	data.stats.wait,

		l1:		data.stats.l1miss,
		l2:		data.stats.l2miss,
		l3:		data.stats.l3miss,
		tlb:	data.stats.tlbmiss,
		dzf:	data.stats.dzf,
		hpf:	data.stats.hpf,

		locality: data.locality.stats,
	};
}

/**
 * Add cycles
 */
function addTime(output, profile) {
	// Data
	var data = profile.data;

	// Init vars
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
 * Add data-locality data
 */
function addLocality(output, profile) {
	// Data
	var data = profile.data;

	// Init vars
	output.locality	= [];

	// Data
	var max;
	for (var frameID in data.locality.byFrames) {
		if (data.locality.byFrames.hasOwnProperty(frameID)) {
			max = data.locality.byFrames[frameID].ipc + data.locality.byFrames[frameID].tlb + data.locality.byFrames[frameID].l1 + data.locality.byFrames[frameID].l2 + data.locality.byFrames[frameID].l3 + data.locality.byFrames[frameID].hpf
			output.locality.push({
				t:		data.locality.byFrames[frameID].t,
				ipc:	Math.round(100 * data.locality.byFrames[frameID].ipc / max),
				miss:	100 - Math.round(100 * data.locality.byFrames[frameID].ipc / max)
			});
		}
	}
	output.locality.sort(function(a, b){return a.t - b.t});
	

	// Stats
	output.stats.locality = data.locality.stats;
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
	addCommon(output, profile);

	// for potential parallelism
	addTime(output, profile);

	// Data locality
	addLocality(output, profile);


	// Unload data
	profile.unloadData();

	// Response
	response.json(output);
});

module.exports = router;
