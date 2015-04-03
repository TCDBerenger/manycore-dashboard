app.controller('DetailController', ['$scope', '$stateParams', 'profiles', 'selected', 'details', 'widgets', function($scope, $stateParams, profiles, selected, details, widgets) {
	// Metadata
	$scope.meta = {};
	
	// Metadata - Copy params data
	$scope.meta.ids = $stateParams.ids;
	$scope.ids = $stateParams.ids.split('-');
	
	// Metadata - Copy detail data
	details.forEach(function(element, index, array) {
		if (element.cat == $stateParams.cat) {
			for (var attr in element) {
				if (element.hasOwnProperty(attr)) $scope.meta[attr] = element[attr];
			}
		}
	});
	
	// Profiles
	$scope.allProfiles = profiles.all;
	$scope.profiles = selected;
	
	// Details
	$scope.details = details;
	$scope.widgets = widgets;
	
	
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