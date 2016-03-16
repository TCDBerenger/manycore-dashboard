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
	output
	 ├	info
	 │	 ├	cores				<integer>	number of cores
	 │	 ├	threads				<integer>	number of threads handlable by CPU (i.e. in hyperthreading: twice cores)
	 │	 ├	timeStep			<integer>	time between each frame in ms (10⁻³s) (probably: 50 ms)
	 │	 ├	timeMin				<integer>	first time frame in ms (10⁻³s)
	 │	 ├	timeMax				<integer>	last time frame in ms (10⁻³s)
	 │	 └	duration			<integer>	how long is the run
	 ├	times					<array>		list of time frames
	 │	 ├	0
	 │	 │	 ├	r				<integer>	time (in ms) spending in state running
	 │	 │	 ├	yb				<integer>	time (in ms) spending in states ready and standby
	 │	 │	 ├	w				<integer>	time (in ms) spending in state waiting (all reasons)
	 │	 │	 ├	lw				<integer>	time (in ms) spending in state waiting for a lock aquisition
	 │	 │	 ├	i				<integer>	time (in ms) idle (cores)
	 │	 │	 └	sys				<integer>	time (in ms) keeping by the OS
	 │	 │	...
	 │	 └	<timeMax>
	 ├	switches				<array>		list of switch event times (in ms)
	 ├	migrations				<array>		list of migration event times (in ms)
	 ├	states					<array>		list of states by frams
	 │	 ├	0
	 │	 │	 ├	t				<integer>	time in ms (10⁻³s), identiral to frame<id>
	 │	 │	 ├	r				<integer>	number of threads in running state
	 │	 │	 └	yb				<integer>	number of threads in ready or standby state /!\ false state /!\
	 │	 │	...
	 │	 └	<timeMax>
	 ├	threads
	 │	 ├	info
	 │	 │	 ├	0
	 │	 │	 │	 ├ h			<integer>	thread id
	 │	 │	 │	 ├ s			<integer>	time (in ms) thread starts
	 │	 │	 │	 └ e			<integer>	time (in ms) thread ends
	 │	 │	 │	...
	 │	 │	 └	<thread max>
	 │	 │	...
	 │	 ├	ticks
	 │	 │	 ├	<h>				<integer>	thread id
	 │	 │	 │	 ├ m			<array>		list of migration event times (in ms)
	 │	 │	 │	 ├ ls			<array>		list of lock acquisition success event times (in ms)
	 │	 │	 │	 └ lf			<array>		list of lock acquisition failure event times (in ms)
	 │	 │	 │	...
	 │	 │	 └	<thread max>
	 │	 └	periods
	 │		 ├	<h>				<integer>	thread id
	 │		 │	 ├ m			<array>		list of migration periods (core attachment)
	 │		 │	 │	 ├ s		<integer>	time (in ms) thread starts
	 │		 │	 │	 ├ c		<integer>	color id (core id)
	 │		 │	 │	 └ e		<integer>	time (in ms) thread ends
	 │		 │	 └ lw			<array>		list of lock acquisition waiting periods
	 │		 │		 ├ s		<integer>	time (in ms) thread starts
	 │		 │		 └ e		<integer>	time (in ms) thread ends
	 │		 │	...
	 │		 └	<thread max>
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
		 └	times
		 	 ├	r				<integer>	duration in ms for running state
		 	 ├	y				<integer>	duration in ms for ready state
		 	 ├	w				<integer>	duration in ms for waiting state
		 	 ├	b				<integer>	duration in ms for standby state
		 	 └	yb				<integer>	duration in ms for ready or standby state /!\ false state /!\
 */


/**
 * Add common stats
 */
function addCommon(output, id) {
	// Init vars
	var data = profiles[id].data;

	// Stats
	output.stats = {
		h:	data.stats.threads,
		
	    s:	data.stats.switches,
	    m:	data.stats.migrations,
		c:	data.stats.cycles,

		r:	Math.round(data.stats.running),
		y:	Math.round(data.stats.ready),
		b:	Math.round(data.stats.standby),
		w:	Math.round(data.stats.wait)
	};

	// Threads
	output.threads = { info: [] };
	for (var h in data.threads.list) {
		output.threads.info.push({
			h: +h,
			s: data.threads.list[h].s,
			e: data.threads.list[h].e,
		});
	};

	// Sort - by start time
	output.threads.info.sort(function(a, b){return a.s - b.s});
}


