var module = angular.module('mcq', []);
module.directive('mcq', function ($parse) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        id: "=",
        text: "=",
        options: "=",
        value: "=", 
        check: "="
      },
      controller: function($scope){
        var applyValue = function(){
          $scope.value = $scope.v + " (" + $scope.c + ")";
          //console.log("selected: " + $scope.value);
        }
        $scope.setOption = function(option, $event){
          $scope.v = option;
          applyValue();
        }
        $scope.setText = function(v, $event){
          $scope.v = $event.target.value;
          applyValue();
        }
        $scope.confidence = function(v, $event){
          $scope.c = $event.target.value;
          applyValue();
        }
      },
      template: '<div class="col-md-12" ng-model="value">'
        + '   <hr />'
        + '   <h4>{{text}}</h4>'
        + '   <div ng-if="options.length > 0" class="radio" ng-repeat="opt in options">'
        + '      <label>'
        + '      <input type="radio" class="choice" ng-click="setOption(opt, $event)" name="{{id}}" value="{{opt}}">{{opt}}'
        + '      </label>'
        + '   </div>'
        + '   <div ng-if="options.length > 0">'
        + '     <label>How confident are you in your answer?</label>'
        +'      <select class="form-control confidence" ng-keyup="confidence(1, $event)" ng-mouseleave="confidence(1, $event)" ng-click="confidence(1, $event)">'
        + '     <option value="0">I don\'t know.</option>'
        + '     <option value="+2">Very Confident. I don\'t need any additional information to improve my answers.</option>'
        + '     <option value="+1">Confident, but I might use additional information to improve my answers. </option>'
        + '     <option value="-1">Doubtful, I really need more information to answer. </option>'
        + '     <option value="-2">Very doubtful, I don\'t really understand it and I need more information.</option>'
        + '   </select>'
        + '   </div>'
        + '   <div ng-if="options.length == 0">'
        + '      <textarea class="form-control open-question" rows="5" ng-keyup="setText(1, $event)" id="{{id}}"></textarea>'
        + '   </div>'
        + '</div>'
    };
  });