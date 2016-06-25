/************************************************/
/* Experiment threads							*/
/*	(one thread is one experiment)				*/
/************************************************/
xpapp.factory('threads', function() {
	var looseThreads = [
		{
			id: 1, groups: 1,
			title: 'Test 1',
			goal: 'The goal of this survey is to evaluate a prototype visualisation for identifying the presence of <b>data-locality</b> issues.',
			tasks: [

			],
			steps: [
				// page: common					state: '...'
				// page: a task					taskID: 99
				// page: one in xp				pageID: '...'
				// init a form:					form:m { ... }
				// display next in sidebar:		nextInSidebar: true
				// dashboard path:				path: '/admin'
				// collect the mouse tracking:	mousetrack: true
				// Forbid go back to edit:		editable: false

				{ pageID: 'habits',		label: 'Your tools',			form: {} },
//				{ pageID: 'info',		label: 'Explanations' },
				{ taskID: 1,			label: 'Task 1',				form: {}, path: '/dashboard/9-8', mousetrack: true },
//				{ state: 'tool',		label: 'Test Particules',		path: '/dashboard/5-4', mousetrack: true, nextInSidebar: true },
//				{ pageID: 'start',		label: 'Experimentation',		form: {} },
//				{ state: 'tool',		label: 'Test Particules',		path: '/dashboard/1012', mousetrack: true, nextInSidebar: true },
//				{ pageID: 'questions',	label: 'Questions' },
//				{ state: 'feedback',	label: 'Feedback' }
			]
		},
	];
	
	// ID treatment
	var threads = [];
	looseThreads.forEach(function (thread) {
		thread.steps.unshift(
			{ label: 'We need your consent', state: 'consent', form: {}, editable: false },
			{ label: 'About you', state: 'user', form: {}, required: ['expertise', 'experience'] }
		);
		thread.steps.push({ label: 'Submit your answers', state: 'submit', form: {} });
		thread.steps.push({ label: 'The end', state: 'thankyou' });
		thread.steps.forEach(function(step, index) { step.id = index; });
		threads[thread.id] = thread;
	});
	
	return threads;
});

/************************************************/
/* Taxonomy										*/
/************************************************/
xpapp.service('taxonomy', function() {
	// Build the "flat" taxonomy
	this.tg =	{ id: 'tg',	t: 'Task granularity',	i: 'sliders',	d: '' },
	this.sy =	{ id: 'sy',	t: 'Synchronisation',	i: 'refresh',	d: '' },
	this.ds =	{ id: 'ds',	t: 'Data sharing',		i: 'exchange',	d: '' },
	this.lb =	{ id: 'lb',	t: 'Load balancing',	i: 'list-ol',	d: '' },
	this.dl =	{ id: 'dl',	t: 'Load balancing',	i: 'compass',	d: '' },
	this.rs =	{ id: 'rs',	t: 'Resource sharing',	i: 'sitemap',	d: '' },

	this[11] =	{ id: 11,	t: 'oversubscription' },
	this[12] =	{ id: 12,	t: 'task start/stop overhead' },
	this[13] =	{ id: 13,	t: 'thread migration' },
	this[21] =	{ id: 21,	t: 'Low work to synchronisation ratio' },
	this[22] =	{ id: 22,	t: 'Lock contention' },
	this[23] =	{ id: 23,	t: 'Lock convoy' },
	this[24] =	{ id: 24,	t: 'Badly-behaved spinlocks' },
	this[31] =	{ id: 31,	t: 'True sharing of updated data' },
	this[32] =	{ id: 32,	t: 'Sharing of data between CPUs on NUMA systems' },
	this[33] =	{ id: 33,	t: 'Sharing of lock data structures' },
	this[34] =	{ id: 34,	t: 'Sharing data between distant cores' },
	this[41] =	{ id: 41,	t: 'Undersubscription' },
	this[42] =	{ id: 42,	t: 'Alternating sequential/parallel execution' },
	this[43] =	{ id: 43,	t: 'Chains of data dependencies' },
	this[44] =	{ id: 44,	t: 'Bad threads to cores ratio' },
	this[51] =	{ id: 51,	t: 'Cache Locality' },
	this[52] =	{ id: 52,	t: 'TLB Locality' },
	this[53] =	{ id: 53,	t: 'DRAM memory pages' },
	this[54] =	{ id: 54,	t: 'Page faults' },
	this[61] =	{ id: 61,	t: 'Exceeding memory bandwidth' },
	this[62] =	{ id: 62,	t: 'Competition between threads sharing a cache' },
	this[63] =	{ id: 63,	t: 'False data sharing' },

	// Fill taxonomies with issues
	this.tg.issues = [this[11], this[12], this[13]];
	this.sy.issues = [this[21], this[22], this[23], this[24]];
	this.ds.issues = [this[31], this[32], this[33], this[34]];
	this.lb.issues = [this[41], this[42], this[43], this[44]];
	this.dl.issues = [this[51], this[52], this[53], this[54]];
	this.rs.issues = [this[61], this[62], this[63]];

	// List all categories ...
	this.all = {
		categories: [this.tg, this.sy, this.ds, this.lb, this.dl, this.rs],
		issues: []
	};

	// ... and issues
	this.all.categories.forEach(function(category) {
		category.issues.forEach(function(issue) {
			this.all.issues.push(issue);
		}, this);
	}, this);
});

/************************************************/
/* Old experiment threads						*/
/*	(to keep a trace)							*/
/************************************************/
xpapp.factory('disabledThreads', function() {
	var disabledThreads = [
		{
			id: 98, groups: 1,
			title: 'Experimentation (test)',
			goal: 'The goal of this survey is to evaluate a prototype tool for parallel performance analysis.',
			steps: [
				// init a form:					form:m { ... }
				// display next in sidebar:		nextInSidebar: true
				// dashboard path:				path: '/admin'
				// collect the mouse tracking:	mousetrack: true
				// Forbid go back to edit:		editable: false
				{ pageID: 'habits',		label: 'Your tools',			form: {} },
				{ pageID: 'info',		label: 'Explanations' },
				{ state: 'tool',		label: 'Test Merge & Sort',		path: '/dashboard/9-8', mousetrack: true, nextInSidebar: true },
				{ pageID: 'start',		label: 'Experimentation',		form: {} },
			]
		}, {
			id: 99, groups: 4,
			title: 'Test 99',
			goal: 'The goal of this survey is to evaluate a prototype visualisation for identifying the presence of <b>data-locality</b> issues.',
			steps: [
				{ label: 'Terminology',		pageID: 1 },
				{ label: 'Source Code',		pageID: 2, form: {} },
				{ label: 'Visualisation',	pageID: 3 },
				{ label: 'Tool',			pageID: 4, form: {} },
			]
		},
	];

	return disabledThreads;
});