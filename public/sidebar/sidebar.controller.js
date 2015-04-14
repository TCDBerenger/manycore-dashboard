app.controller('SidebarController', ['$scope', '$rootScope', '$stateParams', 'details', function($scope, $rootScope, $stateParams, details) {
	// Metadata
	$scope.meta = {};
	$scope.meta.cat = "";
	$scope.meta.ids = $rootScope;
	
	// Profiles
	$scope.profiles = []; //selected;
	
	// Details
	$scope.detail = null;
	$scope.details = details;
	


	/************************************************/
	/* Bind - Style									*/
	/************************************************/
	/**
	 * Detail & expand
	 */
	$rootScope.$on('$stateChangeStart',
		function(event, toState, toParams, fromState, fromParams) {
			if (toState.name == 'dashboard') {
				$scope.detail = null;
				document.getElementById('wrapper').className = '';
			} else {
				$scope.details.forEach(function(detail) {
					if (detail.cat == toParams.cat) {
						$scope.detail = detail;
					}
				});
				document.getElementById('wrapper').className = 'min';
			}
		});
	
	
	/************************************************/
	/* Functions - Graphical						*/
	/************************************************/
	
	/**
	 * Flag - detail
	 */
	$scope.hasDetail = function() {
		return $scope.detail != null;
	};

	/************************************************/
	/* Functions - Graphical						*/
	/************************************************/
	
	/**
	 * Flag - selected
	 */
	$scope.hasSelectedProfile = function() {
		return $scope.selectedProfiles.length > 0;
	};

	/************************************************/
	/* Functions - Browsing							*/
	/************************************************/
	
	/**
	 * Join
	 */
	$scope.encodeSelectedProfile = function() {
		var output = "";
		
		$rootScope.selectedProfiles.forEach(function(element, index, array) {
			output += (output.length > 0) ? "-" : "";
			output += element.id;
		});
		
		return output;
	};
}]);