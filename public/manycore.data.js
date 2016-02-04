/* global app */

app.factory('colours', [function() {
	// Gradient:
	//	[O] opaque	→ [D] dark			→ [N] normal	→ [F] faded			→ [L] light
	var list = {
		black:		'#000000',		white:		'#FFFFFF',
		dViolet:	'#7846B4',		eViolet:	'#AB8AD2',		lViolet:	'#DDD0ED',
		
		oBlue:		'#12212d',	dBlue:		'#2c5171',	nBlue:		'#4682B4',	fBlue:		'#9ED3FF',	lBlue:		'#D0E0ED',
		oFuschia:	'#200916',	dFuschia:	'#511738',	nFuschia:	'#812559',	fFuschia:	'#cf589b',	lFuschia:	'#ecbcd7',
		oGrey:		'#1e1e1e',	dGrey:		'#4c4c4c',	nGrey:		'#797979',	fGrey:		'#ABABAB',	lGrey:		'#DEDEDE',
		oGreen:		'#132d12',	dGreen:		'#2f712c',	nGreen:		'#4BB446',	fGreen:		'#8DD28A',	lGreen:		'#D2EDD0',
		oMagenta:	'#2c122d',	dMagenta:	'#6d2c71',	nMagenta:	'#AF46B4',	fMagenta:	'#CE8AD2',	lMagenta:	'#ECD0ED',
		oOrange:	'#2d1e12',	dOrange:	'#714b2c',	nOrange:	'#B47846',	fOrange:	'#D2AB8A',	lOrange:	'#EDDDD0',
		oRed:		'#2D1213',	dRed:		'#712C2F',	nRed:		'#B4464B',	fRed:		'#D28A8D',	lRed:		'#EDD0D2',
		oTurquoise:	'#143133',	dTurquoise:	'#327a80',	nTurquoise:	'#5EB8C0',	fTurquoise:	'#9ad3d8',	lTurquoise:	'#d7edef',
		oYellow:	'#2d2a12',	dYellow:	'#71682c',	nYellow:	'#b4a646',	fYellow:	'#D2C88A',	lYellow:	'#EDE9D0',
		
		oRed1:	'#170909',	dRed1:	'#381618',	nRed1:	'#5A2326',	fRed1:	'#BC5258',	lRed1:	'#E4DABC',
		oRed2:	'#220D0E',	dRed2:	'#542123',	nRed2:	'#873538',	fRed2:	'#C66E72',	lRed2:	'#E8C5C6',
		oRed3:	'#2D1213',	dRed3:	'#712C2F',	nRed3:	'#B4464B',	fRed3:	'#D28A8D',	lRed3:	'#EDD0D2',
		oRed4:	'#391618',	dRed4:	'#8D383C',	nRed4:	'#C87377',	fRed4:	'#DDA8AA',	lRed4:	'#F1DCDD',
		oRed5:	'#451A1D',	dRed5:	'#AC4247',	nRed5:	'#DBA1A4',	fRed5:	'#E9C4C6',	lRed5:	'#F6E8E8',
		
		oGBlue:	'#1e1d27',	dGBlue:	'#4c4962',	nGBlue:	'#7c789a',	fGBlue:	'#adabc0',	lGBlue:	'#dedde6',
		oGViol:	'#251d27',	dGViol:	'#5c4962',	nGViol:	'#92789a',	fGViol:	'#bbabc0',	lGViol:	'#e4dde6',
	};
	
	// Categories:
	//	[T] text	→ [F] foreground	→ [N] normal	→ [G] background	→ [H] highlight
	var sets = {
		Blue:		{ t: list.oBlue,		f: list.dBlue,		n: list.nBlue, 		g: list.fBlue, 		h: list.lBlue },
		Fuschia:	{ t: list.oFuschia,		f: list.dFuschia,	n: list.nFuschia, 	g: list.fFuschia, 	h: list.lFuschia },
		Grey:		{ t: list.oGrey,		f: list.dGrey,		n: list.nGrey, 		g: list.fGrey,	 	h: list.lGrey },
		Green:		{ t: list.oGreen,		f: list.dGreen, 	n: list.nGreen, 	g: list.fGreen, 	h: list.lGreen },
		Magenta:	{ t: list.oMagenta,		f: list.dMagenta,	n: list.nMagenta, 	g: list.fMagenta, 	h: list.lMagenta },
		Orange:		{ t: list.oOrange,		f: list.dOrange, 	n: list.nOrange, 	g: list.fOrange, 	h: list.lOrange },
		Red:		{ t: list.oRed,			f: list.dRed, 		n: list.nRed, 		g: list.fRed, 		h: list.lRed },
		Turquoise:	{ t: list.oTurquoise,	f: list.dTurquoise,	n: list.nTurquoise, g: list.fTurquoise, h: list.lTurquoise },
		Yellow:		{ t: list.oYellow,		f: list.dYellow, 	n: list.nYellow, 	g: list.fYellow, 	h: list.lYellow },
		
		Red1: 	{ t: list.oRed1,	f: list.dRed1,	n: list.nRed1,	g: list.fRed1,	h: list.lRed1 },
		Red2: 	{ t: list.oRed2,	f: list.dRed2,	n: list.nRed2,	g: list.fRed2,	h: list.lRed2 },
		Red3: 	{ t: list.oRed3,	f: list.dRed3,	n: list.nRed3,	g: list.fRed3,	h: list.lRed3 },
		Red4: 	{ t: list.oRed4,	f: list.dRed4,	n: list.nRed4,	g: list.fRed4,	h: list.lRed4 },
		Red5: 	{ t: list.oRed5,	f: list.dRed5,	n: list.nRed5,	g: list.fRed5,	h: list.lRed5 },
		
		GBlue:	{ t: list.oGBlue,	f: list.dGBlue,	n: list.nGBlue,	g: list.fGBlue,	h: list.lGBlue },
		GViol:	{ t: list.oGViol,	f: list.dGViol,	n: list.nGViol,	g: list.fGViol,	h: list.lGViol },
	}
	
	var cores = ['#b6e3bc', '#b6e3da', '#b6cee3', '#bcb6e3', '#dab6e3', '#e3b6ce', '#e3bcb6', '#e3dab6'];

	return {
		unkn:	list.black,		// unkown color
		base:	list.dGrey,		// generic color
		plus:	list.fBlue,		// plus, capacity, more possible
		good:	list.fGreen,	// correctly running
		bad:	list.fRed,		// Not expected
		alt:	list.eViolet,	// alternating
		list:	list,
		sets:	sets,
		cores:	cores
	};
}]);


