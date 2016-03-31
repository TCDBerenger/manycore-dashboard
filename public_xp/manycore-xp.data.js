/************************************************/
/* Experiment threads							*/
/*	(one thread is one experiment)				*/
/************************************************/
xpapp.factory('threads', function() {
	var looseThreads = [
		{
			id: 99, groups: 4,
			title: 'Test',
			goal: 'The goal of this survey is to evaluate a prototype visualisation for identifying the presence of <b>data-locality</b> issues.',
			steps: [
				// init a form:					form:m { ... }
				// display next in sidebar:		nextInSidebar: true
			]
		},
	];
	
	var disabledThreads = [
	];
	
	// ID treatment
	var threads = [];
	looseThreads.forEach(function (thread) {
		thread.steps.unshift({label: 'introduction', state: 'intro', form: {}});
		thread.steps.push({label: 'the end', state: 'thankyou'});
		thread.steps.forEach(function(step, index) { step.id = index; });
		threads[thread.id] = thread;
	});
	
	return threads;
});

/************************************************/
/* Old experiment threads						*/
/*	(to keep a trace)							*/
/************************************************/
xpapp.factory('disabledThreads', function() {
	var disabledThreads = [
	];
	
	return looseThreads;
});