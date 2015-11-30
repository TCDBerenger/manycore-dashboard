/* global app */

app.factory('colours', [function() {
	var list = {
		black:		'#000000',		white:		'#FFFFFF',
		dGrey:		'#797979',		eGrey:		'#ABABAB',		lGrey:		'#DEDEDE',
		dBlue:		'#4682B4',		eBlue:		'#9ED3FF',		lBlue:		'#D0E0ED',
		dGreen:		'#4BB446',		eGreen:		'#8DD28A',		lGreen:		'#D2EDD0',
		dRed:		'#B4464B',		eRed:		'#D28A8D',		lRed:		'#EDD0D2',
		dOrange:	'#B47846',		eOrange:	'#D2AB8A',		lOrange:	'#EDDDD0',
		dMagenta:	'#AF46B4',		eMagenta:	'#CE8AD2',		lMagenta:	'#ECD0ED',
		dViolet:	'#7846B4',		eViolet:	'#AB8AD2',		lViolet:	'#DDD0ED',
		dYellow:	'#b4a646',		eYellow:	'#D2C88A',		lYellow:	'#EDE9D0',
		dTurquoise:	'#5EB8C0',		eTurquoise:	'#9ad3d8',		lTurquoise:	'#d7edef',
		dFuschia:	'#812559',		eFuschia:	'#cf589b',		lFuschia:	'#ecbcd7',
	};

	return {
		unkn:	list.black,		// unkown color
		base:	list.dGrey,		// generic color
		plus:	list.eBlue,		// plus, capacity, more possible
		good:	list.eGreen,	// correctly running
		bad:	list.eRed,		// Not expected
		alt:	list.eViolet,	// alternating
		list:	list
	};
}]);


