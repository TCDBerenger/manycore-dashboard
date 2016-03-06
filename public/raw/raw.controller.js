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
			{ l: 'ratio', a: 'factor_', u: '×'}
		], [
			{ l: 'rate (by ms by core)', a: 'rate_', u: 'events'},
			{ l: 'typical (by ms by core)', a: 'calibration_', u: 'events'}
		]];
	
	// Set facets
	var ipc =	JSON.parse(JSON.stringify(facets.ipc));
	var miss =	JSON.parse(JSON.stringify(facets.miss));
	[ipc, miss].forEach(function(facet) { facet.unity = 'per cycle'; });
	ipc.label = 'Instructions';
	
	// Sets
	$scope.sets = [
		{
			title:			'Locks',
			version:		4,
			lists: [[
				{ main:	facets.lf,	details: subEvents },
				{ main:	facets.lw },
			], [
				{ main:	facets.ls,	details: subEvents },
				{ main:	facets.lh },
				{ main:	facets.lr },
			]]
		}, {
			title:			'Core states',
			version:		3,
			lists: [[
				{ main:	facets.i },
			], [
				{ main:	facets.s,	details: subEvents },
			], [
				{ main:	facets.m,	details: subEvents },
			]]
		}, {
			title:			'Thread states',
			version:		3,
			lists: [[
				{ main:	facets.r,	details: [[ { l: 'ratio', a: 'percent_', u: '%'} ]] },
				{ main:	facets.yb,	details: [[ { l: 'ratio', a: 'percent_', u: '%'} ], [ { f: facets.y }, { f: facets.b } ]] },
				{ main:	facets.w,	details: [[ { l: 'ratio', a: 'percent_', u: '%'} ], [ { f: facets.lw } ]]  },
			]]
		}, {
			title:			'Data locality',
			version:		3,
			lists: [[
				{ main:	ipc,		details: [[ { l: 'ratio', a: 'percent_', u: '%'} ]] },
				{ main:	miss,		details: [[ { l: 'ratio', a: 'percent_', u: '%'} ]] },
			], [
				{ main:	facets.tlb },
				{ main:	facets.l1 },
				{ main:	facets.l2 },
				{ main:	facets.l3 },
				{ main:	facets.hpf },
			]]
		}
	];
	
	
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
				$scope.minVersion = Math.min($scope.minVersion, profile.version);
				$scope.maxVersion = Math.max($scope.maxVersion, profile.version);
				$scope.canV4 = $scope.canV4 || profile.version >= 4;
				$scope.canV5 = $scope.canV5 || profile.version >= 5;
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
	$scope.minVersion = 5;
	$scope.maxVersion = 3;
	$scope.canV3 = true;
	$scope.canV4 = false;
	$scope.canV5 = false;
	
	// Export vars
	$scope.profiles = profiles;
	$scope.encodedIDs = encodedIDs;
	$scope.categories = categories.all;
	$scope.facets = facets;
	
	// Data
	retreiveData();
	$rootScope.saveSelectedIDs(profileIDs);
}]);