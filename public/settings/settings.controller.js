app.controller('SettingsController', ['$cookies', '$scope', function($cookies, $scope) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	var settings = {};
	
	
	
	/************************************************/
	/* Functions - Data								*/
	/************************************************/
	
	// Common setter
	function settingSetter(property, value) {
		settings['_' + property] = value;
		$cookies.put(property, value);
		console.log('Coockie', '_' + property, settings['_' + property]);
	}
	
	// Common getter
	/*function settingGetter(property) {
		return settings['_' + property] || $cookies.get(property);
	}*/
	
	
	/************************************************/
	/* Constructor - Finish							*/
	/************************************************/
	
	// Populate porperties
	['asideTabsHide'].forEach(function(property) {
		settings['_' + property] = $cookies.get(property);
		console.log('Coockie', '_' + property, settings['_' + property]);
		Object.defineProperty(settings, property, {
			get: function() { console.log('get', '_' + property, settings['_' + property]); return settings['_' + property]; },
			set: function(value) { settingSetter(property, value); }
		});
	});
	
	// Populate scope
	$scope.settings = settings;
}]);