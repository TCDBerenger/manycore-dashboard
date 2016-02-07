app.factory('profileService', ['$http', function($http) {
	var output = {
		all: []
	};
	
	output.postReceipt = function(list) {
		list.forEach(function(profile) {
			// Only add
			//if (! output.hasOwnProperty(profile.id)) {
				output[profile.id] = profile;
			//}

			// Check data property
			if (! profile.hasOwnProperty('data')) {
				profile.data = {};
			}
		});
	}
	
	output.getAll = function() {
		return $http.get('/service/profiles').success(function(data) {
			angular.copy(data, output.all);
			output.postReceipt(output.all);
		});
	};
	
	output.gets = function(ids) {
		/*
		// Init
		ids = ids.split('-');

		// Vars
		var missingIDs = [];
		var directResult = [];

		// Reuse
		idArray.forEach(function(id) {
			if (output.map.hasOwnProperty(id)) {
				directResult.push(output.map[id]);
			} else {
				missingIDs.push(id);
			}
		});

		console.log('before', ids, directResult, missingIDs);
		
		if (missingIDs.length > 0) {
			var tmp = $http.get('/service/profiles/' + missingIDs.join('-')).then(function(result) {

				// Get result profiles
				var profiles = [];
				angular.copy(result.data, profiles);
				output.postReceipt(profiles);

				// Prepare result (with previously downloaded results)
				var result = [];
				idArray.forEach(function(id) {
					result.push(output.map[id]);
				});
				
				console.log('result', result);
				return result;
			});
			console.log('promise', tmp);
			return tmp;
		} else {
			return directResult;
		}
		*/
		
		return $http.get('/service/profiles/' + ids).then(function(res){
			var fromServer = [];
			var toController = [];
			
			angular.copy(res.data, fromServer);
			output.postReceipt(fromServer);

			// Prepare result (with previously downloaded results)
			fromServer.forEach(function(profile) {
				toController.push(output[profile.id]);
			});
			
			return toController;
		});
	};
	
	return output;
}]);