app.factory('facets', ['colours', function(colours) {
	/*  DESCRIPTIONS TO MOVE INTO LEGENDS AND DELETE HERE  */
	var desc_r = 'thread is actively executing';
	var desc_y = 'thread is ready to run but is is waiting for a core to become available';
	var desc_b = 'thread is ready to execute and is on standby to be executed';
	var desc_w = 'threads are not ready to be processed because they waiting ressource(s)';
	var desc_lw = 'threads are not ready to be processed because they waiting to acquire a lock';
	var desc_i = 'no thread running on core';
	var desc_sys = 'processor is used by the OS';
	var desc_miss = 'time spent on locality misses';
	var desc_s = 'cores switching from one thread to another';
	var desc_m = 'thread migrates to another core';
	var desc_ls = 'number of lock acquisition success';
	var desc_lf = 'number of lock acquisition failure';
	var desc_q_s = 'core is idle or execute only one thread sequentially';
	var desc_q_p = 'core executing more than one thread in parallel';

	/*  TO REMOVE:
		- title	==> merge into label and move to legend
		- desc	==> move to legend
	*/
	
	return {
		h:		{ label: 'Thread',			unity: '',	cat: '',	attr: 'h',	color: colours.list.eGrey,	fcolor: colours.list.dGrey,	gcolor: colours.list.lGrey },
		pn:		{ label: 'Process',			unity: '',	cat: '',	attr: 'pn',	color: colours.list.eGrey,	fcolor: colours.list.dGrey,	gcolor: colours.list.lGrey },
		ct:		{ label: 'Core time',		unity: '',	cat: '',	attr: 'ct',	color: colours.list.eGrey,	fcolor: colours.list.dGrey,	gcolor: colours.list.lGrey },
		
		r:		{ label: 'executing',		title: 'Thread executing',				desc: desc_r,	unity: 'ms',	cat: 'times',	attr: 'r',		color: colours.list.eGreen,		fcolor: colours.list.dGreen,	gcolor: colours.list.lGreen },
		y:	 	{ label: 'ready',			title: 'Thread ready to run',			desc: desc_y,	unity: 'ms',	cat: 'times',	attr: 'y',		color: colours.list.eRed,		fcolor: colours.list.dRed,		gcolor: colours.list.lRed },
		b:	 	{ label: 'standby',			title: 'Thread on standby to execute',	desc: desc_b,	unity: 'ms',	cat: 'times',	attr: 'b',		color: colours.list.eRed,		fcolor: colours.list.dRed,		gcolor: colours.list.lRed },
		yb: 	{ label: 'ready',			title: 'Thread ready to execute',		desc: desc_y,	unity: 'ms',	cat: 'times',	attr: 'yb',		color: colours.list.eRed,		fcolor: colours.list.dRed,		gcolor: colours.list.lRed },
		w: 		{ label: 'waiting',			title: 'Waiting',						desc: desc_w,	unity: 'ms',	cat: 'times',	attr: 'w',		color: colours.list.eOrange,	fcolor: colours.list.dOrange,	gcolor: colours.list.lOrange },
		lw:		{ label: 'lock waiting',	title: 'Thread waiting for lock',		desc: desc_lw,	unity: 'ms',	cat: 'times',	attr: 'lw',		color: colours.list.eYellow,	fcolor: colours.list.dYellow,	gcolor: colours.list.lYellow },
		uu: 	{ label: 'idle core',		title: 'Core is idle',					desc: desc_i,	unity: 'ms',	cat: 'times',	attr: 'uu',		color: colours.list.eBlue,		fcolor: colours.list.dBlue,		gcolor: colours.list.lBlue },
		i: 		{ label: 'Idle core',		unity: 'ms',	cat: 'times',	attr: 'i',		color: colours.list.eBlue,		fcolor: colours.list.dBlue,		gcolor: colours.list.lBlue },
		sys: 	{ label: 'system',			title: 'Core occupied by other program',desc: desc_sys,	unity: 'ms',	cat: 'times',	attr: 'sys',	color: colours.list.white,		fcolor: colours.list.lGrey,		gcolor: colours.list.white },
	
		ipc:	{ label: 'Executing',			unity: '',	cat: 'locality',	attr: 'ipc',	color: colours.list.eGreen,		fcolor: colours.list.dGreen,	gcolor: colours.list.lGreen },
		miss:	{ label: 'Cache misses',		unity: '',	cat: 'locality',	attr: 'miss',	color: colours.list.eOrange,	fcolor: colours.list.dOrange,	gcolor: colours.list.lOrange },
		tlb:	{ label: 'Address translation',	unity: '',	cat: 'locality',	attr: 'tlb',	color: colours.list.lGrey },
		l1:		{ label: 'Loading from L2',		unity: '',	cat: 'locality',	attr: 'l1',		color: colours.list.lOrange },
		l2:		{ label: 'Loading from L3',		unity: '',	cat: 'locality',	attr: 'l2',		color: colours.list.eOrange },
		l3:		{ label: 'Loading from RAM',	unity: '',	cat: 'locality',	attr: 'l3',		color: colours.list.dOrange },
		hpf:	{ label: 'Swapping',			unity: '',	cat: 'locality',	attr: 'hpf',	color: colours.list.black },
		
		s:		{ label: 'switches',		title: 'Context switches',			desc: desc_s,	list: 'switches',	unity: 'events',	cat: 'switches',	attr: 's',		color: colours.list.eGrey,		fcolor: colours.list.dGrey,		gcolor: colours.list.lGrey },
		m:		{ label: 'migrations',		title: 'Thread migrations',			desc: desc_m,	list: 'migrations',	unity: 'events',	cat: 'migrations',	attr: 'm',		color: colours.list.eViolet,	fcolor: colours.list.dViolet,	gcolor: colours.list.lViolet },
		ls:		{ label: 'lock success',	title: 'Lock without contention',	desc: desc_ls,	list: 'slocks',		unity: 'events',	cat: 'locks',		attr: 'ls',		color: colours.list.eTurquoise,	fcolor: colours.list.dTurquoise,gcolor: colours.list.lTurquoise },
		lf:		{ label: 'lock failure',	title: 'Lock with contention',		desc: desc_lf,	list: 'flocks',		unity: 'events',	cat: 'locks',		attr: 'lf',		color: colours.list.eFuschia,	fcolor: colours.list.dFuschia,	gcolor: colours.list.lFuschia },
		
		q_s:	{ label: 'sequential',		title: 'Sequential sequence',	desc: desc_q_s,	unity: '', cat: '', attr: '',	color: colours.list.eOrange,	fcolor: colours.list.dOrange,	gcolor: colours.list.lOrange },
		q_p:	{ label: 'parallel',		title: 'Parallel sequence',		desc: desc_q_p,	unity: '', cat: '', attr: '',	color: colours.list.eGreen,		fcolor: colours.list.dGreen,	gcolor: colours.list.lGreen },
	};
}]);

