app.controller('manycoreMainController', ['$scope', '$rootScope', '$http', '$location', '$sce', function($scope, $rootScope, $http, $location, $sce) {
	testtmp1 = true;	// useless
	$scope.testtmp2 = true;
	
	
  $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }
  

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
}]);