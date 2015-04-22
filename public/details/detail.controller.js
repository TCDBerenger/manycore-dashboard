app.controller('DetailController', ['$scope', '$rootScope', '$window', '$stateParams', 'selectedProfiles', 'dataProfiles', 'categories', 'widgets', function($scope, $rootScope, $window, $stateParams, selectedProfiles, dataProfiles, categories, widgets) {
	// Metadata
	$scope.meta = {};

	console.log(dataProfiles);
	
	// Metadata - Copy params data
	$scope.meta.ids = $stateParams.ids;
	$scope.ids = $stateParams.ids.split('-');
	
	// Metadata - Copy detail data
	var category = categories[$stateParams.cat];
	for (var attr in category) {
		if (category.hasOwnProperty(attr)) {
			$scope.meta[attr] = category[attr];
		}
	};
	
	// Details
	$scope.widgets = widgets;
	$scope.profiles = selectedProfiles;
	$scope.ids = [];
	$scope.data = dataProfiles;

	// Populate ids
	$scope.profiles.forEach(function(profile) {
		$scope.ids.push(profile.id);
	});

	// Start session from here? Dispatch selected profiles
	if (! $rootScope.hasOwnProperty('selectedProfiles') || $rootScope.selectedProfiles.length == 0) {
		$rootScope.selectedProfiles = selectedProfiles;
	}

	// Setting for layout and visual/graphics elements
	$scope.layout = {
		col: {
			graph: 8,
			data: 4
		}
	};

	// Data to show
	$scope.chartSets = {
		cycles: [
			{ attr: 'cyclesReady',		desc: 'ready',		color: '#ff7f0e' },
			{ attr: 'cyclesRunning',	desc: 'running',	color: '#aec7e8' },
			{ attr: 'cycles',			desc: 'cycles',		color: '#1f77b4' }
		]
	}

	// Global binds
	angular.element($window).on('resize', function() {
		$scope.$apply();
	});

	
	$scope.displayProfiles = function() {
		var output = "";
		
		if ($scope.profiles.length == 0) {
			output = "nothing (bad URL)"
		} else {
			$scope.profiles.forEach(function(element, index, array) {
				if (array.length > 1 && index == array.length - 1) {
					output += " & ";
				} else if (index > 0) {
					output += ", ";
				}
				
				output += element.label;
			});
		}
		
		return output;
	}
}]);