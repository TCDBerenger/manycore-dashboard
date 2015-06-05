/************************************************/
/* JS libraries									*/
/************************************************/
var fs = require('fs');


/************************************************/
/* Constants									*/
/************************************************/
var VERSION = 32;

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
		switches:	1,		// number of switches by ms by core
		migrations: 0.3		// number of migrations by ms by core
	}
};


/************************************************/
/* Variables - profiles							*/
/************************************************/
var profileIJK =	{ id: 1,	label: 'Matmul IJK',	desc: 'Matrix multiplication IJK', 	hardware: hardRoman, file: 'matmulijk', 	pid: 6396,	timeStep: 50 };
var profileKIJ =	{ id: 2,	label: 'Matmul KIJ',	desc: 'Matrix multiplication KIJ', 	hardware: hardRoman, file: 'matmulkij', 	pid: 3904,	timeStep: 50 };
var profileKJI =	{ id: 3,	label: 'Matmul KJI',	desc: 'Matrix multiplication KJI', 	hardware: hardRoman, file: 'matmulkji', 	pid: 1788,	timeStep: 50 };
var profilePS =		{ id: 4,	label: 'Particle S',	desc: 'Particle system (serial)', 	hardware: hardRoman, file: 'particles', 	pid: 10460,	timeStep: 50 };
var profileAB =		{ id: 5,	label: 'Account B',		desc: '',							hardware: hardRoman, file: 'accountb',		pid: 11300,	timeStep: 50 };
var profileCPi =	{ id: 6,	label: 'Compute Pi',	desc: '',							hardware: hardRoman, file: 'computepi',		pid: 6568,	timeStep: 50 };
var profileMlb =	{ id: 7,	label: 'Mandelbrot',	desc: '',							hardware: hardRoman, file: 'mandelbrot',	pid: 7484,	timeStep: 50 };
var profileNQ =		{ id: 8,	label: 'N Queens',		desc: '',							hardware: hardRoman, file: 'nqueens',		pid: 3120,	timeStep: 50 };
var profileRT =		{ id: 9,	label: 'Ray Tracer',	desc: '',							hardware: hardRoman, file: 'raytracer',		pid: 7500,	timeStep: 50 };
var profileAA =		{ id: 10,	label: 'Account A',		desc: '',							hardware: hardRoman, file: 'accounta',		pid: 11360,	timeStep: 50 };
var profileMSP =	{ id: 11,	label: 'Merge sort P',	desc: 'Merge and sort (parallel)',	hardware: hardRoman, file: 'mergesortp',	pid: 9148,	timeStep: 50 };
var profileMSS =	{ id: 12,	label: 'Merge sort S',	desc: 'Merge and sort (serial)',	hardware: hardRoman, file: 'mergesorts',	pid: 7272,	timeStep: 50 };
var profilePP =		{ id: 13,	label: 'Particle P',	desc: 'Particle system (parallel)',	hardware: hardRoman, file: 'particlep',		pid: 4532,	timeStep: 50 };
var profilePA =		{ id: 14,	label: 'Phase A',		desc: 'Phase A',					hardware: hardRoman, file: 'phasea',		pid: 8580,	timeStep: 50 };
var profilePB =		{ id: 15,	label: 'Phase B',		desc: 'Phase B',					hardware: hardRoman, file: 'phaseb',		pid: 3324,	timeStep: 50 };

var profileMap = {
	1: profileIJK,	5: profileAB,	9: profileRT,	13: profilePP,
	2: profileKIJ,	6: profileCPi,	10: profileAA,	14: profilePA,
	3: profileKJI,	7: profileMlb,	11: profileMSP,	15: profilePB,
	4: profilePS,	8: profileNQ,	12: profileMSS,
	all: [profileIJK, profileKIJ, profileKJI, profilePS, profileAB, profileCPi, profileMlb, profileNQ, profileRT, profileAA, profileMSP, profileMSS, profilePP, profilePA, profilePB]
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
function loadData(profile) {
	// Check if data are already loaded
	if (profile.hasOwnProperty('data')) {
		return;
	}

	// Vars
	var filenameRaw1 = 'data/' + profile.file + '.states.json';
	var filenameRaw2 = 'data/' + profile.file + '.switches.json';
	var filenameRaw3 = 'data/' + profile.file + '.dl.json';
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
	if (! profile.hasOwnProperty('data')) {

		// Load raw
		var raw1 = JSON.parse(fs.readFileSync(filenameRaw1, 'utf8'));
		var raw2 = JSON.parse(fs.readFileSync(filenameRaw2, 'utf8'));
		var raw3 = JSON.parse(fs.readFileSync(filenameRaw3, 'utf8'));
		console.log("[" + profile.id + "] " + profile.file + " raw data loaded");

		// Compute
		profile.data = computeData(profile, raw1, raw2, raw3);
		profileData[profile.id] = profile.data;
		console.log("[" + profile.id + "] " + profile.file + " raw data computed");

		// Save to cache
		fs.writeFileSync(filenameCache, JSON.stringify(profile.data));
		console.log("[" + profile.id + "] " + profile.file + " raw data cached");
	}
}

/**
 * Compute data
 */
function computeData(profile, raw1, raw2, raw3) {

	// Create structure
	var data = {
		info: {
			version:		VERSION,
			cores:			profile.hardware.data.cores,
			threads:		profile.hardware.data.threads,
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
		timeShift:		data.info.timeShift,
		timeStep:		data.info.timeStep,
		timeMin:		data.info.timeMin,
		timeMax:		data.info.timeMax,
		duration:		data.info.timeMax + data.info.timeStep,
		threadCount:	data.info.threadCount
	};
}


/************************************************/
/* Export										*/
/************************************************/
var profileExport = {
	data:		profileData,
	loadData:	function(id) { loadData(profileMap[id]) },
	unloadData:	function(id) { unloadData(profileMap[id]) },
	exportInfo:	exportInfo
};

// Add load/unload function
profileMap.all.forEach(function(profile) {
	profile.loadData = function() {
		loadData(profile);
	};
	profile.unloadData = function() {
		unloadData(profile);
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