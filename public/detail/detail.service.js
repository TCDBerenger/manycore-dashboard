app.factory('detailService', ['$http', function($http) {
	var output = { };
	
	output.gets = function(cat, ids) {
		return $http.get('/details/' + cat + '/'+ ids).then(function(res){
			var selected = {};
			
			angular.copy(res.data, selected);

			return selected;
		});
	};
	
	return output;
}]);