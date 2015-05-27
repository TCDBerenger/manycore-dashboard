var express = require('express');
var router = express.Router();
var fs = require('fs');
var VERSION = 32;

var hardRoman = {
	data: {
		cores: 8
	},
	calib: {
		switches:	35		// number of switches by ms by core
	}
};

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
	1:	{ file: 'matmulijk', 	pid: 6396,	timeStep: 50, hardware: hardRoman },
	2:	{ file: 'matmulkij', 	pid: 3904,	timeStep: 50, hardware: hardRoman },
	3:	{ file: 'matmulkji', 	pid: 1788,	timeStep: 50, hardware: hardRoman },
	4:	{ file: 'particles', 	pid: 10460,	timeStep: 50, hardware: hardRoman },
	5:	{ file: 'accountb',		pid: 11300,	timeStep: 50, hardware: hardRoman },
	6:	{ file: 'computepi',	pid: 6568,	timeStep: 50, hardware: hardRoman },
	7:	{ file: 'mandelbrot',	pid: 7484,	timeStep: 50, hardware: hardRoman },
	8:	{ file: 'nqueens',		pid: 3120,	timeStep: 50, hardware: hardRoman },
	9:	{ file: 'raytracer',	pid: 7500,	timeStep: 50, hardware: hardRoman },
 	10:	{ file: 'accounta',		pid: 11360,	timeStep: 50, hardware: hardRoman },
 	11:	{ file: 'mergesortp',	pid: 9148,	timeStep: 50, hardware: hardRoman },
 	12:	{ file: 'mergesorts',	pid: 7272,	timeStep: 50, hardware: hardRoman },
 	13:	{ file: 'particlep',	pid: 4532,	timeStep: 50, hardware: hardRoman }
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
	 ├	frames
	 │	 ├	0
	 │	 │	 ├	t					[]			array of threads
	 │	 │	 │	 ├	0
	 │	 │	 │	 │	 ├	cycles		<integer>	number of cycles
	 │	 │	 │	 │	 ├	ready		<integer>	duration of ready state
	 │	 │	 │	 │	 ├	running		<integer>	duration of running state
	 │	 │	 │	 │	 ├	standby		<integer>	duration of standby state
	 │	 │	 │	 │	 ├	wait		<integer>	duration of wait state
	 │	 │	 │	 ├	...
	 │	 │	 │	 └	<?>
	 │	 │	 ├	c					[]			array of cores
	 │	 │	 │	 ├	0
	 │	 │	 │	 │	 ├	switches	<integer>	number of switches
	 │	 │	 │	 │	 ├	migrations	<integer>	number of migrations
	 │	 │	 │	 │	 ├	cycles		<integer>	number of cycles
	 │	 │	 │	 │	 ├	ready		<integer>	duration of ready state
	 │	 │	 │	 │	 ├	running		<integer>	duration of running state
	 │	 │	 │	 │	 ├	standby		<integer>	duration of standby state
	 │	 │	 │	 │	 ├	wait		<integer>	duration of wait state
	 │	 │	 │	 ├	...
	 │	 │	 │	 └	<?>
	 │	 │	 ├	switches 			<integer>	number of switches
	 │	 │	 ├	migrations 			<integer>	number of migrations
	 │	 │	 ├	starts 				<integer>	number of thread starts
	 │	 │	 ├	ends 				<integer>	number of thread ends
	 │	 │	 ├	cycles				<integer>	number of cycles
	 │	 │	 ├	ready				<integer>	duration of ready state
	 │	 │	 ├	running				<integer>	duration of running state
	 │	 │	 ├	standby				<integer>	duration of standby state
	 │	 │	 └	wait				<integer>	duration of wait state
	 │	 ├	...
	 │	 └	<?>
	 ├	lifecycles					[]			array of thread lifecycle events
	 │	 ├	<thread0>
	 │	 │	 ├	s					<integer>	start time (real, not corresponding to a time frame), could be null
	 │	 │	 ├	m					[]			array of migration /!\ unique /!\ (real) times (only one migration appears for 1 ms, so some migrations are missing)
	 │	 │	 └	e					<char>		start time (real, not corresponding to a time frame), could be null
	 │	 ├	...
	 │	 └	<threadN>
	 ├	lifetimes					[]			array of thread lifecycle events
	 │	 ├	0
	 │	 │	 ├	t					<integer>	time (real, not corresponding to a time frame)
	 │	 │	 ├	h					ID			thread ID
	 │	 │	 └	e					<char>		's' for start, 'e' for end
	 │	 ├	...
	 │	 └	<?>
	 ├	migrations					[]			array of migration events, in the increasing time order
	 │	 ├	0
	 │	 │	 ├	t					<integer>	time (real, not corresponding to a time frame)
	 │	 │	 ├	h					ID			thread ID
	 │	 │	 └	c					ID			new core ID
	 │	 ├	...
	 │	 └	<?>
	 ├	switches					[]			array of switches events, in the increasing time order
	 │	 ├	0
	 │	 │	 ├	t					<integer>	time (real, not corresponding to a time frame)
	 │	 │	 ├	h					ID			thread ID
	 │	 ├	...
	 │	 └	<?>
	 ├	timelist
	 │	 ├	migrations				[]			array of migration event time (real, not corresponding to a time frame), in the increasing time order
	 │	 └	switches				[]			array of switches event time (real, not corresponding to a time frame), in the increasing time order
	 ├	threads
	 │	 └	byFrames
	 │		 ├	frame<0>			ID
	 │		 │	 ├	thread<0>		ID
	 │		 │	 │	 ├	cycles		<integer>	number of cycles
	 │		 │	 │	 ├	ready		<integer>	duration of ready state
	 │		 │	 │	 ├	running		<integer>	duration of running state
	 │		 │	 │	 ├	standby		<integer>	duration of standby state
	 │		 │	 │	 └	wait		<integer>	duration of wait state
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
	var filenameRaw3 = 'data/' + profileMap[id].file + '.dl.json';
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
		var raw3 = JSON.parse(fs.readFileSync(filenameRaw3, 'utf8'));
		console.log("[" + id + "] " + profileMap[id].file + " raw data loaded");

		// Compute
		profileData[id] = computeData(id, raw1, raw2, raw3, profileMap[id]);
		console.log("[" + id + "] " + profileMap[id].file + " raw data computed");

		// Save to cache
		fs.writeFileSync(filenameCache, JSON.stringify(profileData[id]));
		console.log("[" + id + "] " + profileMap[id].file + " raw data cached");
	}
}