app.factory('facets', ['colours', function(colours) {
	/*  DESCRIPTIONS TO MOVE INTO LEGENDS AND DELETE HERE  */
	var desc_w = 'threads are not ready to be processed because they waiting ressource(s)';
	var desc_lw = 'threads are not ready to be processed because they waiting to acquire a lock';
	var desc_i = 'no thread running on core';
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
		h:		{ label: 'Thread',			unity: '',	cat: '',	attr: 'h',	colours: colours.sets.Grey,	color: colours.list.fGrey,	fcolor: colours.list.dGrey,	gcolor: colours.list.lGrey },
		pn:		{ label: 'Process',			unity: '',	cat: '',	attr: 'pn',	colours: colours.sets.Grey,	color: colours.list.fGrey,	fcolor: colours.list.dGrey,	gcolor: colours.list.lGrey },
		ct:		{ label: 'Core time',		unity: '',	cat: '',	attr: 'ct',	colours: colours.sets.Grey,	color: colours.list.fGrey,	fcolor: colours.list.dGrey,	gcolor: colours.list.lGrey },
		
		r:		{ label: 'Executing',			unity: 'ms',	cat: 'times',	attr: 'r',		colours: colours.sets.Green,	color: colours.list.nGreen,		fcolor: colours.list.dGreen,	gcolor: colours.list.fGreen },
		y:	 	{ label: 'Ready',				unity: 'ms',	cat: 'times',	attr: 'y',		colours: colours.sets.Orange,	color: colours.list.nOrange,	fcolor: colours.list.dOrange,	gcolor: colours.list.fOrange },
		b:	 	{ label: 'Standby',				unity: 'ms',	cat: 'times',	attr: 'b',		colours: colours.sets.Orange,	color: colours.list.nOrange,	fcolor: colours.list.dOrange,	gcolor: colours.list.fOrange },
		yb: 	{ label: 'Ready',				unity: 'ms',	cat: 'times',	attr: 'yb',		colours: colours.sets.Orange,	color: colours.list.nOrange,	fcolor: colours.list.dOrange,	gcolor: colours.list.fOrange },
		i: 		{ label: 'Idle core',			unity: 'ms',	cat: 'times',	attr: 'i',		colours: colours.sets.Blue,		color: colours.list.nBlue,		fcolor: colours.list.dBlue,		gcolor: colours.list.fBlue },
		sys: 	{ label: 'system',				unity: 'ms',	cat: 'times',	attr: 'sys',	colours: colours.sets.Grey,		color: colours.list.lGrey,		fcolor: colours.list.nGrey,		gcolor: colours.list.white },
		lw:		{ label: 'lock waiting',		unity: 'ms',	cat: 'times',	attr: 'lw',		colours: colours.sets.Yellow,	color: colours.list.nYellow,	fcolor: colours.list.dYellow,	gcolor: colours.list.fYellow },
		uu: 	{ label: 'idle core',			unity: 'ms',	cat: 'times',	attr: 'uu',		colours: colours.sets.Blue,		color: colours.list.nBlue,		fcolor: colours.list.dBlue,		gcolor: colours.list.fBlue },
		
		ipc:	{ label: 'Executing',			unity: '',	cat: 'locality',	attr: 'ipc',	colours: colours.sets.Green,	color: colours.list.nGreen,	fcolor: colours.list.dGreen,	gcolor: colours.list.fGreen },
		miss:	{ label: 'Cache misses',		unity: '',	cat: 'locality',	attr: 'miss',	colours: colours.sets.Red,		color: colours.list.nRed,	fcolor: colours.list.dRed,		gcolor: colours.list.fRed },
		tlb:	{ label: 'Address translation',	unity: '',	cat: 'locality',	attr: 'tlb',	colours: colours.sets.Red5,		color: colours.list.nRed5,	fcolor: colours.list.dRed5,		gcolor: colours.list.fRed5 },
		l1:		{ label: 'Loading from L2',		unity: '',	cat: 'locality',	attr: 'l1',		colours: colours.sets.Red4,		color: colours.list.nRed4,	fcolor: colours.list.dRed4,		gcolor: colours.list.fRed4 },
		l2:		{ label: 'Loading from L3',		unity: '',	cat: 'locality',	attr: 'l2',		colours: colours.sets.Red3,		color: colours.list.nRed3,	fcolor: colours.list.dRed3,		gcolor: colours.list.fRed3 },
		l3:		{ label: 'Loading from RAM',	unity: '',	cat: 'locality',	attr: 'l3',		colours: colours.sets.Red2,		color: colours.list.nRed2,	fcolor: colours.list.dRed2,		gcolor: colours.list.fRed2 },
		hpf:	{ label: 'Swapping',			unity: '',	cat: 'locality',	attr: 'hpf',	colours: colours.sets.Red1,		color: colours.list.nRed1,	fcolor: colours.list.dRed1,		gcolor: colours.list.fRed1 },
		
		s:		{ label: 'switches',		title: 'Context switches',			desc: desc_s,	list: 'switches',	unity: 'events',	cat: 'switches',	attr: 's',		colours: colours.sets.GBlue,	color: colours.list.nGBlue,		fcolor: colours.list.dGBlue },
		m:		{ label: 'migrations',		title: 'Thread migrations',			desc: desc_m,	list: 'migrations',	unity: 'events',	cat: 'migrations',	attr: 'm',		colours: colours.sets.GViol,	color: colours.list.nGViol,		fcolor: colours.list.dGViol },
		ls:		{ label: 'lock success',	title: 'Lock without contention',	desc: desc_ls,	list: 'slocks',		unity: 'events',	cat: 'locks',		attr: 'ls',		colours: colours.sets.Turquoise,	color: colours.list.fTurquoise,	fcolor: colours.list.dTurquoise,gcolor: colours.list.lTurquoise },
		lf:		{ label: 'lock failure',	title: 'Lock with contention',		desc: desc_lf,	list: 'flocks',		unity: 'events',	cat: 'locks',		attr: 'lf',		colours: colours.sets.Fuschia,	color: colours.list.fFuschia,	fcolor: colours.list.dFuschia,	gcolor: colours.list.lFuschia },
		
		q_s:	{ label: 'sequential',		title: 'Sequential sequence',	desc: desc_q_s,	unity: '', cat: '', attr: '',	colours: colours.sets.Orange,	color: colours.list.fOrange,	fcolor: colours.list.dOrange,	gcolor: colours.list.lOrange },
		q_p:	{ label: 'parallel',		title: 'Parallel sequence',		desc: desc_q_p,	unity: '', cat: '', attr: '',	colours: colours.sets.Green,	color: colours.list.fGreen,		fcolor: colours.list.dGreen,	gcolor: colours.list.lGreen },
	};
}]);