app.factory('decks', ['facets', 'colours', function(facets, colours) {

	function n2ft(v) {
		switch(v) {
			case 0.25:	return '¼';
			case 0.5:	return '½';
			case 0.75:	return '¾';
			default:	return v + '×';
		}
	}
	function n2p(v) {
		return (Math.round(v * 1000) / 10) + ' %';
	}
	function n2fp(v) {
		switch(v) {
			case 0.25:	return '¼';
			case 0.5:	return '½';
			case 0.75:	return '¾';
			default:	return (v * 100) + ' %';
		}
	}
	
	function buildThreads(profile) {
		var begin = profile.currentData.info.timeMin;
		var end = profile.currentData.info.duration;
		var lines = [];
		profile.currentData.threads.info.forEach(function(thread) {
			lines.push({
				id: thread.h,
				l: thread.h,
				s: Math.max(thread.s, begin),
				e: (thread.e) ? Math.min(thread.e, end) : end
			});
		});
		return lines;
	}
	function buildThreadsForDP(profile) {
		if (profile.id == 21)
			return [
				{ id: 11936,	l: 'φ 1',	s:1,	e:1023},	// 5 2
				{ id: 18964,	l: 'φ 2',	s:0,	e:512},		// 2 1
				{ id: 18596,	l: 'φ 3',	s:1,	e:1028},	// 1 3
				{ id: 18012,	l: 'φ 4',	s:1,	e:509},		// 3 4
				{ id: 8020,		l: 'φ 5',	s:1,	e:1529},	// 4 5
			];
		else if (profile.id == 22)
			return [
				{ id: 9448,		l: 'φ 1',	s:9,	e:1055},	// 45 02
				{ id: 11740,	l: 'φ 2',	s:0,	e:540},		// 01 02
				{ id: 12748,	l: 'φ 3',	s:1,	e:1061},	// 01 03
				{ id: 18188,	l: 'φ 4',	s:1,	e:513},		// 03 04
				{ id: 4304,		l: 'φ 5',	s:1,	e:1090},	// 04 05
				{ id: 16232,	l: 'φ 6',	s:1,	e:576},		// 05 06
				{ id: 10008,	l: 'φ 7',	s:1,	e:1095},	// 06 07
				{ id: 7920,		l: 'φ 8',	s:1,	e:518},		// 07 08
				{ id: 16172,	l: 'φ 9',	s:2,	e:1165},	// 08 09
				{ id: 2692,		l: 'φ 10',	s:2,	e:621},		// 09 10
				{ id: 19948,	l: 'φ 11',	s:2,	e:1146},	// 10 11
				{ id: 15944,	l: 'φ 12',	s:2,	e:529},		// 11 12
				{ id: 6964,		l: 'φ 13',	s:3,	e:1103},	// 12 13
				{ id: 17064,	l: 'φ 14',	s:3,	e:590},		// 13 14
				{ id: 12780,	l: 'φ 15',	s:3,	e:1110},	// 14 15
				{ id: 5472,		l: 'φ 16',	s:3,	e:534},		// 15 16
				{ id: 19964,	l: 'φ 17',	s:3,	e:1183},	// 16 17
				{ id: 16464,	l: 'φ 18',	s:3,	e:647},		// 17 18
				{ id: 8344,		l: 'φ 19',	s:4,	e:1194},	// 18 19
				{ id: 9164,		l: 'φ 20',	s:4,	e:593},		// 19 20
				{ id: 6060,		l: 'φ 21',	s:4,	e:1116},	// 20 21
				{ id: 8208,		l: 'φ 22',	s:4,	e:546},		// 21 22
				{ id: 3232,		l: 'φ 23',	s:4,	e:1133},	// 22 23
				{ id: 13484,	l: 'φ 24',	s:4,	e:599},		// 23 24
				{ id: 19940,	l: 'φ 25',	s:5,	e:1188},	// 24 25
				{ id: 19828,	l: 'φ 26',	s:5,	e:552},		// 25 26
				{ id: 5500,		l: 'φ 27',	s:5,	e:1177},	// 26 27
				{ id: 10608,	l: 'φ 28',	s:5,	e:627},		// 27 28
				{ id: 8600,		l: 'φ 29',	s:5,	e:1152},	// 28 29
				{ id: 13088,	l: 'φ 30',	s:5,	e:558},		// 29 30
				{ id: 22092,	l: 'φ 31',	s:6,	e:1121},	// 30 31
				{ id: 14260,	l: 'φ 32',	s:6,	e:606},		// 31 32
				{ id: 2320,		l: 'φ 33',	s:6,	e:1127},	// 32 33
				{ id: 12608,	l: 'φ 34',	s:6,	e:564},		// 33 34
				{ id: 6272,		l: 'φ 35',	s:7,	e:1171},	// 34 35
				{ id: 9616,		l: 'φ 36',	s:7,	e:641},		// 35 36
				{ id: 20644,	l: 'φ 37',	s:7,	e:1201},	// 36 37
				{ id: 18556,	l: 'φ 38',	s:7,	e:570},		// 37 38
				{ id: 5780,		l: 'φ 39',	s:8,	e:1140},	// 38 39
				{ id: 20176,	l: 'φ 40',	s:8,	e:615},		// 39 40
				{ id: 5756,		l: 'φ 41',	s:8,	e:1158},	// 40 41
				{ id: 5256,		l: 'φ 42',	s:8,	e:634},		// 41 42
				{ id: 19564,	l: 'φ 43',	s:8,	e:1207},	// 42 43
				{ id: 6028,		l: 'φ 44',	s:9,	e:583},		// 43 44
				{ id: 14012,	l: 'φ 45',	s:9,	e:1567},	// 44 45
			];
		else
			return buildThreads(profile);
	}
	function buildCores(profile) {
		var begin = profile.currentData.info.timeMin;
		var end = profile.currentData.info.duration;
		var lines = [];
		for (var l = 0; l < profile.hardware.data.threads; l++)
			lines.push({ id: l, l: 'core ' + l, s: begin, e: end });
		return lines;
	}
	function buildCoresAnonymously(profile) {
		var begin = profile.currentData.info.timeMin;
		var end = profile.currentData.info.duration;
		var lines = [];
		for (var l = 0; l < profile.hardware.data.threads; l++)
			lines.push({ id: l, l: 'core', s: begin, e: end });
		return lines;
	}

	var limit = 	{ color: colours.list.eGrey, fcolor: colours.list.dGrey, gcolor: colours.list.lGrey };
	var text = 		{ color: colours.list.black, fcolor: colours.list.black, gcolor: colours.list.black };
	
	// Texts on axis
	var a_threads =		JSON.parse(JSON.stringify(limit));
	a_threads.title =	'Threads';
	a_threads.desc =	'vertical list of thread\'s identifier';
	var a_uu =		JSON.parse(JSON.stringify(facets.uu));
	a_uu.title =	'CPU';
	a_uu.desc =		'capacity of thread executing by the cores';
	var a_cores =	JSON.parse(JSON.stringify(text));
	a_cores.title =	'cores';
	a_cores.desc =	'below CPU it represents core capacity, above CPU it is in equivalent core';

	// Fruit salad
	var m =		JSON.parse(JSON.stringify(facets.m));
	m.colors = ['#b6e3bc', '#b6e3da', '#b6cee3', '#bcb6e3', '#dab6e3', '#e3b6ce', '#e3bcb6', '#e3dab6'];

	return {
		cacheMisses: {
			graph: {
				v:		[facets.hpf, facets.l3, facets.l2, facets.l1, facets.tlb, facets.ipc],
				limit:	limit
			},
			data: {
				stats: [facets.ipc, facets.tlb, facets.l1, facets.l2, facets.l3, facets.hpf],
				focus: [facets.ipc, facets.tlb, facets.l1, facets.l2, facets.l3, facets.hpf],
				statsFocusable: true, //'amount'
				time: 'step'
			},
			focus: [facets.ipc, facets.tlb, facets.l1, facets.l2, facets.l3, facets.hpf],
			legend: {
				axis: [
					{ b: '%', t: '[Y] Percent',	d: 'ratio of time spent on locality misses compared to time spent on executing', c: colours.list.eGrey}
				],
				data: [
					{ b: '▮', f: facets.ipc,	d: 'instructions per clock cycle' },
					{ b: '▮', f: facets.tlb,	d: 'address translation (TLB) misses' },
					{ b: '▮', f: facets.l1,		d: 'level 1 cache miss, loading data from L2 cache' },
					{ b: '▮', f: facets.l2,		d: 'level 2 cache miss, loading data from L3 cache' },
					{ b: '▮', f: facets.l3,		d: 'level 3 cache miss, loading data from RAM' },
					{ b: '▮', f: facets.hpf,	d: 'hard page faults, swapping to disk' }
				]
			},
			clues: [],
			settings: []
		},
		coreIdle: {
			graph : {
				h:			limit,		// threads (color)
				lines:		buildCores,
				melody:		facets.uu,
				melody_cat:	'cores',
			},
			data : [facets.uu],
			legend: {
				axis: [
					{ b: '⊢', f: limit,	t: '[Y] Cores',	d: 'each line represents a core' }
				],
				data: [
					{ b: '▮', t: 'Idle', d: 'time spend by the core waiting a thread to run (other processes are considered as idle time)',	 c: colours.list.eGrey }
				]
			},
			clues: [],
			settings: [
				{ property: 'melodyHeight', value: 9, type: 'range', label: 'Inactivity height', unit: 'pixels', min: 6, max: 12, step: 1 }
			]
		},
		lockContentions: {
			graph : {
				v:		[facets.sys, facets.i, facets.r, facets.lw],
				limit:	facets.i,
				axis:	{ labels: 'cores' }
			},
			data : [facets.r, facets.uu, facets.lw],
			focus: [facets.sys, facets.i, facets.r, facets.lw],
			legend: {
				axis: [
					{ b: '┄', t: '[Y] Core capacity',	d: 'capacity of the CPU',					c: colours.list.dBlue },
					{ b: '-', t: '[Y] Core capacity',	d: 'part of the CPU or equivalent portion', c: colours.list.eGrey },
				],
				data: [
					{ b: '▮', f: facets.lw },
					{ b: '▮', f: facets.r },
					{ b: '▯', f: facets.sys,	d: 'core occupied by other program',	 c: colours.list.black }
				]
			},
			clues: [],
			settings: [
				{ property: 'crenellate', value: false, type: 'flag', label: 'Round by core', desc: 'average of core activity among thread states' }
			]
		},
		lockCounts: {
			graph : {
				v:			[facets.ls, facets.lf],
				limit:		limit,
				limitLabel:	'calib.',
				expected:	function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * (profile.hardware.calibration.ls + profile.hardware.calibration.lf); },
				displayed:	function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * (profile.hardware.calibration.ls + profile.hardware.calibration.lf) * 2; },
				vStep:		function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * (profile.hardware.calibration.ls + profile.hardware.calibration.lf); }
			},
			data : [facets.ls, facets.lf],
			focus: [facets.ls, facets.lf],
			legend: {
				axis: [
					{ b: '┄', t: '[Y] Core capacity',	d: 'capacity of the CPU',					f: limit },
					{ b: '-', t: '[Y] Core capacity',	d: 'part of the CPU or equivalent portion', f: limit },
				],
				data: [
					{ b: '▮', t: 'Lock with contention',	d: 'number failure of lock acquisition',	f: facets.lf },
					{ b: '▮', t: 'Lock without contention',	d: 'number success of lock acquisition',	f: facets.ls }
				]
			},
			clues: [],
			settings: [
				{ property: 'timeGroup', value: 50, type: 'range', label: 'Group by', unit: 'ms', min: 10, max: 50, step: 10 }
			]
		},
		threadMigrations: {
			graph : {
				v:		[facets.m],
				limit:		limit,
				limitLabel:	'calib.',
				expected:	function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * profile.hardware.calibration.m; },
				displayed:	function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * profile.hardware.calibration.m * 2; },
				vStep:		function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * profile.hardware.calibration.m; }
			},
			data : [facets.m],
			focus: [facets.m],
			legend: {
				axis: [
					{ b: '┄', t: '[Y] Calibration',	d: 'typical level of thread migrations', c: colours.list.eGrey}
				],
				data: [
					{ b: '▮', f: facets.m }
				]
			},
			clues: [
				{ c: colours.base,	t: 'Thread migrations',							d: 'too many migrations' },
				{ c: colours.base,	t: 'Alternating sequential/parallel execution',	d: 'alternating period of high and low thread migrations' }
			],
			settings: [
				{ property: 'timeGroup', value: 50, type: 'range', label: 'Group by', unit: 'ms', min: 10, max: 50, step: 10 }
			]
		},
		threadSwitches: {
			graph : {
				v:			[facets.s],
				limit:		limit,
				limitLabel:	'calib.',
				expected:	function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * profile.hardware.calibration.s; },
				displayed:	function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * profile.hardware.calibration.s * 2; },
				vStep:		function(profile, timeGroup) { return timeGroup * profile.hardware.data.threads * profile.hardware.calibration.s; }
			},
			data : [facets.s],
			focus: [facets.s],
			legend: {
				axis: [
					{ b: '┄', t: '[Y] Calibration',	d: 'typical level of context switches', c: colours.list.eGrey}
				],
				data: [
					{ b: '▮', f: facets.s }
				]
			},
			clues: [
				{ c: colours.base,	t: 'Oversubscription',	d: 'high frequency' }
			],
			settings: [
				{ property: 'timeGroup', value: 50, type: 'range', label: 'Group by', unit: 'ms', min: 10, max: 50, step: 10 }
			]
		},
		threadStates: {
			graph : {
				v:		[facets.sys, facets.i, facets.r, facets.yb],
				limit:	facets.i,
				axis:	{ labels: 'cores' }
			},
			data : [facets.r, facets.i, facets.y, facets.b],
			focus: [facets.sys, facets.i, facets.r, facets.yb],
			legend: {
				axis: [
					{ b: '┄', t: '[Y] Core capacity',	d: 'capacity of the CPU',					c: colours.list.dBlue },
					{ b: '-', t: '[Y] Core capacity',	d: 'part of the CPU or equivalent portion', c: colours.list.eGrey },
				],
				data: [
					{ b: '▮', f: facets.yb },
					{ b: '▮', f: facets.r },
					{ b: '▯', f: facets.sys,	d: 'core occupied by other program',	 c: colours.list.black }
				]
			},
			texts : [a_uu, a_cores],
			clues: [
				{ c: colours.bad,	t: 'Oversubscription', 			d: 'too many threads' },
				{ c: colours.bad,	t: 'Thread migrations', 		d: 'too many threads' },
				{ c: colours.bad,	t: 'Bad thread to core ratio', 	d: 'too many threads' },
				{ c: colours.plus,	t: 'Underscubscription', 		d: 'not enough threads' }
			],
			settings: [
			]
		},
		
		
		
		migrationLT: {
			graph : {
				h:			limit,		// threads (color)
				ticks:		[facets.m],
				periods:	[m],
			},
			data : [facets.m],
			legend: {
				axis: [
					{ b: '⊢', f: limit,	t: '[Y] Threads',	d: 'each line represents a thread complying with the start and end times' }
				],
				data: [
					{ b: '|', f: facets.m },
					{ b: '◧', t: 'Cores', d: 'core to which a thread is attached to (one color by core)',	 c: colours.list.eGrey }
				]
			},
			texts: [a_threads],
			clues: [
				{ c: colours.unkn,	t: 'Task start/stop overhead',	d: 'too many creations' },
				{ c: colours.alt,	t: 'Oversubscription',			d: 'too many threads' },
				{ c: colours.base,	t: 'Thread migrations',			d: 'too many threads' },
				{ c: colours.alt,	t: 'Thread migrations',			d: 'too many migrations' },
				{ c: colours.unkn,	t: 'Task start/stop overhead',	d: 'too short lifetime' }
			],
			modes: [
				{ id: 1, label: 'rate' },
				{ id: 2, label: 'events' },
				{ id: 3, label: 'affinity' }
			],
			settings: [
				{ property: 'disableTicks', value: false, type: 'flag', label: 'Disable ticks' },
				{ property: 'groupTicks', value: false, type: 'flag', label: 'Group ticks' },
				{ property: 'timeGroup', value: 50, type: 'range', label: 'Group by', unit: 'ms', min: 10, max: 50, step: 10, depends: ['groupTicks', true] },
				{ property: 'disablePeriods', value: true, type: 'flag', label: 'Disable fruit salad' },
			]
		},
		lockLT: {
			graph : {
				h:	limit,		// threads (color)
				ticks:		[facets.ls, facets.lf],
				periods:	[facets.lw],
			},
			data : [facets.lw],
			legend: {
				axis: [
					{ b: '⊢', f: limit,	t: '[Y] Threads',	d: 'each line represents a thread complying with the start and end times' }
				],
				data: [
					{ b: '▮', t: 'Lock with contention',		d: 'failure of lock acquisition',	f: facets.lf },
					{ b: '▮', t: 'Lock without  contention',	d: 'success of lock acquisition',	f: facets.ls },
					{ b: '▬', f: facets.lw }
				]
			},
			clues: [],
			settings: [
				{ property: 'disableTicks', value: false, type: 'flag', label: 'Disable ticks' },
				{ property: 'disablePeriods', value: false, type: 'flag', label: 'Disable periods' }
			]
		},
		sequences: {
			graph : {
				h:			limit,		// threads (color)
				lines:		buildCoresAnonymously,
				sequences:	{ under: facets.q_s, count: facets.q_p }
			},
			data : [],
			legend: {
				axis: [
					{ b: '⊢', f: limit,	t: '[Y] Cores',	d: 'each line represents a core, not in the right order, not with the right thread' }
				],
				data: [
					{ b: '─', t: 'Sequential line',			d: 'core is idle (sequential sequence)',		f: facets.q_s },
					{ b: '▮', t: 'Sequential executing',	d: 'one core only is executing a thread',		f: facets.q_s },
					{ b: '─', t: 'Parallel line',			d: 'core is idle (parallel sequence)',			f: facets.q_p },
					{ b: '▮', t: 'Parallel executing',		d: 'more than one core is executing a thread',	f: facets.q_p }
				]
			},
			clues: [],
			params: [
				{ property: 'lineHeight', value: 10 }
			],
			settings: [
				{ property: 'disableLine', value: false, type: 'flag', label: 'Core line', desc: 'hide core line' },
				{ property: 'disableSequenceDashs', value: false, type: 'flag', label: 'Core executing', desc: 'hide core executing' },
				{ property: 'disableSequenceBackgound', value: false, type: 'flag', label: 'Parallel sequences', desc: 'hide backgound sequences (parallel/sequential)' },
				{ property: 'sequenceThreshold', value: 1, type: 'range', label: 'Parallel threshold', unit: 'running threads', min: 0, max: 3, step: 1 },
			]
		},
		chains: {
			graph : {
				h:			limit,		// color
				lines:		buildThreads,
				linesHack:	buildThreadsForDP,
				depends:	{
					list: 'locks',
					failure: facets.lf,
					working: facets.ls,
					
					start: facets.ls,
					end: facets.lf,
					color: facets.lw,
					from: 'hl',
					to: 'h',
					failID: 0
				}
			},
			legend: {
				axis: [
					{ b: '⊢', f: limit,	t: '[Y] Threads',	d: 'each line represents a thread complying with the start and end times' },
				],
				data: [
					{ b: '×', f: facets.lf,									d: 'attempt to acquire a lock' },
					{ b: '¦', f: facets.lf,									d: 'indicating which thread hold the lock' },
					{ b: '|', f: facets.ls,	t: 'Lock acquire or release',	d: '', 								c: colours.list.dTurquoise},
					{ b: '▰', f: facets.ls,	t: 'Lock hold',					d: '' },
				]
			},
			data : [facets.ls, facets.lf],
			clues: [],
			settings: [
				{ property: 'hackLineProvider', value: true, type: 'flag', label: 'Data provider', desc: 'use a hack for dinner philosopher problems' },
			]
		},
		pCoordDL: {
			graph : {
				h:		limit,
				plots:	[facets.pn, facets.h, facets.ct, facets.ipc, facets.tlb, facets.l1, facets.l2, facets.l3, facets.hpf]
			},
			legend: {
				axis: [
				],
				data: [
				],
				options: { disablePrelist: true }
			},
			clues: [],
			settings: [
				{ property: 'colorMode', value: 0, type: 'select', label: 'Color by', choices: ['good↔poor locality', 'process', 'thread'] },
				{ property: 'colorThreshold', value: 20, type: 'range', label: 'Locality threshold', unit: '%', min: 5, max: 95, step: 5, depends: ['colorMode', 0] },
			]
		}
	};
}]);


