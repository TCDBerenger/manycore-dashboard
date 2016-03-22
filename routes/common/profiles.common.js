/************************************************/
/* JS libraries									*/
/************************************************/
var fs = require('fs');


/************************************************/
/* Constants									*/
/************************************************/
var VERSION = 81;
var PARALLEL_THRESHOLD = 2;

/************************************************/
/* Variables - hardwares						*/
/************************************************/
var hardRoman = {
	folder: 'Roman',
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
		arch:		'x86-64',	// architecture 32 or 64 bits
		pcores:		4,			// number of physical cores
		lcores:		8,			// number of logical cores
		l1caches:	4,			// number of caches L1
		l2caches:	2,			// number of caches L2
		l3caches:	1,			// number of caches L3
		clock:		3.06,		// clock speed in GHz
		cycles:		3060000,	// max cycles by ms
		l1:			32,			// cache L1 in KB
		l2:			256,		// cache L2 in KB
		l3:			8192,		// cache L3 in KB
		ram:		12573696,	// cache RAM in KB
		bandwidth:	26843535	// maximum memory bandwidth by milli-second = 25,599.99 MB/s
	},
	calibration: {			// TYPICAL VALUES
		s:	1,				// number of switches by ms by core
		m:	0.3,			// number of migrations by ms by core
		ls: 0.01,			// number of success lock acquisition by ms by core
		lf: 0.003,			// number of failure lock acquisition by ms by core
		il1:	200000,		// number of L1 cache line invalidations by ms by core
		il2:	400000		// number of L2 cache line invalidations by ms by core
	}
};

var hardSTG = {
	folder: 'STG',
	info: {
		label:	'Intel i7-860 with 4 GB RAM',
		cpu: {
			label:	'Intel® Core™ i7-860',
			link:	'http://ark.intel.com/products/41316/Intel-Core-i7-860-Processor-8M-Cache-2_80-GHz',
			model:	'i7-860',
			type:	'64 bits',
			cores:	'4 cores / 8 threads',
			clock:	'2.78 GHz',
			l1:		'32 KB',
			l2:		'256 KB',
			l3:		'8 MB'
		},
		ram:	'12 279 MB'
	},
	data: {
		arch:		'x86-64',	// architecture 32 or 64 bits
		pcores:		4,			// number of physical cores
		lcores:		8,			// number of logical cores
		l1caches:	4,			// number of caches L1
		l2caches:	2,			// number of caches L2
		l3caches:	1,			// number of caches L3
		clock:		2.78,		// clock speed in GHz
		cycles:		2800000,	// max cycles by ms
		l1:			32,			// cache L1 in KB
		l2:			256,		// cache L2 in KB
		l3:			8192,		// cache L3 in KB
		ram:		4194304,	// cache RAM in KB
		bandwidth:	22369607	// maximum memory bandwidth in KB by second = 21,333.32 MB/s
	},
	calibration: {			// TYPICAL VALUES
		s:	1,				// number of switches by ms by core
		m:	0.3,			// number of migrations by ms by core
		ls: 0.01,			// number of success lock acquisition by ms by core
		lf: 0.003,			// number of failure lock acquisition by ms by core
		il1:	200000,		// number of L1 cache line invalidations by ms by core
		il2:	400000		// number of L2 cache line invalidations by ms by core
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

		{ id: 21,	label: 'Dining ph.  5',	desc: 'Probliem for 5 philosophers dining',		hardware: hardRoman, file: 'philosophers5',		pid: 12220,	timeStep: 50, v: 4 },
		{ id: 22,	label: 'Dining ph. 45',	desc: 'Probliem for 45 philosophers dining',	hardware: hardRoman, file: 'philosophers45',	pid: 6908,	timeStep: 50, v: 4 },

		{ id: 31,	label: 'P/C 1/1',		desc: '1 producer and 1 consumer',			hardware: hardRoman, file: 'pc1x1',		pid: 67380,	timeStep: 50, v: 4 },
		{ id: 32,	label: 'P/C 1/10',		desc: '1 producer and 10 consumers',		hardware: hardRoman, file: 'pc1x10',	pid: 73540,	timeStep: 50, v: 4 },
		{ id: 33,	label: 'P/C 1/100',		desc: '1 producer and 100 consumers',		hardware: hardRoman, file: 'pc1x100',	pid: 76824,	timeStep: 50, v: 4 },
		{ id: 34,	label: 'P/C 10/1',		desc: '10 producers and 1 consumer',		hardware: hardRoman, file: 'pc10x1',	pid: 79828,	timeStep: 50, v: 4 },
		{ id: 35,	label: 'P/C 10/10',		desc: '10 producers and 10 consumers',		hardware: hardRoman, file: 'pc10x10',	pid: 81516,	timeStep: 50, v: 4 },
		{ id: 36,	label: 'P/C 10/100',	desc: '10 producers and 100 consumers',		hardware: hardRoman, file: 'pc10x100',	pid: 82952,	timeStep: 50, v: 4 },
		{ id: 37,	label: 'P/C 100/1',		desc: '100 producers and 1 consumer',		hardware: hardRoman, file: 'pc100x1',	pid: 84696,	timeStep: 50, v: 4 },
		{ id: 38,	label: 'P/C 100/10',	desc: '100 producers and 10 consumers',		hardware: hardRoman, file: 'pc100x10',	pid: 90436,	timeStep: 50, v: 4 },
		{ id: 39,	label: 'P/C 100/100',	desc: '100 producers and 100 consumers',	hardware: hardRoman, file: 'pc100x100',	pid: 93496,	timeStep: 50, v: 4 },

		{ id: 1006,	label: 'Dining ph.  6',	desc: 'Dining philosopher problem for 6 covers',	hardware: hardSTG,	 file: 'philosophers006',	pid: 8864,	timeStep: 50, v: 5, disabled: true },
		{ id: 1012,	label: 'Dining ph. 12',	desc: 'Dining philosopher problem for 12 covers',	hardware: hardSTG,	 file: 'philosophers012' },
		{ id: 1045,	label: 'Dining ph. 45″',desc: 'Dining philosopher problem for 45 covers',	hardware: hardSTG,	 file: 'philosophers045',	pid: 5456,	timeStep: 50, v: 4, disabled: true },
	]
};

