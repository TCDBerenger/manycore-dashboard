/************************************************/
/* Tasks types									*/
/************************************************/
xpapp.constant('TYPES', {
	TASK_STANDALONE_A: 1,
	TASK_COMPARISON_B: 2,
});

/************************************************/
/* Experiment threads							*/
/*	(one thread is one experiment)				*/
/************************************************/
xpapp.factory('threads', ['TYPES', function(TYPES) {
	var looseThreads = [
		{
			id: 1, groups: 12,
			title: 'Test 1',
			goal: 'The goal of this survey is to evaluate a prototype visualisation for identifying the presence of <b>data-locality</b> issues.',
			tasks: {
				distribution: [
					['m', 'n', 'o', 'a', 'b', 'l'],
					['n', 'o', 'm', 'b', 'c', 'a'],
					['o', 'm', 'n', 'c', 'd', 'b'],
					['o', 'n', 'm', 'd', 'e', 'c'],
					['m', 'o', 'n', 'e', 'f', 'd'],
					['n', 'm', 'o', 'f', 'g', 'e'],
					['g', 'h', 'f', 'm', 'n', 'o'],
					['h', 'i', 'g', 'n', 'o', 'm'],
					['i', 'j', 'h', 'o', 'm', 'n'],
					['j', 'k', 'i', 'o', 'n', 'm'],
					['k', 'l', 'j', 'm', 'o', 'n'],
					['l', 'a', 'k', 'n', 'm', 'o'],
				],
				a: { id: 's52',	type: TYPES.TASK_STANDALONE_A,	path: '/dashboard/252' },	// 5: DL
				b: { id: 's21',	type: TYPES.TASK_STANDALONE_A,	path: '/dashboard/221' },	// 2: SY
				c: { id: 's51',	type: TYPES.TASK_STANDALONE_A,	path: '/dashboard/251' },	// 5: DL
				d: { id: 's61',	type: TYPES.TASK_STANDALONE_A,	path: '/dashboard/261' },	// 6: RS
				e: { id: 's41',	type: TYPES.TASK_STANDALONE_A,	path: '/dashboard/241' },	// 4: LB
				f: { id: 's22',	type: TYPES.TASK_STANDALONE_A,	path: '/dashboard/222' },	// 2: SY
				g: { id: 's11',	type: TYPES.TASK_STANDALONE_A,	path: '/dashboard/211' },	// 1: TG
				h: { id: 's12',	type: TYPES.TASK_STANDALONE_A,	path: '/dashboard/212' },	// 1: TG
				i: { id: 's33',	type: TYPES.TASK_STANDALONE_A,	path: '/dashboard/233' },	// 3: DS
				j: { id: 's63',	type: TYPES.TASK_STANDALONE_A,	path: '/dashboard/263' },	// 6: RS
				k: { id: 's31',	type: TYPES.TASK_STANDALONE_A,	path: '/dashboard/231' },	// 3: DS
				l: { id: 's44',	type: TYPES.TASK_STANDALONE_A,	path: '/dashboard/244' },	// 4: LB
				m: { id: 'c5',	type: TYPES.TASK_COMPARISON_B,	path: '/dashboard/250-251' },	// 5: DL
				n: { id: 'c4',	type: TYPES.TASK_COMPARISON_B,	path: '/dashboard/240-241' },	// 4: LB
				o: { id: 'c2',	type: TYPES.TASK_COMPARISON_B,	path: '/dashboard/220-221' },	// 2: SY
			},
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
				{ pageID: 'info',		label: 'Explanations' },
				{ pageID: 'training',	label: 'Training' },
				{ taskID: 1,			label: 'Task 1',				form: {}, mousetrack: true },
				{ taskID: 2,			label: 'Task 2',				form: {}, mousetrack: true },
				{ taskID: 3,			label: 'Task 3',				form: {}, mousetrack: true },
				{ taskID: 4,			label: 'Task 4',				form: {}, mousetrack: true },
				{ taskID: 5,			label: 'Task 5',				form: {}, mousetrack: true },
				{ taskID: 6,			label: 'Task 6',				form: {}, mousetrack: true },
//				{ state: 'tool',		label: 'Test Particules',		path: '/dashboard/5-4', mousetrack: true, nextInSidebar: true },
//				{ pageID: 'start',		label: 'Experimentation',		form: {} },
//				{ state: 'tool',		label: 'Test Particules',		path: '/dashboard/1012', mousetrack: true, nextInSidebar: true },
//				{ pageID: 'questions',	label: 'Questions' },
				{ state: 'feedback',	label: 'Feedback',				form: {} }
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
}]);

/************************************************/
/* Taxonomy										*/
/************************************************/
xpapp.service('taxonomy', function() {
	// Build the "flat" taxonomy
	this.tg =	{ id: 'tg',	t: 'Task granularity',	i: 'sliders', d: [
			'In parallel programs it is often a challenge to find enough parallelism (performing many calculations simultaneously) to keep the machine busy.\
			 A key focus of parallel software development is designing algorithms that expose more parallelism.',
			'However, there are overheads associated with starting, managing and switching between parallel threads.\
			 If the tasks are too small (fine-grained parallelism), the cost of these overheads can exceed the benefits.\
			 Conversely, if tasks are too large (coarse-grained parallelism) some resources might be under utilized.',
			'Choosing the correct task granularity is critical.'
		]
	},
	this.sy =	{ id: 'sy',	t: 'Synchronisation',	i: 'refresh',	d: [
			'In a shared-memory programming model, where data is shared and updated by multiple threads;\
			 some sort of synchronisation is needed to ensure that all threads get a consistent view of memory.',
			'Synchronization always causes some overhead.',
			'If the algorithm requires a large amount of synchronization, the overhead can offset much of the benefits of parallelism.\
			 Perhaps the most common synchronisation mechanism is the lock;\
			 other mechanisms include barriers, semaphores, and the atomic instructions used in so-called “lock-free” and “wait-free” data structures.'
		]
	},
	this.ds =	{ id: 'ds',	t: 'Data sharing',		i: 'exchange',	d: [
			'Threads within a process communicate through data in shared memory.\
			 Sharing data between cores involves physically transferring the data along wires between the cores.',
			'On shared memory computers these data transfers happen automatically through the caching hardware.',
			'However these transfers take time, along with a cost to data sharing, particularly when shared variables and data structures are modified.'
		]
	},
	this.lb =	{ id: 'lb',	t: 'Load balancing',	i: 'list-ol',	d: [
			'Load balancing is the attempt to divide work evenly among the cores.\
			 Dividing the work in this way is usually, but not always, beneficial.',
			'There is an overhead in dividing work between parallel cores and it can sometimes be more efficient not to use all the available cores.\
			 Nonetheless, a poor load balance is one of the most easily understood performance problems.',
		]
	},
	this.dl =	{ id: 'dl',	t: 'Data locality',		i: 'compass',	d: [
			'This is not a specifically multicore problem, but it is impossible to talk about single or multicore performance without talking about locality.',
			'Two or more memory accesses have data locality when they touch nearby memory regions. High data locality means caches are very effective, low data locality means caches have very little effect.',
			'Locality is important because it takes hundreds of processor cycles to access a value in main memory, but only a few cycles to access cache.\
			 This problem is often called the “memory wall”.',
		]
	},
	this.rs =	{ id: 'rs',	t: 'Resource sharing',	i: 'sitemap',	d: [
			'Those who are new to parallel programming often expect linear performance scaling: code running on four cores will be four times faster than on one core. There are many reasons why this is seldom true, but perhaps the most self-explanatory is that those four cores share and must compete for access to other parts of the hardware that have not been replicated four times. For example, all cores will typically share a single connection to main memory.',
		]
	},

	this[11] =	{ id: 11, t: 'oversubscription',
						  d: 'not enough free cores available' },
	this[12] =	{ id: 12, t: 'task start/stop overhead',
						  d: 'a dedicated thread is not justified for the amount of work performed' },
	this[13] =	{ id: 13, t: 'thread migration',
						  d: 'excessive thread movement across cores' },
	this[21] =	{ id: 21, t: 'Low work to synchronisation ratio',
						  d: 'threads spend more time acquiring locks than executing' },
	this[22] =	{ id: 22, t: 'Lock contention',
						  d: 'a thread attempts to acquire a lock held by another thread' },
	this[24] =	{ id: 24, t: 'Badly-behaved spinlocks',
						  d: 'a thread repeatedly fails to acquire a lock without pause' },
	this[31] =	{ id: 31, t: 'True sharing of updated data',
						  d: 'the same variable is written/read by different cores' },
	this[32] =	{ id: 32, t: 'Sharing of data between CPUs on NUMA systems',
						  d: 'different parts of the data may be in different local memories' },
	this[33] =	{ id: 33, t: 'Sharing of lock data structures',
						  d: 'large number of locks acquired or released' },
	this[34] =	{ id: 34, t: 'Sharing data between distant cores',
						  d: 'transferring shared data between threads on distant cores' },
	this[41] =	{ id: 41, t: 'Undersubscription',
						  d: 'too few threads actively running' },
	this[42] =	{ id: 42, t: 'Alternating sequential/parallel execution',
						  d: 'sequential phases limit performance of the system' },
	this[43] =	{ id: 43, t: 'Chains of data dependencies',
						  d: 'the structure of some parts of the application prevents parallelisation' },
	this[44] =	{ id: 44, t: 'Bad threads to cores ratio',
						  d: 'the work is not appropriately divided for the available cores' },
	this[51] =	{ id: 51, t: 'Cache Locality',
						  d: 'data is not present in a reasonably nearby cache' },
	this[52] =	{ id: 52, t: 'TLB Locality',
						  d: 'data used by the application is seldom in the same virtual page' },
	this[53] =	{ id: 53, t: 'DRAM memory pages',
						  d: 'memory accesses seldom target the same physical DRAM pages' },
	this[54] =	{ id: 54, t: 'Page faults',
						  d: 'not enough physical memory' },
	this[61] =	{ id: 61, t: 'Exceeding memory bandwidth',
						  d: 'the memory bus is saturated with requests' },
	this[62] =	{ id: 62, t: 'Competition between threads sharing a cache',
						  d: 'individual threads might have good data locality, but different threads making a lot of accesses to different parts of memory while sharing a cache could result in poor cache performance' },
	this[63] =	{ id: 63, t: 'False data sharing',
						  d: 'updating data invalidates nearby locations which hold data used by other threads' },

	// Fill taxonomies with issues
	this.tg.issues = [this[11], this[12], this[13]];
	this.sy.issues = [this[21], this[22], this[24]];
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
			issue.cat = category;
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