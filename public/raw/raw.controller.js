app.controller('RawController', ['$scope', '$rootScope', '$http', 'selectedProfiles', 'categories', 'facets', function($scope, $rootScope, $http, selectedProfiles, categories, facets) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	// Profiles
	var profiles =		selectedProfiles;
	var profileIDs =	selectedProfiles.map(function(profile) { return profile.id; });
	var encodedIDs =	profileIDs.join('-');
	
	
	/************************************************/
	/* Graphics - Scope								*/
	/************************************************/
	// Set settings
	var subEvents = [[
			{ l: 'typical value', a: 'expected_', u: 'events'},
			{ l: 'deviation', a: 'factor_', u: '×'}
		], [
			{ l: 'mean (by ms by core)', a: 'rate_', u: 'events'},
			{ l: 'typical (by ms by core)', a: 'calibration_', u: 'events'}
		]];
	var subPercent = [[ { l: 'ratio', a: 'percent_', u: '%'} ]];
	var subLocality = [[ { l: 'ratio IPC/Cache Miss', a: 'percent_', u: '%'} ]];
	
	// Set facets - Threads
	var h =		JSON.parse(JSON.stringify(facets.h));
	h.label = 'Threads';
	h.cat = 'stats';
	
	// Set facets - DL
	var f_ipc =	JSON.parse(JSON.stringify(facets.ipc));
	f_ipc.label = 'Instructions';
	
	// Sets
	$scope.sets = [[
		{
			title:		'Thread states',
			lists: [[
				{ main:	h,	details: [[ { l: 'threads by logical core', a: 'rate_', u: ''} ]]  },
			], [
				{ main:	facets.r,	details: subPercent },
				{ main:	facets.p,	details: subPercent },
			], [
				{ main:	facets.yb,	details: [[ { l: 'ratio', a: 'percent_', u: '%'} ], [ { f: facets.y }, { f: facets.b } ]] },
				{ main:	facets.w,	details: [[ { l: 'ratio', a: 'percent_', u: '%'} ], [ { f: facets.lw } ]]  },
			]]
		},{
			title:		'Locks',
			lists: [[
				{ main:	facets.lf,	details: subEvents },
				{ main:	facets.lw },
			], [
				{ main:	facets.ls,	details: subEvents },
				{ main:	facets.lh },
				{ main:	facets.lr },
			]]
		}
	], [
		{
			title:		'Core states',
			lists: [[
				{ main:	facets.i,	details: subPercent  },
				{ main:	facets.o,	details: subPercent },
			], [
				{ main:	facets.s,	details: subEvents },
			], [
				{ main:	facets.m,	details: subEvents },
			]]
		}, {
			title:		'Core cache',
			lists: [[
				{ main:	facets.il,	details: [[ { l: 'ratio per cycle', a: 'percent_', u: '%'} ]] },
			], [
				{ main:	facets.il1,	details: [[ { l: 'ratio per cycle', a: 'percent_', u: '%'} ]] },
				{ main:	facets.il2,	details: [[ { l: 'ratio per cycle', a: 'percent_', u: '%'} ]] },
			]]
		}
	], [
		{
			title:		'Data locality',
			lists: [[
				{ main:	f_ipc,			details: subLocality },
				{ main:	facets.miss,	details: subLocality },
			], [
				{ main:	facets.tlb,		details: subLocality },
				{ main:	facets.l1,		details: subLocality },
				{ main:	facets.l2,		details: subLocality },
				{ main:	facets.l3,		details: subLocality },
				{ main:	facets.hpf,		details: subLocality },
			]]
		}
	], [
		{
			title:		'Memory',
			lists: [[
				{ main:	facets.e,		details: subPercent },
			], [
				{ main:	facets.l3,		details: [[ { l: 'ratio IPC/Cache Miss', a: 'percent_', u: '%'} ]] },
				{ main:	facets.hpf,		details: [[ { l: 'ratio IPC/Cache Miss', a: 'percent_', u: '%'} ]] },
			]]
		}
	]];
	
	
	/************************************************/
	/* Network - retreive data						*/
	/************************************************/
	/**
	 * Retreive - data
	 */
	function retreiveData() {	
		$http.get('/service/raw/' + encodedIDs).success(function(data) {
			//	
			//	Profiles
			//
			profiles.forEach(function(profile) {
				profile.raw = data[profile.id];
			});

		
			//
			//	Finish to wait
			//
			$scope.isWaiting = false;
		});
	}
	
	/************************************************/
	/* Constructor - Finish							*/
	/************************************************/
	// Init UI vars
	$scope.isWaiting = true;
	
	// Export vars
	$scope.profiles = profiles;
	$scope.encodedIDs = encodedIDs;
	$scope.categories = categories.all;
	$scope.facets = facets;
	
	// Data
	retreiveData();
	$rootScope.saveSelectedIDs(profileIDs);
}]);