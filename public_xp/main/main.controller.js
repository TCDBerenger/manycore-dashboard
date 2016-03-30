xpapp.controller('manycoreMainController', ['$scope', '$rootScope', '$http', '$location', '$sce', function($scope, $rootScope, $http, $location, $sce) {
	testtmp1 = true;	// useless
	$scope.testtmp2 = true;
	
	
  $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }

  // Load the code snippets
  $http.get('survey/src-data.json').then(function(res){
    $scope.group = res.data.groups[$rootScope.xp.group];
    $scope.groupHalf = $scope.group.length / 2;
    $scope.srcData = res.data;
    $scope.current = $scope.group[0];
  });

  // Load the questions on the code
  $http.get('survey/src-survey.json').then(function(res){
    $scope.srcSurvey = res.data;
  });

  // Load the visualisation URLs
  $http.get('survey/vis-data.json').then(function(res){
    $scope.visData = res.data;
  });

  // Load the questions on the code
  $http.get('survey/vis-survey.json').then(function(res){
    $scope.visSurvey = res.data;
  });

  // Information about the participant
  $scope.info = {
    date: new Date(),
    email: "",
    age: null,
    gender: null,
    education: null,
    expertise: null,
    experience: null,
    consent: false
  };

  // Current page
  $scope.problem = 0;
  $scope.current = 0;

  // Answers for a page
  $scope.srcAnsw = {};
  $scope.visAnsw = {};

  // Question phase
  $scope.phase = 0;

  // Moves to the next page on the code experiment
  $scope.srcNext = function(){
    // If we have to do the second phase, skip
    if($scope.nextPhase())
      return;

    // Write the answers to our server
    $scope.write({
      type: 'src', time: new Date(), problem: $scope.current, result: $scope.srcAnsw
    });

    // Go the the next page
    if($scope.problem >= $scope.groupHalf - 1){
      $scope.nextPage("/about-tool");
    }
    $scope.problem += 1;
    $scope.current = $scope.group[Math.floor($scope.problem)];
    $scope.clear();
  };

  // Moves to the next page on the code experiment
  $scope.visNext = function(){
    // If we have to do the second phase, skip
    if($scope.nextPhase())
      return;

    // Write the answers to our server
    $scope.write({
      type: 'vis', time: new Date(), problem: $scope.current, result: $scope.visAnsw
    });

    // Go to the next page
    if($scope.problem >= ($scope.group.length - 1)){
      $scope.nextPage("/thankyou");
    }else{
      $scope.problem += 1;
      $scope.current = $scope.group[Math.floor($scope.problem)];
    }
    $scope.clear();
  };

  // Transitions the questions
  $scope.nextPhase = function(){
    $scope.phase = ($scope.phase == 0 ? 1 : 0);
    if($scope.phase == 1){
      $scope.write({
        type: 'page-change', time: new Date(), url: "new-phase"
      });
    }
    return $scope.phase == 1;
  }

  // Start the experiment
  $scope.startExperiment = function(){
    $scope.write($scope.info);
    $scope.nextPage('/about-code');
  }

  // Logs a page change and goes to the page
  $scope.nextPage = function(href){
    $location.path(href);
    $scope.write({
      type: 'page-change', time: new Date(), url: href
    });
  }

  // Clears everything that is required
  $scope.clear = function(){
    $scope.srcAnsw = {};
    $scope.visAnsw = {};
    var chk = document.getElementsByClassName("choice");
    for(var i=0;i<chk.length;i++)
      chk[i].checked = false;
    var txt = document.getElementsByClassName("open-question");
    for(var i=0;i<txt.length;i++)
      txt[i].value = "";
    var cnf = document.getElementsByClassName("confidence");
      cnf[i].value = 0;
    window.scrollTo(0, 0);
  }

	// Writes the data object to the log file
	$scope.write = function(payload){
		console.log('WRITE (1): ' + JSON.stringify(payload));
		/*$http.post(url, payload)
			.success(function(data, status, headers, config, statusText) {
			console.log('WRITE (2): ' + status, data, config.url); 
			});*/
		$http.post('/service/collect', payload)
			.then(function successCallback(response) {
				// this callback will be called asynchronously
				// when the response is available
				console.log('WRITE (2): OK', response.status, response.data, response.config.url); 
			}, function errorCallback(response) {
				// called asynchronously if an error occurs
				// or server returns response with an error status.
				console.error('WRITE (2): KO', response.status, response.data, response.config.url); 
			});	
	};
}]);