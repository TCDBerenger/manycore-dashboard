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
		return $http.get('/service/profiles').success(function(data) {
			angular.copy(data, output.all);
			output.reindexation();

			output.all.forEach(function(profile) {
				profile.data = {};
			});
		});
	};
	
	output.gets = function(ids) {
		/*
		var selected = [];

		for (var i = ids.length - 1; i >= 0; i--) {
			if (output.map.hasOwnProperty(ids[i])) {
				selected.push(output.map[ids[i]]);
				array.splice(i, 1);
			}
		};
		
		if (ids.length > 0) {
			return $http.get('/service/profiles/' + ids).then(function(res){
				
				angular.copy(res.data, selected);

				selected.forEach(function(profile) {
					profile.data = {};
				});
				
				return selected;
			});
		} else {
			return function() {
				return selected;
			}
		}
		*/
		return $http.get('/service/profiles/' + ids).then(function(res){
			var selected = [];
			
			angular.copy(res.data, selected);
			/*
			selected.forEach(function(profile) {
				output.all[output.map[profile.id]] = profile;
			});
			*/
			
			selected.forEach(function(profile) {
				profile.data = {};
			});
			
			return selected;
		});
	};
	
	return output;
}]);