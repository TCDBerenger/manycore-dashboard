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
		
		white:	{ t: list.white,	f: list.white,	n: list.white,	g: list.white,	h: list.white },
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
	var desc_w = 'threads are not ready to be processed because they waiting resource(s)';
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
		sys: 	{ label: 'System',				capability: CAPABILITY_STATE,		attr: 'sys',	unity: 'ms', cat: 'times',	colours: colours.sets.Grey,		color: colours.list.lGrey,		fcolor: colours.list.nGrey,		gcolor: colours.list.white },
		lw:		{ label: 'Lock waiting',		capability: CAPABILITY_LOCK,		attr: 'lw',		unity: 'ms', cat: 'times',	colours: colours.sets.Yellow,	color: colours.list.nYellow,	fcolor: colours.list.dYellow,	gcolor: colours.list.fYellow },
		lh:		{ label: 'Lock holding',		capability: CAPABILITY_LOCK,		attr: 'lh',		unity: 'ms', cat: 'times',	colours: colours.sets.Turquoise },
		o:		{ label: 'Single-code execution',capability: CAPABILITY_STATE,		attr: 'o',		unity: 'ms', cat: '',		colours: colours.sets.Orange },
		p:		{ label: 'Parallel execution',	capability: CAPABILITY_STATE,		attr: 'p',		unity: 'ms', cat: '',		colours: colours.sets.Green },
		
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
		
		qs:		{ label: 'Sequential sequence',		capability: CAPABILITY_STATE,	attr: 'qs',	unity: '', cat: '', colours: colours.sets.Orange },
		qp:		{ label: 'Parallel sequence',		capability: CAPABILITY_STATE,	attr: 'qp',	unity: '', cat: '', colours: colours.sets.Green },
		
		e:		{ label: 'Program memory bandwidth',	capability: CAPABILITY_MEMORY,	attr: 'e',	unity: 'MB',	colours: colours.sets.Magenta },
		ue:		{ label: 'Idle memory bandwidth',		capability: CAPABILITY_MEMORY,	attr: 'ue',	unity: 'MB',	colours: colours.sets.Blue },
		se:		{ label: 'System memory bandwidth',		capability: CAPABILITY_MEMORY,	attr: 'se',	unity: 'MB',	colours: colours.sets.Grey },
		
		il:		{ label: 'Cache line invalidations',	capability: CAPABILITY_COHERENCY,	attr: 'il',		unity: '',	colours: colours.sets.Red3 },
		il1:	{ label: 'L1 cache line invalidations',	capability: CAPABILITY_COHERENCY,	attr: 'il1',	unity: '',	colours: colours.sets.Red4 },
		il2:	{ label: 'L2 cache line invalidations',	capability: CAPABILITY_COHERENCY,	attr: 'il2',	unity: '',	colours: colours.sets.Red2 },
		pil1:	{										capability: CAPABILITY_COHERENCY,	attr: 'pil1',				colours: colours.sets.white },
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

	// Clues for thread states (running, waiting, ready, ...)
	var clues_threadStates = [
		{
			img:	'limit_r',
			t:		'Executing normally',
			good:	true
		}, {
			img:	'limit_r-y',
			t:		'Bad threads to cores ratio',
			q:		'More parallelism in application than hardware can exploit',
			i:		'Reduce number of threads',
			for:	'lb'
		}, {
			img:	'limit_i',
			t:		'Undersubscription',
			i:		'Try adding threads',
			q:		['Program could consume more CPU time','Program could be waiting for data dependencies'],
			for:	'lb'
		}, {
			img:	'limit_i-lw',
			t:		['Chains of data dependencies', 'Bad threads to cores ratio'],
			for:	'lb'
		}, {
			img:	'limit_sys',
			t:		'Overloaded system',
			i:		'Close unecessary programs',
			q:		'Background tasks are using too many resources.'
		}, {
			img:	'limit_i-r',
			alt:	'well distributed',
			t:		'Undersubscription',
			q:		'The work is not appropriately divided',
			i:		'Program could consume more CPU time (try adding threads)',
			for:	'tg'
		}, {
			img:	'limit_r-y',
			t:		'Oversubscription',
			q:		'More parallelism in application than hardware can exploit',
			i:		'Reduce number of threads',
			for:	'tg'
		}, {
			img:	'limit_sys-y',
			t:		'Oversubscription',
			q:		'Other programs are consuming CPU time',
			i:		'Close unecessary programs',
			for:	'tg'
		}, {
			img:	'limit_i-lw',
			t:		'Low work to sync. ratio',
			q:		['Many threads contend for few locks','Possible deadlock scenario'],
			for:	'sy'
		}
	];
	
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
			clues: [{
					img:	'coord_5',
					alt:	'Address translation',
					t:		'TLB Locality',
					q:		'poor TLB Locality'
				}, {
					img:	'coord_6-7',
					alt:	'Loading from L2 & L3',
					t:		'Cache locality',
					q:		'poor cache locality and possibly also have other issues'
				}, {
					img:	'coord_9',
					alt:	'Swapping',
					t:		'Page faults'
				}
			],
			settings: [
				{ property: 'colorMode', value: 0, type: 'select', label: 'Color by', choices: ['good <--> poor locality', 'process', 'thread'] },
				{ property: 'colorThreshold', value: 20, type: 'range', label: 'Locality threshold', unit: '%', min: 5, max: 95, step: 5, depends: ['colorMode', 0] },
			]
		},
		cacheInvalidations: {
			handling: {
				time: TIME_PROFILE,
			},
			graph: {
				v:				[facets.pil1, facets.il1, facets.il2],
				limit:			limit,
//				value_divider:	1,
				axis_label: 	function(v, index, r) { return ((v > 100) ? v - 100 : 100 - v) + '%'; }
			},
			data: [facets.il1, facets.il2],
			focus: [facets.il1, facets.il2],
			legend: {
				axis: [
					{ b: '%', t: 'Percent',	d: 'maximum possible cache line invalidations per cache (L1 or L2)', c: colours.list.fGrey}
				],
				data: [
					{ b: '▮', 	d: 'L1 cache misses due to invalidation',	f: facets.il1, t: 'L1 invalidation misses' },
					{ b: '▮', 	d: 'L2 cache misses due to invalidation',	f: facets.il2, t: 'L2 invalidation misses' }
				]
			},
			clues: [{
					img:	'mean',
					good:	true,
					t:		'No sharing',
					q:		'No sharing of data between threads'
				}, {
					img:	'mean_il1',
					t:		'Coarse sharing',
					q:		'Lots of coarse-grained data sharing (between threads on different core)'
				}, {
					img:	'mean_il2',
					t:		'Fine sharing',
					q:		'Lots of fine-grained data sharing (between threads on the same core)'
				}
			],
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
					{ b: '%', t: 'Percent',	d: 'ratio of time spent on locality misses compared to time spent on executing', c: colours.list.fGrey}
				],
				data: [
					{ b: '▮', f: facets.ipc,	d: 'number of instructions' },
					{ b: '▮', f: facets.tlb,	d: 'address translation (TLB) misses' },
					{ b: '▮', f: facets.l1,		d: 'level 1 cache miss, loading data from L2 cache' },
					{ b: '▮', f: facets.l2,		d: 'level 2 cache miss, loading data from L3 cache' },
					{ b: '▮', f: facets.l3,		d: 'level 3 cache miss, loading data from RAM' },
					{ b: '▮', f: facets.hpf,	d: 'hard page faults, swapping to disk' }
				]
			},
			clues: [{
				f:		facets.ipc,
				t: 		'Low memory access',
//				img:	'percent_ipc',
				good:	true
			}, {
				f:		facets.l2,
//				img:	'percent_l2',
				alt:	'many loads from L3',
				t:		['True sharing', 'Sharing of lock data structures', 'Sharing data between distant cores'],
				for:	'ds'
			}, {
				f:		facets.l3,
//				img:	'percent_l3',
				alt:	'many loads from RAM',
				t:		'True sharing',
				for:	'ds'
			}, {
				img:	'plain_miss',
				t:		'Poor cache locality',
				q:		'Many cache misses at all levels',
				for:	'dl'
			}, {
				f:		facets.tlb,
				alt:	'lots of address trans.',
				t:		['TLB Locality', 'DRAM memory pages', 'Page faults',],
				for:	'dl'
			}, {
				f:		facets.l3,
				alt:	'many loads from RAM',
				t:		['Cache locality', 'TLB Locality'],
				for:	'dl'
			}, {
				f:		facets.hpf,
				alt:	'lots of swapping',
				t:		['DRAM memory pages', 'Page faults'],
				for:	'dl'
			}, {
				f:		facets.l2,
				alt:	'many loads from L3',
				t:		'False data sharing',
				for:	'rs'
			}, {
				f:		facets.l3,
				alt:	'many loads from RAM',
				t:		'False data sharing',
				for:	'rs'
			}, {
				f:		facets.hpf,
				alt:	'lots of swapping',
				t:		'Exceeding mem. capacity',
				for:	'rs'
			}],
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
					{ b: '⊢', f: limit,	t: 'Cores',	d: 'each line represents a core' }
				],
				data: [
					{ b: '▮', f: facets.e,	d: 'usage by core' },
				]
			},
			clues: [{
					img:	'lines',
					t:		'Low memory requirement',
					good:	true
				}, {
					img:	'lines_e-full',
					t:		'High remote memory access',
					q:		['The program is memory-hungry','May indicate <strong>Sharing of data between CPUs on NUMA systems</strong>'],
					for:	'ds'
				}, {
					img:	'lines_e-following',
					good:	true,
					t:		'Well balanced memory accesses',
					q:		'Few threads accessing memory at once',
					for:	'rs'
				}, {
					img:	'lines_e-one',
					t:		'Exceeding mem. bandwidth',
					q:		'Poorly balanced memory accesses',
					i:		'Try splitting the work more finely',
					for:	'rs'
				}, {
					img:	'lines_e-alt',
					t:		'Exceeding mem. bandwidth',
					q:		'Poorly balanced memory accesses (because many threads accessing memory at once)',
					i:		'Try splitting the work more finely',
					for:	'rs'
				}, {
					img:	'lines_e-full',
					t:		'Exceeding mem. bandwidth',
					q:		'The program is memory-hungry',
					for:	'rs'
				}
			],
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
					{ b: '⊢', f: limit,	t: 'Cores',	d: 'each line represents a core' }
				],
				data: [
					{ b: '▮', f: facets.i, t: 'Idle', d: 'time spent by the core waiting for a thread of this program to run (work from other programs is considered as idle time)' }
				]
			},
			clues: [{
					img:	'lines',
					t:		'All cores executing',
					good:	true
				}, {
					img:	'lines_i-alt',
					t:		'Alternating s./p. execution'
				}, {
					img:	'lines_i-bad',
					t:		'Bad load balance',
					q:		'Some cores are under-used and some fully-used'
				}, {
					img:	'lines_i-full',
					t:		'Undersubscription',
					i:		'Try adding threads',
					q:		['Program could consume more CPU time','Program could be waiting for data dependencies'],
				}
			],
			settings: [
				{ property: 'melodyHeight', value: 9, type: 'range', label: 'Inactivity height', unit: 'pixels', min: 6, max: 12, step: 1 }
			]
		},
		coreInvalidations: {
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
				data: [
					{ b: '▮', 	d: 'L1 cache misses due to invalidation',	f: facets.il1, t: 'L1 invalidation misses' },
					{ b: '▮', 	d: 'L2 cache misses due to invalidation',	f: facets.il2, t: 'L2 invalidation misses' }
				]
			},
			clues: [{
					img:	'blank',
					alt: 	'few invalidations',
					t:		'Low sharing',
					q:		'Different threads rarely access the same data'
				}, {
					f:		facets.il1,
					t:		'Coarse sharing',
					alt:	'many L1 invalidation misses',
					q:		'Lots of coarse-grained data sharing (between threads on different core)'
				}, {
					f:		facets.il2,
					t:		'Fine sharing',
					alt:	'many L2 invalidation misses',
					q:		'Lots of fine-grained data sharing (between threads on the same core)'
				}
			],
			settings: []
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
					{ b: '◓',	f: facets.lw,	t: 'Over capacity',				d: 'time spent by threads while waiting for a lock' },
					{ b: '▪▪',	f: facets.i,	t: 'Limit of core capacity',	d: 'capacity of CPU computation' },
					{ b: '◒',	f: facets.r,	t: 'Core capacity',				d: 'time spent in thread execution, idle, or used by the OS' }
				],
				data: [
					{ b: '▮', f: facets.lw,		d: 'threads are waiting to acquire a lock' },
					{ b: '▮', f: facets.r,		d: 'thread is actively executing', },
					{ b: '▮', f: facets.i,		d: 'no thread running on core' },
					{ b: '▮', f: facets.sys,	d: 'Core occupied by other program',	 c: colours.list.fGrey }
				]
			},
			clues: clues_threadStates,
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
				limitLabel:	'μ',
			},
			data: [facets.ls, facets.lf],
			focus: [facets.ls, facets.lf],
			legend: {
				axis: [
					{ b: 'μ', t: 'Typical value',	d: 'the expected value of lock acquisitions',	f: limit, sv: 'calibration', sd: 'lock acquisitions by ms' },
					{ b: '2×', t: 'Excess',		d: 'more lock acquisitions than expected (multiple of the typical value)',			f: limit },
				],
				data: [
					{ b: '▮', t: 'Lock with contention',	d: 'number of failed lock acquisitions',	f: facets.lf },
					{ b: '▮', t: 'Lock without contention',	d: 'number of successful lock acquisitions',	f: facets.ls }
				]
			},
			clues: [{
				img:	'mean',
				t:		'No synchronisation',
				q:		'Very few locks',
				good:	true
			}, {
				img:	'mean_ls',
				t:		'No contention',
				q:		'Locking without contention',
				good:	true
			}, {
				img:	'mean_lf-half',
				good:	true,
				t:		'Low contention',
				q:		'Very little contention for locks'
			}, {
				img:	'mean_lf',
				t:		['Low work to sync. ratio', 'Badly-behaved spinlocks'],
				q:		'Threads spend too much time acquiring locks',
				for:	'sy'
			}, {
				img:	'mean_lf-full',
				t:		['Low work to sync. ratio', 'Badly-behaved spinlocks'],
				q:		'Threads spend too much time acquiring locks',
				for:	'sy'
			}, {
				img:	'mean_lf-full',
				t:		['False data sharing', 'Competition between threads sharing a cache'],
				q:		'High contention',
				i:		'Try dividing the work more coarsely',
				for:	'rs'
			}],
			plans: [
				{ id: 1, label: 'log₂', property: 'useLogScale' },
				{ id: 2, label: 'linear', property: 'useLinearScale' },
			],
			settings: [
				{ property: 'calibration', type: 'pnumeric', check: 'positive', label: 'Typical values', unit: 'lock acquisitions', psource: function(profile) { return profile.hardware.data.lcores * (profile.hardware.calibration.ls + profile.hardware.calibration.lf); } },
				{ property: 'timeGroup', value: 50, type: 'range', label: 'Group by', unit: 'ms', min: 10, max: 50, step: 5 },
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
			data: [facets.e, facets.ue],
			focus: [facets.e, facets.ue, facets.se],
			legend: {
				axis: [],
				data: [
					{ b: '▮', f: facets.e,	d: 'used by this program' },
					{ b: '▮', f: facets.ue,	d: 'available memory bandwidth' },
					{ b: '▮', f: facets.se,	d: 'used by other programs' }
				]
			},
			clues: [{
				img:	'percent_i',
				t:		'Low memory requirement',
				good:	true
			}, {
				img:	'percent_e-sys',
				t: 		'Competing for memory',
				q:		'Other programs are using too much memory',
				i:		'Close uncessary programs'
			}, {
				img:	'percent_e',
				t:		'High remote memory access',
				q:		['The program is memory-hungry','May indicate <strong>Sharing of data between CPUs on NUMA systems</strong>'],
				for:	'ds'
			}, {
				img:	'percent_e',
				t:		'Exceeding mem. bandwidth',
				q:		'The program is memory-hungry',
				for:	'rs'
			}],
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
					{ b: '⊢', f: limit,	t: 'Threads',	d: 'each line represents a thread complying with the start and end times' },
				],
				data: [
					{ b: '[ ]',	c: facets.ls.colours.f,	t: 'Lock acquire and release',	d: 'the lock events' },
					{ b: '▮',	f: facets.ls,			t: 'Lock hold',					d: 'a thread is holding a lock' },
					{ b: '┊',	f: facets.lf,			t: 'Lock dependency',			d: 'indicating which thread holds the lock (customisable)' },
					{ b: '×',	f: facets.lf,			t: 'Lock failure',				d: 'attempt to acquire a lock' },
				]
			},
			clues: [{
					img:	'lines',
					t:		'No locking',
					good:	true
				}, {
					img:	'lines_flow',
					t:		'Locking without contention',
					good:	true
				}, {
					img:	'lines_contentions',
					t:		'Sharing of lock data structures',
					i:		'Locks are shared between many threads',
					for:	'ds'
				}, {
					img:	'lines_dependency',
					t:		'Chains of data dependencies',
					q:		'Data dependencies force serial execution phases',
					i:		'Try more fine-grained locking',
					for:	'lb'
				}
			],
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
				limitLabel:	'μ',
			},
			data: [facets.m],
			focus: [facets.m],
			legend: {
				axis: [
					{ b: 'μ', t: 'Typical value',	d: 'the expected value of thread migrations',	f: limit, sv: 'calibration', sd: 'thread migrations by ms' },
					{ b: '×', t: 'Excess',			d: 'more thread migrations than expected (multiple of the typical value)',			f: limit },
				],
				data: [
					{ b: '▮', d:'thread migrates to another core', f: facets.m }
				]
			},
			clues: [{
				img: 'mean',
				t:	 'Low thread migration',
				good: true
			}, {
				img: 'mean_m',
				t:	 'Average thread migration',
				good: true
			}, {
				img: 'mean_m-full',
				t: 'Oversubscription',
				q: 'Too many threads are waiting to execute',
				i: 'Reduce the number of threads',
				for: 'tg'
			}, {
				img: 'mean_m-alt',
				t: 'Alternating s./p. execution',
				q: 'Sequential phases limit performance of the system',
				i: 'Try to eliminate sequential phases and load balance better',
				for: 'lb'
			}],
			plans: [
				{ id: 1, label: 'log₂', property: 'useLogScale' },
				{ id: 2, label: 'linear', property: 'useLinearScale' },
			],
			settings: [
				{ property: 'calibration', type: 'pnumeric', check: 'positive', label: 'Typical values', unit: 'thread migrations', psource: function(profile) { return profile.hardware.data.lcores * profile.hardware.calibration.m; } },
				{ property: 'timeGroup', value: 50, type: 'range', label: 'Group by', unit: 'ms', min: 10, max: 50, step: 5 },
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
				limitLabel:	'μ',
			},
			data: [facets.s],
			focus: [facets.s],
			legend: {
				axis: [
					{ b: 'μ', t: 'Typical value',	d: 'the expected value of context switches',	f: limit, sv: 'calibration', sd: 'context switches by ms' },
					{ b: '2×', t: 'Excess',		d: 'more context switches than expected (multiple of the typical value)',		f: limit },
				],
				data: [
					{ b: '▮', d: 'cores switching from one thread to another', f: facets.s }
				]
			},
			clues: [{
				img: 'mean',
				t:	 'Low context switching',
				good: true
			}, {
				img: 'mean_s',
				t:	 'Average context switching',
				good: true
			}, {
				img: 'mean_s-full',
				t: 'Oversubscription',
				q: 'Too many threads are waiting to execute',
				i: 'Reduce the number of threads'
			}],
			plans: [
				{ id: 1, label: 'log₂', property: 'useLogScale' },
				{ id: 2, label: 'linear', property: 'useLinearScale' },
			],
			settings: [
				{ property: 'calibration', type: 'pnumeric', check: 'positive', label: 'Typical values', unit: 'context switches', psource: function(profile) { return profile.hardware.data.lcores * profile.hardware.calibration.s; } },
				{ property: 'timeGroup', value: 50, type: 'range', label: 'Group by', unit: 'ms', min: 10, max: 50, step: 5 },
				{ property: 'highlightOverflow', value: false, type: 'flag', label: 'High zone', desc: 'shows the high area, over the typical value' }
			]
		},
		threadAllStates: {
			handling: {
				time: TIME_PROFILE,
			},
			graph : {
				v:		[facets.sys, facets.i, facets.r, facets.yb, facets.lw],
				limit:	facets.i,
				axis:	{ labels: 'cores' }
			},
			data: [facets.lw, facets.b, facets.y, facets.r, facets.i],
			focus: [facets.sys, facets.i, facets.r, facets.yb, facets.lw],
			legend: {
				axis: [
					{ b: '◓',	f: facets.lw,	t: 'Over capacity',				d: 'time spent by threads while waiting for a lock' },
					{ b: '◓',	f: facets.yb,	t: 'Over capacity',				d: 'time spent by threads while waiting a core' },
					{ b: '▪▪',	f: facets.i,	t: 'Limit of core capacity',	d: 'capacity of CPU computation' },
					{ b: '◒',	f: facets.r,	t: 'Core capacity',				d: 'time spent in thread execution, idle, or used by the OS' }
				],
				data: [
					{ b: '▮', f: facets.lw,		d: 'threads are not ready to be processed because they waiting to acquire a lock' },
					{ b: '▮', f: facets.yb,		t: 'ready + standby',	d: 'thread is ready to run but is is waiting for a core to become available'},
					{ b: '▮', f: facets.r,		d: 'thread is actively executing', },
					{ b: '▮', f: facets.i,		d: 'no thread running on core' },
					{ b: '▮', f: facets.sys,	d: 'Core occupied by other program',	 c: colours.list.fGrey }
				]
			},
			clues: clues_threadStates,
			settings: []
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
					{ b: '◓',	f: facets.yb,	t: 'Over capacity',				d: 'time spent by threads while waiting a core' },
					{ b: '▪▪',	f: facets.i,	t: 'Limit of core capacity',	d: 'capacity of CPU computation' },
					{ b: '◒',	f: facets.r,	t: 'Core capacity',				d: 'time spent in thread execution, idle, or used by the OS' }
				],
				data: [
					{ b: '▮', f: facets.yb,		t: 'ready + standby',	d: 'thread is ready to run but is is waiting for a core to become available'},
					{ b: '▮', f: facets.r,		d: 'thread is actively executing', },
					{ b: '▮', f: facets.i,		d: 'no thread running on core' },
					{ b: '▮', f: facets.sys,	d: 'Core occupied by other program',	 c: colours.list.fGrey }
				]
			},
			clues: clues_threadStates,
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
					{ b: '⊢', f: limit,	t: 'Threads',	d: 'each line represents a thread complying with the start and end times' }
				],
				data: [
					{ b: '|',				d:'thread migrates to another core', f: facets.m },
					{ b: '◧', t: 'Cores',	d: 'core to which a thread is attached to (one color by core)',	 c: colours.list.fGrey }
				]
			},
			clues: [{
					img:	'lines_m-full',
					plan:	'rate',
					t:		'Oversubscription',
					q:		'Too many threads are waiting to execute',
					i:		'Reduce the number of threads'
				}, /*{
					img:	'lines_m-alt',
					plan:	'rate',
					t:		'Alternating s./p. execution',
					q:		'Too many threads are waiting to execute',
					i:		'Reduce the number of threads'
				}, */{
					img:	'lines',
					plan:	'rate / events',
					good:	true
				}, {
					img:	'lines_m-low-rate',
					plan:	'events',
					good:	true
				}, {
					img:	'lines_m-high-rate',
					plan:	'events',
					t:		'Thread migrations',
					q:		'Low affinity',
					i:		['Reduce the number of threads', 'Bind threads to specific cores']
				}, {
					img:	'lines_affinity',
					plan:	'core affinity',
					good:	true,
					t:		'High affinity',
					q:		'Threads rarely migrate'
				}, {
					img:	'lines_fruitsalad',
					alt:	'fruit salad effect',
					plan:	'core affinity',
					t:		'Thread migrations',
					q:		'Low affinity',
					i:		['Reduce the number of threads', 'Bind threads to specific cores']
				}
			],
			plans: [
				{ id: 1, label: 'rate', property: 'groupTicks' },
				{ id: 2, label: 'events', property: 'enableTicks' },
				{ id: 3, label: 'core affinity', property: 'enablePeriods' }
			],
			plansTooltip: 'change the graph mode',
			settings: [
				{ property: 'timeGroup', value: 50, type: 'range', label: 'Group by', unit: 'ms', min: 10, max: 50, step: 5 }, // depends: ['plan', 0]
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
					{ b: '⊢', f: limit,	t: 'Threads',	d: 'each line represents a thread complying with the start and end times' }
				],
				data: [
					{ b: '╳', t: 'Lock with contention',		d: 'failure of lock acquisition',	f: facets.lf },
					{ b: '[', t: 'Lock without  contention',	d: 'success of lock acquisition',	f: facets.ls },
					{ b: '▮', f: facets.lw,						d: 'threads are not ready to be processed because they waiting to acquire a lock' }
				]
			},
			clues: [{
					img:	'lines',
					t:		'No synchronisation',
					q:		'Very few locks',
					good:	true
				}, {
					img:	'lines_acquiring',
					t:		'No contention',
					q:		'Locking without contention',
					good:	true
				}, {
					img:	'lines_lw-full',
					alt:	'mostly waiting',
					t:		'Low work to sync. ratio',
					q:		'High contention',
					i:		'Threads are mostly waiting for a lock'
				}, {
					img:	'lines_contentions',
					t:		'Badly-behaved spinlocks',
					i:		'Repeated lock acquisition failures'
				}
			],
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
				sequences:	{ under: facets.qs, count: facets.qp }
			},
			data: [facets.r, facets.i],
			legend: {
				axis: [
					{ b: '⊢', f: limit,	t: 'Cores',	d: 'each line represents a core, not in the right order, not with the right thread' }
				],
				data: [
					{ b: '░', t: '[Sequential] phase',		d: 'one core is executing a thread (could be customised)',		f: facets.qs },
					{ b: '■', t: '[Sequential] execution',	d: 'core is executing a thread',								f: facets.qs },
					{ b: '░', t: '[Parallel] phase',		d: 'many cores are executing a thread (could be customised)',	f: facets.qp },
					{ b: '■', t: '[Parallel] execution',	d: 'core is executing a thread',								f: facets.qp },
					{ b: '─', t: 'line',					d: 'core is idle',												f: limit }
				]
			},
			clues: [{
					img:	'lines_qp',
					good:	true,
					alt:	'Mostly parallel execution',
					t:		'High parallelisation'
				}, {
					img:	'lines_qp-qs-alt',
					t: 'Alternating s./p. execution',
					q: 'Sequential phases limit performance of the system',
					i: 'Try to eliminate sequential phases and load balance better',
				}, {
					img:	'lines_qs',
					alt:	'Mostly serial execution',
					t:		'Low parallelisation'
				}
			],
			params: [
				{ property: 'lineHeight', value: 10 }
			],
			settings: [
				{ property: 'disableLine', value: false, type: 'flag', label: 'Core line', desc: 'hide core line' },
				{ property: 'disableSequenceDashs', value: false, type: 'flag', label: 'Core executing', desc: 'hide core executing' },
				{ property: 'disableSequenceBackgound', value: false, type: 'flag', label: 'Parallel sequences', desc: 'hide backgound sequences (parallel/sequential)' },
				{ property: 'sequenceThreshold', value: 1, type: 'range', label: 'Parallel threshold', unit: 'running threads', min: 1, max: 7, step: 1 },
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
/* 00 */	cacheBreackdown:	{ id: id(),	c: CAPABILITY_LOCALITY,	 file: 'chart-d3-pcoords',	deck: decks.cacheBreackdown,	wide: true,		title: 'Breakdown of cost by cause of locality misses',				desc: ''},
/* 01 */	cacheInvalidations:	{ id: id(),	c: CAPABILITY_COHERENCY, file: 'chart-percent',		deck: decks.cacheInvalidations,	wide: false,	title: 'Proportion of cache line invalidations',	                desc: 'A cache line invalidation can occur when multiple cores modify a shared memory location'},
/* 02 */	cacheMisses:		{ id: id(),	c: CAPABILITY_LOCALITY,	 file: 'chart-percent',		deck: decks.cacheMisses,		wide: false,	title: 'Proportion of locality misses',				                desc: 'Data cache misses as a proportion of instructions executed'},
/* 03 */	coreBandwidth:		{ id: id(),	c: CAPABILITY_MEMORY,	 file: 'chart-lines',		deck: decks.coreBandwidth,		wide: false,	title: 'Remote memory access by core',								desc: 'Memory bandwidth'},
/* 04 */	coreIdle:			{ id: id(),	c: CAPABILITY_STATE,	 file: 'chart-lines',		deck: decks.coreIdle,			wide: false,	title: 'Idle cores',												desc: 'Times that cores are idle'},
/* 05 */	coreInvalidations:	{ id: id(),	c: CAPABILITY_COHERENCY, file: 'chart-d3-caches',	deck: decks.coreInvalidations,	wide: true,		title: 'Breakdown of cache line invalidations by core',             desc: ''},
/* 06 */	coreSequences:		{ id: id(),	c: CAPABILITY_STATE,	 file: 'chart-lines',		deck: decks.sequences,			wide: false,	title: 'Execution phases',                 							desc: 'Phase of execution (sequential or parallel)'},
/* 07 */	lockCounts:			{ id: id(),	c: CAPABILITY_LOCK,		 file: 'chart-units',		deck: decks.lockCounts,			wide: false,	title: 'Lock contentions',											desc: 'Locking with and without contention'},
/* 08 */	lockContentions:	{ id: id(),	c: CAPABILITY_LOCK,		 file: 'chart-percent',		deck: decks.lockContentions,	wide: false,	title: 'Time waiting for a lock',									desc: ''},
/* 09 */	memBandwidth:		{ id: id(),	c: CAPABILITY_MEMORY,	 file: 'chart-percent',		deck: decks.memBandwidth,		wide: false,	title: 'Remote memory access',										desc: 'Memory bandwidth'},
/* 10 */	threadChains:		{ id: id(),	c: CAPABILITY_LOCK,		 file: 'chart-lines',		deck: decks.threadChains,		wide: false,	title: 'Chains of dependencies on locks',							desc: 'Synchronisations, waiting and dependencies (mouseover) between threads '},
/* 11 */	threadFruitSalad:	{ id: id(),	c: CAPABILITY_STATE,	 file: 'chart-threads',		deck: decks.threadFruitSalad,	wide: false,	title: 'Migrations by thread',										desc: 'Creation, running, moving between cores, termination'},
/* 12 */	threadLocks:		{ id: id(),	c: CAPABILITY_LOCK,		 file: 'chart-threads',		deck: decks.threadLocks,		wide: false,	title: 'Time each thread spends waiting for locks',					desc: ''},
/* 13 */	threadMigrations:	{ id: id(),	c: CAPABILITY_SWITCH,	 file: 'chart-units',		deck: decks.threadMigrations,	wide: false,	title: 'Rate of thread migrations',									desc: 'Thread switching the core on which it is executing'},
/* 14 */	threadStates:		{ id: id(),	c: CAPABILITY_STATE,	 file: 'chart-percent',		deck: decks.threadStates,		wide: false,	title: 'Breakdown of thread states compared to number of cores',	desc: 'Number of threads compared to number of cores'},
/* 15 */	threadAllStates:	{ id: id(),	c: CAPABILITY_STATE,	 file: 'chart-percent',		deck: decks.threadAllStates,	wide: false,	title: 'Breakdown of thread states compared to number of cores',	desc: 'Number of threads compared to number of cores'},
/* 16 */	threadSwitches:		{ id: id(),	c: CAPABILITY_SWITCH,	 file: 'chart-units',		deck: decks.threadSwitches,		wide: false,	title: 'Core switching the thread it is executing',					desc: 'Thread switches'},
	};
}]);