app.factory('widgets', ['decks', function(decks) {
	var i = 0;
	function id() { return ++i; }
	
	return {
		cacheBreackdown:	{ id: id(),	v: 3, file: 'chart-d3-pcoords',	deck: decks.pCoordDL,			wide: true,		title: 'Breackdown of time spent on locality misses',				desc: ''},
		cacheInvalid:		{ id: id(),	v: 3, file: 'chart-todo',		deck: null,						wide: false,	title: 'Cache misses from updating shared data',					desc: ''},
		cacheMisses:		{ id: id(),	v: 3, file: 'chart-percent',	deck: decks.cacheMisses,		wide: false,	title: 'Percentage of time spent on locality misses',				desc: ''},
		coreIdle:			{ id: id(),	v: 3, file: 'chart-lines',		deck: decks.coreIdle,			wide: false,	title: 'Idle cores',												desc: 'Times that cores are idle'},
		coreSequences:		{ id: id(),	v: 3, file: 'chart-lines',		deck: decks.sequences,			wide: false,	title: 'Single thread execution phases',							desc: 'alternating sequential/parallel execution'},
		lockCounts:			{ id: id(),	v: 4, file: 'chart-units',		deck: decks.lockCounts,			wide: false,	title: 'Lock contentions',											desc: 'Locking with and without contention'},
		lockContentions:	{ id: id(),	v: 4, file: 'chart-percent',	deck: decks.lockContentions,	wide: false,	title: 'Time waiting for a lock',									desc: ''},
		threadChains:		{ id: id(),	v: 4, file: 'chart-lines',		deck: decks.chains,				wide: false,	title: 'Chains of dependencies on locks',							desc: 'synchronisations and waiting between threads'},
		threadFruitSalad:	{ id: id(),	v: 3, file: 'chart-threads',	deck: decks.migrationLT,		wide: false,	title: 'Migrations by thread',										desc: 'creation, running, moving between cores, termination'},
		threadLocks:		{ id: id(),	v: 4, file: 'chart-threads',	deck: decks.lockLT,				wide: false,	title: 'Time each thread spends waiting for locks',					desc: ''},
		threadStates:		{ id: id(),	v: 3, file: 'chart-percent',	deck: decks.threadStates,		wide: false,	title: 'Breakdown of thread states compared to number of cores',	desc: 'number of threads compared to number of cores'},
		threadMigrations:	{ id: id(),	v: 3, file: 'chart-units',		deck: decks.threadMigrations,	wide: false,	title: 'Rate of thread migrations',									desc: 'thread switching the core on which it is executing'},
		threadSwitches:		{ id: id(),	v: 3, file: 'chart-units',		deck: decks.threadSwitches,		wide: false,	title: 'Core swhitching the thread it is executing',				desc: 'thread switches'},
	};
}]);


