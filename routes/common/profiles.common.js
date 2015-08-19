/************************************************/
/* JS libraries									*/
/************************************************/
var fs = require('fs');


/************************************************/
/* Constants									*/
/************************************************/
var VERSION = 58;

/************************************************/
/* Variables - hardwares						*/
/************************************************/
var hardRoman = {
	info: {
		label:	'Intel i7-950 with 12 GB RAM',
		cpu: {
			label:	'Intel® Core™ i7-950',
			link:	'http://ark.intel.com/products/37150/Intel-Core-i7-950-Processor-8M-Cache-3_06-GHz-4_80-GTs-Intel-QPI',
			model:	'i7-950',
			type:	'64 bits',
			cores:	'4 cores / 8 threads',
			clock:	'3.06 GHz',
			l1:		'32 KB',
			l2:		'256 KB',
			l3:		'8 MB'
		},
		ram:	'12 279 MB'
	},
	data: {
		cores:		4,			// #cores
		threads: 	8,			// #theads (hyperthreading)
		type:		64,			// 32 or 64 bits
		clock:		3.06,		// in GHz
		l1:			32,			// in KB
		l2:			256,		// in KB
		l3:			8192,		// in KB
		ram:		12573696	// in KB
	},
	calibration: {
		s:	1,				// number of switches by ms by core
		m: 0.3,				// number of migrations by ms by core
		ls: 0.01,			// number of success lock acquisition by ms by core
		lf: 0.003			// number of failure lock acquisition by ms by core
	}
};


