app.factory('profileService', ['$http', function($http) {
	var output = {
		all: [],
		map: {}
	};
	
	output.reindexation = function() {
		output.map = {};
		
		output.all.forEach(function(profile, index, array) {
			output.map[profile.id] = index;
		});
	}
	
	output.getAll = function() {
		return $http.get('/profiles').success(function(data) {
			angular.copy(data, output.all);
			output.reindexation();
		});
	};
	
	output.gets = function(ids) {
		return $http.get('/profiles/' + ids).then(function(res){
			var selected = [];
			
			angular.copy(res.data, selected);
			/*
			selected.forEach(function(profile) {
				output.all[output.map[profile.id]] = profile;
			});
			*/
			return selected;
		});
	};
	
	return output;
}]);