/**
 * Compute data
 */
function computeData(id, raw1, raw2, raw3, profile) {

	// Create structure
	var data = {
		info: {
			version:		VERSION,
			cores:			profile.hardware.data.cores,
			timeShift:		raw1[0].time,
			timeStep:		profile.timeStep,
			timeMin:		0,
			timeMax:		0,
			threadCount:	NaN
		},
		stats: {
			switches:		0,
			migrations:		0,
			starts:			0,
			ends:			0
		},
		frames: {},
		switches: [],
		migrations: [],
		lifetimes: [],
		lifecycle: {},
		locality: {
			byFrames: {},
			stats: {
				ipc:		0,
				tlb:		0,
				l1:			0,
				l2:			0,
				l3:			0,
				hpf:		0
			}
		},
		timelist: {
			switches: [],
			migrations: []
		},
		threads: {
			byFrames: {}
		}
	};

	// Grobal vars
	var timeID, timeEvent;

	/**
	 *
	 *	RAW 1:
	 *		states
	 *
	 */

	// Analyse element by element and group them by time
	var statThreads = {};
	raw1.forEach(function(element) {
		// Compute time ID
		timeID = element.time - data.info.timeShift;
		timeID = Math.round(timeID / 10000);

		// Info
		data.info.timeMax = Math.max(data.info.timeMax, timeID);

		// Thread treatment
		if (element.pid == profile.pid) {
			// Auto build structure
			if (! data.threads.byFrames.hasOwnProperty(timeID)) data.threads.byFrames[timeID] = {};
			if (! data.threads.byFrames[timeID].hasOwnProperty(element.tid)) data.threads.byFrames[timeID][element.tid] = {};
			if (! data.threads.byFrames[timeID][element.tid].hasOwnProperty(element.type)) data.threads.byFrames[timeID][element.tid][element.type] = 0;

			// Save state
			data.threads.byFrames[timeID][element.tid][element.type] += element.value;

			// Count threads
			statThreads[element.tid] = true;
		}

		// Frame treatment
		if (element.pid == profile.pid) {
			// Auto build structure
			if (! data.frames.hasOwnProperty(timeID)) data.frames[timeID] = { t:{}, c:{} };
			if (! data.frames[timeID].hasOwnProperty(element.type)) data.frames[timeID][element.type] = 0;

			// Sum by frame
			data.frames[timeID][element.type] += element.value;

			// Auto build structure
			if (! data.stats.hasOwnProperty(element.type)) data.stats[element.type] = 0;

			// Sum by stat (with auto build structure)
			data.stats[element.type] += element.value;

			// By thread
			if (element.tid >= 0) {
				// Auto build structure
				if (! data.frames[timeID].t.hasOwnProperty(element.tid)) data.frames[timeID].t[element.tid] = {};
				if (! data.frames[timeID].t[element.tid].hasOwnProperty(element.type)) data.frames[timeID].t[element.tid][element.type] = 0;

				// Save state
				data.frames[timeID].t[element.tid][element.type] += element.value;
			}

			// By core
			if (element.cid >= 0) {
				// Auto build structure
				if (! data.frames[timeID].c.hasOwnProperty(element.cid)) data.frames[timeID].c[element.cid] = {};
				if (! data.frames[timeID].c[element.cid].hasOwnProperty(element.type)) data.frames[timeID].c[element.cid][element.type] = 0;

				// Save state
				data.frames[timeID].c[element.cid][element.type] += element.value;
			}
		}
	});

	// Count threads
	var countThreads = 0;
	for (var t in statThreads) { if (statThreads.hasOwnProperty(t) && t) countThreads++; };
	data.info.threadCount = countThreads;




	/**
	 *
	 *	RAW 2:
	 *		switches
	 *
	 */
	// Vars
	var coreThreads = {};
	var property;

	// Loop
	raw2.forEach(function(element) {
		// Compute time ID
		timeEvent = element.time - data.info.timeShift;
		timeEvent = Math.round(timeEvent / 10000);
		timeID = Math.floor(timeEvent / data.info.timeStep) * data.info.timeStep;

		// Switch
		if (element.type == "sw" && element.pid == profile.pid) {
			// Auto build structure
			if (! coreThreads.hasOwnProperty(element.tid)) coreThreads[element.tid] = element.cid;

			// Switch
			data.stats.switches++;

			// Add a switch
			if (! data.frames.hasOwnProperty(timeID)) data.frames[timeID] = { switches: 1 };
			else if (! data.frames[timeID].hasOwnProperty("switches")) data.frames[timeID].switches = 1;
			else data.frames[timeID].switches++;

			// Save switch
			data.switches.push({
				t: timeEvent,
				h: element.tid
			});

			// Save switch time
			data.timelist.switches.push(timeEvent);

			// Switch for migration
			if (coreThreads[element.tid] != element.cid) {
				// Migration
				data.stats.migrations++;

				// Add a migration
				if (! data.frames.hasOwnProperty(timeID)) data.frames[timeID] = { migrations: 1 };
				else if (! data.frames[timeID].hasOwnProperty("migrations")) data.frames[timeID].migrations = 1;
				else data.frames[timeID].migrations++;

				// Save migration
				data.migrations.push({
					t: timeEvent,
					h: element.tid,
					c: element.cid
				});

				// Save migration time
				data.timelist.migrations.push(timeEvent);

				// Save lifecycle
				if (! data.lifecycle.hasOwnProperty(element.tid)) data.lifecycle[element.tid] = { s: null, e: null, m: []};
				if (data.lifecycle[element.tid].m[data.lifecycle[element.tid].m.length - 1] != timeEvent) {
					data.lifecycle[element.tid].m.push(timeEvent);
					data.lifecycle[element.tid].m.sort(function(a, b){return a - b});
				}

				// Save new attached core
				coreThreads[element.tid] = element.cid;
			}

		}

		// Lifecycle
		else if ((element.type == "start" || element.type == "end") && element.pid == profile.pid) {

			// Which case ?
			property = element.type + "s";

			// Start
			data.stats[property]++;

			// Add a start with auto build structure
			if (! data.frames.hasOwnProperty(timeID)) data.frames[timeID] = {};
			if (! data.frames[timeID].hasOwnProperty(property)) data.frames[timeID][property] = 1;
			else data.frames[timeID][property]++;

			// Save start
			data.lifetimes.push({
				t: timeEvent,
				h: element.tid,
				e: element.type[0]
			});

			// Save lifecycle
			if (! data.lifecycle.hasOwnProperty(element.tid)) data.lifecycle[element.tid] = { s: null, e: null, m: []};
			data.lifecycle[element.tid][element.type[0]] = timeEvent;
		}
		
	});

	// Sorts arrays
	data.switches.sort(function(a, b){return a.t - b.t});
	data.migrations.sort(function(a, b){return a.t - b.t});
	data.timelist.switches.sort(function(a, b){return a - b});
	data.timelist.migrations.sort(function(a, b){return a - b});



	/**
	 *
	 *	RAW 3:
	 *		dala locality
	 *
	 */
	// Var
	var property;
	var stat_ipc = 0;

	// Loop
	raw3.threads.forEach(function(thread) {
		thread.measures.forEach(function(measure) {
			measure.data.forEach(function (value, value_index) {
				timeID = value_index * profile.timeStep;
				property = measure.name.toLowerCase();

				// By frame
				if (! data.locality.byFrames.hasOwnProperty(timeID))			data.locality.byFrames[timeID] = { t: timeID };
				if (! data.locality.byFrames[timeID].hasOwnProperty(property))	data.locality.byFrames[timeID][property] = 0;
				data.locality.byFrames[timeID][property] += +value || 0;

				// Stats
				data.locality.stats[property] += +value || 0;
			});
		});
	});

	// Stats
	data.stats.cycles = +raw3.info.cycles;
	data.stats.l1miss = +raw3.info.l1miss;
	data.stats.l2miss = +raw3.info.l2miss;
	data.stats.l3miss = +raw3.info.l3miss;
	data.stats.tlbmiss = +raw3.info.tlbmiss;
	data.stats.dzf = +raw3.info.dzf;
	data.stats.hpf = +raw3.info.hpf;




	// computation done
	return data;
}