/**
 * Add raw data for visualisations and stats
 */
function addRawData(output, id, statProperties, frameProperties, eventProperties, coreFrameProperties, addDalaLocality) {
	// Shortcut vars
	var hasF =	frameProperties && frameProperties.length > 0;
	var hasE =	eventProperties && eventProperties.length > 0;
	var hasCF =	coreFrameProperties && coreFrameProperties.length > 0;
	var isB =	{ s: statProperties.indexOf('b') >= 0,	f: hasF && frameProperties.indexOf('b') >= 0 };
	var isE =	{ s: statProperties.indexOf('e') >= 0,	f: hasF && frameProperties.indexOf('e') >= 0,													cf: hasCF && coreFrameProperties.indexOf('e') >= 0 };
	var isI =	{ s: statProperties.indexOf('i') >= 0,	f: hasF && frameProperties.indexOf('i') >= 0,													cf: hasCF && coreFrameProperties.indexOf('i') >= 0 };
	var isM =	{ s: statProperties.indexOf('m') >= 0,													e: hasE && eventProperties.indexOf('m') >= 0 };
	var isR =	{ s: statProperties.indexOf('r') >= 0,	f: hasF && frameProperties.indexOf('r') >= 0,													cf: hasCF && coreFrameProperties.indexOf('r') >= 0 };
	var isS =	{ s: statProperties.indexOf('s') >= 0,													e: hasE && eventProperties.indexOf('s') >= 0 };
	var isY =	{ s: statProperties.indexOf('y') >= 0,	f: hasF && frameProperties.indexOf('y') >= 0 };
	var isLF =	{ s: statProperties.indexOf('lf') >= 0,													e: hasE && eventProperties.indexOf('lf') >= 0 };
	var isLS =	{ s: statProperties.indexOf('ls') >= 0,													e: hasE && eventProperties.indexOf('ls') >= 0 };
	var isLW =	{ s: statProperties.indexOf('lw') >= 0,	f: hasF && frameProperties.indexOf('lw') >= 0 };
	var isUE =	{ s: statProperties.indexOf('ue') >= 0,	f: hasF && frameProperties.indexOf('ue') >= 0 };
	var isYB =	{ 										f: hasF && frameProperties.indexOf('yb') >= 0 };
	var isSE =	{ s: statProperties.indexOf('se') >= 0,	f: hasF && frameProperties.indexOf('se') >= 0 };
	var isSYS =	{ 										f: hasF && frameProperties.indexOf('sys') >= 0 };
	var isIL1 =	{ s: statProperties.indexOf('il1') >= 0,f: hasF && frameProperties.indexOf('il1') >= 0,													cf: hasCF && coreFrameProperties.indexOf('il1') >= 0 };
	var isIL2 =	{ s: statProperties.indexOf('il2') >= 0,f: hasF && frameProperties.indexOf('il2') >= 0,													cf: hasCF && coreFrameProperties.indexOf('il2') >= 0 };
	var hasCFP =	isE.cf;
	var hasCFL =	isI.cf || isR.cf;
	
	// Find data (real raw data)
	var data =	profiles[id].data;
	var hardware = profiles[id].hardware;
	
	// Compute some data
	var max = {
		timeProfile: data.info.duration * hardware.data.lcores,
		timeFrame: data.info.timeStep * hardware.data.lcores,
		bandwidthProbile: data.info.duration * hardware.data.bandwidth,
		bandwidthFrame: data.info.timeStep * hardware.data.bandwidth,
		L1Profile: data.info.duration * hardware.data.cycles,// * (hardware.data.l1caches - 1),
		L1Frame: data.info.timeStep * hardware.data.cycles,// * (hardware.data.l1caches - 1),
		L2Profile: data.info.duration * hardware.data.cycles,// * (hardware.data.l2caches - 1),
		L2Frame: data.info.timeStep * hardware.data.cycles,// * (hardware.data.l2caches - 1),
		locality: data.locality.stats.ipc + data.locality.stats.tlb + data.locality.stats.l1 + data.locality.stats.l2 + data.locality.stats.l3 + data.locality.stats.hpf
	};
	
	
	// Prepare output
	output.raw = {
		stats: {},
		statsPercent: {},
		amount: [],
		amountPercent: [],
		events: {},
		threads: {
			times: {},
			events: {}
		}
	}
	
	//
	// Add stats
	//
	if (isB.s) {	output.raw.stats.b =	Math.round(data.stats.standby);				output.raw.statsPercent.b =		Math.round(100 * data.stats.standby / max.timeProfile); }
	if (isE.s) {	output.raw.stats.e =	Math.round(data.stats.bandwidth / 1048576);	output.raw.statsPercent.e =		Math.round(100 * data.stats.bandwidth / max.bandwidthProbile); }
	if (isI.s) {	output.raw.stats.i =	Math.round(data.stats.idle);				output.raw.statsPercent.i =		Math.round(100 * data.stats.idle / max.timeProfile); }
	if (isM.s) {	output.raw.stats.m =	data.stats.migrations; }
	if (isR.s) {	output.raw.stats.r =	Math.round(data.stats.running);				output.raw.statsPercent.r =		Math.round(100 * data.stats.running / max.timeProfile); }
	if (isS.s) {	output.raw.stats.s =	data.stats.switches; }
	if (isY.s) {	output.raw.stats.y =	Math.round(data.stats.ready);				output.raw.statsPercent.y =		Math.round(100 * data.stats.ready / max.timeProfile); }
	if (isLF.s) {	output.raw.stats.lf =	Math.round(data.stats.lock_failure); }
	if (isLS.s) {	output.raw.stats.ls =	Math.round(data.stats.lock_success); }
	if (isLW.s) {	output.raw.stats.lw =	Math.round(data.stats.lock_wait);			output.raw.statsPercent.lw =	Math.round(100 * data.stats.lock_wait / max.timeProfile); }
	if (isUE.s) {	output.raw.stats.ue =	Math.round((max.bandwidthProbile - data.stats.bandwidth) / 1048576);	output.raw.statsPercent.ue =	100 - Math.round(100 * data.stats.bandwidth / max.bandwidthProbile); }
	if (isSE.s) {	output.raw.stats.se =	0;																		output.raw.statsPercent.se =	0 }
	if (isIL1.s) {	output.raw.stats.il1 =	Math.round(data.stats.invalid_l1);			output.raw.statsPercent.il1 =	Math.round(100 * data.stats.invalid_l1 / max.L1Profile); }
	if (isIL2.s) {	output.raw.stats.il2 =	Math.round(data.stats.invalid_l2);			output.raw.statsPercent.il2 =	Math.round(100 * data.stats.invalid_l2 / max.L2Profile); }
	if (addDalaLocality) {
				output.raw.stats.ipc =	Math.round(data.locality.stats.ipc);	output.raw.statsPercent.ipc =	Math.round(100 * data.locality.stats.ipc / max.locality);
				output.raw.stats.tlb =	Math.round(data.locality.stats.tlb);	output.raw.statsPercent.tlb =	Math.round(100 * data.locality.stats.tlb / max.locality);
				output.raw.stats.l1 =	Math.round(data.locality.stats.l1);		output.raw.statsPercent.l1 =	Math.round(100 * data.locality.stats.l1 / max.locality);
				output.raw.stats.l2 =	Math.round(data.locality.stats.l2);		output.raw.statsPercent.l2 =	Math.round(100 * data.locality.stats.l2 / max.locality);
				output.raw.stats.l3 =	Math.round(data.locality.stats.l3);		output.raw.statsPercent.l3 =	Math.round(100 * data.locality.stats.l3 / max.locality);
				output.raw.stats.hpf =	Math.round(data.locality.stats.hpf);	output.raw.statsPercent.hpf =	Math.round(100 * data.locality.stats.hpf / max.locality);
	}
	
	// Time frames
	if (hasF || hasCF || addDalaLocality) {
		var amount, amountPercent, maxAL;
		for (var timeID = 0; timeID <= data.info.timeMax; timeID+= data.info.timeStep) {
			
			//
			// Add amounts
			//	- times of states for threads
			//	- instructions for data locality
			//
			if (hasF || hasCF || addDalaLocality) {
				amount = { t: timeID };
				amountPercent = { t: timeID };
				
				// Times
				if (isB.f) { amount.b =		Math.round(data.frames[timeID].standby);								amountPercent.b =	Math.round(100 * data.frames[timeID].standby / max.timeFrame); }
				if (isI.f) { amount.i =		Math.round(data.frames[timeID].idle);									amountPercent.i =	Math.round(100 * data.frames[timeID].idle / max.timeFrame); }
				if (isR.f) { amount.r =		Math.round(data.frames[timeID].running);								amountPercent.r =	Math.round(100 * data.frames[timeID].running / max.timeFrame); }
				if (isY.f) { amount.y =		Math.round(data.frames[timeID].ready);									amountPercent.y =	Math.round(100 * data.frames[timeID].ready / max.timeFrame); }
				if (isLW.f) { amount.lw =	Math.round(data.frames[timeID].lock_wait);								amountPercent.lw =	Math.round(100 * data.frames[timeID].lock_wait / max.timeFrame); }
				if (isYB.f) { amount.yb =	Math.round(data.frames[timeID].ready + data.frames[timeID].standby);	amountPercent.yb =	Math.round(100 * (data.frames[timeID].ready + data.frames[timeID].standby) / max.timeFrame); }
				if (isSYS.f) {
					amount.sys =		max.timeFrame - Math.round(data.frames[timeID].running) - Math.round(data.frames[timeID].idle);
					amountPercent.sys =	100 - Math.round(100 * data.frames[timeID].running / max.timeFrame) - Math.round(100 * data.frames[timeID].idle / max.timeFrame);
				}
				
				// Bandwidth
				if (isE.f) { amount.e =		Math.round(data.frames[timeID].bandwidth / 1048576);		amountPercent.e =	Math.round(100 * data.frames[timeID].bandwidth / max.bandwidthFrame); }
				if (isSE.f) { amount.se =	Math.round(data.frames[timeID].sysBandwidth / 1048576);		amountPercent.se =	Math.round(100 * data.frames[timeID].sysBandwidth / max.bandwidthFrame); }
				if (isUE.f) {
					amount.ue =			Math.round((max.bandwidthFrame - data.frames[timeID].bandwidth - data.frames[timeID].sysBandwidth) / 1048576);
					amountPercent.ue =	100 - Math.round(100 * (data.frames[timeID].bandwidth + data.frames[timeID].sysBandwidth) / max.bandwidthFrame);
				}
				
				// Cache line invalidation
				if (isIL1.f) { amount.il1 = data.frames[timeID].invalid_l1;	amountPercent.il1 = Math.round(100 * data.frames[timeID].invalid_l1 / max.L1Frame); }
				if (isIL2.f) { amount.il2 = data.frames[timeID].invalid_l2;	amountPercent.il2 = Math.round(100 * data.frames[timeID].invalid_l2 / max.L2Frame); }
				
				// Core times
				if (hasCFP) {
					for (var cid = profiles[id].hardware.data.pcores; cid--; ) {
						if (isE.cf)	amount['e_c' + cid] =	Math.round(data.frames[timeID].c[cid].bandwidth / 1048576);
					}
				}
				if (hasCFL) {
					for (var cid = profiles[id].hardware.data.lcores; cid--; ) {
						if (isR.cf)	amount['r_c' + cid] =	Math.round(data.frames[timeID].c[cid].running);
						if (isI.cf)	amount['i_c' + cid] =	Math.round(data.frames[timeID].c[cid].idle);
					}
				}
				if (isIL1.cf) {
					for (var cid = profiles[id].hardware.data.l1caches; cid--; ) {
						amount['il1_c' + cid] =	data.frames[timeID].c[cid].invalid_l1;
						amountPercent['il1_c' + cid] =	Math.round(100 * data.frames[timeID].c[cid].invalid_l1 / max.L1Frame);
					}
				}
				if (isIL2.cf) {
					for (var cid = profiles[id].hardware.data.l2caches; cid--; ) {
						amount['il2_c' + cid] =	data.frames[timeID].c[cid].invalid_l2;
						amountPercent['il2_c' + cid] =	Math.round(100 * data.frames[timeID].c[cid].invalid_l2 / max.L1Frame);
					}
				}
				
				// Data locality
				if (addDalaLocality) {
					if (data.locality.byFrames.hasOwnProperty(timeID)) {
						amount.ipc =	Math.round(data.locality.byFrames[timeID].ipc);
						amount.tlb =	Math.round(data.locality.byFrames[timeID].tlb);
						amount.l1 =		Math.round(data.locality.byFrames[timeID].l1);
						amount.l2 =		Math.round(data.locality.byFrames[timeID].l2);
						amount.l3 =		Math.round(data.locality.byFrames[timeID].l3);
						amount.hpf =	Math.round(data.locality.byFrames[timeID].hpf);
						
						maxAL = data.locality.byFrames[timeID].ipc + data.locality.byFrames[timeID].tlb + data.locality.byFrames[timeID].l1 + data.locality.byFrames[timeID].l2 + data.locality.byFrames[timeID].l3 + data.locality.byFrames[timeID].hpf;
						
						amountPercent.ipc =	Math.round(100 * data.locality.byFrames[timeID].ipc / maxAL);
						amountPercent.tlb =	Math.round(100 * data.locality.byFrames[timeID].tlb / maxAL);
						amountPercent.l1 =	Math.round(100 * data.locality.byFrames[timeID].l1 / maxAL);
						amountPercent.l2 =	Math.round(100 * data.locality.byFrames[timeID].l2 / maxAL);
						amountPercent.l3 =	Math.round(100 * data.locality.byFrames[timeID].l3 / maxAL);
						amountPercent.hpf =	Math.round(100 * data.locality.byFrames[timeID].hpf / maxAL);
					} else {
						amount.ipc = null;	amountPercent.ipc =	0;
						amount.tlb = null;	amountPercent.tlb =	0;
						amount.l1 =  null;	amountPercent.l1 =	0;
						amount.l2 =  null;	amountPercent.l2 =	0;
						amount.l3 =  null;	amountPercent.l3 =	0;
						amount.hpf = null;	amountPercent.hpf =	0;
					}
				}
				
				output.raw.amount.push(amount);
				output.raw.amountPercent.push(amountPercent);
			}
		}
	}
	
	// Events
	var events;
	if (hasE) {
		if (isM.e) output.raw.events.m = data.events.m;
		if (isS.e) output.raw.events.s = data.events.s;
		if (isLF.e) {
			events = [];
			data.lock_failure.forEach(function(lock) {
				events.push(lock.t);
			});
			output.raw.events.lf = events;
		}
		if (isLS.e) {
			events = [];
			data.lock_success.forEach(function(lock) {
				events.push(lock.t);
			});
			output.raw.events.ls = events;
		}
	}
}



