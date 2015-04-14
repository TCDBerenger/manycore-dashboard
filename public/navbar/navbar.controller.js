app.controller('NavbarController', ['$scope', '$rootScope', '$stateParams', 'details', function($scope, $rootScope, $stateParams, details) {
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
	 * Detail
	 */
	$rootScope.$on('$stateChangeStart',
		function(event, toState, toParams, fromState, fromParams) {
			if (toState.name == 'dashboard') {
				$scope.detail = null;
			} else {
				$scope.details.forEach(function(detail) {
					if (detail.cat == toParams.cat) {
						$scope.detail = detail;
					}
				});

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

}]);