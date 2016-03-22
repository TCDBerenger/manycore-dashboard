// Cosntants
const CAPABILITY_STATE =	0;
const CAPABILITY_SWITCH =	1;
const CAPABILITY_LOCALITY =	2;
const CAPABILITY_LOCK =		3;
const CAPABILITY_MEMORY =	4;
const CAPABILITY_COHERENCY =5;

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
		oGreenYlw:	'#252d12',	dGreenYlw:	'#5d712c',	nGreenYlw:	'#94b446',	fGreenYlw:	'#bdd28a',	lGreenYlw:	'#e4edd0',
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
		GreenYlw:	{ t: list.oGreenYlw,	f: list.dGreenYlw,	n: list.nGreenYlw,	g: list.fGreenYlw,	h: list.lGreenYlw },
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
		h:		{ label: 'Thread',			attr: 'h',	unity: '', cat: '', colours: colours.sets.Grey,	color: colours.list.fGrey,	fcolor: colours.list.dGrey,	gcolor: colours.list.lGrey },
		pn:		{ label: 'Process',			attr: 'pn',	unity: '', cat: '', colours: colours.sets.Grey,	color: colours.list.fGrey,	fcolor: colours.list.dGrey,	gcolor: colours.list.lGrey },
		ct:		{ label: 'Core time',		attr: 'ct',	unity: '', cat: '', colours: colours.sets.Grey,	color: colours.list.fGrey,	fcolor: colours.list.dGrey,	gcolor: colours.list.lGrey },
		
		r:		{ label: 'Executing',			capability: CAPABILITY_STATE,		attr: 'r',		unity: 'ms', cat: 'times',	colours: colours.sets.Green,	color: colours.list.nGreen,		fcolor: colours.list.dGreen,	gcolor: colours.list.fGreen },
		y:	 	{ label: 'Ready',				capability: CAPABILITY_STATE,		attr: 'y',		unity: 'ms', cat: 'times',	colours: colours.sets.Orange,	color: colours.list.nOrange,	fcolor: colours.list.dOrange,	gcolor: colours.list.fOrange },
		b:	 	{ label: 'Standby',				capability: CAPABILITY_STATE,		attr: 'b',		unity: 'ms', cat: 'times',	colours: colours.sets.Orange,	color: colours.list.nOrange,	fcolor: colours.list.dOrange,	gcolor: colours.list.fOrange },
		yb: 	{ label: 'Ready',				capability: CAPABILITY_STATE,		attr: 'yb',		unity: 'ms', cat: 'times',	colours: colours.sets.Orange,	color: colours.list.nOrange,	fcolor: colours.list.dOrange,	gcolor: colours.list.fOrange },
		i: 		{ label: 'Idle core',			capability: CAPABILITY_STATE,		attr: 'i',		unity: 'ms', cat: 'times',	colours: colours.sets.Blue,		color: colours.list.nBlue,		fcolor: colours.list.dBlue,		gcolor: colours.list.fBlue },
		w:		{ label: 'Waiting',				capability: CAPABILITY_STATE,		attr: 'w',		unity: 'ms', cat: 'times',	colours: colours.sets.Yellow },
		sys: 	{ label: 'system',				capability: CAPABILITY_STATE,		attr: 'sys',	unity: 'ms', cat: 'times',	colours: colours.sets.Grey,		color: colours.list.lGrey,		fcolor: colours.list.nGrey,		gcolor: colours.list.white },
		lw:		{ label: 'Lock waiting',		capability: CAPABILITY_LOCK,		attr: 'lw',		unity: 'ms', cat: 'times',	colours: colours.sets.Yellow,	color: colours.list.nYellow,	fcolor: colours.list.dYellow,	gcolor: colours.list.fYellow },
		lh:		{ label: 'Lock holding',		capability: CAPABILITY_LOCK,		attr: 'lh',		unity: 'ms', cat: 'times',	colours: colours.sets.Turquoise },
		
		ipc:	{ label: 'Executing',			capability: CAPABILITY_LOCALITY,	attr: 'ipc',	unity: '', cat: 'locality',	colours: colours.sets.Green,	color: colours.list.nGreen,	fcolor: colours.list.dGreen,	gcolor: colours.list.fGreen },
		miss:	{ label: 'Cache misses',		capability: CAPABILITY_LOCALITY,	attr: 'miss',	unity: '', cat: 'locality',	colours: colours.sets.Red,		color: colours.list.nRed,	fcolor: colours.list.dRed,		gcolor: colours.list.fRed },
		tlb:	{ label: 'Address translation',	capability: CAPABILITY_LOCALITY,	attr: 'tlb',	unity: '', cat: 'locality',	colours: colours.sets.Red5,		color: colours.list.nRed5,	fcolor: colours.list.dRed5,		gcolor: colours.list.fRed5 },
		l1:		{ label: 'Loading from L2',		capability: CAPABILITY_LOCALITY,	attr: 'l1',		unity: '', cat: 'locality',	colours: colours.sets.Red4,		color: colours.list.nRed4,	fcolor: colours.list.dRed4,		gcolor: colours.list.fRed4 },
		l2:		{ label: 'Loading from L3',		capability: CAPABILITY_LOCALITY,	attr: 'l2',		unity: '', cat: 'locality',	colours: colours.sets.Red3,		color: colours.list.nRed3,	fcolor: colours.list.dRed3,		gcolor: colours.list.fRed3 },
		l3:		{ label: 'Loading from RAM',	capability: CAPABILITY_LOCALITY,	attr: 'l3',		unity: '', cat: 'locality',	colours: colours.sets.Red2,		color: colours.list.nRed2,	fcolor: colours.list.dRed2,		gcolor: colours.list.fRed2 },
		hpf:	{ label: 'Swapping',			capability: CAPABILITY_LOCALITY,	attr: 'hpf',	unity: '', cat: 'locality',	colours: colours.sets.Red1,		color: colours.list.nRed1,	fcolor: colours.list.dRed1,		gcolor: colours.list.fRed1 },
		
		s:		{ label: 'Context switches',		capability: CAPABILITY_SWITCH,	attr: 's',		unity: 'events', cat: 'switches',	list: 'switches',	colours: colours.sets.GBlue },
		m:		{ label: 'Thread migrations',		capability: CAPABILITY_SWITCH,	attr: 'm',		unity: 'events', cat: 'migrations',	list: 'migrations',	colours: colours.sets.GViol },
		ls:		{ label: 'Lock without contention',	capability: CAPABILITY_LOCK,	attr: 'ls',		unity: 'events', cat: 'locks',		list: 'slocks',		colours: colours.sets.Turquoise },
		lf:		{ label: 'Lock with contention',	capability: CAPABILITY_LOCK,	attr: 'lf',		unity: 'events', cat: 'locks',		list: 'flocks',		colours: colours.sets.Fuschia },
		lr:		{ label: 'Lock release',			capability: CAPABILITY_LOCK,	attr: 'lr',		unity: 'events', cat: 'locks',							colours: colours.sets.Turquoise },
		
		p:		{ label: 'Parallel',				capability: CAPABILITY_STATE,	attr: 'p',	unity: '',			colours: colours.sets.GreenYlw },
		q:		{ label: 'Parallelized',			capability: CAPABILITY_STATE,	attr: 'q',	unity: '',			colours: colours.sets.GreenYlw },
		q_s:	{ label: 'Sequential sequence',		capability: CAPABILITY_STATE,	attr: '',	unity: '', cat: '', colours: colours.sets.Orange },
		q_p:	{ label: 'Parallel sequence',		capability: CAPABILITY_STATE,	attr: '',	unity: '', cat: '', colours: colours.sets.Green },
		
		e:		{ label: 'Memory bandwidth',			capability: CAPABILITY_MEMORY,	attr: 'e',	unity: 'MB',	colours: colours.sets.Magenta },
		ue:		{ label: 'Available memory bandwidth',	capability: CAPABILITY_MEMORY,	attr: 'ue',	unity: 'MB',	colours: colours.sets.Blue },
		se:		{ label: 'System memory bandwidth',		capability: CAPABILITY_MEMORY,	attr: 'se',	unity: 'MB',	colours: colours.sets.Grey },
		
		il:		{ label: 'Cache line invalidations',	capability: CAPABILITY_COHERENCY,	attr: 'il',		unity: '',	colours: colours.sets.Red3 },
		il1:	{ label: 'L1 cache line invalidations',	capability: CAPABILITY_COHERENCY,	attr: 'il1',	unity: '',	colours: colours.sets.Red4 },
		il2:	{ label: 'L2 cache line invalidations',	capability: CAPABILITY_COHERENCY,	attr: 'il2',	unity: '',	colours: colours.sets.Red2 },
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
	function buildPhysicalCores(profile) {
		var begin = profile.currentData.info.timeMin;
		var end = profile.currentData.info.duration;
		var lines = [];
		for (var l = 0; l < profile.hardware.data.pcores; l++)
			lines.push({ id: l, l: 'core ' + l, s: begin, e: end });
		return lines;
	}
	function buildLogicalCores(profile) {
		var begin = profile.currentData.info.timeMin;
		var end = profile.currentData.info.duration;
		var lines = [];
		for (var l = 0; l < profile.hardware.data.lcores; l++)
			lines.push({ id: l, l: 'core ' + l, s: begin, e: end });
		return lines;
	}
	function buildLogicalCoresAnonymously(profile) {
		var begin = profile.currentData.info.timeMin;
		var end = profile.currentData.info.duration;
		var lines = [];
		for (var l = 0; l < profile.hardware.data.lcores; l++)
			lines.push({ id: l, l: 'core', s: begin, e: end });
		return lines;
	}

	var limit = 	{ colours: colours.sets.Grey,	color: colours.list.fGrey, fcolor: colours.list.dGrey, gcolor: colours.list.lGrey };
	var text = 		{ 								color: colours.list.black, fcolor: colours.list.black, gcolor: colours.list.black };

	// Fruit salad
	var m =		JSON.parse(JSON.stringify(facets.m));
	m.colors = ['#b6e3bc', '#b6e3da', '#b6cee3', '#bcb6e3', '#dab6e3', '#e3b6ce', '#e3bcb6', '#e3dab6'];
	
	return {
		cacheBreackdown: {
			handling: {
				time: TIME_NONE,
			},
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
		},
		cacheInvalidations: {
			handling: {
				time: TIME_NONE,
			},
			graph : {
				levels:	[
					{
						l: 'cache L1',
						f: facets.il1,
						count: function(profile) { return profile.hardware.data.l1caches; }, 
					}, {
						l: 'cache L2',
						f: facets.il2,
						count: function(profile) { return profile.hardware.data.l2caches; }, 
					}
				]
			},
			legend: {
				axis: [],
				data: [],
				options: { disablePrelist: true }
			},
			clues: [],
			settings: []
		},
		cacheInvalid: {
			handling: {
				time:	TIME_PROFILE,
				v:		[facets.il1, facets.il2]
			},
			graph : {
				v:			[facets.il1, facets.il2],
				limit:		limit,
				limitLabel:	't. value',
				useFrameIstead: true
			},
			data: [facets.il1, facets.il2],
			focus: [facets.il1, facets.il2],
			legend: {
				axis: [
					{ b: '-', t: 't. value',	d: 'typical value of expected cache line invalidations',	f: limit, sv: 'calibration', sd: 'cache line invalidations by ms' },
					{ b: 'n×', t: 'excess',		d: 'more cache line invalidations than expected (multiple of the typical value)',			f: limit },
				],
				data: [
					{ b: '▮', 	d: 'number line invalidations in L2 cache',	f: facets.il2 },
					{ b: '▮', 	d: 'number line invalidations in L1 cache',	f: facets.il1 }
				]
			},
			clues: [],
			plans: [
				{ id: 1, label: 'log₂', property: 'useLogScale' },
				{ id: 2, label: 'linear', property: 'useLinearScale' },
			],
			params: [
				{ property: 'timeGroup', value: 50 }
			],
			settings: [
				{ property: 'calibration', type: 'pnumeric', check: 'positive', label: 'Typical values', unit: 'line invalidations', psource: function(profile) { return 0.1 * profile.hardware.data.cycles * (profile.hardware.data.l1caches + profile.hardware.data.l2caches - 2); } },
				{ property: 'highlightOverflow', value: false, type: 'flag', label: 'High zone', desc: 'shows the high area, over the typical value' }
			]
		},
		cacheInvalidL1: {
			handling: {
				time: TIME_PROFILE,
			},
			graph: {
				v:		[facets.il1],
				limit:	limit
			},
			data: [facets.il1, facets.il2],
			focus: [facets.il1],
			legend: {
				axis: [
					{ b: '%', t: '[Y] Percent',	d: 'theoretical maximum of possible L1 cache invalidations', c: colours.list.fGrey}
				],
				data: [
					{ b: '▮', 	d: 'number line invalidations in L1 cache',	f: facets.il1 }
				]
			},
			clues: [],
			settings: []
		},
		cacheInvalidL2: {
			handling: {
				time: TIME_PROFILE,
			},
			graph: {
				v:		[facets.il2],
				limit:	limit
			},
			data: [facets.il1, facets.il2],
			focus: [facets.il2],
			legend: {
				axis: [
					{ b: '%', t: '[Y] Percent',	d: 'theoretical maximum of possible L2 cache invalidations', c: colours.list.fGrey}
				],
				data: [
					{ b: '▮', 	d: 'number line invalidations in L2 cache',	f: facets.il2 }
				]
			},
			clues: [],
			settings: []
		},
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
		coreBandwidth: {
			handling: {
				time: TIME_PROFILE,
			},
			graph : {
				h:			limit,		// threads (color)
				lines:		buildPhysicalCores,
				melody_c:	facets.e,
				melody_c_max:	function(profile, timeStep) { return Math.round(profile.hardware.data.bandwidth * timeStep / profile.hardware.data.pcores / 1048576); },
				// in theory, a single core could use all the bandwidth. However, for the graph,
				// we devided the max by the number of physical cores (half number of cores).
				// This is totally arbitrary.
			},
			data: [facets.e],
			legend: {
				axis: [
					{ b: '⊢', f: limit,	t: '[Y] Cores',	d: 'each line represents a core' }
				],
				data: [
					{ b: '▮', f: facets.e,	d: 'memory bandwidth used by the program' },
				]
			},
			clues: [],
			settings: [
				{ property: 'melodyHeight', value: 9, type: 'range', label: 'Inactivity height', unit: 'pixels', min: 6, max: 12, step: 1 }
			]
		},
		coreIdle: {
			handling: {
				time: TIME_PROFILE,
			},
			graph : {
				h:			limit,		// threads (color)
				lines:		buildLogicalCores,
				melody_c:	facets.i,
			},
			data: [facets.i, facets.r],
			legend: {
				axis: [
					{ b: '⊢', f: limit,	t: '[Y] Cores',	d: 'each line represents a core' }
				],
				data: [
					{ b: '▮', f: facets.i, t: 'Idle', d: 'time spend by the core waiting a thread to run (other processes are considfred as idle time)' }
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
					{ b: '-', t: 't. value',	d: 'typical value of expected lock acquisitions',	f: limit, sv: 'calibration', sd: 'lock acquisitions by ms' },
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
				{ property: 'calibration', type: 'pnumeric', check: 'positive', label: 'Typical values', unit: 'lock acquisitions', psource: function(profile) { return profile.hardware.data.lcores * (profile.hardware.calibration.ls + profile.hardware.calibration.lf); } },
				{ property: 'timeGroup', value: 50, type: 'range', label: 'Group by', unit: 'ms', min: 10, max: 50, step: 10 },
				{ property: 'highlightOverflow', value: false, type: 'flag', label: 'High zone', desc: 'shows the high area, over the typical value' }
			]
		},
		memBandwidth: {
			handling: {
				time: TIME_PROFILE,
			},
			graph: {
				v:		[facets.e, facets.ue, facets.se],
				limit:	limit
			},
			data: [facets.e],
			focus: [facets.e],
			legend: {
				axis: [],
				data: [
					{ b: '▮', f: facets.e,	d: 'memory bandwidth used by the program' },
					{ b: '▮', f: facets.ue,	d: 'available memory bandwidth' },
					{ b: '▮', f: facets.se,	d: 'non-available memory bandwidth, used by the system and other programs' }
				]
			},
			clues: [],
			settings: []
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
					{ b: '-', t: 't. value',	d: 'typical value of expected thread migrations',	f: limit, sv: 'calibration', sd: 'thread migrations by ms' },
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
				{ property: 'calibration', type: 'pnumeric', check: 'positive', label: 'Typical values', unit: 'thread migrations', psource: function(profile) { return profile.hardware.data.lcores * profile.hardware.calibration.m; } },
				{ property: 'timeGroup', value: 50, type: 'range', label: 'Group by', unit: 'ms', min: 10, max: 50, step: 10 },
				{ property: 'highlightOverflow', value: false, type: 'flag', label: 'High zone', desc: 'shows the high area, over the typical value' }
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
					{ b: '-', t: 't. value',	d: 'typical value of expected context switches',	f: limit, sv: 'calibration', sd: 'context switches by ms' },
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
				{ property: 'calibration', type: 'pnumeric', check: 'positive', label: 'Typical values', unit: 'context switches', psource: function(profile) { return profile.hardware.data.lcores * profile.hardware.calibration.s; } },
				{ property: 'timeGroup', value: 50, type: 'range', label: 'Group by', unit: 'ms', min: 10, max: 50, step: 10 },
				{ property: 'highlightOverflow', value: false, type: 'flag', label: 'High zone', desc: 'shows the high area, over the typical value' }
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
				ticks:		[{f: facets.m}],
				periods:	facets.m,
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
				ticks:		[{f: facets.ls, char: '[', size: 14}, {f: facets.lf, char: '╳', colour: 'g', size: 6}],
				periods:	facets.lw,
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
				lines:		buildLogicalCoresAnonymously,
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
		cacheBreackdown:	{ id: id(),	c: CAPABILITY_LOCALITY,	 file: 'chart-d3-pcoords',	deck: decks.cacheBreackdown,	wide: true,		title: 'Breakdown of time spent on locality misses',				desc: ''},
		cacheInvalidations:	{ id: id(),	c: CAPABILITY_COHERENCY, file: 'chart-d3-caches',	deck: decks.cacheInvalidations,	wide: true,		title: 'Cache line invalidations',									desc: ''},
		cacheInvalid:		{ id: id(),	c: CAPABILITY_COHERENCY, file: 'chart-units',		deck: decks.cacheInvalid,		wide: false,	title: 'Cache misses from updating shared data',					desc: ''},
		cacheInvalidL1:		{ id: id(),	c: CAPABILITY_COHERENCY, file: 'chart-percent',		deck: decks.cacheInvalidL1,		wide: false,	title: 'Percentage of time spent on L1 cache line invalidations',	desc: ''},
		cacheInvalidL2:		{ id: id(),	c: CAPABILITY_COHERENCY, file: 'chart-percent',		deck: decks.cacheInvalidL2,		wide: false,	title: 'Percentage of time spent on L2 cache line invalidations',	desc: ''},
		cacheMisses:		{ id: id(),	c: CAPABILITY_LOCALITY,	 file: 'chart-percent',		deck: decks.cacheMisses,		wide: false,	title: 'Percentage of time spent on locality misses',				desc: ''},
		coreBandwidth:		{ id: id(),	c: CAPABILITY_MEMORY,	 file: 'chart-lines',		deck: decks.coreBandwidth,		wide: false,	title: 'Remote memory access by core',								desc: 'Memory bandwidth'},
		coreIdle:			{ id: id(),	c: CAPABILITY_STATE,	 file: 'chart-lines',		deck: decks.coreIdle,			wide: false,	title: 'Idle cores',												desc: 'Times that cores are idle'},
		coreSequences:		{ id: id(),	c: CAPABILITY_STATE,	 file: 'chart-lines',		deck: decks.sequences,			wide: false,	title: 'Single thread execution phases',							desc: 'alternating sequential/parallel execution'},
		lockCounts:			{ id: id(),	c: CAPABILITY_LOCK,		 file: 'chart-units',		deck: decks.lockCounts,			wide: false,	title: 'Lock contentions',											desc: 'Locking with and without contention'},
		lockContentions:	{ id: id(),	c: CAPABILITY_LOCK,		 file: 'chart-percent',		deck: decks.lockContentions,	wide: false,	title: 'Time waiting for a lock',									desc: ''},
		memBandwidth:		{ id: id(),	c: CAPABILITY_MEMORY,	 file: 'chart-percent',		deck: decks.memBandwidth,		wide: false,	title: 'Remote memory access',										desc: 'Memory bandwidth'},
		threadChains:		{ id: id(),	c: CAPABILITY_LOCK,		 file: 'chart-lines',		deck: decks.threadChains,		wide: false,	title: 'Chains of dependencies on locks',							desc: 'synchronisations and waiting between threads'},
		threadFruitSalad:	{ id: id(),	c: CAPABILITY_STATE,	 file: 'chart-threads',		deck: decks.threadFruitSalad,	wide: false,	title: 'Migrations by thread',										desc: 'creation, running, moving between cores, termination'},
		threadLocks:		{ id: id(),	c: CAPABILITY_LOCK,		 file: 'chart-threads',		deck: decks.threadLocks,		wide: false,	title: 'Time each thread spends waiting for locks',					desc: ''},
		threadMigrations:	{ id: id(),	c: CAPABILITY_SWITCH,	 file: 'chart-units',		deck: decks.threadMigrations,	wide: false,	title: 'Rate of thread migrations',									desc: 'thread switching the core on which it is executing'},
		threadStates:		{ id: id(),	c: CAPABILITY_STATE,	 file: 'chart-percent',		deck: decks.threadStates,		wide: false,	title: 'Breakdown of thread states compared to number of cores',	desc: 'number of threads compared to number of cores'},
		threadSwitches:		{ id: id(),	c: CAPABILITY_SWITCH,	 file: 'chart-units',		deck: decks.threadSwitches,		wide: false,	title: 'Core switching the thread it is executing',					desc: 'thread switches'},
	};
}]);


