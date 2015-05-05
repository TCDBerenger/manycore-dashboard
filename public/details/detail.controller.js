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
	$rootScope.saveSelectedIDs($scope.ids);

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
			{ cat: 'times',	attr: 'r',	title: 'running',	desc: 'running',	color: '#8DD28A' },
			{ cat: 'times',	attr: 'ys',		title: 'ready',		desc: 'ready',		color: '#D28A8D' }
		],
		cyclesExtended: [
			//{ cat: 'times',	attr:'init',		title: 'init',			desc: 'init',		color:'#797979' },
			{ cat: 'times',	attr:'r',		title: 'running',		desc: 'running',	color:'#8DD28A' },
			{ cat: 'times',	attr:'s',		title: 'standby',		desc: 'standby',	color:'#D2AB8A' },
			{ cat: 'times',	attr:'w',		title: 'wait',			desc: 'wait',		color:'#D2AB8A' },
			{ cat: 'times',	attr:'y',		title: 'ready',			desc: 'ready',		color:'#D28A8D' }
			//{ cat: 'times',	attr:'transition',	title: 'transition',	desc: 'transition',	color:'#797979' },
			//{ cat: 'times',	attr:'terminated',	title: 'terminated',	desc: 'terminated',	color:'#797979' },
			//{ cat: 'times',	attr:'unknown',		title: 'unknown',		desc: 'unknown',	color:'#797979' }
		],
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