/************************************************/
/* Variables - profiles							*/
/************************************************/
var profileMap = {
	all: [
		{ id: 1,	label: 'Matmul IJK',	desc: 'Matrix multiplication IJK', 	hardware: hardRoman, file: 'matmulijk', 	pid: 6396,	timeStep: 50, v: 3 },
		{ id: 2,	label: 'Matmul KIJ',	desc: 'Matrix multiplication KIJ', 	hardware: hardRoman, file: 'matmulkij', 	pid: 3904,	timeStep: 50, v: 3 },
		{ id: 3,	label: 'Matmul KJI',	desc: 'Matrix multiplication KJI', 	hardware: hardRoman, file: 'matmulkji', 	pid: 1788,	timeStep: 50, v: 3 },
		{ id: 4,	label: 'Particle P',	desc: 'Particle system (parallel)',	hardware: hardRoman, file: 'particlep',		pid: 4532,	timeStep: 50, v: 3 },
		{ id: 5,	label: 'Particle S',	desc: 'Particle system (serial)', 	hardware: hardRoman, file: 'particles', 	pid: 10460,	timeStep: 50, v: 3 },
		{ id: 6,	label: 'Account A',		desc: '',							hardware: hardRoman, file: 'accounta',		pid: 11360,	timeStep: 50, v: 3 },
		{ id: 7,	label: 'Account B',		desc: '',							hardware: hardRoman, file: 'accountb',		pid: 11300,	timeStep: 50, v: 3 },
		{ id: 8,	label: 'Merge sort P',	desc: 'Merge and sort (parallel)',	hardware: hardRoman, file: 'mergesortp',	pid: 9148,	timeStep: 50, v: 3 },
		{ id: 9,	label: 'Merge sort S',	desc: 'Merge and sort (serial)',	hardware: hardRoman, file: 'mergesorts',	pid: 7272,	timeStep: 50, v: 3 },
		{ id: 10,	label: 'Phase A',		desc: '',							hardware: hardRoman, file: 'phasea',		pid: 8580,	timeStep: 50, v: 3 },
		{ id: 11,	label: 'Phase B',		desc: '',							hardware: hardRoman, file: 'phaseb',		pid: 3324,	timeStep: 50, v: 3 },
		{ id: 12,	label: 'Compute Pi',	desc: '',							hardware: hardRoman, file: 'computepi',		pid: 6568,	timeStep: 50, v: 3 },
		{ id: 13,	label: 'Mandelbrot',	desc: '',							hardware: hardRoman, file: 'mandelbrot',	pid: 7484,	timeStep: 50, v: 3 },
		{ id: 14,	label: 'N Queens',		desc: '',							hardware: hardRoman, file: 'nqueens',		pid: 3120,	timeStep: 50, v: 3 },
		{ id: 15,	label: 'Ray Tracer',	desc: '',							hardware: hardRoman, file: 'raytracer',		pid: 7500,	timeStep: 50, v: 3 },
		{ id: 16,	label: 'Bad cache A',	desc: '',							hardware: hardRoman, file: 'badcachea',		pid: 4536,	timeStep: 50, v: 3 },
		{ id: 17,	label: 'Spike',			desc: '',							hardware: hardRoman, file: 'spike',			pid: 8500,	timeStep: 50, v: 3, disabled: true },
		{ id: 18,	label: 'NodeJS',		desc: 'Sample NodeJS server',		hardware: hardRoman, file: 'nodejs',		pid: 8792,	timeStep: 50, v: 3, disabled: true },
		{ id: 19,	label: 'Word',			desc: 'Microsoft Word sample',		hardware: hardRoman, file: 'word',			pid: 2852,	timeStep: 50, v: 3 },
		{ id: 20,	label: 'Excel',			desc: 'Microsoft Excel sample',		hardware: hardRoman, file: 'excel',			pid: 5176,	timeStep: 50, v: 3, disabled: true },

		{ id: 21,	label: 'Dining ph. 45',	desc: 'Dining philosophers problem 45',		hardware: hardRoman, file: 'philosophers45',	pid: 4168,	timeStep: 50, v: 4 },

		{ id: 31,	label: 'P/C 1/1',		desc: '1 producer and 1 consumer',			hardware: hardRoman, file: 'pc1x1',		pid: 67380,	timeStep: 50, v: 4 },
		{ id: 32,	label: 'P/C 1/10',		desc: '1 producer and 10 consumers',		hardware: hardRoman, file: 'pc1x10',	pid: 73540,	timeStep: 50, v: 4 },
		{ id: 33,	label: 'P/C 1/100',		desc: '1 producer and 100 consumers',		hardware: hardRoman, file: 'pc1x100',	pid: 76824,	timeStep: 50, v: 4 },
		{ id: 34,	label: 'P/C 10/1',		desc: '10 producers and 1 consumer',		hardware: hardRoman, file: 'pc10x1',	pid: 79828,	timeStep: 50, v: 4 },
		{ id: 35,	label: 'P/C 10/10',		desc: '10 producers and 10 consumers',		hardware: hardRoman, file: 'pc10x10',	pid: 81516,	timeStep: 50, v: 4 },
		{ id: 36,	label: 'P/C 10/100',	desc: '10 producers and 100 consumers',		hardware: hardRoman, file: 'pc10x100',	pid: 82952,	timeStep: 50, v: 4 },
		{ id: 37,	label: 'P/C 100/1',		desc: '100 producers and 1 consumer',		hardware: hardRoman, file: 'pc100x1',	pid: 84696,	timeStep: 50, v: 4 },
		{ id: 38,	label: 'P/C 100/10',	desc: '100 producers and 10 consumers',		hardware: hardRoman, file: 'pc100x10',	pid: 90436,	timeStep: 50, v: 4 },
		{ id: 39,	label: 'P/C 100/100',	desc: '100 producers and 100 consumers',	hardware: hardRoman, file: 'pc100x100',	pid: 93496,	timeStep: 50, v: 4 }
	]
};

// Indexing
profileMap.all.forEach(function (profile) { profileMap[profile.id] = profile; });


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
	 ├	events
	 │	 ├	threads								list of threads (object with key)
	 │	 │	 ├	0
	 │	 │	 │	 ├	m				[]			array of migration event time (real, not corresponding to a time frame), in the increasing time order
	 │	 │	 │	 ├	ls				[]			array of lock success aquisition event time (real, not corresponding to a time frame), in the increasing time order
	 │	 │	 │	 └	lf				[]			array of lock failure aquisition event time (real, not corresponding to a time frame), in the increasing time order
	 │	 │	 ├	...
	 │	 │	 └	<?>
	 │	 ├	m						[]			array of migration event time (real, not corresponding to a time frame), in the increasing time order
	 │	 └	s						[]			array of switches event time (real, not corresponding to a time frame), in the increasing time order
	 ├	periods
	 │	 └	threads								list of threads (object with key)
	 │	 	 ├	0
	 │	 	 │	 ├	m				[]			array of migration periods, aka core attachment (real, not corresponding to a time frame), in the increasing time order
	 │	 	 │	 └	lw				[]			array of lock waiting periods (real, not corresponding to a time frame), in the increasing time order
	 │	 	 ├	...
	 │	 	 └	<?>
	 │
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
		 └	switch					<integer>	number of switches for all cores during all run