app.factory('decks', ['facets', 'colours', function(facets, colours) {
	// Time handling constants
	const TIME_NONE = 0;
	const TIME_PROFILE = 10;
	const TIME_CUSTOM = 20;

	
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
	
	function buildThreads(profile, presetList) {
		var begin = profile.currentData.info.timeMin;
		var end = profile.currentData.info.duration;
		var lines = presetList || [];
		var excludes = (presetList) ? presetList.map(function(line) { return line.id; }) : [];
		profile.currentData.threads.info.forEach(function(thread) {
			if (excludes.indexOf(thread.h) < 0)
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
		var presetList;
		if (profile.id == 21) {
			presetList = [
				{ id: 11936,	l: 'φ 1',	s:1,	e:1023},	// 5 2
				{ id: 18964,	l: 'φ 2',	s:0,	e:512},		// 2 1
				{ id: 18596,	l: 'φ 3',	s:1,	e:1028},	// 1 3
				{ id: 18012,	l: 'φ 4',	s:1,	e:509},		// 3 4
				{ id: 8020,		l: 'φ 5',	s:1,	e:1529},	// 4 5
			];
			return buildThreads(profile, presetList);
		} else if (profile.id == 22) {
			presetList = [
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
			return buildThreads(profile, presetList);
		} else {
			return buildThreads(profile);
		}
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

	var limit = 	{ color: colours.list.fGrey, fcolor: colours.list.dGrey, gcolor: colours.list.lGrey };
	var text = 		{ color: colours.list.black, fcolor: colours.list.black, gcolor: colours.list.black };

	// Fruit salad
	var m =		JSON.parse(JSON.stringify(facets.m));
	m.colors = ['#b6e3bc', '#b6e3da', '#b6cee3', '#bcb6e3', '#dab6e3', '#e3b6ce', '#e3bcb6', '#e3dab6'];
	
	return {
		cacheMisses: {
			handling: {
				time: TIME_PROFILE,
			},
			graph: {
				v:		[facets.hpf, facets.l3, facets.l2, facets.l1, facets.tlb, facets.ipc],
				limit:	limit
			},
			data: [facets.ipc, facets.tlb, facets.l1, facets.l2, facets.l3, facets.hpf],
			focus: [facets.ipc, facets.tlb, facets.l1, facets.l2, facets.l3, facets.hpf],
			legend: {
				axis: [
					{ b: '%', t: '[Y] Percent',	d: 'ratio of time spent on locality misses compared to time spent on executing', c: colours.list.fGrey}
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
			handling: {
				time: TIME_PROFILE,
			},
			graph : {
				h:			limit,		// threads (color)
				lines:		buildCores,
				melody_c:	facets.i,
			},
			data: [facets.i, facets.r],
			focus: [facets.i],
			legend: {
				axis: [
					{ b: '⊢', f: limit,	t: '[Y] Cores',	d: 'each line represents a core' }
				],
				data: [
					{ b: '▮', t: 'Idle', d: 'time spend by the core waiting a thread to run (other processes are considfred as idle time)',	 c: colours.list.fGrey }
				]
			},
			clues: [],
			settings: [
				{ property: 'melodyHeight', value: 9, type: 'range', label: 'Inactivity height', unit: 'pixels', min: 6, max: 12, step: 1 }
			]
		},
		lockContentions: {
			handling: {
				time: TIME_PROFILE,
			},
			graph : {
				v:		[facets.sys, facets.i, facets.r, facets.lw],
				limit:	facets.i,
				axis:	{ labels: 'cores' }
			},
			data: [facets.lw, facets.r, facets.i],
			focus: [facets.sys, facets.i, facets.r, facets.lw],
			legend: {
				axis: [
					{ b: '◓',	f: facets.lw,	t: '[Y] Over capacity',				d: 'time spent by threads while waiting for a lock' },
					{ b: '▪▪',	f: facets.i,	t: '[Y] Limit of core capacity',	d: 'capacity of CPU computation' },
					{ b: '◒',	f: facets.r,	t: '[Y] Core capacity',				d: 'time spent in thread execution, idle, or used by the OS' }
				],
				data: [
					{ b: '▮', f: facets.lw,		d: 'threads are not ready to be processed because they waiting to acquire a lock' },
					{ b: '▮', f: facets.r,		d: 'thread is actively executing', },
					{ b: '▮', f: facets.i,		d: 'no thread running on core' },
					{ b: '▮', f: facets.sys,	d: 'Core occupied by other program',	 c: colours.list.fGrey }
				]
			},
			clues: [],
			settings: []
		},
		lockCounts: {
			handling: {
				time:	TIME_CUSTOM,
				v:		[facets.ls, facets.lf]
			},
			graph : {
				v:			[facets.ls, facets.lf],
				limit:		limit,
				limitLabel:	't. value',
			},
			data: [facets.ls, facets.lf],
			focus: [facets.ls, facets.lf],
			legend: {
				axis: [
					{ b: '-', t: 't. value',	d: 'typical value of expected lock acquisitions (could be changed in settings)',	f: limit, sv: 'calibration', sd: 'lock acquisitions by ms' },
					{ b: 'n×', t: 'excess',		d: 'more lock acquisitions than expected (multiple of the typical value)',			f: limit },
				],
				data: [
					{ b: '▮', t: 'Lock with contention',	d: 'number failure of lock acquisition',	f: facets.lf },
					{ b: '▮', t: 'Lock without contention',	d: 'number success of lock acquisition',	f: facets.ls }
				]
			},
			clues: [],
			plans: [
				{ id: 1, label: 'log₂', property: 'useLogScale' },
				{ id: 2, label: 'linear', property: 'useLinearScale' },
			],
			settings: [
				{ property: 'calibration', type: 'pnumeric', label: 'Typical values', unit: 'lock acquisitions', psource: function(profile) { return profile.hardware.data.threads * (profile.hardware.calibration.ls + profile.hardware.calibration.lf); } },
				{ property: 'timeGroup', value: 50, type: 'range', label: 'Group by', unit: 'ms', min: 10, max: 50, step: 10 }
			]
		},
		threadChains: {
			handling: {
				time: TIME_NONE,
			},
			graph : {
				h:			limit,		// color
				lines:		buildThreadsForDP,
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
			data: [facets.ls, facets.lf],
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
			clues: [],
			settings: [
				{ property: 'holdingMode', value: 1, type: 'select', label: 'Thread holding the lock', choices: ['hide', 'show on mouve hover', 'show'] },
			]
		},
		threadMigrations: {
			handling: {
				time:	TIME_CUSTOM,
				v:		[facets.m]
			},
			graph : {
				v:		[facets.m],
				limit:		limit,
				limitLabel:	't. value',
			},
			data: [facets.m],
			focus: [facets.m],
			legend: {
				axis: [
					{ b: '-', t: 't. value',	d: 'typical value of expected thread migrations (could be changed in settings)',	f: limit, sv: 'calibration', sd: 'thread migrations by ms' },
					{ b: 'n×', t: 'excess',		d: 'more thread migrations than expected (multiple of the typical value)',			f: limit },
				],
				data: [
					{ b: '▮', d:'thread migrates to another core', f: facets.m }
				]
			},
			clues: [
				{ c: colours.base,	t: 'Thread migrations',							d: 'too many migrations' },
				{ c: colours.base,	t: 'Alternating sequential/parallel execution',	d: 'alternating period of high and low thread migrations' }
			],
			plans: [
				{ id: 1, label: 'log₂', property: 'useLogScale' },
				{ id: 2, label: 'linear', property: 'useLinearScale' },
			],
			settings: [
				{ property: 'calibration', type: 'pnumeric', label: 'Typical values', unit: 'thread migrations', psource: function(profile) { return profile.hardware.data.threads * profile.hardware.calibration.m; } },
				{ property: 'timeGroup', value: 50, type: 'range', label: 'Group by', unit: 'ms', min: 10, max: 50, step: 10 }
			]
		},
		threadSwitches: {
			handling: {
				time:	TIME_CUSTOM,
				v:		[facets.s]
			},
			graph : {
				v:			[facets.s],
				limit:		limit,
				limitLabel:	't. value',
			},
			data: [facets.s],
			focus: [facets.s],
			legend: {
				axis: [
					{ b: '-', t: 't. value',	d: 'typical value of expected context switches (could be changed in settings)',	f: limit, sv: 'calibration', sd: 'context switches by ms' },
					{ b: 'n×', t: 'excess',		d: 'more context switches than expected (multiple of the typical value)',		f: limit },
				],
				data: [
					{ b: '▮', d: 'cores switching from one thread to another', f: facets.s }
				]
			},
			clues: [
				{ c: colours.base,	t: 'Oversubscription',	d: 'high frequency' }
			],
			plans: [
				{ id: 1, label: 'log₂', property: 'useLogScale' },
				{ id: 2, label: 'linear', property: 'useLinearScale' },
			],
			settings: [
				{ property: 'calibration', type: 'pnumeric', label: 'Typical values', unit: 'context switches', psource: function(profile) { return profile.hardware.data.threads * profile.hardware.calibration.s; } },
				{ property: 'timeGroup', value: 50, type: 'range', label: 'Group by', unit: 'ms', min: 10, max: 50, step: 10 }
			]
		},
		threadStates: {
			handling: {
				time: TIME_PROFILE,
			},
			graph : {
				v:		[facets.sys, facets.i, facets.r, facets.yb],
				limit:	facets.i,
				axis:	{ labels: 'cores' }
			},
			data: [facets.b, facets.y, facets.r, facets.i],
			focus: [facets.sys, facets.i, facets.r, facets.yb],
			legend: {
				axis: [
					{ b: '◓',	f: facets.yb,	t: '[Y] Over capacity',				d: 'time spent by threads while waiting a core' },
					{ b: '▪▪',	f: facets.i,	t: '[Y] Limit of core capacity',	d: 'capacity of CPU computation' },
					{ b: '◒',	f: facets.r,	t: '[Y] Core capacity',				d: 'time spent in thread execution, idle, or used by the OS' }
				],
				data: [
					{ b: '▮', f: facets.yb,		t: 'ready + standby',	d: 'thread is ready to run but is is waiting for a core to become available'},
					{ b: '▮', f: facets.r,		d: 'thread is actively executing', },
					{ b: '▮', f: facets.i,		d: 'no thread running on core' },
					{ b: '▮', f: facets.sys,	d: 'Core occupied by other program',	 c: colours.list.fGrey }
				]
			},
			clues: [
				{ c: colours.bad,	t: 'Oversubscription', 			d: 'too many threads' },
				{ c: colours.bad,	t: 'Thread migrations', 		d: 'too many threads' },
				{ c: colours.bad,	t: 'Bad thread to core ratio', 	d: 'too many threads' },
				{ c: colours.plus,	t: 'Underscubscription', 		d: 'not enough threads' }
			],
			settings: []
		},
		threadFruitSalad: {
			handling: {
				time:	TIME_CUSTOM,
				v:		[facets.m]
			},
			graph : {
				h:			limit,		// threads (color)
				ticks:		[facets.m],
				periods:	[facets.m],
				c_periods:	colours.cores,
			},
			data: [facets.m],
			legend: {
				axis: [
					{ b: '⊢', f: limit,	t: '[Y] Threads',	d: 'each line represents a thread complying with the start and end times' }
				],
				data: [
					{ b: '|',				d:'thread migrates to another core', f: facets.m },
					{ b: '◧', t: 'Cores',	d: 'core to which a thread is attached to (one color by core)',	 c: colours.list.fGrey }
				]
			},
			clues: [
				{ c: colours.unkn,	t: 'Task start/stop overhead',	d: 'too many creations' },
				{ c: colours.alt,	t: 'Oversubscription',			d: 'too many threads' },
				{ c: colours.base,	t: 'Thread migrations',			d: 'too many threads' },
				{ c: colours.alt,	t: 'Thread migrations',			d: 'too many migrations' },
				{ c: colours.unkn,	t: 'Task start/stop overhead',	d: 'too short lifetime' }
			],
			plans: [
				{ id: 1, label: 'rate', property: 'groupTicks' },
				{ id: 2, label: 'events', property: 'enableTicks' },
				{ id: 3, label: 'core affinity', property: 'enablePeriods' }
			],
			settings: [
				{ property: 'timeGroup', value: 50, type: 'range', label: 'Group by', unit: 'ms', min: 10, max: 50, step: 10 }, // depends: ['plan', 0]
			]
		},
		threadLocks: {
			handling: {
				time:	TIME_NONE,	// TODO change to TIME_CUSTOM
				v:		[facets.lw]
			},
			graph : {
				h:	limit,		// threads (color)
				ticks:		[facets.ls, facets.lf],
				periods:	[facets.lw],
			},
			data: [facets.lw],
			legend: {
				axis: [
					{ b: '⊢', f: limit,	t: '[Y] Threads',	d: 'each line represents a thread complying with the start and end times' }
				],
				data: [
					{ b: '╳', t: 'Lock with contention',		d: 'failure of lock acquisition',	f: facets.lf },
					{ b: '[', t: 'Lock without  contention',	d: 'success of lock acquisition',	f: facets.ls },
					{ b: '▮', f: facets.lw,						d: 'threads are not ready to be processed because they waiting to acquire a lock' }
				]
			},
			clues: [],
			settings: [
				{ property: 'disableTicks', value: false, type: 'flag', label: 'Disable ticks' },
				{ property: 'disablePeriods', value: false, type: 'flag', label: 'Disable periods' }
			]
		},
		sequences: {
			handling: {
				time: TIME_NONE,
			},
			graph : {
				h:			limit,		// threads (color)
				lines:		buildCoresAnonymously,
				sequences:	{ under: facets.q_s, count: facets.q_p }
			},
			data: [facets.r, facets.i],
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
		pCoordDL: {
			graph : {
				h:		limit,
				plots:	[facets.pn, facets.h, facets.ct, facets.ipc, facets.tlb, facets.l1, facets.l2, facets.l3, facets.hpf],
				c_scale:[facets.ipc.colours.n, facets.miss.colours.n, facets.miss.colours.n]
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
				{ property: 'colorMode', value: 0, type: 'select', label: 'Color by', choices: ['good <--> poor locality', 'process', 'thread'] },
				{ property: 'colorThreshold', value: 20, type: 'range', label: 'Locality threshold', unit: '%', min: 5, max: 95, step: 5, depends: ['colorMode', 0] },
			]
		}
	};
}]);


app.factory('widgets', ['decks', function(decks) {
	var i = 0;
	function id() { return ++i; }
	
	// Reserved properties:
	//	- data:			automatically provided and updated in case of time group
	//	- settings:		programmatically provided and handled (data of deck.settings)
	//	- stats:		data and UI computed for focus or not
	
	return {
		cacheBreackdown:	{ id: id(),	v: 3, file: 'chart-d3-pcoords',	deck: decks.pCoordDL,			wide: true,		title: 'Breakdown of time spent on locality misses',				desc: ''},
		cacheInvalid:		{ id: id(),	v: 3, file: 'chart-todo',		deck: null,						wide: true,		title: 'Cache misses from updating shared data',					desc: ''},
		cacheMisses:		{ id: id(),	v: 3, file: 'chart-percent',	deck: decks.cacheMisses,		wide: false,	title: 'Percentage of time spent on locality misses',				desc: ''},
		coreIdle:			{ id: id(),	v: 3, file: 'chart-lines',		deck: decks.coreIdle,			wide: false,	title: 'Idle cores',												desc: 'Times that cores are idle'},
		coreSequences:		{ id: id(),	v: 3, file: 'chart-lines',		deck: decks.sequences,			wide: false,	title: 'Single thread execution phases',							desc: 'alternating sequential/parallel execution'},
		lockCounts:			{ id: id(),	v: 4, file: 'chart-units',		deck: decks.lockCounts,			wide: false,	title: 'Lock contentions',											desc: 'Locking with and without contention'},
		lockContentions:	{ id: id(),	v: 4, file: 'chart-percent',	deck: decks.lockContentions,	wide: false,	title: 'Time waiting for a lock',									desc: ''},
		threadChains:		{ id: id(),	v: 4, file: 'chart-lines',		deck: decks.threadChains,		wide: false,	title: 'Chains of dependencies on locks',							desc: 'synchronisations and waiting between threads'},
		threadFruitSalad:	{ id: id(),	v: 3, file: 'chart-threads',	deck: decks.threadFruitSalad,	wide: false,	title: 'Migrations by thread',										desc: 'creation, running, moving between cores, termination'},
		threadLocks:		{ id: id(),	v: 4, file: 'chart-threads',	deck: decks.threadLocks,		wide: false,	title: 'Time each thread spends waiting for locks',					desc: ''},
		threadMigrations:	{ id: id(),	v: 3, file: 'chart-units',		deck: decks.threadMigrations,	wide: false,	title: 'Rate of thread migrations',									desc: 'thread switching the core on which it is executing'},
		threadStates:		{ id: id(),	v: 3, file: 'chart-percent',	deck: decks.threadStates,		wide: false,	title: 'Breakdown of thread states compared to number of cores',	desc: 'number of threads compared to number of cores'},
		threadSwitches:		{ id: id(),	v: 3, file: 'chart-units',		deck: decks.threadSwitches,		wide: false,	title: 'Core switching the thread it is executing',					desc: 'thread switches'},
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