/**
 * Unload raw data
 */
function unloadData(id) {
	delete profileData[id];
}


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
	var data = profileData[id];

	// Infos
	output.info = {
		cores:			data.info.cores,
		timeShift:		data.info.timeShift,
		timeStep:		data.info.timeStep,
		timeMin:		data.info.timeMin,
		timeMax:		data.info.timeMax,
		duration:		data.info.timeMax + data.info.timeStep,
		threadCount:	data.info.threadCount
	};

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
		hpf:	data.stats.hpf
	};
}

/**
 * Add dash stats
 */
function addDash(output, id) {
	// Init vars
	var data = profileData[id];

	// locality
	output.stats.locality = data.locality.stats;
}

/**
 * Add common stats for details
 */
function addDetails(output, id) {
	// Init vars
	var data = profileData[id];

	// calib
	output.calib = {
		switches:	profileMap[id].hardware.calib.switches
	},

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
	var data		= profileData[id];
	output.switches	= {
		list: data.timelist.switches,
		frames: []
	};

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
	var data			= profileData[id];
	output.migrations	= {
		list: data.timelist.migrations
	};

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
	var data			= profileData[id];
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
	var data		= profileData[id];
	//var profile		= profileMap[id];
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
	var data		= profileData[id];
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



/************************************************/
/* Functions - For each category				*/
/************************************************/
/**
 * Test
 */
function jsonTest(id) {
	var output = {};

	output.id = id;
	output.cat = 'dash';

	// Common
	addCommon(output, id);
	addDetails(output, id);

	// Cache
	output.cache = profileData[id];

	// Computation
	addCycles(output, id);
	addLifetimes(output, id);
	addMigrations(output, id);
	addStates(output, id);
	addSwitches(output, id);
	addTime(output, id);

	return output;
}

/**
 * Dashboard
 */
function jsonDash(id) {
	var output = {};

	output.id = id;
	output.cat = 'dash';

	// Common
	addCommon(output, id);
	addDash(output, id);

	// for potential parallelism
	addTime(output, id);

	// Data locality
	addLocality(output, id, true);


	return output;
}

/**
 * Task granularity
 */
function jsonTG(id) {
	var output = {};

	output.id = id;
	output.cat = 'tg';

	// Common
	addCommon(output, id);
	addDetails(output, id);

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
function jsonSY(id) {
	var output = {};

	output.id = id;
	output.cat = 'sy';
	output.log = "TODO";

	// Common
	addCommon(output, id);
	addDetails(output, id);

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
	addDetails(output, id);

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
	addDetails(output, id);

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
function jsonDL(id) {
	var output = {};

	output.id = id;
	output.cat = 'dl';
	output.log = "TODO";

	// Common
	addCommon(output, id);
	addDetails(output, id);

	// Data
	addLocality(output, id, false);

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
	addDetails(output, id);

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
	addDetails(output, id);

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
	if (cat != 'tg' && cat != 'sy' && cat != 'ds' && cat != 'lb' && cat != 'dl' && cat != 'rs' && cat != 'io' && cat != 'dash' && cat != 'test') {
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
			case 'test':output[id] = jsonTest(id); break;
			case 'dash':output[id] = jsonDash(id); break;
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
		unloadData(id);
	});
	response.json(output);
});

module.exports = router;