// Global treatment
profileMap.all.forEach(function (profile) {
	// Missing data
	if (! profile.timeStep) profile.timeStep = 50;
	if (! profile.v) profile.v = 5;
	
	// Indexing
	profileMap[profile.id] = profile;
});


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
	 │	 ├	byFrames
	 │	 │	 ├	frame<0>			ID
	 │	 │	 │	 ├	thread<0>		ID
	 │	 │	 │	 │	 ├	cycles		<integer>	number of cycles
	 │	 │	 │	 │	 ├	ready		<integer>	duration of ready state
	 │	 │	 │	 │	 ├	running		<integer>	duration of running state
	 │	 │	 │	 │	 ├	standby		<integer>	duration of standby state
	 │	 │	 │	 │	 └	wait		<integer>	duration of wait state
	 │	 │	 │	 ├	...
	 │	 │	 │	 └	thread<N>
	 │	 │	 ├	...
	 │	 │	 └	frame<?>
	 │	 └	list
	 │		 └	<h>
	 │			 ├	s					<integer>	start time (real, not corresponding to a time frame), could be null
	 │			 ├	e					<integer>	end time (real, not corresponding to a time frame), could be null
	 │			 └	ct					<integer>	core time in ms
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
		v = JSON.parse(fs.readFileSync('data/' + profile.hardware.folder + '.' + profile.file + '.cache.json', 'utf8')).info.version;

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
	var filenameCache = 'data/' + profile.hardware.folder + '.' + profile.file + '.cache.json';

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
	var filenameRaw1 = 'data/' + profile.hardware.folder + '/' + profile.file + '.states.json';
	var filenameRaw2 = 'data/' + profile.hardware.folder + '/' + profile.file + '.switches.json';
	var filenameRaw3 = 'data/' + profile.hardware.folder + '/' + profile.file + '.dl.json';
	var filenameRaw4 = 'data/' + profile.hardware.folder + '/' + profile.file + '.locks.json';
	var filenameRaw5 = 'data/' + profile.hardware.folder + '/' + profile.file + '.memory.json';
	var filenameRaw6 = 'data/' + profile.hardware.folder + '/' + profile.file + '.coherency.json';
	var filenameCache = 'data/' + profile.hardware.folder + '.' + profile.file + '.cache.json';

	// Load raw
	var raw1 = JSON.parse(fs.readFileSync(filenameRaw1, 'utf8'));
	var raw2 = JSON.parse(fs.readFileSync(filenameRaw2, 'utf8'));
	var raw3 = JSON.parse(fs.readFileSync(filenameRaw3, 'utf8'));
	var raw4 = (profile.v >= 4) ? JSON.parse(fs.readFileSync(filenameRaw4, 'utf8')) : null;
	var raw5 = (profile.v >= 5) ? JSON.parse(fs.readFileSync(filenameRaw5, 'utf8')) : null;
	var raw6 = (profile.v >= 5) ? JSON.parse(fs.readFileSync(filenameRaw6, 'utf8')) : null;
	console.log("[" + profile.id + "] " + profile.file + " raw data loaded");

	// Compute
	var data = computeData(profile, raw1, raw2, raw3, raw4, raw5, raw6);
	console.log("[" + profile.id + "] " + profile.file + " raw data computed");

	// Save to cache
	fs.writeFileSync(filenameCache, JSON.stringify(data));
	console.log("[" + profile.id + "] " + profile.file + " raw data cached");

	return data;
}

