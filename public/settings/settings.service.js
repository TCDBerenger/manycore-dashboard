app.factory('settingsService', ['$cookies', function($cookies) {
	var output = {};
	
	output.all = {
		asideTabsHide:	$cookies.get('asideTabsHide')
	}
	
	return output;
}]);