app.factory('strips', ['facets', function(facets) {
	var example_good = 'The biggest is the shape, the more accurate is the use of resources.';
	var example_ok = 'A big shape means an under-exploitation of resources.';
	var example_bad = 'A non minimal shape means a problem or a misusing of resources.';
	return {
		r:		{ title: 'Running',					facet: facets.r,	reverse: false,	description: 'This graph represents the time spent in thread execution.', example: example_good },
		i:		{ title: 'Unused cores',			facet: facets.i,	reverse: true,	description: 'This graph shows the time spend by the core waiting a thread to run.', example: example_ok },
		yb:		{ title: 'Waiting for a core',		facet: facets.yb,	reverse: false,	description: 'This graph shows the time spent by threads while waiting a core.', example: example_bad },
		lw:		{ title: 'Waiting for a ressource',	facet: facets.lw,	reverse: false,	description: 'This graph represents the time spent by threads while waiting for a lock.', example: example_bad },
		q:		{ title: 'Parallelisation',			facet: facets.p,	reverse: false,	description: 'This graph represents the parallelised state of the cores, at least two threads running simultaneously.', example: example_good },
		miss:	{ title: 'Cache misses',			facet: facets.miss,	reverse: false,	description: 'This graph represents the time spent on locality misses.', example: example_bad },
		e:		{ title: 'Memory bandwidth',		facet: facets.e,	reverse: false,	description: 'This graph shows the amount memory bandwidth used.', example: example_bad },
		il:		{ title: 'Cache coherency',			facet: facets.il,	reverse: false,	description: 'This graph shows the amount of invalidations of shared memory by cores.', example: example_bad }
	};
}]);