/**
 * Add switches
 */
function addSwitches(output, id) {
	// Data
	output.switches = profiles[id].data.events.s;
}

/**
 * Add migrations
 */
function addMigrations(output, id) {
	// Data
	output.migrations = profiles[id].data.events.m;
}


/**
 * Add times spending in thread of core states
 */
function addTimes(output, id, properties) {
	// Init vars
	var max;
	var data =	profiles[id].data;
	var isR =	properties.indexOf('r') >= 0;
	var isYB =	properties.indexOf('yb') >= 0;
	var isW =	properties.indexOf('w') >= 0;
	var isLW =	properties.indexOf('lw') >= 0;
	var isI =	properties.indexOf('i') >= 0;
	var isSYS =	properties.indexOf('sys') >= 0;
	
	// Init return
	output.times = {};
	if (! output.percent) output.percent = {};

	// Add times
	max = profiles[id].hardware.data.lcores * data.info.timeStep;
	for (var timeID = 0; timeID <= data.info.timeMax; timeID+= data.info.timeStep) {
		// Auto create structure
		if (! output.percent[timeID]) output.percent[timeID] = {};
		output.times[timeID] = {};
		
		if (isR) {
			output.times[timeID].r =	Math.round(data.frames[timeID].running);
			output.percent[timeID].r =	Math.round(100 * data.frames[timeID].running / max);
		}	
		if (isYB) {
			output.times[timeID].yb =	Math.round(data.frames[timeID].ready + data.frames[timeID].standby);
			output.percent[timeID].yb =	Math.round(100 * (data.frames[timeID].ready + data.frames[timeID].standby) / max);
		}	
		if (isW) {
			output.times[timeID].w =	Math.round(data.frames[timeID].wait);
			output.percent[timeID].w =	Math.round(100 * data.frames[timeID].wait / max);
		}	
		if (isLW) {
			output.times[timeID].lw =	Math.round(data.frames[timeID].lock_wait);
			output.percent[timeID].lw =	Math.round(100 * data.frames[timeID].lock_wait / max);
		}	
		if (isI) {
			output.times[timeID].i =	Math.round(data.frames[timeID].idle);
			output.percent[timeID].i =	Math.round(100 * data.frames[timeID].idle / max);
		}	
		if (isSYS) {
			output.times[timeID].sys =		max - Math.round(data.frames[timeID].running) - Math.round(data.frames[timeID].idle);
			output.percent[timeID].sys =	100 - Math.round(100 * data.frames[timeID].running / max) - Math.round(100 * data.frames[timeID].idle / max);
		}	
	}
}