/**
 * Compute data
 */
function computeData(profile, raw1, raw2, raw3, raw4, raw5, raw6) {
	// Create structure
	var data = {
		info: {
			version:		VERSION,
			capability:		[!!raw1, !!raw2, !!raw3, !!raw4 && raw4.length > 0, !!raw5, !!raw6],
			timeStep:		profile.timeStep,
			timeMin:		0,
			timeMax:		0,
			duration:		0
		},
		stats: {
			idle:			0,
			parallel:		0,
			switches:		0,
			migrations:		0,
			starts:			0,
			ends:			0,
			lock_failure:	0,
			lock_success:	0,
			lock_release:	0,
			lock_wait:		0,
			lock_hold:		0,
			threads:		0,
			bandwidth:		0,
			invalid_l1:		0,
			invalid_l2:		0
		},
		frames: {},
		events: {
			threads:		{},
			sequences:		{},
			s:				[],
			m:				[]
		},
		periods: {
			cores:			{},
			threads:		{}
		},
		switches: [],
		migrations: [],
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
		locks:				{},
		lock_failure:		[],
		lock_success:		[],
		lock_release:		[],
		threads: {
			byFrames:		{},
			list:			{}
		}
	};

	// Grobal vars
	var timeID, timeEvent;
	var timeStep = data.info.timeStep;

	// Global functions
	function checkThread(id) {
		if (! data.threads.list.hasOwnProperty(id))
			data.threads.list[id] = { s: null, e: null, ct: 0};
		return data.threads.list[id];
	}
	function checkFrame(id) {
		if (! data.frames.hasOwnProperty(id)) {
			data.frames[id] = {
				t:				{},	// by thread
				c:				{},	// by code

				cycles: 		0,	// in cycles
				
				runcores:		0,	// number of running cores (float number between 0 to lcores)

				idle:			0,	// in ms, idle process
				ready: 			0,	// in ms
				running: 		0,	// in ms
				standby: 		0,	// in ms
				wait: 			0,	// in ms
				lock_wait:		0,	// in ms, how long threads waiting for a lock acquisition
				parallel:		0,	// in ms, how long more than PARALLEL_THRESHOLD cores are running

				starts:			0,	// how many threads starting
				ends:			0,	// how many threads ending
				switches:		0,	// how many threads switching
				migrations:		0,	// how many threads migrating
				lock_success:	0,	// how many threads successing lock acquisition
				lock_failure:	0,	// how many threads failing lock acquisition
				
				bandwidth:		0,	// how many memory bandwidth is used in bytes
				
				invalid_l1:		0,	// how many L1 invalidations (cache coherency misses)
				invalid_l2:		0,	// how many L2 invalidations (cache coherency misses)
			}
		}
	}

	/**
	 *
	 *	Profile treatment
	 *
	 */
	// Missing data
	if (! profile.pid) {
		profile.pid = raw4[0].pid;
		console.log('0> add pid', profile.pid);
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

				// Compute core time
				if (element.type == 'running') {
					checkThread(element.tid).ct += element.value;
				}
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
	// Sequential sequences
	var coreLength = profile.hardware.data.lcores;
	var coreActivity = [];
	var isActuallyRunning;
	for (var cid = 0; cid < coreLength; cid++) coreActivity[cid] = true;

	// Vars
	var coreThreads = {};
	var migrationMap = {};
	var property;

	// Loop
	raw2.forEach(function(element) {
		// Compute time ID
		timeEvent = Math.round(element.dtime / 10000);
		timeID = Math.floor(timeEvent / timeStep) * timeStep;

		// Check time frame existance
		checkFrame(timeID);

		// Sequential or parallel sequences
		if (element.type == "sw") {
			isActuallyRunning = element.pid == profile.pid;
			if (isActuallyRunning != coreActivity[element.cid]) {
				coreActivity[element.cid] = isActuallyRunning;

				// Save new state (override with new states if already exists)
				data.events.sequences[timeEvent] = { c_r: 0 };
				for (var cid = 0; cid < coreLength; cid++) {
					if (coreActivity[cid])
						data.events.sequences[timeEvent].c_r++;
				}
			}
		}

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

				// Save new attached core
				coreThreads[element.tid] = element.cid;
			}

		}

		// Thread life
		else if ((element.type == "start" || element.type == "end") && element.pid == profile.pid) {

			// Which case ?
			property = element.type + "s";

			// Start
			data.stats[property]++;

			// Add a start with auto build structure
			data.frames[timeID][property]++;

			// Save thread property
			checkThread(element.tid)[element.type[0]] = timeEvent;
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
	
	// Events to time frames for sequences
	var q_previousEventTime = 0;
	var q_previousRunningCoreS = (data.events.sequences[0]) ? data.events.sequences[0].c_r | 0 : 0;
	var q_previousRunningCoreByMs = q_previousRunningCoreS / timeStep;
	for (timeID = 0; timeID <= data.info.timeMax; timeID += timeStep) {
		
		// Check (probably useless) the time frame existance
		checkFrame(timeID);
		
		// Sequence - add event
		for (timeEvent = Math.max(timeID, 1); timeEvent < timeID + timeStep; timeEvent++) {
			if (timeEvent in data.events.sequences) {
				
				// Add previous stat until this new event
				data.frames[timeID].runcores += q_previousRunningCoreByMs * (timeEvent - Math.max(timeID, q_previousEventTime));
				data.frames[timeID].parallel += (q_previousRunningCoreS >= PARALLEL_THRESHOLD) ? (timeEvent - Math.max(timeID, q_previousEventTime)) : 0;
				
				// Set current stats with found new event stats
				q_previousEventTime = timeEvent;
				q_previousRunningCoreS = data.events.sequences[timeEvent].c_r;
				q_previousRunningCoreByMs = q_previousRunningCoreS / timeStep;
			}
		}
		
		// Sequence - end of frame (also empty frame)
		if (q_previousEventTime < timeID + timeStep) {
			// Add current stat until the end of the frame
			// NB: if no new stat is found this turn, use previous stat for all the time frame
			data.frames[timeID].runcores += q_previousRunningCoreByMs * (timeID + timeStep - Math.max(timeID, q_previousEventTime));
			data.frames[timeID].parallel += (q_previousRunningCoreS >= PARALLEL_THRESHOLD) ? (timeID + timeStep - Math.max(timeID, q_previousEventTime)) : 0;
		}
		
		// Sequence post-treatment
		data.stats.parallel += data.frames[timeID].parallel;
//		data.frames[timeID].runcores = Math.round(data.frames[timeID].runcores);
	}


	/**
	 *
	 *	RAW 3:
	 *		dala locality
	 *
	 */
	// Var
//	var property;
//	var steps = +raw3.info.duration / timeStep;

	// Init stats
	data.locality.stats = {
		ipc:	0,
		tlb:	0,
		l1:		0,
		l2:		0,
		l3:		0,
		hpf:	0
	}

	// Loop
	raw3.threads.forEach(function(thread) {
		if (thread.id > 1) thread.measures.forEach(function(measure) {
			// Save average
			checkThread(thread.id)[measure.name.toLowerCase()] = measure.data.reduce(function(a, b) { return a + b; }) / measure.data.length;

			// Save by time frame
			measure.data.forEach(function (value, value_index) {
				timeID = value_index * profile.timeStep;
				property = measure.name.toLowerCase();

				// By frame
				if (! data.locality.byFrames.hasOwnProperty(timeID))			data.locality.byFrames[timeID] = { t: timeID };
				if (! data.locality.byFrames[timeID].hasOwnProperty(property))	data.locality.byFrames[timeID][property] = 0;
				data.locality.byFrames[timeID][property] += +value || 0;

				// Stats
				data.locality.stats[property] += (+value || 0) * timeStep / 100; //  / steps
			});
		});
	});

	// Stats -- UNUSED
	/*
	data.rawLocality.stats = {
		d:		+raw3.info.duration,
		cycles:	+raw3.info.cycles,
		tlb:	+raw3.info.tlbmiss,
		l1:		+raw3.info.l1miss,
		l2:		+raw3.info.l2miss,
		l3:		+raw3.info.l3miss,
		dzf:	+raw3.info.dzf,
		hpf:	+raw3.info.hpf
	}
	*/


	/**
	 *
	 *	RAW 4:
	 *		locks
	 *
	 */
	// Vars
	var lock_map = {};	// current owner of a lock				(key: 'lock-id')
	var hold_map = {};	// when a thread starts holding a lock	(key: 'lock-id')
	var wait_map = {};	// when a thread starts waiting a lock	(key: 'thread-lock')
	var duration, currentEnd, currentID;

	// Loop
	if (raw4 != null) raw4.forEach(function(element) {
		// Compute time ID
		timeEvent = Math.round(element.dtime / 10000);
		timeID = Math.floor(timeEvent / timeStep) * timeStep;

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

			// Save when lock is holding
			if (hold_map[element.value] != null && hold_map[element.value] != element.dtime) console.log("4> incoherent: lock already holded", element.value, hold_map[element.value], element.dtime);
			hold_map[element.value] = element.dtime;

			// Save lock life
			if (! data.locks.hasOwnProperty(element.value)) data.locks[element.value] = [];
			data.locks[element.value].push({ t: timeEvent, x: 'ls', h: element.tid });

			// Stats
			data.stats.lock_success++;
			data.stats.lock_wait += duration;

			// Stats by frame
			data.frames[timeID].lock_success++;


			// Save the failure duration
			if (duration > 0) {
				if (wait_map[element.tid] == null || ! wait_map.hasOwnProperty(element.tid)) console.log('4> incoherent: duration positive but no starting time', duration, wait_map[element.tid]);

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
					currentID -= timeStep;
				}
			}

			// Reset
			wait_map[element.tid] = undefined;			// Thread doesn't wait the lock anymore
			lock_map[element.value] = element.tid;		// which thread has the lock

		} else if (element.type == 'failure') {

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
			if (wait_map[element.tid] != null && wait_map[element.tid] != element.dtime) console.log("4> incoherent: thread already waiting", wait_map[element.tid], element.dtime);
			wait_map[element.tid] = element.dtime;

			// Save lock life
			if (! data.locks.hasOwnProperty(element.value)) data.locks[element.value] = [];
			data.locks[element.value].push({ t: timeEvent, x: 'lf', h: element.tid, hl: lock_map[element.value] });

			// Stats
			data.stats.lock_failure++;

			// Stats by frame
			data.frames[timeID].lock_failure++;

		} else if (element.type == 'release') {
			// Compute duration
			duration = Math.round((element.dtime - hold_map[element.value]) / 10000);

			// Save the release
			data.lock_release.push({
				t: timeEvent,
				l: element.value,				// which occupied lock
				h: element.tid,					// which thread fails
				d: duration						// how long does it take to get the lock
			});

			// Check event list existance
			if (! data.periods.threads.hasOwnProperty(element.tid))
				data.periods.threads[element.tid] = { lh: [] };
			else if (! data.periods.threads[element.tid].hasOwnProperty('lh'))
				data.periods.threads[element.tid].lh = [];

			// Save the success
			data.periods.threads[element.tid].lh.push({ s: Math.round(hold_map[element.value] / 10000), e: timeEvent});
			hold_map[element.value] = null;

			// Save lock life
			if (! data.locks.hasOwnProperty(element.value)) data.locks[element.value] = [];
			data.locks[element.value].push({ t: timeEvent, x: 'lr' });

			// Stats
			data.stats.lock_release++;
			data.stats.lock_hold += duration;

			// Reset
			hold_map[element.value] = undefined;		// Lock isn't holded anymore (when start holding)
			lock_map[element.value] = undefined;		// Lock isn't holded anymore (which thread)
		}
	});


	/**
	 *
	 *	RAW 5:
	 *		memory bandwidth
	 *
	 */
	if (raw5 != null) {
		// Treat all elements
		raw5.forEach(function(element) {
			// Compute time ID
			timeEvent = Math.round(element.dtime / 10000);
			
			// Append memory bandwidth
			if (element.cid % 2 == 0 && element.type == 'drambw') {

				// Check time frame existance
				checkFrame(timeEvent);
				
				// Append memory bandwidth
				data.stats.bandwidth += element.value | 0;
				data.frames[timeEvent].bandwidth += element.value | 0;
				data.frames[timeEvent].c[element.cid / 2].bandwidth = element.value;
			}
		});
	}


	/**
	 *
	 *	RAW 6:
	 *		cache coherency misses
	 *
	 */
	var coreCount = profile.hardware.data.lcores;
	var lxID, pxID, value, cxID;
	if (raw6 != null) raw6.forEach(function(element) {
		if (element.pid == profile.pid) {
			// Compute time ID
			timeEvent = Math.round(element.dtime / 10000);

			// Check time frame existance
			checkFrame(timeEvent);
			
			// Compute id
			lxID = element.type[1];
			pxID = 'invalid_l' + lxID;
			cxID = Math.floor(element.cid / (coreCount / profile.hardware.data['l' + lxID + 'caches']));
			value = element.value | 0;
			
			// Append Lx invalidation (cache coherency misses)
			// Sum values by threads
			data.stats[pxID] += value;
			data.frames[timeEvent][pxID] += value;
			
			// Append Lx invalidation (cache coherency misses)
			// Sum values by threads for cache ID
			data.frames[timeEvent].c[cxID][pxID] = (data.frames[timeEvent].c[cxID][pxID] | 0) + value;
		}
	});
	

	/**
	 *
	 *	Post treatment
	 *
	 */
	data.info.duration = data.info.timeMax + timeStep;
	


	/**
	 *
	 *	Done!
	 *
	 */
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
		capability:	data.info.capability,
		timeMin:	data.info.timeMin,
		timeMax:	data.info.timeMax,
		timeStep:	data.info.timeStep,
		duration:	data.info.duration
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