app.factory('categories', ['widgets', 'strips', 'facets',  function(widgets, strips, facets) {
	var yb =	JSON.parse(JSON.stringify(facets.yb));
	var lw =	JSON.parse(JSON.stringify(facets.lw));
	var miss =	JSON.parse(JSON.stringify(facets.miss));
	var uc =	JSON.parse(JSON.stringify(facets.i));
	
	yb.shift = true;
	lw.shift = true;
	miss.shift = true;
	uc.label = "Unused cores"
	
	var common = {
		label: 'Profile', title: 'Profile', icon: 'heartbeat',
		strips: [strips.r],
		gauges: []
	};
	var tg = {
		tag: 'tg', cat: 'tg', label: 'Task granularity', title: 'Task granularity', icon: 'sliders', enabled: true,
		description: 'This category helps about the challenge to find enough parallelism to keep the machine busy.',
		example: 'If there are too many threads, the cost of these overheads can exceed the benefits.',
		strips: [strips.yb, strips.i],
		gauges: [[yb, facets.i], [facets.s, facets.m]], /* facets.r, */
		widgets: [widgets.threadStates, widgets.threadSwitches, widgets.threadMigrations, widgets.threadFruitSalad]
	};
	var sy = {
		tag: 'sy', cat: 'sy', label: 'Synchronisation', title: 'Synchronisation', icon: 'refresh', enabled: true,
		description: 'This category helps about the synchronisation needed to ensure that all threads get a consistent view of a shared memory. The common mechanism is the lock.',
		example: 'If the algorithm requires a large amount of synchronization, the overhead can offset much of the benefits of parallelism.',
		strips: [strips.lw],
		gauges: [[lw], [facets.ls, facets.lf]],
		widgets: [widgets.lockCounts, widgets.lockContentions, widgets.threadLocks]
	};
	var ds = {
		tag: 'ds', cat: 'ds', label: 'Data sharing', title: 'Data sharing', icon: 'exchange', enabled: true,
		description: 'This category helps about the data shared between cores.',
		example: 'These transfers take time, with the result that there is typically a cost to data sharing, particularly when shared variables and data structures are modified.',
		strips: [strips.il],
		gauges: [[lw, miss]],
		widgets: [widgets.lockContentions, widgets.cacheMisses, widgets.cacheInvalidL1, widgets.cacheInvalidL2, widgets.cacheInvalid, widgets.cacheInvalidations, widgets.memBandwidth, widgets.coreBandwidth]
	};
	var lb = {
		tag: 'lb', cat: 'lb', label: 'Load balancing', title: 'Load balancing', icon: 'list-ol', enabled: true,
		description: 'This category helps about the attempt to divide work evenly among the cores.',
		example: 'Dividing the work in this way is usually, but not always, beneficial.',
		strips: [strips.q],
		gauges: [[uc, lw], [facets.m]],
		widgets: [widgets.coreIdle, widgets.lockContentions, widgets.threadMigrations, widgets.threadStates, widgets.coreSequences, widgets.threadChains]
	};
	var dl = {
		tag: 'dl', cat: 'dl', label: 'Data locality', title: 'Data locality', icon: 'compass', enabled: true,
		description: 'This category helps about identifying which memory is used: CPU, RAM and disk.',
		example: 'More the memory is away from the core, more processor cycles are needed to read a value.',
		strips: [strips.miss],
		gauges: [[miss]], /* facets.ipc, */
		widgets: [widgets.cacheMisses, widgets.cacheBreackdown]
	};
	var rs = {
		tag: 'rs', cat: 'rs', label: 'Resource sharing', title: 'Resource sharing', icon: 'sitemap', enabled: true,
		description: 'This category helps about sharing resources between all threads.',
		example: 'For example, all cores will typically share a single connection to main memory.',
		strips: [strips.e],
		gauges: [],
		widgets: [widgets.memBandwidth, widgets.coreBandwidth, widgets.lockCounts, widgets.cacheMisses, widgets.cacheInvalidL1, widgets.cacheInvalidL2, widgets.cacheInvalid, widgets.cacheInvalidations]
	};
	var io = {
		tag: 'io', cat: 'io', label: 'Input/Output', title: 'Input/Output', icon: 'plug', enabled: false,
		description: 'This category helps about the degradation of performance while compete for I/O resources.',
		example: 'I/O contentions are often seen in instances of heavy workloads and causes latency and bottlenecks.',
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