/**
 * Add data-locality data
 */
function addLocality(output, id, simplified) {
	// Init vars
	var data		= profiles[id].data;
	output.locality	= {};
	if (! output.percent) output.percent = {};

	// Data
	var max;
	for (var frameID in data.locality.byFrames) {
		// Auto create structure
		if (! output.percent[frameID]) output.percent[frameID] = {};
		output.locality[frameID] = {};
		
		if (data.locality.byFrames.hasOwnProperty(frameID)) {
			if (simplified) {
				output.locality[frameID].ipc =	Math.round(data.locality.byFrames[frameID].ipc);
				output.locality[frameID].miss =	Math.round(data.locality.byFrames[frameID].tlb + data.locality.byFrames[frameID].l1 + data.locality.byFrames[frameID].l2 + data.locality.byFrames[frameID].l3 + data.locality.byFrames[frameID].hpf);
				
				output.percent[frameID].ipc =	Math.round(100 * data.locality.byFrames[frameID].ipc / max);
				output.percent[frameID].miss =	100 - output.percent[frameID].ipc;
				
			} else {
				output.locality[frameID].ipc =	Math.round(data.locality.byFrames[frameID].ipc);
				output.locality[frameID].tlb =	Math.round(data.locality.byFrames[frameID].tlb);
				output.locality[frameID].l1 =	Math.round(data.locality.byFrames[frameID].l1);
				output.locality[frameID].l2 =	Math.round(data.locality.byFrames[frameID].l2);
				output.locality[frameID].l3 =	Math.round(data.locality.byFrames[frameID].l3);
				output.locality[frameID].hpf =	Math.round(data.locality.byFrames[frameID].hpf);
				
				max = data.locality.byFrames[frameID].ipc + data.locality.byFrames[frameID].tlb + data.locality.byFrames[frameID].l1 + data.locality.byFrames[frameID].l2 + data.locality.byFrames[frameID].l3 + data.locality.byFrames[frameID].hpf;
				
				output.percent[frameID].ipc =	(100 * data.locality.byFrames[frameID].ipc / max);
				output.percent[frameID].tlb =	(100 * data.locality.byFrames[frameID].tlb / max);
				output.percent[frameID].l1 =	(100 * data.locality.byFrames[frameID].l1 / max);
				output.percent[frameID].l2 =	(100 * data.locality.byFrames[frameID].l2 / max);
				output.percent[frameID].l3 =	(100 * data.locality.byFrames[frameID].l3 / max);
				output.percent[frameID].hpf =	(100 * data.locality.byFrames[frameID].hpf / max);
			}
		} else {
			if (simplified) {
				output.locality[frameID].ipc =	null;
				output.locality[frameID].miss =	null;
				
				output.percent[frameID].ipc =	0;
				output.percent[frameID].miss =	0;
				
			} else {
				output.locality[frameID].ipc =	null;
				output.locality[frameID].tlb =	null;
				output.locality[frameID].l1 =	null;
				output.locality[frameID].l2 =	null;
				output.locality[frameID].l3 =	null;
				output.locality[frameID].hpf =	null;
				
				output.percent[frameID].ipc =	0;
				output.percent[frameID].tlb =	0;
				output.percent[frameID].l1 =	0;
				output.percent[frameID].l2 =	0;
				output.percent[frameID].l3 =	0;
				output.percent[frameID].hpf =	0;
			}
		}
	}
}