**/
var profileData = {};

/**
 * Load raw data
 */
function getVersion(profile) {
	// Vars
	var v = NaN;

	try {
		// Get version
		v = JSON.parse(fs.readFileSync('data/' + profile.file + '.cache.json', 'utf8')).info.version;

	} catch (e) { }
	
	console.log("[" + profile.id + "] cache revision: " + v);
	return v;
}

/**
 * Load raw data
 */
function loadData(profile, notCreateCache) {
	// Check if data are already loaded
	if (profile.hasOwnProperty('data')) {
		return;
	}

	// Vars
	var filenameCache = 'data/' + profile.file + '.cache.json';

	// Load data from cache
	try {
		// Load cache
		profile.data = JSON.parse(fs.readFileSync(filenameCache, 'utf8'));
		console.log("[" + profile.id + "] " + profile.file + " cache opened");

		// Check old version
		if (profile.data.info.version != VERSION) {

			// Delete file
			fs.unlinkSync(filenameCache);
			console.log("[" + profile.id + "] " + profile.file + " cache invalidated");

			// Start over
			delete profile.data;
		}

	} catch (e) { }

	// Load from raw data
	if (! profile.hasOwnProperty('data') && ! notCreateCache) {
		profile.data = reloadCache(profile);
		profileData[profile.id] = profile.data;
	}
}

/**
 * Reload raw data
 */
function reloadCache(profile) {
	// Vars
	var filenameRaw1 = 'data/' + profile.file + '.states.json';
	var filenameRaw2 = 'data/' + profile.file + '.switches.json';
	var filenameRaw3 = 'data/' + profile.file + '.dl.json';
	var filenameRaw4 = 'data/' + profile.file + '.locks.json';
	var filenameCache = 'data/' + profile.file + '.cache.json';

	// Load raw
	var raw1 = JSON.parse(fs.readFileSync(filenameRaw1, 'utf8'));
	var raw2 = JSON.parse(fs.readFileSync(filenameRaw2, 'utf8'));
	var raw3 = JSON.parse(fs.readFileSync(filenameRaw3, 'utf8'));
	var raw4 = (profile.v >= 4) ? JSON.parse(fs.readFileSync(filenameRaw4, 'utf8')) : null;
	console.log("[" + profile.id + "] " + profile.file + " raw data loaded");

	// Compute
	var data = computeData(profile, raw1, raw2, raw3, raw4);
	console.log("[" + profile.id + "] " + profile.file + " raw data computed");

	// Save to cache
	fs.writeFileSync(filenameCache, JSON.stringify(data));
	console.log("[" + profile.id + "] " + profile.file + " raw data cached");
	
	return data;
}

/**
 * Compute data
 */