app.factory('strips', ['facets', function(facets) {
	var tooltip_r = [
		'Time spent executing threads in this program.',
		'A larger shape indicates more time spent executing.'];
	var tooltip_i = [
		'Idle time across all cores.',
		'A larger shape indicates under-utilisation of resources.'];
	var tooltip_yb = [
		'Time spent waiting for a core.',
		'A larger shape indicates a problem or a misuse of resources.'];
	var tooltip_lw = [
		'Time spent waiting for a locked resource.','A resource (data) is locked if it is currently being held by another thread.',
		'A larger shape indicates a problem or a misuse of resources.'];
	var tooltip_qs = [
        'Percentage of time spent by the machine executing the program on less than two cores. Program might not execute or might execute on a single core.',
		'A larger shape indicates more time is spent executing in sequential.'];
	var tooltip_miss = [
		'Cache misses as a percentage of instructions executed.',
		'A locality miss (TLB, L1, ..., HPF) occurs when the storage of a data is not right.',
		'A larger shape indicates a problem or a misuse of resources.'];
	var tooltip_e = [
		'Percentage of memory bandwidth used.',
		'A larger shape might indicate a problem or a misuse of resources.'];
	var tooltip_il = [
		'Percentage of cache line invalidations (L1 and L2) of shared memory by cores.',
		'A larger shape indicates a problem or a misuse of resources.'];
	
	return {
		r:		{ title: 'Running',					facet: facets.r,	reverse: false,	tooltip: tooltip_r },
		i:		{ title: 'Available CPU time',		facet: facets.i,	reverse: true,	tooltip: tooltip_i },
		yb:		{ title: 'Waiting for a core',		facet: facets.yb,	reverse: false,	tooltip: tooltip_yb },
		lw:		{ title: 'Waiting for a resource',	facet: facets.lw,	reverse: false,	tooltip: tooltip_lw },
		q:		{ title: 'Single-core execution', 	facet: facets.qs,	reverse: false,	tooltip: tooltip_qs },
		miss:	{ title: 'Cache misses',			facet: facets.miss,	reverse: false,	tooltip: tooltip_miss },
		e:		{ title: 'Memory bandwidth',		facet: facets.e,	reverse: false,	tooltip: tooltip_e },
		il:		{ title: 'Cache coherency',			facet: facets.il,	reverse: false,	tooltip: tooltip_il }
	};
}]);