/**
 * Add Locks
 */
function addLocks(output, id) {
	// Init vars
	var data = profiles[id].data;
	
	// Init return
	output.slocks	= [];
	output.flocks	= [];

	// List lock success
	data.lock_success.forEach(function(lock) {
		output.slocks.push(lock.t);
	});

	// List lock failure
	data.lock_failure.forEach(function(lock) {
		output.flocks.push(lock.t);
	});

	// Stats
	/*output.stats.locks = {
		ls:	data.stats.lock_success,
		lf:	data.stats.lock_failure,
		lr:	data.stats.lock_release,
		lw:	data.stats.lock_wait,
		lh:	data.stats.lock_hold
	};*/
}

/**
 * Add thread ticks
 */
function addThreadTicks(output, id, properties) {
	// Init vars
	var data = profiles[id].data;

	// Init output
	output.threads.ticks = {};
	
	// Add lists
	for (var h in data.events.threads) {
		output.threads.ticks[h] = {};
		
		properties.forEach(function(p) {
			output.threads.ticks[h][p] = data.events.threads[h][p];
		});
	}
}

/**
 * Add thread periods
 */
function addThreadPeriods(output, id, properties) {
	// Init vars
	var data = profiles[id].data;

	// Init output
	output.threads.periods = {};
	
	// Add lists
	for (var h in data.periods.threads) {
		output.threads.periods[h] = {};
		
		properties.forEach(function(p) {
			output.threads.periods[h][p] = data.periods.threads[h][p];
		});
	}
}