function computeData(profile, raw1, raw2, raw3, raw4) {

	// Create structure
	var data = {
		info: {
			version:		VERSION,
			cores:			profile.hardware.data.cores,
			threads:		profile.hardware.data.threads,
			timeStep:		profile.timeStep,
			timeMin:		0,
			timeMax:		0
		},
		stats: {
			idle:			0,
			switches:		0,
			migrations:		0,
			starts:			0,
			ends:			0,
			lock_success:	0,
			lock_failure:	0,
			lock_wait:		0,
			threads:		0
		},
		frames: {},
		events: {
			threads:		{},
			s:				[],
			m:				[]
		},
		periods: {
			cores:			{},
			threads:		{}
		},
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
		lock_success:		[],
		lock_failure:		[],
		threads: {
			byFrames:		{}
		}
	};

	// Grobal vars
	var timeID, timeEvent;

	// Global functions
	function checkFrame(id) {
		if (! data.frames.hasOwnProperty(id)) {
			data.frames[id] = {
				t:				{},	// by thread
				c:				{},	// by code

				cycles: 		0,	// in cycles
				
				idle:			0,	// in ms, idle process
				ready: 			0,	// in ms
				running: 		0,	// in ms
				standby: 		0,	// in ms
				wait: 			0,	// in ms
				lock_wait:		0,	// in ms, how long threads waiting for a lock acquisition

				starts:			0,	// how many threads starting
				ends:			0,	// how many threads ending
				switches:		0,	// how many threads switching
				migrations:		0,	// how many threads migrating
				lock_success:	0,	// how many threads successing lock acquisition
				lock_failure:	0,	// how many threads failing lock acquisition
			}
		}
	}

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
		timeEvent = Math.round(element.dtime / 10000);

		// Info
		data.info.timeMax = Math.max(data.info.timeMax, timeEvent);

		if (element.pid == profile.pid) {
			//
			// Thread treatment
			//

			// Auto build structure
			if (! data.threads.byFrames.hasOwnProperty(timeEvent)) data.threads.byFrames[timeEvent] = {};
			if (! data.threads.byFrames[timeEvent].hasOwnProperty(element.tid)) data.threads.byFrames[timeEvent][element.tid] = {};
			if (! data.threads.byFrames[timeEvent][element.tid].hasOwnProperty(element.type)) data.threads.byFrames[timeEvent][element.tid][element.type] = 0;

			// Save state
			data.threads.byFrames[timeEvent][element.tid][element.type] += element.value;

			// Count threads
			statThreads[element.tid] = true;


			//
			// Frame treatment
			//

			// Check time frame existance
			checkFrame(timeEvent);

			// Sum by frame
			data.frames[timeEvent][element.type] += element.value;

			// Auto build structure
			if (! data.stats.hasOwnProperty(element.type)) data.stats[element.type] = 0;

			// Sum by stat (with auto build structure)
			data.stats[element.type] += element.value;

			// By thread
			if (element.tid >= 0) {
				// Auto build structure
				if (! data.frames[timeEvent].t.hasOwnProperty(element.tid)) data.frames[timeEvent].t[element.tid] = {};
				if (! data.frames[timeEvent].t[element.tid].hasOwnProperty(element.type)) data.frames[timeEvent].t[element.tid][element.type] = 0;

				// Save state
				data.frames[timeEvent].t[element.tid][element.type] += element.value;
			}

			// By core
			if (element.cid >= 0) {
				// Auto build structure
				if (! data.frames[timeEvent].c.hasOwnProperty(element.cid)) data.frames[timeEvent].c[element.cid] = {};
				if (! data.frames[timeEvent].c[element.cid].hasOwnProperty(element.type)) data.frames[timeEvent].c[element.cid][element.type] = 0;

				// Save state
				data.frames[timeEvent].c[element.cid][element.type] += element.value;
			}
		}
		
		// IDLE
		else if (element.pid == 1 && element.type == 'running') {

			// Check time frame existance
			checkFrame(timeEvent);

			// Sum by frame
			data.frames[timeEvent].idle += element.value;

			// Save by core (no sum) by frame
			if (! data.frames[timeEvent].c.hasOwnProperty(element.cid)) data.frames[timeEvent].c[element.cid] = { idle: element.value };
			else data.frames[timeEvent].c[element.cid].idle = element.value;

			// Sum by stat (with auto build structure)
			data.stats.idle += element.value;
			
		}
	});

	// Count threads
	for (var t in statThreads) {
		if (statThreads.hasOwnProperty(t) && t)
			data.stats.threads++;
	};




	/**
	 *
	 *	RAW 2:
	 *		switches
	 *
	 */
	// Vars
	var coreThreads = {};
	var migrationMap = {};
	var property;

	// Loop
	raw2.forEach(function(element) {
		// Compute time ID
		timeEvent = Math.round(element.dtime / 10000);
		timeID = Math.floor(timeEvent / data.info.timeStep) * data.info.timeStep;

		// Check time frame existance
		checkFrame(timeID);

		// Switch
		if (element.type == "sw" && element.pid == profile.pid) {
			// Auto build structure
			if (! coreThreads.hasOwnProperty(element.tid)) coreThreads[element.tid] = element.cid;

			// Switch
			data.stats.switches++;

			// Add a switch
			data.frames[timeID].switches++;

			// Save switch
			data.switches.push({
				t: timeEvent,
				h: element.tid
			});

			// Save switch time
			data.events.s.push(timeEvent);

			// Switch for migration
			if (coreThreads[element.tid] != element.cid) {
				// Migration
				data.stats.migrations++;

				// Add a migration
				data.frames[timeID].migrations++;

				// Save migration
				data.migrations.push({
					t: timeEvent,
					h: element.tid,
					c: element.cid
				});

				// Save migration time
				data.events.m.push(timeEvent);
			
				// Check event list existance
				if (! data.events.threads.hasOwnProperty(element.tid))
					data.events.threads[element.tid] = { m: [] };
				else if (! data.events.threads[element.tid].hasOwnProperty('m'))
					data.events.threads[element.tid].m = [];
				
				// Save the migration
				data.events.threads[element.tid].m.push(timeEvent);
				
				// Save the migration core attachement
				if (! migrationMap.hasOwnProperty(element.tid)) migrationMap[element.tid] = {};
				migrationMap[element.tid][timeEvent] = element.cid;

				// TO DELETE - Save lifecycle
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
			data.frames[timeID][property]++;

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
	data.events.s.sort(function(a, b){return a - b});
	data.events.m.sort(function(a, b){return a - b});
	
	// Build migration periods
	Object.keys(migrationMap).forEach(function(h) {
		// Check event list existance
		if (! data.periods.threads.hasOwnProperty(h))
			data.periods.threads[h] = { m: [] };
		else if (! data.periods.threads[h].hasOwnProperty('m'))
			data.periods.threads[h].m = [];
		
		Object.keys(migrationMap[h]).forEach(function(t) {
			if (data.periods.threads[h].m.length == 0) {
				data.periods.threads[h].m.push({ s: +t, c: migrationMap[h][t], e: null });
			} else if (data.periods.threads[h].m[data.periods.threads[h].m.length - 1].c != migrationMap[h][t]) {
				data.periods.threads[h].m[data.periods.threads[h].m.length - 1].e = +t;
				data.periods.threads[h].m.push({ s: +t, c: migrationMap[h][t], e: null });
			}
		});
	});


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



	/**
	 *
	 *	RAW 4:
	 *		locks
	 *
	 */
	// Vars
	var lock_map = {};	// current owner of a lock
	var wait_map = {};	// when a thread starts waiting a lock (key: 'thread-lock')
	var duration, currentEnd, currentID;

	// Loop
	if (raw4 != null) raw4.forEach(function(element) {
		// Compute time ID
		timeEvent = Math.round(element.dtime / 10000);
		timeID = Math.floor(timeEvent / data.info.timeStep) * data.info.timeStep;

		// Check time frame existance
		checkFrame(timeID);

		if (element.type == 'success') {
			// Compute duration
			//	only if a failure appends before a success
			//	convert (and round) from nanodeconds to milliseconds
			duration = isFinite(wait_map[element.tid]) ? (element.dtime - wait_map[element.tid]) / 10000 : 0;

			// Save the success
			data.lock_success.push({
				t: timeEvent,
				h: element.tid,												// which thread success
				hl: (duration > 0) ? lock_map[element.value] : undefined,	// which thread owned the lock
				l: element.value,											// which lock
				d: duration													// how long does it take to get the lock
			});
			
			// Check event list existance
			if (! data.events.threads.hasOwnProperty(element.tid))
				data.events.threads[element.tid] = { ls: [] };
			else if (! data.events.threads[element.tid].hasOwnProperty('ls'))
				data.events.threads[element.tid].ls = [];
			
			// Save the success
			data.events.threads[element.tid].ls.push(timeEvent);

			// Stats
			data.stats.lock_success++;
			data.stats.lock_wait += duration;

			// Stats by frame
			data.frames[timeID].lock_success++;


			// Save the failure duration
			if (duration > 0) {
				if (wait_map[element.tid] == null || ! wait_map.hasOwnProperty(element.tid)) console.log('incoherent: duration positive but no starting time', duration, wait_map[element.tid]);

				// Check event list existance
				if (! data.periods.threads.hasOwnProperty(element.tid))
					data.periods.threads[element.tid] = { lw: [] };
				else if (! data.periods.threads[element.tid].hasOwnProperty('lw'))
					data.periods.threads[element.tid].lw = [];
				
				// Save the success
				data.periods.threads[element.tid].lw.push({ s: Math.round(wait_map[element.tid] / 10000), e: timeEvent});

				// Save the failure duration by frame
				currentID = timeID;
				currentEnd = element.dtime;
				while (currentEnd >= wait_map[element.tid]) {
					// Stats
					data.frames[currentID].lock_wait += Math.min(currentEnd - (currentID * 10000), currentEnd - wait_map[element.tid]) / 10000;

					// Next loop
					currentEnd = currentID * 10000;
					currentID -= data.info.timeStep;
				}
			}

			// Reset
			wait_map[element.tid] = undefined;			// Thread doesn't wait the lock anymore
			lock_map[element.value] = element.tid;		// which thread has the lock

		} else { // if (element.type == 'failure')

			// Save the failure
			data.lock_failure.push({
				t: timeEvent,
				l: element.value,				// which occupied lock
				h: element.tid,					// which thread fails
				hl: lock_map[element.value]		// which thread owns the lock
			});
			
			// Check event list existance
			if (! data.events.threads.hasOwnProperty(element.tid))
				data.events.threads[element.tid] = { lf: [] };
			else if (! data.events.threads[element.tid].hasOwnProperty('lf'))
				data.events.threads[element.tid].lf = [];
			
			// Save the failure
			data.events.threads[element.tid].lf.push(timeEvent);

			// Save when a thread fail
			if (wait_map[element.tid] != null && wait_map[element.tid] != element.dtime) console.log("incoherent: thread already waiting", wait_map[element.tid], element.dtime);
			wait_map[element.tid] = element.dtime;

			// Stats
			data.stats.lock_failure++;

			// Stats by frame
			data.frames[timeID].lock_failure++;
		}
	});



	// computation done
	return data;
}

/**
 * Unload raw data
 */
function unloadData(profile) {
	delete profile.data;
	delete profileData[profile.id];
}


/************************************************/
/* Post treatment								*/
/************************************************/
/**
 * Add common stats
 */
function exportInfo(output, profile) {
	// Data
	var data = profile.data;

	// Infos
	output.info = {
		cores:			data.info.cores,
		threads:		data.info.threads,
		timeStep:		data.info.timeStep,
		timeMin:		data.info.timeMin,
		timeMax:		data.info.timeMax,
		duration:		data.info.timeMax + data.info.timeStep
	};
}


/************************************************/
/* Export										*/
/************************************************/
var profileExport = {
	data:		profileData,
	getVersion:		function(id) { return getVersion(profileMap[id]) },
	loadData:		function(id, notCreateCache) { loadData(profileMap[id], notCreateCache) },
	unloadData:		function(id) { unloadData(profileMap[id]) },
	reloadCache:	function(id) { return reloadCache(profileMap[id]) },
	expected:	VERSION,
	exportInfo:	exportInfo
};

// Add load/unload function
profileMap.all.forEach(function(profile) {
	profile.getVersion = function() {
		return getVersion(profile);
	};
	profile.loadData = function(notCreateCache) {
		loadData(profile, notCreateCache);
	};
	profile.unloadData = function() {
		unloadData(profile);
	};
	profile.reloadCache = function() {
		return reloadCache(profile);
	};
	profile.exportInfo = function(output) {
		exportInfo(output, profile);
	};
})

// Copy in all profiles attributes
for (var attribute in profileMap) {
	if (profileMap.hasOwnProperty(attribute)) {
		profileExport[attribute] = profileMap[attribute];
	}
}

module.exports = profileExport;