app.factory('strips', ['facets', function(facets) {
	return {
		r:		{ title: 'Running',				facet: facets.r,	reverse: false },
		uu:		{ title: 'Unused cores',		facet: facets.uu,	reverse: true },
		yb:		{ title: 'Waiting a core',		facet: facets.yb,	reverse: false },
		lw:		{ title: 'Waiting a ressource',	facet: facets.lw,	reverse: false },
		miss:	{ title: 'Cache misses',		facet: facets.miss,	reverse: false }
	};
}]);


app.factory('categories', ['widgets', 'strips', 'facets',  function(widgets, strips, facets) {
	var yb =	JSON.parse(JSON.stringify(facets.yb));
	var lw =	JSON.parse(JSON.stringify(facets.lw));
	var miss =	JSON.parse(JSON.stringify(facets.miss));
	
	yb.shift = true;
	lw.shift = true;
	miss.shift = true;
	
	var common = {
		label: 'Profile', title: 'Profile', icon: 'heartbeat',
		strips: [strips.r],
		gauges: []
	};
	var tg = {
		tag: 'tg', cat: 'tg', label: 'Task granularity', title: 'Task granularity', icon: 'tasks', enabled: true,
		strips: [strips.yb, strips.uu],
		gauges: [[yb, facets.uu], [facets.s, facets.m]], /* facets.r, */
		widgets: [widgets.threadStates, widgets.threadSwitches, widgets.threadMigrations, widgets.threadFruitSalad]
	};
	var sy = {
		tag: 'sy', cat: 'sy', label: 'Synchronisation', title: 'Synchronisation', icon: 'cutlery', enabled: true,
		strips: [strips.lw],
		gauges: [[lw], [facets.ls, facets.lf]],
		widgets: [widgets.lockCounts, widgets.lockContentions, widgets.threadLocks]
	};
	var ds = {
		tag: 'ds', cat: 'ds', label: 'Data sharing', title: 'Data sharing', icon: 'share-alt', enabled: true,
		strips: [],
		gauges: [[lw, miss]],
		widgets: [widgets.lockContentions, widgets.cacheInvalid, widgets.cacheMisses]
	};
	var lb = {
		tag: 'lb', cat: 'lb', label: 'Load balancing', title: 'Load balancing', icon: 'code-fork', enabled: true,
		strips: [],
		gauges: [[lw, facets.uu], [facets.m]],
		widgets: [widgets.coreIdle, widgets.lockContentions, widgets.threadMigrations, widgets.threadStates, widgets.coreSequences, widgets.threadChains]
	};
	var dl = {
		tag: 'dl', cat: 'dl', label: 'Data locality', title: 'Data locality', icon: 'location-arrow', enabled: true,
		strips: [strips.miss],
		gauges: [[miss]], /* facets.ipc, */
		widgets: [widgets.cacheMisses, widgets.cacheBreackdown]
	};
	var rs = {
		tag: 'rs', cat: 'rs', label: 'Resource sharing', title: 'Resource sharing', icon: 'exchange', enabled: true,
		strips: [],
		gauges: [],
		widgets: [widgets.lockCounts, widgets.cacheMisses]
	};
	var io = {
		tag: 'io', cat: 'io', label: 'Input/Output', title: 'Input/Output', icon: 'plug', enabled: false,
		strips: [],
		gauges: [],
		widgets: []
	};

	var output = {
		all: [tg, sy, ds, lb, dl, rs, io],
		tg: tg, sy: sy, ds: ds, lb: lb, dl: dl, rs: rs, io: io, common: common
	};
	
	return output;
}]);