/**
 * Add dependencies (only locks at the moment)
 */
function addDependencies(output, id) {
	// Init vars
	var data = profiles[id].data;
	
	// Init return
	output.dependencies	= {
		ls: [],
		lf: [],
		locks: data.locks
	};

	// List lock success
	data.lock_success.forEach(function(lock) {
		if (lock.hl)
			output.dependencies.ls.push(lock);
	});

	// List lock failure
	data.lock_failure.forEach(function(lock) {
		output.dependencies.lf.push(lock);
	});

	// List lock release
	/*data.lock_failure.forEach(function(lock) {
		output.dependencies.lf.push(lock);
	});*/
}

/**
 * Add events (only parallel/sequential at the moment)
 */
function addEvents(output, id) {
	// Init vars
	var data = profiles[id].data;
	var previous_r = -1;
	
	// Init return
	output.events	= {
		q: {}
	};

	// List lock success
	for (var t in data.events.sequences) {
		if (data.events.sequences[t].c_r != previous_r) {
			output.events.q[t] = data.events.sequences[t].c_r;
			previous_r = data.events.sequences[t].c_r;
		}
	}
}

/**
 * Add threads informations
 */
function addThreadInfo(output, id, profile, properties) {
	// Init vars
	var data =	profiles[id].data;
	var isPN =	properties.indexOf('pn') >= 0;
	var isCT =	properties.indexOf('ct') >= 0;
	var isIPC =	properties.indexOf('ipc') >= 0;
	var isTLB =	properties.indexOf('tlb') >= 0;
	var isL1 =	properties.indexOf('l1') >= 0;
	var isL2 =	properties.indexOf('l2') >= 0;
	var isL3 =	properties.indexOf('l3') >= 0;
	var isHPF =	properties.indexOf('hpf') >= 0;
	
	// Add infos
	output.threads.info.forEach(function(thread) {
		if (isPN)	thread.pn = profile.label;
		if (isCT)	thread.ct = Math.round(data.threads.list[thread.h].ct * 100 / output.info.duration);
		if (isIPC)	thread.ipc = data.threads.list[thread.h].ipc;
		if (isTLB)	thread.tlb = data.threads.list[thread.h].tlb;
		if (isL1)	thread.l1 = data.threads.list[thread.h].l1;
		if (isL2)	thread.l2 = data.threads.list[thread.h].l2;
		if (isL3)	thread.l3 = data.threads.list[thread.h].l3;
		if (isHPF)	thread.hpf = data.threads.list[thread.h].hpf;
	});
}



