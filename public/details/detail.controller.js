app.controller('DetailController', ['$scope', '$rootScope', '$stateParams', 'selectedProfiles', 'dataProfiles', 'categories', 'widgets', function($scope, $rootScope, $stateParams, selectedProfiles, dataProfiles, categories, widgets) {
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
	$scope.data = dataProfiles;

	// Start session from here? Dispatch selected profiles
	if (! $rootScope.hasOwnProperty('selectedProfiles') || $rootScope.selectedProfiles.length == 0) {
		$rootScope.selectedProfiles = selectedProfiles;
	}

	
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