app.factory('categories', ['widgets', 'strips', 'facets',  function(widgets, strips, facets) {
	var gauge_yb =	{ l: 'Waiting for a core',				f: facets.yb };
	var gauge_uc =	{ l: 'Unused CPU',						f: facets.i };
	var gauge_s =	{ l: 'Context switches',				f: facets.s };
	var gauge_m =	{ l: 'Thread migrations',				f: facets.m };
	var gauge_lw =	{ l: 'Waiting for a lock',				f: facets.lw };
	var gauge_ls =	{ l: 'Locks',							f: facets.ls };
	var gauge_lf =	{ l: 'Locks with contention',			f: facets.lf };
	var gauge_miss ={ 										f: facets.miss };
	var gauge_il =	{ 										f: facets.il };
	var gauge_e =	{ l: 'Memory bandwidth', 				f: facets.e };
	
	var common = {
		label: 'Profile', title: 'Profile', icon: 'heartbeat',
		strips: [strips.r],
		gauges: []
	};
	var tg = {
		tag: 'tg', cat: 'tg', label: 'Task granularity', title: 'Task granularity', icon: 'sliders', enabled: true,
		descriptionDash: [
			'This category describes the level of parallelism exhibited by the application.',	
			'For instance, if there are too many threads, the cost can exceed the benefits.',
		],
		descriptionDetails: [
			'In parallel programs it is often a challenge to find enough parallelism (performing many calculations simultaneously) to keep the machine busy.\
			 A key focus of parallel software development is designing algorithms that expose more parallelism.',
			'However, there are overheads associated with starting, managing and switching between parallel threads.\
			 If the tasks are too small (fine-grained parallelism), the cost of these overheads can exceed the benefits.\
			 Conversely, if tasks are too large (coarse-grained parallelism) some resources might be under utilized.',
			'Choosing the correct task granularity is critical.'
		],
		issues: [
			{ t: 'Oversubscription',			d: 'not enough free cores available' },
			{ t: 'Task start/stop overhead',	d: 'a dedicated thread is not justified for the amount of work performed' },
			{ t: 'Thread migration',			d: 'excessive thread movement across cores' }
		],
		strips: [strips.yb, strips.i],
		gauges: [[gauge_yb, gauge_uc], [gauge_s, gauge_m]],
		widgets: [widgets.threadStates, widgets.threadSwitches, widgets.threadMigrations, widgets.threadFruitSalad]
	};
	var sy = {
		tag: 'sy', cat: 'sy', label: 'Synchronisation', title: 'Synchronisation', icon: 'refresh', enabled: true,
		descriptionDash: [
			'This category helps about the synchronisation needed to ensure that all threads get a consistent view of a shared memory. The common mechanism is the lock.',	
			'If the algorithm requires a large amount of synchronization, the overhead can offset much of the benefits of parallelism.',
		],
		descriptionDetails: [
			'In a shared-memory programming model, where data is shared and updated by multiple threads;\
			 some sort of synchronisation is needed to ensure that all threads get a consistent view of memory.',
			'Synchronization always causes some overhead.',
			'If the algorithm requires a large amount of synchronization, the overhead can offset much of the benefits of parallelism.\
			 Perhaps the most common synchronisation mechanism is the lock;\
			 other mechanisms include barriers, semaphores, and the atomic instructions used in so-called “lock-free” and “wait-free” data structures.'
		],
		issues: [
			{ t: 'Low work to synchronisation ratio',	d: 'threads spend more time acquiring locks than executing' },
			{ t: 'Lock contention',						d: 'a thread attempts to acquire a lock held by another thread' },
			{ t: 'Badly-behaved spinlocks',				d: 'a thread repeatedly fails to acquire a lock without pause' }
		],
		strips: [strips.lw],
		gauges: [[gauge_lw], [gauge_ls, gauge_lf]],
		widgets: [widgets.lockCounts, widgets.lockContentions, widgets.threadLocks]
	};
	var ds = {
		tag: 'ds', cat: 'ds', label: 'Data sharing', title: 'Data sharing', icon: 'exchange', enabled: true,
		descriptionDash: [
			'This category helps about the data shared between cores.',	
			'These transfers take time, with the result that there is typically a cost to data sharing, particularly when shared variables and data structures are modified.',
		],
		descriptionDetails: [
			'Threads within a process communicate through data in shared memory.\
			 Sharing data between cores involves physically transferring the data along wires between the cores.',
			'On shared memory computers these data transfers happen automatically through the caching hardware.',
			'However these transfers take time, along with a cost to data sharing, particularly when shared variables and data structures are modified.'
		],
		issues: [
			{ t: 'True sharing of updated data',					d: 'the same variable is written/read by different cores' },
			{ t: 'Sharing data between CPUs on NUMA systems',	d: 'different parts of the data may be in different local memories' },
			{ t: 'Sharing of lock data structures',					d: 'large number of locks acquired or released' },
			{ t: 'Sharing data between distant cores',				d: 'transferring shared data between threads on distant cores' }
		],
		strips: [strips.il],
		gauges: [[gauge_lw], [gauge_il, gauge_miss]],
		widgets: [widgets.threadChains, widgets.memBandwidth, widgets.coreBandwidth, widgets.cacheMisses, widgets.cacheInvalidations, widgets.coreInvalidations]
	};
	var lb = {
		tag: 'lb', cat: 'lb', label: 'Load balancing', title: 'Load balancing', icon: 'list-ol', enabled: true,
		descriptionDash: [
			'This category helps about the attempt to divide work evenly among the cores.',	
			'Dividing the work in this way is usually, but not always, beneficial.',
		],
		descriptionDetails: [
			'Load balancing is the attempt to divide work evenly among the cores.\
			 Dividing the work in this way is usually, but not always, beneficial.',
			'There is an overhead in dividing work between parallel cores and it can sometimes be more efficient not to use all the available cores.\
			 Nonetheless, a poor load balance is one of the most easily understood performance problems.',
		],
		issues: [
			{ t: 'Undersubscription',							d: 'too few threads actively running' },
			{ t: 'Alternating sequential/parallel execution',	d: 'sequential phases limit performance of the system' },
			{ t: 'Chains of data dependencies',					d: 'the structure of some parts of the application prevents parallelisation' },
			{ t: 'Bad threads to cores ratio',					d: 'the work is not appropriately divided for the available cores' }
		],
		strips: [strips.q],
		gauges: [[gauge_uc, gauge_lw], [gauge_m]],
		widgets: [widgets.coreIdle, widgets.threadAllStates, widgets.threadMigrations, widgets.coreSequences, widgets.threadChains]
	};
	var dl = {
		tag: 'dl', cat: 'dl', label: 'Data locality', title: 'Data locality', icon: 'compass', enabled: true,
		descriptionDash: [
			'This category helps about identifying which memory is used: CPU, RAM and disk.',	
			'More the memory is away from the core, more processor cycles are needed to read a value.',
		],
		descriptionDetails: [
			'This is not a specifically multicore problem, but it is impossible to talk about single or multicore performance without talking about locality.',
			'Two or more memory accesses have data locality when they touch nearby memory regions. High data locality means caches are very effective, low data locality means caches have very little effect.',
			'Locality is important because it takes hundreds of processor cycles to access a value in main memory, but only a few cycles to access cache.\
			 This problem is often called the “memory wall”.',
		],
		issues: [
			{ t: 'Cache Locality',		d: 'data is not present in a reasonably nearby cache' },
			{ t: '<abbr title="Translation Lookaside Buffer">TLB</abbr> Locality',
										d: 'data used by the application is seldom in the same virtual page' },
			{ t: 'DRAM memory pages',	d: 'memory accesses seldom target the same physical DRAM pages' },
			{ t: 'Page faults',			d: 'not enough physical memory' }
		],
		strips: [strips.miss],
		gauges: [[gauge_miss]],
		widgets: [widgets.cacheMisses, widgets.cacheBreackdown]
	};
	var rs = {
		tag: 'rs', cat: 'rs', label: 'Resource sharing', title: 'Resource sharing', icon: 'sitemap', enabled: true,
		descriptionDash: [
			'This category helps about sharing resources between all threads.',	
			'For example, all cores will typically share a single connection to main memory.',
		],
		descriptionDetails: [
			'Those who are new to parallel programming often expect linear performance scaling: code running on four cores will be four times faster than on one core. There are many reasons why this is seldom true, but perhaps the most self-explanatory is that those four cores share and must compete for access to other parts of the hardware that have not been replicated four times. For example, all cores will typically share a single connection to main memory.',
		],
		issues: [
			{ t: 'Exceeding memory bandwidth',					d: 'the memory bus is saturated with requests' },
			{ t: 'Competition between threads sharing a cache',	d: '' },
			{ t: 'False data sharing',							d: 'updating data invalidates nearby locations which hold data used by other threads' }
		],
		strips: [strips.e],
		gauges: [[gauge_e, gauge_lw], [gauge_il]],
		widgets: [widgets.memBandwidth, widgets.coreBandwidth, widgets.lockCounts, widgets.cacheMisses, widgets.cacheInvalidations, widgets.coreInvalidations]
	};

	var output = {
		all: [tg, sy, ds, lb, dl, rs],
		tg: tg, sy: sy, ds: ds, lb: lb, dl: dl, rs: rs, common: common
	};
	
	return output;
}]);