/************************************************/
/* Functions - For each category				*/
/************************************************/
/**
 * Task granularity
 */
function jsonTG(profile, id) {
	var output = {};

	output.id = id;
	output.cat = 'tg';

	// Common
	profile.exportInfo(output);
	addCommon(output, id);
	
	// Add raw data for visualisation
	addRawData(output, id, ['b', 'i', 'm', 'r', 's', 'y'], ['b', 'i', 'r', 'y', 'sys'], ['m', 's'], null, false);

	// for potential parallelism
	addTimes(output, id, ['r', 'yb', 'i', 'sys']);

	// for context switches
	addSwitches(output, id);

	// for migrations
	addMigrations(output, id);

	// for lifetimes
	addThreadTicks(output, id, ['m']);
	addThreadPeriods(output, id, ['m']);

	return output;
}

/**
 * Synchronisation
 */
function jsonSY(profile, id) {
	var output = {};

	output.id = id;
	output.cat = 'sy';

	// Common
	profile.exportInfo(output);
	addCommon(output, id);
	
	// Add raw data for visualisation
	addRawData(output, id, ['r', 's', 'lf', 'ls', 'lw'], ['i', 'r', 'lw', 'sys'], ['lf', 'ls'], null, false);

	// Add locks
	addLocks(output, id);
	addTimes(output, id, ['r', 'lw', 'i', 'sys']);
	
	// Add ticks
	addThreadTicks(output, id, ['ls', 'lf']);
	
	// Add ticks
	addThreadPeriods(output, id, ['lw']);

	return output;
}

/**
 * Data sharing
 */
function jsonDS(profile, id) {
	var output = {};

	output.id = id;
	output.cat = 'ds';

	// Common
	profile.exportInfo(output);
	addCommon(output, id);
	
	// Add raw data for visualisation
	addRawData(output, id, ['r', 'i', 'lw', 'e', 'il1', 'il2'], ['i', 'r', 'lw', 'sys', 'e', 'ue', 'se', 'il1', 'il2'], null, ['e', 'il1', 'il2'], true);

	// Add locks
	addTimes(output, id, ['r', 'lw', 'i', 'sys']);

	// Add locality
	addLocality(output, id, false);

	return output;
}

/**
 * Load balancing
 */
function jsonLB(profile, id) {
	var output = {};

	output.id = id;
	output.cat = 'lb';

	// Common
	profile.exportInfo(output);
	addCommon(output, id);
	
	// Add raw data for visualisation
	addRawData(output, id, ['b', 'i', 'm', 'r', 'y', 'lf', 'ls', 'lw'], ['b', 'i', 'r', 'y', 'lw', 'sys'], ['m'], ['i'], false);

	// for migrations
	addMigrations(output, id);

	// Add times
	addTimes(output, id, ['r', 'yb', 'lw', 'i', 'sys']);

	// Add locks
	addLocks(output, id);
	
	// Add dependencies for locks
	addDependencies(output, id);
	
	// Add sequences
	addEvents(output, id);

	return output;
}

/**
 * Data locality
 */
function jsonDL(profile, id) {
	var output = {};

	output.id = id;
	output.cat = 'dl';

	// Common
	profile.exportInfo(output);
	addCommon(output, id);
	
	// Add raw data for visualisation
	addRawData(output, id, [], null, null, null, true);

	// Data
	addLocality(output, id, false);
	
	// Parallel coordinates
	addThreadInfo(output, id, profile, ['pn', 'ct', 'ipc', 'tlb', 'l1', 'l2', 'l3', 'hpf']);

	return output;
}

/**
 * Resource sharing
 */
function jsonRS(profile, id) {
	var output = {};

	output.id = id;
	output.cat = 'rs';

	// Common
	profile.exportInfo(output);
	addCommon(output, id);
	
	// Add raw data for visualisation
	addRawData(output, id, ['lf', 'ls', 'e', 'il1', 'il2'], ['e', 'ue', 'se', 'il1', 'il2'], ['lf', 'ls'], ['e', 'il1', 'il2'], true);

	// Add locks
	addLocks(output, id);
	
	// Data locality
	addLocality(output, id, false);

	return output;
}

/**
 * Input / Outp
 */
function jsonIO(profile, id) {
	var output = {};

	output.id = id;
	output.cat = 'io';

	// Common
	profile.exportInfo(output);
	addCommon(output, id);

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
	if (cat != 'tg' && cat != 'sy' && cat != 'ds' && cat != 'lb' && cat != 'dl' && cat != 'rs' && cat != 'io') {
		response.send("Illegal category");
		return;
	} else if (ids.length == 0 || ids.length > 4) {
		response.send("Illegal number of identifiers");
		return;
	} else {
		var issueFound = false;
		ids.forEach(function(id) {
			issueFound = issueFound || isNaN(id) || ! profiles.hasOwnProperty(id);
		});
		if (issueFound) {
			response.send("Illegal identifiers");
			return;
		}
	}

	// Compute
	var output = { c: {} };
	var profile;
	ids.forEach(function(id) {
		profile = profiles[id];

		// Load data
		profile.loadData();

		// Result
		switch(cat) {
			case 'tg':	output[id] = jsonTG(profile, id); break;
			case 'sy':	output[id] = jsonSY(profile, id); break;
			case 'ds':	output[id] = jsonDS(profile, id); break;
			case 'lb':	output[id] = jsonLB(profile, id); break;
			case 'dl':	output[id] = jsonDL(profile, id); break;
			case 'rs':	output[id] = jsonRS(profile, id); break;
			case 'io':	output[id] = jsonIO(profile, id); break;
		}

		// Comon result
		output.c.timeMin = Math.min(output[id].info.timeMin, output.c.timeMin | 0);
		output.c.timeMax = Math.max(output[id].info.timeMax, output.c.timeMax | 0);
		output.c.duration = Math.max(output[id].info.duration, output.c.duration | 0);

		// Unload data
		profile.unloadData();
	});
	response.json(output);
});

module.exports = router;
